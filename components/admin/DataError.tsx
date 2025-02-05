import { AlertCircle } from "lucide-react";
import React from "react";

function DataError({ name }: { name: string }) {
  return (
    <div className="w-full h-full flex flex-col gap-2 items-center justify-center ">
      <AlertCircle size={32} color="red" />
      <p className="text-red-500">{`No ${name} available.`}</p>
    </div>
  );
}

export default DataError;
