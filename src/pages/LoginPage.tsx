import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../supabase";
import { ArrowLeft, Mail, Lock, Loader2, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) setError(error.message);
    else navigate("/");
    setLoading(false);
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Left: Aesthetic Branding */}
      <div className="hidden lg:flex relative bg-black items-center justify-center overflow-hidden">
        <div className="absolute inset-0 opacity-40">
          <img
            src="https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80&w=1500"
            className="w-full h-full object-cover"
            alt="Luxury Car"
          />
        </div>
        <div className="relative z-10 p-16 text-white max-w-xl">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm font-bold mb-12 opacity-60 hover:opacity-100 transition-opacity"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Store
          </Link>
          <h1 className="text-6xl font-black tracking-tighter mb-8 leading-none">
            Experience <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-white/40">
              Excellence.
            </span>
          </h1>
          <p className="text-lg text-white/60 leading-relaxed font-medium">
            Access your private inventory, manage your listings, and connect
            with performance specialists.
          </p>
        </div>
        {/* Animated background element */}
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 90, 0],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute -top-1/4 -right-1/4 w-[600px] h-[600px] bg-gradient-to-br from-blue-600/20 to-purple-600/20 rounded-full blur-[120px]"
        />
      </div>

      {/* Right: Login Form */}
      <div className="flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md space-y-12">
          <div className="space-y-4">
            <h2 className="text-4xl font-black tracking-tight">Welcome Back</h2>
            <p className="text-secondary font-medium">
              Please enter your details to access your account.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            {error && (
              <div className="p-4 bg-red-50 text-red-600 text-sm font-bold rounded-2xl border border-red-100 italic">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-gray-500 ml-2">
                Alamat Email
              </label>
              <div className="relative group">
                <Mail className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300 group-focus-within:text-black transition-colors" />
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  className="w-full pl-16 pr-6 py-5 bg-gray-50 border-none rounded-[2rem] focus:ring-2 focus:ring-black transition-all"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center px-2">
                <label className="text-xs font-black uppercase tracking-widest text-gray-500">
                  Kata Sandi
                </label>
                {/* <button
                  type="button"
                  className="text-xs font-bold underline text-secondary hover:text-black"
                >
                  Forgot password?
                </button> */}
              </div>
              <div className="relative group">
                <Lock className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300 group-focus-within:text-black transition-colors" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  className="w-full pl-16 pr-6 py-5 bg-gray-50 border-none rounded-[2rem] focus:ring-2 focus:ring-black transition-all"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-5 bg-black text-white rounded-[2rem] font-bold text-lg shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:scale-100 flex items-center justify-center gap-2"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          <div className="text-center">
            <p className="text-secondary font-medium">
              Belum punya akun?{" "}
              <Link to="/register" className="text-black font-bold underline">
                Daftar gratis
              </Link>
            </p>
          </div>

          {/* Trust Batch */}
          <div className="pt-12 flex items-center justify-center gap-8 opacity-40 grayscale pointer-events-none">
            <Sparkles className="w-6 h-6" />
            <span className="text-[10px] uppercase font-black tracking-widest">
              Secured by Unicorn Auth
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
