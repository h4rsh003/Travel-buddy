"use client";

import { useState } from "react";
import axios from "axios";
import { FiX, FiMail, FiCheckCircle } from "react-icons/fi";
import { toast } from "react-hot-toast";

interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ForgotPasswordModal({ isOpen, onClose }: ForgotPasswordModalProps) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/forgot-password`, { email });
      setSuccess(true);
      toast.success("Reset link sent!");
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      
      <div className="relative w-full max-w-md bg-travel-card rounded-2xl shadow-2xl p-8 border border-travel-border">
        
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-travel-text-muted hover:text-travel-text transition-colors"
          aria-label="Close modal"
        >
          <FiX size={24} />
        </button>

        {success ? (
          <div className="text-center py-6">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100/10 mb-4 border border-green-500/20">
              <FiCheckCircle className="h-8 w-8 text-green-500" />
            </div>
            <h3 className="text-xl font-bold text-travel-text mb-2">Check your inbox</h3>
            <p className="text-travel-text-muted text-sm mb-6">
              We have sent a password reset link to <span className="font-semibold text-travel-text">{email}</span>
            </p>
            <button
              onClick={onClose}
              className="w-full py-2.5 bg-travel-bg hover:bg-travel-border text-travel-text font-semibold rounded-lg transition-colors border border-travel-border"
            >
              Close
            </button>
          </div>
        ) : (
          <div className="text-center">
            {/* Header Icon */}
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-travel-accent/10 mb-4">
              <FiMail className="h-6 w-6 text-travel-accent" />
            </div>
            
            <h3 className="text-xl font-bold text-travel-text mb-2">Forgot Password?</h3>
            <p className="text-travel-text-muted text-sm mb-6">
              Enter your email address and we&apos;ll send you a link to reset your password.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="text-left">
                <label className="block text-sm font-medium text-travel-text mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full px-4 py-3 rounded-lg border border-travel-border bg-travel-bg text-travel-text placeholder-travel-text-muted focus:ring-2 focus:ring-travel-accent focus:border-travel-accent outline-none transition-all"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-travel-accent hover:bg-travel-accent-hover text-white font-bold rounded-lg shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Sending..." : "Send Reset Link"}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}