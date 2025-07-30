"use client";

import { useMutation } from "@tanstack/react-query";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/utils/UserStore";
import { X } from "lucide-react";
import { FcGoogle } from "react-icons/fc";
import React, { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useSession } from "next-auth/react";
import { Eye,EyeOff } from "lucide-react";

const Login = () => {
  const { showLoginModal, setShowLoginModal } = useAuthStore();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [showPassword,setShowPassword] = useState(false)
  const [showConfirmPassword,setShowConfirmPassword] = useState(false)
  const modalRef = useRef<HTMLFormElement>(null);
  const router = useRouter();
 
  const [userDetails, setUserDetails] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  // Reset form when modal opens/closes
  useEffect(() => {
    if (showLoginModal) {
      setUserDetails({
        username: "",
        email: "",
        password: "",
        confirmPassword: "",
      });
    }
  }, [showLoginModal]);
  const {status} = useSession()
  // Login mutation
  const loginMutation = useMutation({
    mutationFn: async () => {
      const res = await signIn("credentials", {
        redirect: false,
        email: userDetails.email,
        password: userDetails.password,
      });

      if (!res?.ok) {
        throw new Error(res?.error || "Invalid email or password");
      }
      return res;
    },
    onSuccess: () => {
      toast.success("Login successful!");
      setShowLoginModal(false);
      router.refresh();
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
 
  // Signup mutation
  const signupMutation = useMutation({
    mutationFn: async () => {
      const { username, email, password, confirmPassword } = userDetails;

      if (!username || !email || !password || !confirmPassword) {
        throw new Error("Please fill all fields");
      }

      if (password !== confirmPassword) {
        throw new Error("Passwords do not match");
      }

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/register`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username, email, password }),
        }
      );

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Signup failed");
      }

      return res.json();
    },
    onSuccess: () => {
      toast.success("Account created successfully! Logging you in...");
      loginMutation.mutate();
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  // Google login
  const handleGoogleLogin = async () => {
    try {
      await signIn("google", {
        callbackUrl: `${window.location.origin}`,
      });
      setShowLoginModal(false);
      router.refresh();
    } catch{
      toast.error("Google login failed");
      
    }
  };

  const handleUserDetails = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUserDetails((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === "login") {
      loginMutation.mutate();
    } else {
      signupMutation.mutate();
    }
  };

  useEffect(() => {
    if (status === "authenticated") {
      setShowLoginModal(false);
    }
  }, [setShowLoginModal,status]);

  // Close modal on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target as Node)
      ) {
        setShowLoginModal(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [setShowLoginModal]);

  if (!showLoginModal || status === "authenticated") return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <form
        ref={modalRef}
        onSubmit={handleSubmit}
        className="relative bg-white rounded-xl p-8 w-full max-w-md shadow-lg transition-all"
      >
        <X
          size={20}
          onClick={() => setShowLoginModal(false)}
          className="absolute top-4 right-4 cursor-pointer text-gray-500 hover:text-black"
        />

        <h2 className="text-2xl font-semibold text-center mb-6">
          {mode === "login" ? "Sign In" : "Create an Account"}
        </h2>

        <button
          type="button"
          onClick={handleGoogleLogin}
          className="flex items-center justify-center gap-3 bg-white border border-gray-300 text-gray-700 font-medium w-full py-2 rounded-md hover:bg-gray-100 transition"
        >
          <FcGoogle size={20} />
          {mode === "login" ? "Sign in with Google" : "Sign up with Google"}
        </button>

        <div className="flex items-center gap-4 my-6">
          <div className="h-px flex-1 bg-gray-300" />
          <span className="text-gray-500 text-sm">OR</span>
          <div className="h-px flex-1 bg-gray-300" />
        </div>

        {mode === "signup" && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Username
            </label>
            <input
              type="text"
              name="username"
              value={userDetails.username}
              onChange={handleUserDetails}
              placeholder="Enter a username"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-gray-400 focus:outline-none"
            />
          </div>
        )}

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email Address
          </label>
          <input
            type="email"
            name="email"
            value={userDetails.email}
            onChange={handleUserDetails}
            placeholder="Enter your email"
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-gray-400 focus:outline-none"
          />
        </div>

        <div className="mb-4 relative">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Password
          </label>
          <input
            type={showPassword?"text":"password"}
            name="password"
            value={userDetails.password}
            onChange={handleUserDetails}
            placeholder="Enter your password"
            required
            minLength={6}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-gray-400 focus:outline-none"
          />
          <div className="absolute right-3 top-9 cursor-pointer text-gray-500 hover:text-black" onClick={()=>setShowPassword((prev)=>!prev)}>
            {showPassword?<EyeOff size={18}/>:<Eye size={18}/>}
          </div>
        </div>

        {mode === "signup" && (
          <div className="mb-4 relative">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Confirm Password
            </label>
            <input
              type={showConfirmPassword?"text":"password"}
              name="confirmPassword"
              value={userDetails.confirmPassword}
              onChange={handleUserDetails}
              placeholder="Confirm your password"
              required
              minLength={6}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-gray-400 focus:outline-none"
            />
            <div className="absolute right-3 top-9 cursor-pointer text-gray-500 hover:text-black" onClick={()=>setShowConfirmPassword((prev)=>!prev)}>
              {showConfirmPassword?<EyeOff size={18}/>:<Eye size={18}/>}
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={loginMutation.isPending || signupMutation.isPending}
          className="mt-2 w-full bg-black text-white py-2 rounded-md font-medium hover:bg-gray-900 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loginMutation.isPending || signupMutation.isPending
            ? "Processing..."
            : mode === "login"
            ? "Sign In"
            : "Sign Up"}
        </button>

        <div className="flex items-center justify-center gap-2 text-sm text-gray-600 mt-4">
          <span>
            {mode === "login"
              ? "Don't have an account?"
              : "Already have an account?"}
          </span>
          <button
            type="button"
            onClick={() => setMode(mode === "login" ? "signup" : "login")}
            className="text-gray-700 font-medium cursor-pointer hover:underline"
          >
            {mode === "login" ? "Sign up" : "Sign in"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Login;
