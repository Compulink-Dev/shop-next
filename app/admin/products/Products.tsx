"use client";
import * as XLSX from "xlsx";
import { Product } from "@/lib/models/ProductModel";
import { formatId } from "@/lib/utils";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";
import useSWR from "swr";
import useSWRMutation from "swr/mutation";
import { Plus, Upload } from "lucide-react";
import DataError from "@/components/admin/DataError";
import { fetcher } from "@/lib/services/fetcher";
import AdminLoading from "@/components/admin/AdminLoading";

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

  const router = useRouter();

  const { trigger: deleteProduct } = useSWRMutation(
    `/api/admin/products`,
    async (url, { arg }: { arg: { productId: string } }) => {
      const toastId = toast.loading("Deleting product...");
      const res = await fetch(`${url}/${arg.productId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });
      const data = await res.json();
      res.ok
        ? toast.success("Product deleted successfully", {
            id: toastId,
          })
        : toast.error(data.message, {
            id: toastId,
          });
    }
  );

  const { trigger: createProduct, isMutating: isCreating } = useSWRMutation(
    `/api/admin/products`,
    async (url) => {
      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });
      const data = await res.json();
      if (!res.ok) return toast.error(data.message);
      toast.success("Product created successfully");
      router.push(`/admin/products/${data.product._id}`);
    }
  );

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

      setUploadedData(jsonData); // Save the parsed data for display

      // Send the data to the server
      for (const product of jsonData) {
        try {
          const response = await fetch(`/api/admin/products/bulk`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
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

  // If no orders are returned, display an appropriate message
  if (!products || products.length === 0) return <DataError name="products" />;

  return (
    <div>
      <div className="flex justify-between items-center">
        <h1 className="py-4 text-2xl">Products</h1>
        <div className="space-x-2">
          <button
            disabled={isCreating}
            onClick={() => createProduct()}
            className="btn btn-primary btn-sm"
          >
            {isCreating && <span className="loading loading-spinner"></span>}
            <Plus size={12} />
            <p className="">Create</p>
          </button>
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
                <td className="flex items-center">
                  <Link
                    href={`/admin/products/${product._id}`}
                    type="button"
                    className="btn btn-ghost btn-sm"
                  >
                    Edit
                  </Link>
                  &nbsp;
                  <button
                    onClick={() => deleteProduct({ productId: product._id! })}
                    type="button"
                    className="btn btn-ghost text-red-500 btn-sm"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {/* {uploadedData.length > 0 && (
          <div className="mt-8">
            <h2 className="text-xl font-semibold">Uploaded Data</h2>
            <pre className="bg-gray-100 p-4 rounded shadow overflow-x-auto">
              {JSON.stringify(uploadedData, null, 2)}
            </pre>
          </div>
        )} */}
      </div>
    </div>
  );
}
