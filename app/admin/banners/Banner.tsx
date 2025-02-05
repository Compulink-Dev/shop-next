"use client";
import AdminLoading from "@/components/admin/AdminLoading";
import DataError from "@/components/admin/DataError";
import { Banner } from "@/lib/models/BannerModel";
import { fetcher } from "@/lib/services/fetcher";
import { formatId } from "@/lib/utils";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import useSWR from "swr";
import useSWRMutation from "swr/mutation";

export default function Banners() {
  const {
    data: banner,
    error,
    isLoading,
  } = useSWR(`/api/admin/banners`, fetcher);

  const router = useRouter();

  const { trigger: deleteBanner } = useSWRMutation(
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
      res.ok
        ? toast.success("Banner deleted successfully", {
            id: toastId,
          })
        : toast.error(data.message, {
            id: toastId,
          });
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

  if (error) return <div>An error has occurred: {error.message}</div>;

  if (isLoading) return <AdminLoading />;

  // If no orders are returned, display an appropriate message
  if (!banner || banner.length === 0) return <DataError name="banner" />;

  return (
    <div>
      <div className="flex justify-between items-center">
        <h1 className="py-4 text-2xl">Banners</h1>
        <button
          disabled={isCreating}
          onClick={() => createBanner()}
          className="btn btn-primary btn-sm"
        >
          {isCreating && <span className="loading loading-spinner"></span>}
          Create
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="table table-zebra">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
            </tr>
          </thead>
          <tbody>
            {banner.map((banner: Banner) => (
              <tr key={banner._id}>
                <td>{formatId(banner._id!)}</td>
                <td>{banner.name}</td>
                <td>
                  <Link
                    href={`/admin/banners/${banner._id}`}
                    type="button"
                    className="btn btn-ghost btn-sm"
                  >
                    Edit
                  </Link>
                  &nbsp;
                  <button
                    onClick={() => deleteBanner({ bannerId: banner._id! })}
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
      </div>
    </div>
  );
}
