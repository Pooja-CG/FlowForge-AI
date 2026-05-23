"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, Mail, ArrowRight, User, ShieldCheck } from "lucide-react";
import Link from "next/link";

export default function RegisterPage(): React.JSX.Element {
  const [name, setName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const router = useRouter();

  const handleRegister = (e: React.FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    setLoading(true);

    setTimeout(() => {
      localStorage.setItem("registeredEmail", email);
      localStorage.setItem("registeredPassword", password);
      localStorage.setItem("registeredName", name);
      setLoading(false);
      
      router.push("/login?registered=true");
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-black flex flex-col justify-center items-center px-4 font-sans antialiased">
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-zinc-800/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-md w-full space-y-8 relative z-10">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-zinc-950 border border-zinc-800 text-zinc-400 mb-4 shadow-xl">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-white">Create Account</h2>
          <p className="mt-2 text-sm text-zinc-400">Join flowforge-ai and build your workspace</p>
        </div>

        <div className="bg-zinc-900/40 backdrop-blur-md border border-zinc-800 rounded-2xl p-6 sm:p-8 shadow-2xl">
          <form className="space-y-5" onSubmit={handleRegister}>
            {/* Name Field */}
            <div>
              <label className="block text-xs font-medium text-zinc-400 uppercase tracking-wider mb-2">Full Name</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-zinc-500">
                  <User className="w-4 h-4" />
                </span>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
                  placeholder="Alex Carter"
                  className="block w-full pl-10 pr-4 py-3 bg-zinc-950 border border-zinc-800 text-white placeholder-zinc-600 rounded-xl text-sm focus:outline-none focus:border-zinc-700 focus:ring-1 focus:ring-zinc-700 transition"
                />
              </div>
            </div>

            {/* Email Field */}
            <div>
              <label className="block text-xs font-medium text-zinc-400 uppercase tracking-wider mb-2">Email Address</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-zinc-500">
                  <Mail className="w-4 h-4" />
                </span>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                  placeholder="alex@flowforge.ai"
                  className="block w-full pl-10 pr-4 py-3 bg-zinc-950 border border-zinc-800 text-white placeholder-zinc-600 rounded-xl text-sm focus:outline-none focus:border-zinc-700 focus:ring-1 focus:ring-zinc-700 transition"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-xs font-medium text-zinc-400 uppercase tracking-wider mb-2">Password</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-zinc-500">
                  <Lock className="w-4 h-4" />
                </span>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="block w-full pl-10 pr-4 py-3 bg-zinc-950 border border-zinc-800 text-white placeholder-zinc-600 rounded-xl text-sm focus:outline-none focus:border-zinc-700 focus:ring-1 focus:ring-zinc-700 transition"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-white hover:bg-zinc-200 disabled:bg-zinc-800 text-black disabled:text-zinc-500 font-medium rounded-xl text-sm transition shadow-lg cursor-pointer"
            >
              {loading ? "Creating Account..." : "Register Account"}
              {!loading && <ArrowRight className="w-4 h-4" />}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-zinc-400">
            Already have an account?{" "}
            <Link href="/login" className="text-white hover:underline font-medium">
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}