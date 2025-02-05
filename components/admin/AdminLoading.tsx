import { Loader } from "lucide-react";
import React from "react";

function AdminLoading() {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center gap-2">
      <p className="">Loading</p>
      <Loader className="animate-spin" />
    </div>
  );
}

export default AdminLoading;
