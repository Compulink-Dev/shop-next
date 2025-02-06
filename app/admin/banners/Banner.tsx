"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import useSWR from "swr";
import useSWRMutation from "swr/mutation";
import toast from "react-hot-toast";
import { Pen, Trash } from "lucide-react";

import AdminLoading from "@/components/admin/AdminLoading";
import DataError from "@/components/admin/DataError";
import { fetcher } from "@/lib/services/fetcher";
import { formatId } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export default function Banners() {
  const {
    data: banner,
    error,
    isLoading,
  } = useSWR(`/api/admin/banners`, fetcher);

  const router = useRouter();
  const [selectedBannerId, setSelectedBannerId] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { trigger: deleteBanner, isMutating: isDeleting } = useSWRMutation(
    `/api/admin/banners`,
    async (url, { arg }: { arg: { bannerId: string } }) => {
      const toastId = toast.loading("Deleting banner...");
      const res = await fetch(`${url}/${arg.bannerId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });
      const data = await res.json();

      if (res.ok) {
        toast.success("Banner deleted successfully", { id: toastId });
        setIsDialogOpen(false); // Close dialog
      } else {
        toast.error(data.message, { id: toastId });
      }
      setSelectedBannerId(null);
    }
  );

  const { trigger: createBanner, isMutating: isCreating } = useSWRMutation(
    `/api/admin/banners`,
    async (url) => {
      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });
      const data = await res.json();
      if (!res.ok) return toast.error(data.message);

      toast.success("Banner created successfully");
      router.push(`/admin/banners/${data.banner._id}`);
    }
  );

  const openDeleteDialog = (bannerId: string) => {
    setSelectedBannerId(bannerId);
    setIsDialogOpen(true);
  };

  if (error) return <div>An error has occurred: {error.message}</div>;
  if (isLoading) return <AdminLoading />;
  if (!banner || banner.length === 0) return <DataError name="banner" />;

  return (
    <div>
      <div className="flex justify-between items-center">
        <h1 className="py-4 text-2xl">Banners</h1>
        <Button disabled={isCreating} onClick={() => createBanner()}>
          {isCreating && <span className="loading loading-spinner"></span>}
          Create
        </Button>
      </div>

      <div className="overflow-x-auto">
        <table className="table table-zebra">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {banner.map((bannerItem: any) => (
              <tr key={bannerItem._id}>
                <td>{formatId(bannerItem._id!)}</td>
                <td>{bannerItem.name}</td>
                <td>
                  <Link
                    href={`/admin/banners/${bannerItem._id}`}
                    className="btn btn-ghost btn-sm"
                  >
                    <Pen size={14} />
                    Edit
                  </Link>
                  &nbsp;
                  <Dialog
                    open={isDialogOpen && selectedBannerId === bannerItem._id}
                    onOpenChange={setIsDialogOpen}
                  >
                    <DialogTrigger asChild>
                      <Button
                        variant="ghost"
                        className="text-red-500 btn-sm"
                        onClick={() => openDeleteDialog(bannerItem._id!)}
                      >
                        <Trash size={14} /> Delete
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[400px] bg-color">
                      <DialogHeader>
                        <DialogTitle>Confirm Deletion</DialogTitle>
                        <DialogDescription>
                          Are you sure you want to delete this banner? This
                          action cannot be undone.
                        </DialogDescription>
                      </DialogHeader>
                      <DialogFooter>
                        <Button
                          variant="outline"
                          className="text-black"
                          onClick={() => setIsDialogOpen(false)}
                        >
                          Cancel
                        </Button>
                        <Button
                          variant="destructive"
                          onClick={() =>
                            deleteBanner({ bannerId: bannerItem._id! })
                          }
                          disabled={isDeleting}
                        >
                          {isDeleting ? (
                            <span className="loading loading-spinner"></span>
                          ) : (
                            "Confirm"
                          )}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
