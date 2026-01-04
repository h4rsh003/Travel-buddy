"use client";

import Link from "next/link";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import axios from "axios";
import { useRouter } from "next/navigation"; 
import { FiEye, FiEyeOff, FiCheck, FiArrowLeft, FiUser, FiMail, FiLock } from "react-icons/fi";
import { useState } from "react";
import { toast } from "react-hot-toast"; 

// 1. Validation Schema
const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 chars"),
  email: z.string().email("Invalid email address"),
  password: z
    .string()
    .min(6, "Password must be at least 6 chars")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(/[^a-zA-Z0-9]/, "Password must contain at least one special char (!@#$%)"),
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [isPasswordFocused, setIsPasswordFocused] = useState(false); 
  
  const {
    register,
    handleSubmit,
    setError,
    control,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    mode: "onChange", 
  });

  // Watch password for real-time checklist
  // Replaced `watch` with `useWatch` to fix linter/compiler memoization error
  const passwordValue = useWatch({
    control,
    name: "password",
    defaultValue: "",
  });

  const requirements = [
    { regex: /.{6,}/, text: "6+ chars" }, 
    { regex: /[A-Z]/, text: "1 Uppercase" },
    { regex: /[0-9]/, text: "1 Number" },
    { regex: /[^a-zA-Z0-9]/, text: "1 Symbol" },
  ];

  // 2. Handle Registration
  const onSubmit = async (data: RegisterFormValues) => {
    const loadingToast = toast.loading("Creating account...");
    try {
      await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/register`, data);
      
      toast.dismiss(loadingToast);
      toast.success("Registration Successful! Please login.");
      router.push("/auth/login");
    } catch (error) {
      toast.dismiss(loadingToast);
      if (axios.isAxiosError(error) && error.response) {
         setError("root", { message: error.response.data.message });
         toast.error(error.response.data.message);
      } else {
         setError("root", { message: "Something went wrong. Is backend running?" });
         toast.error("Something went wrong.");
      }
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-travel-bg px-4 relative">
      
      {/* Back to Home Link */}
      <div className="absolute top-8 left-8">
        <Link href="/" className="flex items-center gap-2 text-travel-text-muted hover:text-travel-accent transition-colors text-sm font-medium">
            <FiArrowLeft /> Back to Home
        </Link>
      </div>

      <div className="w-full max-w-md space-y-8 rounded-2xl bg-travel-card p-10 shadow-xl border border-travel-border">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-travel-text">
            Create an Account
          </h2>
          <p className="mt-2 text-sm text-travel-text-muted">
            Join Travel Buddy today
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-6">
          {/* Show Backend Error */}
          {errors.root && (
            <div className="rounded-md bg-red-50 p-3 text-sm text-red-600 text-center border border-red-200">
              {errors.root.message}
            </div>
          )}

          <div className="space-y-4 rounded-md shadow-sm">
            {/* Name Input */}
            <div>
              <label className="block text-sm font-medium text-travel-text mb-1">Name</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiUser className="h-5 w-5 text-travel-text-muted" />
                </div>
                <input
                  {...register("name")}
                  type="text"
                  className="block w-full pl-10 rounded-lg border border-travel-border px-3 py-3 text-travel-text placeholder-travel-text-muted focus:border-travel-accent focus:outline-none focus:ring-1 focus:ring-travel-accent sm:text-sm bg-travel-bg transition-all"
                  placeholder="Your Name"
                />
              </div>
              {errors.name && <p className="mt-1 text-xs text-red-500 font-medium">{errors.name.message}</p>}
            </div>

            {/* Email Input */}
            <div>
              <label className="block text-sm font-medium text-travel-text mb-1">Email</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiMail className="h-5 w-5 text-travel-text-muted" />
                </div>
                <input
                  {...register("email")}
                  type="email"
                  className="block w-full pl-10 rounded-lg border border-travel-border px-3 py-3 text-travel-text placeholder-travel-text-muted focus:border-travel-accent focus:outline-none focus:ring-1 focus:ring-travel-accent sm:text-sm bg-travel-bg transition-all"
                  placeholder="you@example.com"
                />
              </div>
              {errors.email && <p className="mt-1 text-xs text-red-500 font-medium">{errors.email.message}</p>}
            </div>

            {/* Password Input with Icons */}
            <div>
              <label className="block text-sm font-medium text-travel-text mb-1">Password</label>
              <div className="relative mt-1">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiLock className="h-5 w-5 text-travel-text-muted" />
                </div>
                <input
                  {...register("password")}
                  type={showPassword ? "text" : "password"}
                  onFocus={() => setIsPasswordFocused(true)} 
                  onBlur={() => setIsPasswordFocused(false)} 
                  className="block w-full pl-10 pr-10 rounded-lg border border-travel-border px-3 py-3 text-travel-text placeholder-travel-text-muted focus:border-travel-accent focus:outline-none focus:ring-1 focus:ring-travel-accent sm:text-sm bg-travel-bg transition-all"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()} 
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 cursor-pointer text-travel-text-muted hover:text-travel-text focus:outline-none"
                >
                  {showPassword ? (
                    <FiEyeOff className="h-5 w-5" aria-hidden="true" />
                  ) : (
                    <FiEye className="h-5 w-5" aria-hidden="true" />
                  )}
                </button>
              </div>
              
              {/*Conditional Compact Password Checklist */}
              {isPasswordFocused && (
                <div className="mt-2 p-3 bg-travel-bg rounded-lg border border-travel-border text-xs leading-relaxed transition-all duration-300 animate-fade-in shadow-sm">
                  <span className="font-semibold text-travel-text mr-1">Must contain:</span>
                  {requirements.map((req, index) => {
                    const isValid = req.regex.test(passwordValue);
                    return (
                      <span
                        key={index}
                        className={`inline-block transition-colors duration-200 ${
                          isValid ? "text-green-600 font-medium" : "text-travel-text-muted"
                        }`}
                      >
                        {/* Checkmark on LEFT side */}
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
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="group relative flex w-full justify-center rounded-lg cursor-pointer border border-transparent bg-travel-accent px-4 py-3 text-sm font-bold text-white shadow-md hover:bg-travel-accent-hover hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-travel-accent focus:ring-offset-2 disabled:bg-travel-border disabled:cursor-not-allowed transition-all transform active:scale-95"
          >
            {isSubmitting ? (
                 <span className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Creating Account...
                </span>
            ) : "Sign Up"}
          </button>
        </form>

        <p className="text-center text-sm text-travel-text-muted">
          Already have an account?{" "}
          <Link href="/auth/login" className="font-bold text-travel-accent hover:text-travel-accent-hover hover:underline transition-all">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}