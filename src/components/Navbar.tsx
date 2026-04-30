import React from "react";
import { Link, useLocation } from "react-router-dom";
import { User as UserIcon, LogOut } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const Navbar: React.FC = () => {
  const location = useLocation();
  const { user, signOut, role, loading } = useAuth();

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
      <div className="flex items-center gap-8">
        <Link to="/" className="text-xl font-bold tracking-tight">
          Motora
        </Link>
      </div>

      <div className="flex items-center gap-8">
        <div className="hidden lg:flex items-center gap-6 text-sm font-medium">
          <Link
            to="/"
            className={`${location.pathname === "/" ? "border-b-2 border-primary" : "text-secondary hover:text-primary"} py-1 transition-colors`}
          >
            Bursa Mobil
          </Link>
          {!loading && role != "admin" && (
            <>
              <Link
                to="/sell"
                className={`${location.pathname === "/sell" ? "border-b-2 border-primary" : "text-secondary hover:text-primary"} py-1 transition-colors`}
              >
                Jual
              </Link>
              <Link
                to="/bookings"
                className={`${location.pathname.startsWith("/bookings") ? "border-b-2 border-primary text-black" : "text-secondary hover:text-primary"} py-1 transition-colors`}
              >
                Pemesanan
              </Link>
              <Link
                to="/sell/requests"
                className={`${location.pathname.startsWith("/sell/requests") ? "border-b-2 border-primary text-black" : "text-secondary hover:text-primary"} py-1 transition-colors`}
              >
                Permintaan Jual
              </Link>
            </>
          )}
          {!loading && role == "admin" && (
            <Link
              to="/admin/transactions"
              className={`${location.pathname.startsWith("/admin") ? "border-b-2 border-primary text-black" : "text-secondary hover:text-primary"} py-1 transition-colors`}
            >
              Admin
            </Link>
          )}
        </div>

        <div className="flex items-center gap-4 border-l pl-8 border-gray-200">
          {user ? (
            <div className="flex items-center gap-2">
              <button
                onClick={() => signOut()}
                className="p-2 text-secondary hover:text-red-500 transition-colors flex items-center gap-2"
                title="Keluar"
              >
                <LogOut className="w-5 h-5" /> Keluar
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className="p-2 text-secondary hover:bg-background rounded-full transition-all flex items-center gap-2"
            >
              <UserIcon className="w-5 h-5" />
              <span className="text-xs font-bold hidden sm:inline">Masuk</span>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
