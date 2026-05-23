"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { User, Mail, Lock, ArrowRight, ShieldAlert, Loader2 } from "lucide-react";
import Link from "next/link";

export default function RegisterPage(): React.JSX.Element {
    const router = useRouter();

    // Form input states
    const [name, setName] = useState<string>("");
    const [email, setEmail] = useState<string>("");
    const [password, setPassword] = useState<string>("");

    // Status execution states
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>("");

    const handleRegister = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            // 1. Submit payload directly to your running FastAPI backend pipeline
            // Automatically switches between production api and local fallback
            const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

            const res = await fetch(`${backendUrl}/api/auth/register`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    name: name.trim(),
                    email: email.trim().toLowerCase(),
                    password: password,
                }),
            });

            const data = await res.json();

            // 2. Handle server-side validation error checks (like duplicate emails)
            if (!res.ok) {
                throw new Error(data.detail || "Registration protocol rejected by database.");
            }

            if (data.status === "error") {
                throw new Error(data.message || "An unexpected processing error occurred.");
            }

            // 3. Stash user profile parameters locally for immediate dashboard read fallbacks
            localStorage.setItem("registeredEmail", email.trim().toLowerCase());
            localStorage.setItem("registeredPassword", password);
            localStorage.setItem("registeredName", name.trim());

            // 4. Safely reroute back to login workspace with registered flag active
            router.push("/login?registered=true");
        } catch (err: any) {
            console.error("FRONTEND SYSTEM REGISTRATION FAILURE:", err);
            setError(err.message || "Could not bridge network connection to the database server.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-black flex flex-col justify-center items-center px-4 font-sans antialiased">
            {/* Visual Background Accent Node */}
            <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-blue-500/5 blur-[120px] rounded-full pointer-events-none" />

            <div className="max-w-md w-full space-y-8 relative z-10">
                <div className="text-center">
                    <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-zinc-950 border border-zinc-800 text-blue-400 mb-4 shadow-xl">
                        <User className="w-7 h-7" />
                    </div>
                    <h2 className="text-3xl font-bold tracking-tight text-white">Create Account</h2>
                    <p className="mt-2 text-sm text-zinc-400">Initialize your access tokens for FlowForge AI</p>
                </div>

                <div className="bg-zinc-900/40 backdrop-blur-md border border-zinc-800 rounded-2xl p-6 sm:p-8 shadow-2xl">
                    <form className="space-y-6" onSubmit={handleRegister}>

                        {/* System Error Display Wrapper */}
                        {error && (
                            <div className="p-3 bg-red-950/30 border border-red-900 text-red-400 rounded-xl text-xs flex items-center gap-2 justify-center">
                                <ShieldAlert className="w-4 h-4 shrink-0" />
                                <span>{error}</span>
                            </div>
                        )}

                        {/* Name Field */}
                        <div>
                            <label className="block text-xs font-medium text-zinc-400 uppercase tracking-wider mb-2">Full Name</label>
                            <div className="relative">
                                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-zinc-500"><User className="w-4 h-4" /></span>
                                <input
                                    type="text"
                                    required
                                    value={name}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
                                    placeholder="Pooja C G"
                                    className="block w-full pl-10 pr-4 py-3 bg-zinc-950 border border-zinc-800 text-white placeholder-zinc-600 rounded-xl text-sm focus:outline-none focus:border-zinc-700 transition"
                                />
                            </div>
                        </div>

                        {/* Email Field */}
                        <div>
                            <label className="block text-xs font-medium text-zinc-400 uppercase tracking-wider mb-2">Email Address</label>
                            <div className="relative">
                                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-zinc-500"><Mail className="w-4 h-4" /></span>
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                                    placeholder="developer@flowforge.ai"
                                    className="block w-full pl-10 pr-4 py-3 bg-zinc-950 border border-zinc-800 text-white placeholder-zinc-600 rounded-xl text-sm focus:outline-none focus:border-zinc-700 transition"
                                />
                            </div>
                        </div>

                        {/* Password Field */}
                        <div>
                            <label className="block text-xs font-medium text-zinc-400 uppercase tracking-wider mb-2">Secure Password</label>
                            <div className="relative">
                                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-zinc-500"><Lock className="w-4 h-4" /></span>
                                <input
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="block w-full pl-10 pr-4 py-3 bg-zinc-950 border border-zinc-800 text-white placeholder-zinc-600 rounded-xl text-sm focus:outline-none focus:border-zinc-700 transition"
                                />
                            </div>
                        </div>

                        {/* Form Submit Button Trigger */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-zinc-800 text-white disabled:text-zinc-500 font-medium rounded-xl text-sm transition shadow-lg cursor-pointer"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    <span>Configuring Schema...</span>
                                </>
                            ) : (
                                <>
                                    <span>Register Account</span>
                                    <ArrowRight className="w-4 h-4" />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-6 text-center text-sm text-zinc-400">
                        Already have credentials?{" "}
                        <Link href="/login" className="text-blue-400 hover:underline font-medium">
                            Sign In Here
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}