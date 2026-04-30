import { useLocation, useNavigate } from "react-router-dom";
import {
  Car,
  CreditCard,
  Truck,
  Gavel,
  LogOut,
  TrendingUp,
  Users,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

const navItems = [
  { icon: Car, label: "Inventaris", path: "/admin/inventory" },
  { icon: CreditCard, label: "Transaksi", path: "/admin/transactions" },
  { icon: Truck, label: "Pengiriman", path: "/admin/delivery" },
  { icon: Gavel, label: "Akuisisi", path: "/admin/acquisitions" },
  { icon: Users, label: "Tim & RBAC", path: "/admin/rbac" },
];

function AdminSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <aside className="w-72 bg-white border-r border-gray-100 flex flex-col fixed inset-y-0 shadow-sm z-50">
      <div className="p-8">
        <div
          className="flex items-center gap-3 mb-10 cursor-pointer"
          onClick={() => navigate("/admin/transactions")}
        >
          <TrendingUp className="w-6 h-6 text-black" />
          <div>
            <h1 className="text-sm font-black uppercase tracking-tight">
              Admin
            </h1>
            <p className="text-[10px] text-secondary font-bold uppercase tracking-widest">
              Motora
            </p>
          </div>
        </div>

        <nav className="space-y-2">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.label}
                onClick={() => {
                  if (item.path !== "#") navigate(item.path);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left text-xs font-bold uppercase tracking-widest transition-all ${
                  isActive
                    ? "bg-black text-white shadow-lg"
                    : item.path === "#"
                      ? "text-gray-300 cursor-not-allowed"
                      : "text-secondary hover:bg-gray-50"
                }`}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
                {item.path === "#" && (
                  <span className="ml-auto text-[8px] bg-gray-100 text-gray-400 px-1.5 py-0.5 rounded-full">
                    Soon
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      <div className="mt-auto p-8 border-t border-gray-50 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full border-2 border-gray-100 p-0.5 overflow-hidden">
            <img
              src="https://api.dicebear.com/7.x/avataaars/svg?seed=Alex"
              alt="Alex"
            />
          </div>
          <div>
            <p className="text-[11px] font-black">
              {user?.user_metadata.full_name}
            </p>
            <p className="text-[9px] text-secondary font-bold">{user?.email}</p>
          </div>
        </div>
        <button
          onClick={() => navigate("/")}
          className="text-secondary hover:text-red-500 transition-colors"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </aside>
  );
}

export default AdminSidebar;
