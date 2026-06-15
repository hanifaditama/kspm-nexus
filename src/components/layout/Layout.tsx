import { ReactNode } from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";

const Layout = ({ children }: { children: ReactNode }) => (
  <div className="flex min-h-screen flex-col">
    <Navbar />
    <main className="min-h-[calc(100vh-4rem)] flex-1">{children}</main>
    <Footer />
  </div>
);

export default Layout;
