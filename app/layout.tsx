import "./globals.css";
import type { Metadata } from "next";
import Providers from "@/components/Providers";
import DrawerButton from "@/components/DrawerButton";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/header/Header";
import { getServerSession, Session } from "next-auth";
import { options } from "./api/auth/[...nextauth]/options";

export const metadata: Metadata = {
  title: "Compulink Shop",
  description: "Compulink Shop",
};

interface RootLayoutProps {
  children: React.ReactNode; // Type for children elements
  params: {
    session?: Session | null; // Optional session prop
    [key: string]: any; // Allow other params
  };
}

export default async function RootLayout({ children }: RootLayoutProps) {
  const session = await getServerSession(options);

  return (
    <html lang="en">
      <body className="bg-base-100 text-white">
        <Providers session={session}>
          <div className="drawer">
            <DrawerButton />
            <div className="drawer-content">
              <div className="min-h-screen flex flex-col">
                <Header />
                {children}
                <footer className="footer footer-center p-4 bg-base-300 text-base-content">
                  <p>Copyright © 2025 - All right reserved by TechTrain</p>
                </footer>
              </div>
            </div>
            <div className="drawer-side">
              <label
                htmlFor="my-drawer"
                aria-label="close sidebar"
                className="drawer-overlay"
              ></label>
              <Sidebar />
            </div>
          </div>
        </Providers>
      </body>
    </html>
  );
}
