"use client";

import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import axios from "axios";
import { toast } from "react-hot-toast";
import { FiLock, FiEye, FiEyeOff, FiCheck } from "react-icons/fi";
import Link from "next/link";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);

  const requirements = [
    { regex: /.{6,}/, text: "6+ chars" }, 
    { regex: /[A-Z]/, text: "1 Uppercase" },
    { regex: /[0-9]/, text: "1 Number" },
    { regex: /[^a-zA-Z0-9]/, text: "1 Symbol" },
  ];

  // Helper to handle blur with delay (prevents layout shift issues)
//   const handlePasswordBlur = () => {
//     setTimeout(() => {
//         setIsPasswordFocused(false);
//     }, 200);
//   };

  // If no token, show invalid state
  if (!token) {
    return (
        <div className="text-center text-red-500 py-10">
            <h3 className="text-lg font-bold">Invalid Link</h3>
            <p>This password reset link is invalid or missing.</p>
            <Link href="/auth/login" className="text-travel-accent hover:underline mt-4 block font-semibold">
                Return to Login
            </Link>
        </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 1. Check if passwords match
    if (password !== confirmPassword) {
      toast.error("Passwords do not match!");
      return;
    }

    // 2. Validate against all Regex requirements
    const isStrongPassword = requirements.every((req) => req.regex.test(password));
    if (!isStrongPassword) {
        toast.error("Password does not meet complexity requirements.");
        return;
    }

    setLoading(true);
    try {
      await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/reset-password`, {
        token,
        newPassword: password
      });

      toast.success("Password reset successful!");
      router.push("/auth/login");
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        toast.error(error.response.data.message || "Failed to reset password.");
      } else {
        toast.error("Failed to reset password.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-travel-text mb-1">New Password</label>
        <div className="relative">
          <input
            type={showPass ? "text" : "password"}
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onFocus={() => setIsPasswordFocused(true)}
            // onBlur={handlePasswordBlur}
            className="w-full pl-10 pr-10 py-3 rounded-lg border border-travel-border bg-travel-bg text-travel-text focus:ring-2 focus:ring-travel-accent outline-none transition-all"
            placeholder="••••••••"
          />
          <FiLock className="absolute left-3 top-3.5 text-travel-text-muted" />
          <button
            type="button"
            onClick={() => setShowPass(!showPass)}
            className="absolute right-3 top-3.5 text-travel-text-muted hover:text-travel-text"
          >
            {showPass ? <FiEyeOff /> : <FiEye />}
          </button>
        </div>

        {/* NEW: Password Checklist */}
        {isPasswordFocused && (
            <div className="mt-2 p-3 bg-travel-bg rounded-lg border border-travel-border text-xs leading-relaxed transition-all duration-300 animate-fade-in shadow-sm">
                <span className="font-semibold text-travel-text mr-1">Must contain:</span>
                {requirements.map((req, index) => {
                const isValid = req.regex.test(password);
                return (
                    <span
                    key={index}
                    className={`inline-block transition-colors duration-200 ${
                        isValid ? "text-green-600 font-medium" : "text-travel-text-muted"
                    }`}
                    >
                    {/* Checkmark */}
                    {isValid && <FiCheck className="inline h-3 w-3 mr-0.5 -mt-0.5" />}
                    {req.text}
                    {/* Comma if not last */}
                    {index < requirements.length - 1 && <span className="text-travel-text-muted mr-1">,</span>}
                    </span>
                );
                })}
            </div>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-travel-text mb-1">Confirm Password</label>
        <div className="relative">
          <input
            type={showPass ? "text" : "password"}
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full pl-10 pr-10 py-3 rounded-lg border border-travel-border bg-travel-bg text-travel-text focus:ring-2 focus:ring-travel-accent outline-none transition-all"
            placeholder="••••••••"
          />
          <FiLock className="absolute left-3 top-3.5 text-travel-text-muted" />
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 bg-travel-accent hover:bg-travel-accent-hover text-white font-bold rounded-lg shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? "Resetting..." : "Reset Password"}
      </button>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-travel-bg px-4">
      <div className="w-full max-w-md bg-travel-card rounded-2xl shadow-xl p-8 border border-travel-border">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-travel-text">Set New Password</h2>
          <p className="text-travel-text-muted text-sm mt-2">Enter your new password below.</p>
        </div>
        
        <Suspense fallback={<div className="text-center p-4 text-travel-text">Loading form...</div>}>
          <ResetPasswordForm />
        </Suspense>
      </div>
    </div>
  );
}