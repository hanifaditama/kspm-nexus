import { ReactNode, useLayoutEffect } from "react";
import { useLocation } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";

const Layout = ({ children }: { children: ReactNode }) => {
  const { pathname } = useLocation();
  const internalRoute = pathname.startsWith("/member") || pathname.startsWith("/admin");

  useLayoutEffect(() => {
    if (!internalRoute) {
      document.documentElement.classList.remove("dark");
    }
  }, [internalRoute]);

  if (internalRoute) return <>{children}</>;

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
};

export default Layout;
