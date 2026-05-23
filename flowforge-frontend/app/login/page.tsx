"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Lock, Mail, ArrowRight, ShieldCheck, CheckCircle2 } from "lucide-react";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (searchParams.get("registered") === "true") {
      setSuccess(true);
    }
  }, [searchParams]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);
    setLoading(true);

    // Fetch credentials created on Register screen
    const storedEmail = localStorage.getItem("registeredEmail") || "admin@flowforge.ai";
    const storedPassword = localStorage.getItem("registeredPassword") || "password123";

    if (email === storedEmail && password === storedPassword) {
      setTimeout(() => {
        localStorage.setItem("isAuthenticated", "true");
        router.push("/");
      }, 1000);
    } else {
      setLoading(false);
      setError("Invalid credentials. Try using your registered account or the default admin login.");
    }
  };

  return (
    <div className="min-h-screen bg-black flex flex-col justify-center items-center px-4 font-sans antialiased">
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-zinc-800/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-md w-full space-y-8 relative z-10">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-zinc-950 border border-zinc-800 text-zinc-400 mb-4 shadow-xl">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-white">flowforge-ai</h2>
          <p className="mt-2 text-sm text-zinc-400">Sign in to access your multi-agent command deck</p>
        </div>

        <div className="bg-zinc-900/40 backdrop-blur-md border border-zinc-800 rounded-2xl p-6 sm:p-8 shadow-2xl">
          <form className="space-y-6" onSubmit={handleLogin}>
            {success && (
              <div className="p-3 bg-zinc-950 border border-zinc-800 text-zinc-300 rounded-xl text-xs flex items-center justify-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                Account created successfully! Please sign in.
              </div>
            )}

            {error && (
              <div className="p-3 bg-red-950/30 border border-red-900 text-red-400 rounded-xl text-xs text-center">
                {error}
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-zinc-400 uppercase tracking-wider mb-2">Email Address</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-zinc-500"><Mail className="w-4 h-4" /></span>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@flowforge.ai"
                  className="block w-full pl-10 pr-4 py-3 bg-zinc-950 border border-zinc-800 text-white placeholder-zinc-600 rounded-xl text-sm focus:outline-none focus:border-zinc-700 transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-400 uppercase tracking-wider mb-2">Password</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-zinc-500"><Lock className="w-4 h-4" /></span>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="block w-full pl-10 pr-4 py-3 bg-zinc-950 border border-zinc-800 text-white placeholder-zinc-600 rounded-xl text-sm focus:outline-none focus:border-zinc-700 transition"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-white hover:bg-zinc-200 disabled:bg-zinc-800 text-black disabled:text-zinc-500 font-medium rounded-xl text-sm transition shadow-lg cursor-pointer"
            >
              {loading ? "Authenticating..." : "Launch Dashboard"}
              {!loading && <ArrowRight className="w-4 h-4" />}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-zinc-400">
            Don't have an account?{" "}
            <Link href="/register" className="text-white hover:underline font-medium">
              Register Now
            </Link>
          </div>
        </div>

        <div className="text-center text-xs text-zinc-600 tracking-wide">
          Fallback Admin Credentials — <span className="font-mono text-zinc-500">admin@flowforge.ai</span> | <span className="font-mono text-zinc-500">password123</span>
        </div>
      </div>
    </div>
  );
}