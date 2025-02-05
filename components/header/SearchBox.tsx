"use client";
import { fetcher } from "@/lib/services/fetcher";
import { useSearchParams } from "next/navigation";
import useSWR from "swr";

export const SearchBox = () => {
  const searchParams = useSearchParams();
  const q = searchParams.get("q") || "";
  const category = searchParams.get("category") || "All";

  const { data: categories, error } = useSWR(
    "/api/products/categories",
    fetcher
  );

  if (error) return error.message;
  if (!categories) return "Loading...";

  return (
    <form action="/search" method="GET">
      <div className="join">
        <select
          name="category"
          defaultValue={category}
          className="join-item select select-bordered "
        >
          <option value="all">All</option>
          {categories.map((c: string) => (
            <option key={c}>{c}</option>
          ))}
        </select>
        <input
          className="join-item input input-bordered  w-48"
          placeholder="Search"
          defaultValue={q}
          name="q"
        />
        <button className="join-item btn bg-red-500">Search</button>
      </div>
    </form>
  );
};
