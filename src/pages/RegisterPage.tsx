import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../supabase";
import { ArrowLeft, Mail, Lock, User, Loader2, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    });
    if (error) setError(error.message);
    else navigate("/login");
    setLoading(false);
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Left: Aesthetic Branding (Reversed side or same for continuity) */}
      <div className="hidden lg:flex relative bg-black items-center justify-center overflow-hidden">
        <div className="absolute inset-0 opacity-40">
          <img
            src="https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&q=80&w=1500"
            className="w-full h-full object-cover"
            alt="Supercar"
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
            The Journey <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-white/40">
              Starts Here.
            </span>
          </h1>
          <p className="text-lg text-white/60 leading-relaxed font-medium">
            Join a world-class community of automotive enthusiasts. Sell, buy,
            and track performance vehicles with ease.
          </p>
        </div>
        <motion.div
          animate={{
            scale: [1.2, 1, 1.2],
            rotate: [0, -90, 0],
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute -bottom-1/4 -left-1/4 w-[600px] h-[600px] bg-gradient-to-tr from-green-600/20 to-blue-600/20 rounded-full blur-[120px]"
        />
      </div>

      {/* Right: Register Form */}
      <div className="flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md space-y-12">
          <div className="space-y-4">
            <h2 className="text-4xl font-black tracking-tight">
              Create Account
            </h2>
            <p className="text-secondary font-medium">
              Join Unicorn Motors and start your journey today.
            </p>
          </div>

          <form onSubmit={handleRegister} className="space-y-6">
            {error && (
              <div className="p-4 bg-red-50 text-red-600 text-sm font-bold rounded-2xl border border-red-100">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-gray-500 ml-2">
                Full Name
              </label>
              <div className="relative group">
                <User className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300 group-focus-within:text-black transition-colors" />
                <input
                  type="text"
                  required
                  placeholder="John Doe"
                  className="w-full pl-16 pr-6 py-5 bg-gray-50 border-none rounded-[2rem] focus:ring-2 focus:ring-black transition-all"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-gray-500 ml-2">
                Email Address
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
              <label className="text-xs font-black uppercase tracking-widest text-gray-500 ml-2">
                Password
              </label>
              <div className="relative group">
                <Lock className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300 group-focus-within:text-black transition-colors" />
                <input
                  type="password"
                  required
                  placeholder="Min. 6 characters"
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
                "Sign Up"
              )}
            </button>
          </form>

          <div className="text-center">
            <p className="text-secondary font-medium">
              Already have an account?{" "}
              <Link to="/login" className="text-black font-bold underline">
                Sign In
              </Link>
            </p>
          </div>

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

export default RegisterPage;
