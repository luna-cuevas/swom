"use client";
import React, { useEffect, useRef, useState } from "react";
import { getSupabaseClient } from "@/utils/supabaseClient";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Link from "next/link";
import { useAtom } from "jotai";
import { globalStateAtom } from "@/context/atoms";

const SignIn = () => {
  const supabase = getSupabaseClient();
  const [state, setState] = useAtom(globalStateAtom);
  const hasShownToast = useRef(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");

  async function isUserSubscribed(email: string): Promise<boolean> {
    console.log("checking subscription status");
    try {
      const response = await fetch(
        "/api/members/subscription/checkSubscription",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to check subscription status");
      }

      const data = await response.json();
      return data.isSubscribed;
    } catch (error) {
      console.error("Error checking subscription status:", error);
      return false;
    }
  }

  useEffect(() => {
    const { data: authListener } =
      supabase.auth.onAuthStateChange(handleAuthChange);
    // Simulate a delay for the loading animation

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const fetchLoggedInUser = async (user: any) => {
    console.log("fetching logged in user", user);

    try {
      // Make a GET request to the API route with the user ID as a query parameter
      const response = await fetch(`/api/members/getUser`, {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        method: "POST",
        body: JSON.stringify({ id: user.id }),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch user data");
      }

      const data = await response.json();

      if (data) {
        return data;
      } else {
        console.log("No data found for the user");
        return null;
      }
    } catch (error: any) {
      console.error("Error fetching user data:", error.message);
      return null;
    }
  };

  const handleAuthChange = async (event: any, session: any) => {
    console.log("=== Auth Change Debug ===");
    console.log("Event:", event);
    console.log("Session user ID:", session?.user?.id);
    console.log("Current state user ID:", state.user.id);
    console.log("Full state:", state);

    if (event === "SIGNED_IN" && session !== null) {
      const loggedInUser = await fetchLoggedInUser(session.user);
      const subbed = await isUserSubscribed(session.user.email);

      if (!hasShownToast.current) {
        toast.success("Signed in successfully");
        hasShownToast.current = true;
      }

      setState((prevState) => ({
        ...prevState,
        session,
        user: {
          email: session.user.email,
          id: session.user.id,
          name: loggedInUser?.name || "",
          role: loggedInUser?.role || "",
          profileImage: loggedInUser?.profileImage || "",
          favorites: loggedInUser?.favorites || [],
          privacyPolicy: loggedInUser?.privacyPolicy || "",
          privacyPolicyDate: loggedInUser?.privacyPolicyDate || "",
          subscribed: loggedInUser?.subscribed || false,
          subscription_id: loggedInUser?.subscription_id || "",
          stripe_customer_id: loggedInUser?.stripe_customer_id || "",
        },
        loggedInUser,
        isSubscribed: subbed,
        activeNavButtons: true,
        signInActive: false,
      }));
    } else if (event === "SIGNED_OUT") {
      hasShownToast.current = false; // Reset the ref when user signs out
      setState((prevState) => ({
        ...prevState,
        session: null,
        user: {
          email: "",
          id: "",
          name: "",
          role: "",
          profileImage: "",
          favorites: [],
          privacyPolicy: "",
          privacyPolicyDate: "",
          subscribed: false,
          subscription_id: "",
          stripe_customer_id: "",
        },
        loggedInUser: null,
        activeNavButtons: false,
        isSubscribed: false,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (error) throw error;

      // The auth state change listener will handle the rest
    } catch (error: any) {
      console.error("Error signing in:", error.message);
      setError(error.message);
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!formData.email) {
      setError("Please enter your email address");
      return;
    }

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(
        formData.email,
        {
          redirectTo:
            process.env.NODE_ENV === "development"
              ? "http://localhost:3000/forgot-password"
              : "https://swom.travel/forgot-password",
        }
      );

      if (error) throw error;

      toast.success("Password reset instructions sent to your email");
      // Close the login popup after successful password reset email
      setState((prevState) => ({
        ...prevState,
        signInActive: false,
      }));
    } catch (error: any) {
      console.error("Error resetting password:", error.message);
      setError(error.message);
      toast.error(error.message);
    }
  };

  if (!state.signInActive) {
    return null;
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center z-[200000000]">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm"
        onClick={() => setState({ ...state, signInActive: false })}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden transform transition-all">
        {/* Close button */}
        <button
          onClick={() => setState({ ...state, signInActive: false })}
          className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 transition-colors">
          <svg
            className="w-6 h-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        {/* Header */}
        <div className="px-8 pt-8 pb-0">
          <h2 className="text-3xl font-semibold text-gray-900 tracking-[0.2rem] uppercase">
            Members Login
          </h2>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-8 pt-6 space-y-6">
          {error && (
            <div className="text-sm text-red-500 bg-red-50 p-3 rounded-lg">
              {error}
            </div>
          )}

          {/* Email field */}
          <div className="space-y-2">
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#7F8019] focus:ring-opacity-20 focus:border-[#7F8019] transition-all duration-200"
              placeholder="Enter your email"
              required
            />
          </div>

          {/* Password field */}
          <div className="space-y-2">
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                className="w-full px-4 py-3 pr-12 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#7F8019] focus:ring-opacity-20 focus:border-[#7F8019] transition-all duration-200"
                placeholder="Enter your password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                aria-label={showPassword ? "Hide password" : "Show password"}>
                {showPassword ? (
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                    />
                  </svg>
                ) : (
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                    />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Forgot password link */}
          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleForgotPassword}
              className="text-sm text-[#7F8019] hover:text-[#666914] transition-colors">
              Forgot your password?
            </button>
          </div>

          {/* Submit button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 px-4 bg-[#7F8019] text-white rounded-lg hover:bg-[#666914] focus:outline-none focus:ring-2 focus:ring-[#7F8019] focus:ring-opacity-20 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed">
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Signing in...
              </span>
            ) : (
              "Sign in"
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="px-8 py-4 bg-gray-50 border-t border-gray-100">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">Don&apos;t have an account?</p>
            <Link
              href="/become-member"
              onClick={() => setState({ ...state, signInActive: false })}
              className="text-sm font-medium text-[#7F8019] hover:text-[#666914] transition-colors">
              Sign up
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignIn;
