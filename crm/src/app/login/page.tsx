"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FaLock, FaEnvelope, FaSignInAlt, FaEye, FaEyeSlash } from "react-icons/fa";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Invalid credentials");
        return;
      }

      // Sync role and user to localStorage so CrmContext picks it up immediately
      localStorage.setItem("visa_crm_role", data.role);
      if (data.user) {
        localStorage.setItem("visa_crm_user", JSON.stringify(data.user));
      }
      router.push("/");
      router.refresh();
    } catch {
      setError("Network error — please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070712] flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">

        {/* Brand */}
        <div className="flex flex-col items-center space-y-3">
          <img src="/logo.webp" alt="JM Visa Services Logo" className="h-16 w-auto object-contain rounded-2xl" />
          <div className="text-center">
            <h1 className="text-2xl font-extrabold text-white">
              JM VISA SERVICES
            </h1>
            <p className="text-xs uppercase font-bold text-violet-400/80 tracking-widest mt-0.5">
              Immigration CRM
            </p>
          </div>
        </div>

        {/* Card */}
        <div className="bg-slate-900/70 backdrop-blur-md border border-slate-800 rounded-2xl p-8 shadow-2xl space-y-6">
          <div>
            <h2 className="text-lg font-bold text-white">Sign in to your account</h2>
            <p className="text-xs text-slate-400 mt-1">Enter your staff credentials to continue.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block">
                Email Address
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <FaEnvelope className="text-xs" />
                </span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="admin@jmvisa.com"
                  className="w-full bg-slate-950 border border-slate-800 text-sm pl-9 pr-4 py-2.5 rounded-xl focus:outline-none focus:ring-1 focus:ring-violet-500 text-slate-200 placeholder-slate-600"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block">
                Password
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <FaLock className="text-xs" />
                </span>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full bg-slate-950 border border-slate-800 text-sm pl-9 pr-10 py-2.5 rounded-xl focus:outline-none focus:ring-1 focus:ring-violet-500 text-slate-200 placeholder-slate-600"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute inset-y-0 right-3 flex items-center text-slate-500 hover:text-slate-300 cursor-pointer"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <FaEyeSlash className="text-xs" />
                  ) : (
                    <FaEye className="text-xs" />
                  )}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <p className="text-xs font-semibold text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-xl px-3 py-2">
                {error}
              </p>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 disabled:opacity-50 text-white font-semibold text-sm py-2.5 px-4 rounded-xl transition-all shadow-lg shadow-violet-500/20 mt-2"
            >
              <FaSignInAlt className="text-xs" />
              <span>{loading ? "Signing in…" : "Sign In"}</span>
            </button>
          </form>

          {/* Dev hint */}
          {process.env.NODE_ENV !== "production" && (
            <div className="border-t border-slate-800/60 pt-4 space-y-1 text-[10px] text-slate-600">
              <p className="font-bold text-slate-500">Dev credentials:</p>
              <p>admin@jmvisa.com / admin123</p>
              <p>manager@jmvisa.com / manager123</p>
              <p>counselor@jmvisa.com / counselor123</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
