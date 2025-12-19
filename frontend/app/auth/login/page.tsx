"use client";

import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { FiEye, FiEyeOff } from "react-icons/fi";

// 1. Define Validation Schema
const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  // 2. Handle Form Submission
  const onSubmit = async (data: LoginFormValues) => {
    try {
      const result = await signIn("credentials", {
        redirect: false,
        email: data.email,
        password: data.password,
      });

      if (result?.error) {
        // Handle Login Failure: Set error below password field
        setError("root", { message: "Invalid email or password" });
      } else {
        router.push("/"); // Redirect to Home Page
      }
    } catch (error) {
      console.log(error);
      setError("root", { message: "Something went wrong" });
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md space-y-8 rounded-lg bg-white p-8 shadow-lg">
        {/* Header */}
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900">
            Welcome Back! 👋
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Sign in to your Travel Buddy account
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-6">
          <div className="space-y-4 rounded-md shadow-sm">
            {/* Email Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <input
                {...register("email")}
                type="email"
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                placeholder="you@example.com"
              />
              {errors.email && (
                <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>
              )}
            </div>

            {/* Password Input with Eye Button */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Password</label>
              <div className="relative mt-1">
                <input
                  {...register("password")}
                  type={showPassword ? "text" : "password"}
                  className="block w-full rounded-md border border-gray-300 px-3 py-2 pr-10 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 focus:outline-none"
                >
                  {showPassword ? (
                    <FiEyeOff className="h-5 w-5" aria-hidden="true" />
                  ) : (
                    <FiEye className="h-5 w-5" aria-hidden="true" />
                  )}
                </button>
              </div>
              {/* Validation Errors */}
              {errors.password && (
                <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>
              )}
              
              {/* Show Login Failed Error Here */}
              {errors.root && (
                <p className="mt-2 text-sm text-red-500 text-center bg-red-50 p-2 rounded border border-red-100">
                  {errors.root.message}
                </p>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="group relative flex w-full justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-blue-400"
          >
            {isSubmitting ? "Signing in..." : "Sign in"}
          </button>
        </form>

        {/* Footer Link */}
        <p className="text-center text-sm text-gray-600">
          Do not have an account?{" "}
          <Link href="/auth/register" className="font-medium text-blue-600 hover:text-blue-500">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}