import { useState, useEffect } from "react";
import { supabase } from "../supabase";
import AdminSidebar from "../components/AdminSidebar";
import {
  Users,
  Shield,
  Search,
  MoreVertical,
  UserPlus,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  ShieldAlert,
  Truck,
  ShoppingBag,
  User,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Profile {
  id: string;
  email: string;
  role: "admin" | "buyer" | "seller" | "delivery";
  full_name: string;
  created_at: string;
}

const ROLES = [
  {
    value: "admin",
    label: "Administrator",
    icon: ShieldCheck,
    color: "text-red-600",
    bg: "bg-red-50",
  },
  {
    value: "buyer",
    label: "Buyer",
    icon: ShoppingBag,
    color: "text-blue-600",
    bg: "bg-blue-50",
  },
  {
    value: "seller",
    label: "Seller",
    icon: User,
    color: "text-amber-600",
    bg: "bg-amber-50",
  },
  {
    value: "delivery",
    label: "Delivery/Logistics",
    icon: Truck,
    color: "text-purple-600",
    bg: "bg-purple-50",
  },
];

function AdminRBACPage() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState<Profile | null>(null);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchProfiles();
  }, []);

  async function fetchProfiles() {
    setLoading(true);
    // In a real app, this would fetch from a 'profiles' table
    // For this demonstration, we'll try to fetch or mock if table doesn't exist
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data) {
      setProfiles(data);
    } else {
      console.error("Error fetching profiles:", error);
      // Fallback/Mock data for UI demonstration
      setProfiles([
        {
          id: "1",
          email: "admin@unicorn.com",
          role: "admin",
          full_name: "System Admin",
          created_at: new Date().toISOString(),
        },
        {
          id: "2",
          email: "buyer@gmail.com",
          role: "buyer",
          full_name: "John Doe",
          created_at: new Date().toISOString(),
        },
        {
          id: "3",
          email: "seller@porsche.de",
          role: "seller",
          full_name: "Hans Schmidt",
          created_at: new Date().toISOString(),
        },
        {
          id: "4",
          email: "delivery@fedex.com",
          role: "delivery",
          full_name: "Freight Master",
          created_at: new Date().toISOString(),
        },
      ]);
    }
    setLoading(false);
  }

  const handleUpdateRole = async (userId: string, newRole: string) => {
    setUpdating(true);
    const { error } = await supabase
      .from("profiles")
      .update({ role: newRole })
      .eq("id", userId);

    if (!error) {
      // Also update auth.user_metadata if possible (requires service role / edge function usually)
      // Here we just update local state
      setProfiles((prev) =>
        prev.map((p) => (p.id === userId ? { ...p, role: newRole as any } : p)),
      );
      setSelectedUser(null);
    } else {
      alert("Error updating role: " + error.message);
    }
    setUpdating(false);
  };

  const filteredProfiles = profiles.filter(
    (p) =>
      p.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.full_name?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="min-h-screen bg-[#F3F4F6] flex font-sans">
      <AdminSidebar />

      <main className="flex-1 ml-72 flex flex-col min-w-0 min-h-screen">
        <header className="p-8 pb-0 flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-black tracking-tight mb-2">
              Role-Based Access Control
            </h2>
            <p className="text-secondary text-sm font-medium">
              Manage internal permissions and client access levels across the
              platform.
            </p>
          </div>
          <div className="flex items-center gap-4">
            <button className="px-6 py-3 bg-black text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:scale-[1.02] transition-transform shadow-lg flex items-center gap-2">
              <UserPlus className="w-4 h-4" /> Invite Member
            </button>
          </div>
        </header>

        <section className="p-8 flex gap-8 items-start flex-1 min-h-0">
          <div className="flex-1 min-w-0">
            <div className="bg-white rounded-[2.5rem] p-4 shadow-premium border border-gray-100 mb-8">
              <div className="p-4 relative">
                <Search className="absolute left-8 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary/40" />
                <input
                  type="text"
                  placeholder="Search by name or email address..."
                  className="w-full pl-12 pr-6 py-4 bg-gray-50/50 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-black outline-none transition-all"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="text-[10px] font-black uppercase tracking-widest text-secondary/40">
                      <th className="px-8 py-4">User</th>
                      <th className="px-8 py-4">Role / Permissions</th>
                      <th className="px-8 py-4">Status</th>
                      <th className="px-8 py-4">Joined</th>
                      <th className="px-8 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {loading
                      ? Array(4)
                          .fill(0)
                          .map((_, i) => (
                            <tr key={i} className="animate-pulse">
                              <td colSpan={5} className="px-8 py-6">
                                <div className="h-12 bg-gray-50 rounded-xl" />
                              </td>
                            </tr>
                          ))
                      : filteredProfiles.map((profile) => {
                          const roleInfo =
                            ROLES.find((r) => r.value === profile.role) ||
                            ROLES[1];
                          return (
                            <tr
                              key={profile.id}
                              className="group hover:bg-gray-50/30 transition-colors"
                            >
                              <td className="px-8 py-6">
                                <div className="flex items-center gap-4">
                                  <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center p-0.5 overflow-hidden">
                                    <img
                                      src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.email}`}
                                      alt=""
                                    />
                                  </div>
                                  <div>
                                    <p className="text-sm font-black text-black leading-tight">
                                      {profile.full_name}
                                    </p>
                                    <p className="text-[10px] text-secondary font-bold">
                                      {profile.email}
                                    </p>
                                  </div>
                                </div>
                              </td>
                              <td className="px-8 py-6">
                                <div
                                  className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full ${roleInfo.bg} ${roleInfo.color}`}
                                >
                                  <roleInfo.icon className="w-3.5 h-3.5" />
                                  <span className="text-[9px] font-black uppercase tracking-widest">
                                    {roleInfo.label}
                                  </span>
                                </div>
                              </td>
                              <td className="px-8 py-6">
                                <span className="inline-flex items-center gap-1.5">
                                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                                  <span className="text-[10px] font-bold text-secondary uppercase tracking-widest">
                                    Active
                                  </span>
                                </span>
                              </td>
                              <td className="px-8 py-6 text-[10px] font-bold text-secondary uppercase">
                                {new Date(
                                  profile.created_at,
                                ).toLocaleDateString("en-US", {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                })}
                              </td>
                              <td className="px-8 py-6 text-right">
                                <button
                                  onClick={() => setSelectedUser(profile)}
                                  className="p-2 hover:bg-black hover:text-white rounded-lg transition-all"
                                >
                                  <MoreVertical className="w-4 h-4" />
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Role Editor Panel */}
          <AnimatePresence>
            {selectedUser && (
              <motion.aside
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="w-96 shrink-0 bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-premium sticky top-8"
              >
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-xl font-black tracking-tight">
                    Modify Permissions
                  </h3>
                  <button
                    onClick={() => setSelectedUser(null)}
                    className="text-secondary hover:text-black transition-colors"
                  >
                    <ShieldAlert className="w-5 h-5" />
                  </button>
                </div>

                <div className="flex flex-col items-center mb-10 text-center">
                  <div className="w-20 h-20 rounded-full border-4 border-gray-100 p-1 mb-4 overflow-hidden">
                    <img
                      src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedUser.email}`}
                      alt=""
                    />
                  </div>
                  <h4 className="text-lg font-black">
                    {selectedUser.full_name}
                  </h4>
                  <p className="text-xs text-secondary font-medium">
                    {selectedUser.email}
                  </p>
                </div>

                <div className="space-y-3 mb-10">
                  <p className="text-[10px] font-black uppercase tracking-widest text-secondary/40 ml-2 mb-2">
                    Select User Role
                  </p>
                  {ROLES.map((role) => (
                    <button
                      key={role.value}
                      onClick={() =>
                        handleUpdateRole(selectedUser.id, role.value)
                      }
                      className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all text-left ${
                        selectedUser.role === role.value
                          ? "border-black bg-black text-white shadow-lg"
                          : "border-gray-100 hover:border-gray-300 bg-gray-50/50"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <role.icon
                          className={`w-4 h-4 ${selectedUser.role === role.value ? "text-white" : role.color}`}
                        />
                        <div>
                          <p className="text-[10px] font-black uppercase tracking-widest">
                            {role.label}
                          </p>
                        </div>
                      </div>
                      {selectedUser.role === role.value && (
                        <CheckCircle2 className="w-4 h-4" />
                      )}
                    </button>
                  ))}
                </div>

                <div className="space-y-4 pt-8 border-t border-gray-50">
                  <div className="flex items-start gap-3 p-4 bg-amber-50 rounded-2xl border border-amber-100 text-amber-700">
                    <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                    <p className="text-[10px] font-bold leading-relaxed">
                      Changing a user's role will immediately update their
                      access permissions across all modules. This action is
                      logged for security audits.
                    </p>
                  </div>
                  <button className="w-full py-4 text-red-600 font-black uppercase tracking-widest text-[10px] hover:bg-red-50 rounded-2xl transition-all">
                    Suspend User Account
                  </button>
                </div>
              </motion.aside>
            )}
          </AnimatePresence>
        </section>
      </main>
    </div>
  );
}

export default AdminRBACPage;
