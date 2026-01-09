"use client";

import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { FiEye, FiEyeOff, FiMail, FiLock, FiArrowLeft } from "react-icons/fi";
import { toast } from "react-hot-toast";
import ForgotPasswordModal from "../forgotPassword/page";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);
  
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  // Handle Form Submission
  const onSubmit = async (data: LoginFormValues) => {
    const loadingToast = toast.loading("Signing in...");

    try {
      const result = await signIn("credentials", {
        redirect: false,
        email: data.email,
        password: data.password,
      });

      toast.dismiss(loadingToast);

      if (result?.error) {
        toast.error("Invalid email or password");
        setError("root", { message: "Invalid email or password" });
      } else {
        toast.success("Welcome back!");
        router.push("/"); 
      }
    } catch (error) {
      console.error(error);
      toast.dismiss(loadingToast);
      toast.error("Something went wrong");
      setError("root", { message: "Something went wrong" });
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-travel-bg px-4 relative">
      
      <div className="absolute top-8 left-8">
        <Link href="/" className="flex items-center gap-2 text-travel-text-muted hover:text-travel-accent transition-colors text-sm font-medium">
            <FiArrowLeft /> Back to Home
        </Link>
      </div>

      <div className="w-full max-w-md space-y-8 rounded-2xl bg-travel-card p-10 shadow-xl border border-travel-border transform transition-all">
     
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-travel-text">
            Welcome Back!
          </h2>
          <p className="mt-2 text-sm text-travel-text-muted">
            Sign in to start your next adventure
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-6">
          <div className="space-y-5">
            
            <div>
              <label className="block text-sm font-medium text-travel-text mb-1">Email</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiMail className="h-5 w-5 text-travel-text-muted" />
                </div>
                <input
                  {...register("email")}
                  type="email"
                  className="block w-full pl-10 rounded-lg border border-travel-border px-3 py-3 text-travel-text 
                    placeholder-travel-text-muted focus:border-travel-accent focus:outline-none focus:ring-1 focus:ring-travel-accent sm:text-sm bg-travel-bg transition-all"
                  placeholder="you@example.com"
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-xs text-red-500 font-medium">{errors.email.message}</p>
              )}
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-sm font-medium text-travel-text mb-1">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiLock className="h-5 w-5 text-travel-text-muted" />
                </div>
                <input
                  {...register("password")}
                  type={showPassword ? "text" : "password"}
                  className="block w-full pl-10 pr-10 rounded-lg border border-travel-border px-3 py-3 text-travel-text
                   placeholder-travel-text-muted focus:border-travel-accent focus:outline-none focus:ring-1 focus:ring-travel-accent sm:text-sm bg-travel-bg transition-all"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 cursor-pointer text-travel-text-muted hover:text-travel-text focus:outline-none"
                >
                  {showPassword ? (
                    <FiEyeOff className="h-5 w-5" />
                  ) : (
                    <FiEye className="h-5 w-5" />
                  )}
                </button>
              </div>
              
              <div className="flex justify-between items-center mt-1">
                 {errors.password ? (
                    <p className="text-xs text-red-500 font-medium">{errors.password.message}</p>
                 ) : <div></div>}
                 
                 {/* Forgot Password Link */}
                 <button
                    type="button"
                    onClick={() => setIsForgotModalOpen(true)}
                    className="text-xs font-semibold text-travel-accent hover:text-travel-accent-hover hover:underline transition-colors"
                 >
                    Forgot Password?
                 </button>
              </div>

              {/* Login Failed Error */}
              {errors.root && (
                <div className="mt-3 p-3 rounded-lg bg-red-50 border border-red-100 text-red-600 text-sm text-center font-medium animate-pulse">
                  {errors.root.message}
                </div>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="group relative flex w-full justify-center cursor-pointer rounded-lg border border-transparent bg-travel-accent px-4 py-3 text-sm font-bold text-white shadow-md hover:bg-travel-accent-hover hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-travel-accent focus:ring-offset-2 disabled:bg-travel-border disabled:cursor-not-allowed transition-all transform active:scale-95"
          >
            {isSubmitting ? (
                <span className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Signing in...
                </span>
            ) : "Sign in"}
          </button>
        </form>

        {/* Footer Link */}
        <p className="text-center text-sm text-travel-text-muted">
          Do not have an account?{" "}
          <Link href="/auth/register" className="font-bold text-travel-accent hover:text-travel-accent-hover hover:underline transition-all">
            Sign up
          </Link>
        </p>
      </div>

      {/* Forgot Password Modal */}
      <ForgotPasswordModal
        isOpen={isForgotModalOpen} 
        onClose={() => setIsForgotModalOpen(false)} 
      />
    </div>
  );
}