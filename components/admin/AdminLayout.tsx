import { options } from "@/app/api/auth/[...nextauth]/options";
import {
  LayoutDashboard,
  MonitorUp,
  User,
  WalletCards,
  Warehouse,
} from "lucide-react";
import { getServerSession } from "next-auth";
import Link from "next/link";

const AdminLayout = async ({
  activeItem = "dashboard",
  children,
}: {
  activeItem: string;
  children: React.ReactNode;
}) => {
  const session = await getServerSession(options);

  if (!session || !session.user.isAdmin) {
    return (
      <div className="relative flex flex-grow p-4">
        <div>
          <h1 className="text-2xl">Unauthorized</h1>
          <p>Admin permission required</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex flex-grow">
      <div className="w-full grid md:grid-cols-5">
        <div className="bg-base-200">
          <ul className="menu space-y-4">
            <li>
              <Link
                className={"dashboard" === activeItem ? "active" : ""}
                href="/admin/dashboard"
              >
                <LayoutDashboard size={15} />
                <p className="">Dashboard</p>
              </Link>
            </li>
            <li>
              <Link
                className={"orders" === activeItem ? "active" : ""}
                href="/admin/orders"
              >
                <Warehouse size={15} />
                <p className="">Orders</p>
              </Link>
            </li>
            <li>
              <Link
                className={"banners" === activeItem ? "active" : ""}
                href="/admin/banners"
              >
                <MonitorUp size={15} />
                <p className="">Banners</p>
              </Link>
            </li>
            <li>
              <Link
                className={"products" === activeItem ? "active" : ""}
                href="/admin/products"
              >
                <WalletCards size={15} />
                <p className="">Products</p>
              </Link>
            </li>
            <li>
              <Link
                className={"users" === activeItem ? "active" : ""}
                href="/admin/users"
              >
                <User size={15} />
                <p className="">Users</p>
              </Link>
            </li>
          </ul>
        </div>
        <div className="md:col-span-4 px-4">{children} </div>
      </div>
    </div>
  );
};

export default AdminLayout;
