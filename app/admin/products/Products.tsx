"use client";
import * as XLSX from "xlsx";
import { formatId } from "@/lib/utils";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";
import useSWR from "swr";
import useSWRMutation from "swr/mutation";
import { Plus, Upload, Trash2, Pen } from "lucide-react";
import DataError from "@/components/admin/DataError";
import { fetcher } from "@/lib/services/fetcher";
import AdminLoading from "@/components/admin/AdminLoading";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Product } from "@/lib/types";

interface UploadedProduct {
  part: string;
  name: string;
  slug: string;
  image: string;
  price: number;
  category: string;
  brand: string;
  countInStock: number;
  description: string;
}

export default function Products() {
  const {
    data: products,
    error,
    isLoading,
  } = useSWR(`/api/admin/products`, fetcher);
  const [uploadedData, setUploadedData] = useState<any[]>([]);
  const [deleteProductId, setDeleteProductId] = useState<string | null>(null);

  const router = useRouter();

  const { trigger: deleteProduct } = useSWRMutation(
    `/api/admin/products`,
    async (url, { arg }: { arg: { productId: string } }) => {
      const toastId = toast.loading("Deleting product...");
      const res = await fetch(`${url}/${arg.productId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();
      res.ok
        ? toast.success("Product deleted successfully", { id: toastId })
        : toast.error(data.message, { id: toastId });
    }
  );

  const handleDeleteConfirm = () => {
    if (deleteProductId) {
      deleteProduct({ productId: deleteProductId });
      setDeleteProductId(null);
    }
  };

  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const file = files[0];
    const reader = new FileReader();

    reader.onload = async (event) => {
      const data = new Uint8Array(event.target?.result as ArrayBuffer);
      const workbook = XLSX.read(data, { type: "array" });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json<UploadedProduct>(sheet);

      setUploadedData(jsonData);
      for (const product of jsonData) {
        try {
          const response = await fetch(`/api/admin/products/bulk`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(product),
          });
          if (!response.ok) {
            const errorData = await response.json();
            toast.error(`Failed to add product: ${errorData.message}`);
          } else {
            toast.success(`Product ${product.name || ""} added successfully`);
          }
        } catch (err) {
          console.error("Error uploading product:", err);
          toast.error(`Error uploading product: ${product.name || ""}`);
        }
      }
    };

    reader.readAsArrayBuffer(file);
  };

  if (error) return <div>An error has occurred: {error.message}</div>;
  if (isLoading) return <AdminLoading />;
  if (!products || products.length === 0) return <DataError name="products" />;

  return (
    <div>
      <div className="flex justify-between items-center">
        <h1 className="py-4 text-2xl">Products</h1>
        <div className="space-x-2">
          <input
            type="file"
            accept=".xlsx, .xls"
            id="file-upload"
            style={{ display: "none" }}
            onChange={(e) => handleFileUpload(e.target.files)}
          />
          <label
            htmlFor="file-upload"
            className="btn btn-error text-white btn-sm"
          >
            <Upload size={12} />
            <p className=""> Upload</p>
          </label>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="table table-zebra mb-8">
          <thead>
            <tr>
              <th>ID</th>
              <th>Part</th>
              <th>Name</th>
              <th>Price</th>
              <th>Category</th>
              <th>Count in stock</th>
              <th>Rating</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product: Product) => (
              <tr key={product._id}>
                <td>{formatId(product._id!)}</td>
                <td>{product.part}</td>
                <td>{product.name}</td>
                <td>${product.price}</td>
                <td>{product.category}</td>
                <td>{product.countInStock}</td>
                <td>{product.rating}</td>
                <td className="flex items-center space-x-2">
                  <Link
                    href={`/admin/products/${product._id}`}
                    className="btn btn-ghost btn-sm"
                  >
                    Edit
                  </Link>
                  <button
                    onClick={() => setDeleteProductId(product._id!)}
                    className="btn btn-ghost text-red-500 btn-sm"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Dialog
        open={!!deleteProductId}
        onOpenChange={() => setDeleteProductId(null)}
      >
        <DialogContent className="bg-color">
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
          </DialogHeader>
          <p>
            Are you sure you want to delete this product? This action cannot be
            undone.
          </p>
          <DialogFooter>
            <Button
              variant="outline"
              className="text-black"
              onClick={() => setDeleteProductId(null)}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteConfirm}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
