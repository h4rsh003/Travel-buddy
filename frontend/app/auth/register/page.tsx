"use client";

import Link from "next/link";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import axios from "axios";
import { useRouter } from "next/navigation"; 
import { FiEye, FiEyeOff, FiCheck, FiArrowLeft, FiUser, FiMail, FiLock, FiX } from "react-icons/fi"; 
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
  
  // UI States
  const [showPassword, setShowPassword] = useState(false);
  const [isPasswordFocused, setIsPasswordFocused] = useState(false); 

  const [step, setStep] = useState<"FORM" | "OTP">("FORM");
  const [emailForVerification, setEmailForVerification] = useState("");
  const [registrationToken, setRegistrationToken] = useState(""); 
  const [otp, setOtp] = useState("");
  const [verifying, setVerifying] = useState(false);
  
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

  const onSubmit = async (data: RegisterFormValues) => {
    const loadingToast = toast.loading("Sending OTP...");
    try {
      // Endpoint returns registrationToken if successful
      const res = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/register`, data);
      
      toast.dismiss(loadingToast);
      toast.success("Code sent to your email!");
      
      // Save info for Step 2
      setEmailForVerification(data.email);
      setRegistrationToken(res.data.registrationToken);
      setStep("OTP"); 
      
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

  const onVerifyOtp = async () => {
    if (otp.length !== 4) {
        toast.error("Please enter the 4-digit code");
        return;
    }
    setVerifying(true);
    const loadingToast = toast.loading("Verifying code...");

    try {
        await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/verify-otp`, {
            otp: otp,
            registrationToken: registrationToken
        });

        toast.dismiss(loadingToast);
        toast.success("Verification Successful! Please login.");
        router.push("/auth/login"); 
    } catch (error) {
        console.error(error);
        toast.dismiss(loadingToast);
        if (axios.isAxiosError(error) && error.response) {
            toast.error(error.response.data.message);
        } else {
            toast.error("Invalid or Expired Code");
        }
    } finally {
        setVerifying(false);
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

      <div className="w-full max-w-md space-y-8 rounded-2xl bg-travel-card p-10 shadow-xl border border-travel-border relative">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-travel-text">
            Create an Account
          </h2>
          <p className="mt-2 text-sm text-travel-text-muted">
            Join Travel Buddy today
          </p>
        </div>

        {/* Form opacity lowers when Modal is active */}
        <form onSubmit={handleSubmit(onSubmit)} className={`mt-8 space-y-6 ${step === "OTP" ? "opacity-20 pointer-events-none blur-sm" : ""}`}>
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
                  // onBlur={() => setIsPasswordFocused(false)} 
                  className="block w-full pl-10 pr-10 rounded-lg border border-travel-border px-3 py-3 text-travel-text placeholder-travel-text-muted focus:border-travel-accent focus:outline-none focus:ring-1 focus:ring-travel-accent sm:text-sm bg-travel-bg transition-all"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()} 
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-travel-text-muted hover:text-travel-text focus:outline-none"
                >
                  {showPassword ? (
                    <FiEyeOff className="h-5 w-5" aria-hidden="true" />
                  ) : (
                    <FiEye className="h-5 w-5" aria-hidden="true" />
                  )}
                </button>
              </div>
              
              {/* Conditional Compact Password Checklist */}
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
            className="group relative flex w-full justify-center rounded-lg border border-transparent bg-travel-accent px-4 py-3 text-sm font-bold text-white shadow-md hover:bg-travel-accent-hover hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-travel-accent focus:ring-offset-2 disabled:bg-travel-border disabled:cursor-not-allowed transition-all transform active:scale-95"
          >
            {isSubmitting ? (
                 <span className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Sending Code...
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

        {step === "OTP" && (
            <div className="absolute inset-0 z-50 bg-travel-card/95 backdrop-blur-sm rounded-2xl flex flex-col items-center justify-center p-8 animate-fade-in">
                <button 
                    onClick={() => setStep("FORM")}
                    className="absolute top-4 right-4 text-travel-text-muted hover:text-travel-text transition-colors"
                    aria-label="Close modal" 
                >
                    <FiX size={24} />
                </button>

                <div className="bg-travel-accent/10 p-4 rounded-full mb-4 text-travel-accent animate-bounce">
                    <FiMail size={32} />
                </div>
                
                <h3 className="text-xl font-bold text-travel-text mb-2">Check your Email</h3>
                <p className="text-sm text-travel-text-muted text-center mb-6 max-w-[80%]">
                    We&apos;ve sent a 4-digit verification code to <br/>
                    <span className="font-bold text-travel-text">{emailForVerification}</span>
                </p>

                {/* OTP Input Field */}
                <input 
                    type="text" 
                    maxLength={4}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ''))}
                    className="w-40 text-center text-3xl font-bold tracking-[0.5em] py-3 rounded-lg border border-travel-border bg-travel-bg focus:border-travel-accent focus:ring-2 focus:ring-travel-accent outline-none mb-6 text-travel-text shadow-inner"
                    placeholder="0000"
                    autoFocus
                />

                <button
                    onClick={onVerifyOtp}
                    disabled={verifying || otp.length < 4}
                    className="w-full bg-travel-accent text-white font-bold py-3 rounded-lg hover:bg-travel-accent-hover transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg active:scale-95"
                >
                    {verifying ? "Verifying..." : "Verify & Register"}
                </button>
                
                <div className="text-xs text-travel-text-muted mt-6 text-center">
                    Didn&apos;t receive code? <br/> 
                    {/* Note: Resend would typically require passing data to backend again in this stateless flow */}
                    <button className="text-travel-accent hover:underline font-semibold mt-1 cursor-not-allowed opacity-50" title="Please register again to resend">Resend Code</button>
                </div>
            </div>
        )}

      </div>
    </div>
  );
}