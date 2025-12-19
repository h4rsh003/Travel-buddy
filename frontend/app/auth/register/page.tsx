"use client";

import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import axios from "axios";
import { useRouter } from "next/navigation"; 
import { FiEye, FiEyeOff } from "react-icons/fi";
import { useState } from "react";

// 1. Updated Validation Schema with Strict Password Rules
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
  
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    mode: "onChange", // 👈 Enables real-time validation as you type
  });

  // 2. Handle Registration
  const onSubmit = async (data: RegisterFormValues) => {
    try {
      await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/register`, data);
      
      alert("Registration Successful! Please login.");
      router.push("/auth/login");
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
         setError("root", { message: error.response.data.message });
      } else {
         setError("root", { message: "Something went wrong. Is backend running?" });
      }
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md space-y-8 rounded-lg bg-white p-8 shadow-lg">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900">
            Create an Account
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Join Travel Buddy today
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-6">
          {/* Show Backend Error */}
          {errors.root && (
            <div className="rounded-md bg-red-50 p-3 text-sm text-red-500 text-center border border-red-200">
              {errors.root.message}
            </div>
          )}

          <div className="space-y-4 rounded-md shadow-sm">
            {/* Name Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Name</label>
              <input
                {...register("name")}
                type="text"
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                placeholder="Your Name"
              />
              {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>}
            </div>

            {/* Email Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <input
                {...register("email")}
                type="email"
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                placeholder="you@example.com"
              />
              {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>}
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
              {/* Validation Message appears here immediately */}
              {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>}
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="group relative flex w-full justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-blue-400"
          >
            {isSubmitting ? "Creating Account..." : "Sign Up"}
          </button>
        </form>

        <p className="text-center text-sm text-gray-600">
          Already have an account?{" "}
          <Link href="/auth/login" className="font-medium text-blue-600 hover:text-blue-500">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}