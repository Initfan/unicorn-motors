import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { User as UserIcon, LogOut, Menu, X } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const Navbar: React.FC = () => {
  const location = useLocation();
  const { user, signOut, role, loading } = useAuth();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const closeMenu = () => setMobileMenuOpen(false);

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-100">
      <div className="px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link
          to="/"
          className="text-xl font-bold tracking-tight"
          onClick={closeMenu}
        >
          Motora
        </Link>

        {/* Desktop Menu */}
        {!loading && (
          <div className="hidden lg:flex items-center gap-8">
            <div className="flex items-center gap-6 text-sm font-medium">
              <Link
                to="/"
                className={`${
                  location.pathname === "/"
                    ? "border-b-2 border-primary"
                    : "text-secondary hover:text-primary"
                } py-1 transition-colors`}
              >
                Bursa Mobil
              </Link>

              {role !== "admin" && role !== "delivery" && (
                <>
                  <Link
                    to="/sell"
                    className={`${
                      location.pathname === "/sell"
                        ? "border-b-2 border-primary"
                        : "text-secondary hover:text-primary"
                    } py-1 transition-colors`}
                  >
                    Jual
                  </Link>

                  <Link
                    to="/bookings"
                    className={`${
                      location.pathname.startsWith("/bookings")
                        ? "border-b-2 border-primary text-black"
                        : "text-secondary hover:text-primary"
                    } py-1 transition-colors`}
                  >
                    Pemesanan
                  </Link>

                  <Link
                    to="/sell/requests"
                    className={`${
                      location.pathname.startsWith("/sell/requests")
                        ? "border-b-2 border-primary text-black"
                        : "text-secondary hover:text-primary"
                    } py-1 transition-colors`}
                  >
                    Permintaan Jual
                  </Link>
                </>
              )}

              {role === "admin" && (
                <Link
                  to="/admin/transactions"
                  className={`${
                    location.pathname.startsWith("/admin")
                      ? "border-b-2 border-primary text-black"
                      : "text-secondary hover:text-primary"
                  } py-1 transition-colors`}
                >
                  Admin
                </Link>
              )}

              {role === "delivery" && (
                <Link
                  to="/admin/delivery"
                  className={`${
                    location.pathname.startsWith("/admin")
                      ? "border-b-2 border-primary text-black"
                      : "text-secondary hover:text-primary"
                  } py-1 transition-colors`}
                >
                  Pengiriman
                </Link>
              )}
            </div>

            <div className="flex items-center gap-4 border-l pl-8 border-gray-200">
              {user ? (
                <button
                  onClick={() => signOut()}
                  className="p-2 text-secondary hover:text-red-500 transition-colors flex items-center gap-2"
                  title="Keluar"
                >
                  <LogOut className="w-5 h-5" />
                  Keluar
                </button>
              ) : (
                <Link
                  to="/login"
                  className="p-2 text-secondary hover:bg-background rounded-full transition-all flex items-center gap-2"
                >
                  <UserIcon className="w-5 h-5" />
                  <span className="text-xs font-bold hidden sm:inline">
                    Masuk
                  </span>
                </Link>
              )}
            </div>
          </div>
        )}

        {/* Mobile Button */}
        <button
          className="lg:hidden p-2"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? (
            <X className="w-6 h-6" />
          ) : (
            <Menu className="w-6 h-6" />
          )}
        </button>
      </div>

      {/* Mobile Menu */}
      {!loading && mobileMenuOpen && (
        <div className="lg:hidden border-t border-gray-100 bg-white px-6 py-4 space-y-4">
          <Link
            to="/"
            onClick={closeMenu}
            className={`block ${
              location.pathname === "/"
                ? "text-primary font-semibold"
                : "text-secondary"
            }`}
          >
            Bursa Mobil
          </Link>

          {role !== "admin" && (
            <>
              <Link
                to="/sell"
                onClick={closeMenu}
                className={`block ${
                  location.pathname === "/sell"
                    ? "text-primary font-semibold"
                    : "text-secondary"
                }`}
              >
                Jual
              </Link>

              <Link
                to="/bookings"
                onClick={closeMenu}
                className={`block ${
                  location.pathname.startsWith("/bookings")
                    ? "text-primary font-semibold"
                    : "text-secondary"
                }`}
              >
                Pemesanan
              </Link>

              <Link
                to="/sell/requests"
                onClick={closeMenu}
                className={`block ${
                  location.pathname.startsWith("/sell/requests")
                    ? "text-primary font-semibold"
                    : "text-secondary"
                }`}
              >
                Permintaan Jual
              </Link>
            </>
          )}

          {role === "admin" && (
            <Link
              to="/admin/transactions"
              onClick={closeMenu}
              className={`block ${
                location.pathname.startsWith("/admin")
                  ? "text-primary font-semibold"
                  : "text-secondary"
              }`}
            >
              Admin
            </Link>
          )}

          <div className="pt-4 border-t border-gray-100">
            {user ? (
              <button
                onClick={() => {
                  signOut();
                  closeMenu();
                }}
                className="flex items-center gap-2 text-red-500"
              >
                <LogOut className="w-5 h-5" />
                Keluar
              </button>
            ) : (
              <Link
                to="/login"
                onClick={closeMenu}
                className="flex items-center gap-2 text-secondary"
              >
                <UserIcon className="w-5 h-5" />
                Masuk
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
