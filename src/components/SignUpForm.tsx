"use client";
import { globalStateAtom } from "@/context/atoms";
import { getSupabaseClient } from "@/utils/supabaseClient";
import { useAtom } from "jotai";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { loadStripe } from "@stripe/stripe-js";
import { sanityClient } from "../../sanity/lib/client";
import { motion, AnimatePresence } from "framer-motion";

const STEP = {
  ENTER_EMAIL: "ENTER_EMAIL",
  VERIFY_OTP: "VERIFY_OTP",
  CREATE_PASSWORD: "CREATE_PASSWORD",
  LOADING_CHECKOUT: "LOADING_CHECKOUT",
};

const SignUpForm = () => {
  const [state, setState] = useAtom(globalStateAtom);
  const [currentStep, setCurrentStep] = useState(STEP.ENTER_EMAIL);
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [tempPassword, setTempPassword] = useState<string | null>(null);
  const router = useRouter();
  const supabase = getSupabaseClient();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const emailParam = searchParams.get("email");

  useEffect(() => {
    if (emailParam) {
      const decodedEmail = decodeURIComponent(emailParam).replace(" ", "+");
      setEmail(decodedEmail);
    }
  }, [emailParam]);

  const handleSendOTP = async (email: string) => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/signup/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      if (!response.ok) {
        toast.error(data.error);
      } else {
        toast.success("Check your email for the verification code");
        setCurrentStep(STEP.VERIFY_OTP);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const sendOTP = async (e?: React.FormEvent<HTMLFormElement>) => {
    if (e) {
      e.preventDefault();
      handleSendOTP(e.currentTarget.email.value);
    } else {
      handleSendOTP(email);
    }
  };

  console.log("email", email);

  const verifyOTP = async (e: any) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const token = e.currentTarget.otp.value as string;
      console.log("[SignUpForm] Verifying OTP for email:", email);

      const response = await fetch("/api/signup/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, token }),
      });

      const data = await response.json();
      if (!response.ok) {
        console.error("[SignUpForm] OTP verification failed:", data.error);
        toast.error(data.error);
      } else {
        console.log("[SignUpForm] OTP verification successful");
        if (data.session) {
          console.log("[SignUpForm] Setting session");
          const { error } = await supabase.auth.setSession(data.session);
          if (error) {
            console.error("[SignUpForm] Failed to set session:", error);
            toast.error("Failed to establish session");
            return;
          }
          setCurrentStep(STEP.CREATE_PASSWORD);
        } else {
          console.error("[SignUpForm] No session in response");
          toast.error("No session received from server");
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  const resetPassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      console.log("[SignUpForm] Starting password update");

      // Check if we have a valid session first
      const {
        data: { session },
      } = await supabase.auth.getSession();
      console.log("[SignUpForm] Current session:", session?.user?.id);

      if (!session) {
        console.error("[SignUpForm] No active session");
        toast.error("No active session. Please verify your email again.");
        setCurrentStep(STEP.VERIFY_OTP);
        return;
      }

      // Get password from form using type assertion
      const form = e.target as HTMLFormElement;
      const passwordInput = form.elements.namedItem(
        "password"
      ) as HTMLInputElement;
      const password = passwordInput.value;

      if (!password) {
        console.error("[SignUpForm] No password provided");
        toast.error("Please enter a password");
        return;
      }

      console.log("[SignUpForm] Sending password update request");
      const response = await fetch("/api/signup/update-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      if (!response.ok) {
        console.error("[SignUpForm] Password update failed:", data.error);
        toast.error(data.error);
      } else {
        console.log("[SignUpForm] Password update successful");
        if (data.session) {
          console.log("[SignUpForm] Setting new session");
          const { error } = await supabase.auth.setSession(data.session);
          if (error) {
            console.error("[SignUpForm] Failed to set new session:", error);
            toast.error("Failed to establish session");
            return;
          }
          toast.success("Signed in successfully");
          handleSubscription();
        } else {
          console.error("[SignUpForm] No session in response");
          toast.error("Failed to establish session");
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  const getProgress = () => {
    switch (currentStep) {
      case STEP.ENTER_EMAIL:
        return 33;
      case STEP.VERIFY_OTP:
        return 66;
      case STEP.CREATE_PASSWORD:
      case STEP.LOADING_CHECKOUT:
        return 100;
      default:
        return 0;
    }
  };

  const handleSubscription = async () => {
    setCurrentStep(STEP.LOADING_CHECKOUT);
    const stripe = await loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY!);
    const response = await fetch("/api/subscription/makeSubscription", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ priceId: "price_1PMZn5DhCJq1hRSt1v2StcWD" }),
    });

    if (response.ok) {
      const { id: sessionId } = await response.json();
      if (stripe) {
        const { error } = await stripe.redirectToCheckout({ sessionId });
        if (error) {
          console.error("Error redirecting to Checkout:", error);
          toast.error("Failed to load checkout page");
          setCurrentStep(STEP.CREATE_PASSWORD);
        }
      }
    } else {
      toast.error("Something went wrong");
      setCurrentStep(STEP.CREATE_PASSWORD);
    }
  };

  const fetchLoggedInUser = async (user: any) => {
    const response = await fetch(`/api/getUser`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ id: user.id }),
    });

    if (response.ok) {
      return await response.json();
    } else {
      console.error("Failed to fetch user data");
      return null;
    }
  };

  useEffect(() => {
    const { data: userData } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("event", event);
        console.log("session", session);
        if (
          [
            "PASSWORD_RECOVERY",
            "SIGNED_IN",
            "INITIAL_SESSION",
            "TOKEN_REFRESHED",
            "USER_UPDATED",
          ].includes(event) &&
          session
        ) {
          console;
          const loggedInUser = await fetchLoggedInUser(session.user);
          console.log("loggedInUser", loggedInUser);
          setState({
            ...state,
            session,
            user: session.user,
            loggedInUser,
            activeNavButtons: true,
          });
        }
      }
    );
  }, []);

  useEffect(() => {
    if (sessionId) {
      toast.success("Subscribed successfully");
      setTimeout(() => router.push("/home"), 2000);
    }
  }, [sessionId]);

  const renderStep = () => {
    return (
      <div className="w-full py-16 px-4">
        <div className="max-w-[600px] mx-auto">
          <div className="bg-white rounded-xl p-8 shadow-md">
            {/* Progress bar */}
            <div className="w-full h-2 bg-gray-200 rounded-full mb-8">
              <motion.div
                className="h-full bg-[#E78426] rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${getProgress()}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>

            <AnimatePresence>
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}>
                {currentStep === STEP.LOADING_CHECKOUT ? (
                  <div className="flex flex-col items-center justify-center py-12">
                    <div className="mb-4">
                      <svg
                        className="animate-spin h-12 w-12 text-[#E78426]"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24">
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                    </div>
                    <h2 className="text-2xl font-semibold text-gray-700 mb-2">
                      Almost there!
                    </h2>
                    <p className="text-gray-500 text-center">
                      Preparing your checkout session...
                      <br />
                      You will be redirected to Stripe in a moment.
                    </p>
                  </div>
                ) : currentStep === STEP.ENTER_EMAIL ? (
                  <form onSubmit={(e) => sendOTP(e)}>
                    <h2 className="text-2xl font-semibold text-gray-700 mb-6">
                      Enter your email
                    </h2>
                    <input
                      type="email"
                      name="email"
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Email address"
                      className="w-full p-4 h-12 border border-gray-200 rounded-lg mb-4"
                      value={email}
                      readOnly={!!emailParam}
                    />
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full bg-[#E78426] hover:bg-[#e78326d8] text-white font-bold px-8 py-3 rounded-full transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2">
                      {isLoading && (
                        <svg
                          className="animate-spin h-5 w-5"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24">
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          />
                        </svg>
                      )}
                      {isLoading ? "Processing..." : "Continue"}
                    </button>
                  </form>
                ) : currentStep === STEP.VERIFY_OTP ? (
                  <form onSubmit={(e) => verifyOTP(e)}>
                    <h2 className="text-2xl font-semibold text-gray-700 mb-6">
                      Verify your email
                    </h2>
                    <input
                      name="otp"
                      placeholder="Enter verification code"
                      type="number"
                      className="w-full p-4 h-12 border border-gray-200 rounded-lg mb-4"
                    />
                    <p className="text-gray-500 text-center text-sm mb-6">
                      Didn&apos;t get the code?{" "}
                      <button
                        type="button"
                        onClick={() => sendOTP()}
                        disabled={isLoading}
                        className="text-[#E78426] hover:text-[#e78326d8] disabled:opacity-50 disabled:cursor-not-allowed">
                        Resend code
                      </button>
                    </p>
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full bg-[#E78426] hover:bg-[#e78326d8] text-white font-bold px-8 py-3 rounded-full transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2">
                      {isLoading && (
                        <svg
                          className="animate-spin h-5 w-5"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24">
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          />
                        </svg>
                      )}
                      {isLoading ? "Verifying..." : "Continue"}
                    </button>
                  </form>
                ) : currentStep === STEP.CREATE_PASSWORD ? (
                  <form onSubmit={(e) => resetPassword(e)}>
                    <h2 className="text-2xl font-semibold text-gray-700 mb-6">
                      Create your password
                    </h2>
                    <input
                      placeholder="Email address"
                      disabled
                      value={email}
                      className="w-full p-4 h-12 border border-gray-200 rounded-lg mb-4 bg-gray-50 text-gray-500"
                    />
                    <input
                      name="password"
                      placeholder="Password"
                      type="password"
                      className="w-full p-4 h-12 border border-gray-200 rounded-lg mb-4"
                    />
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full bg-[#E78426] hover:bg-[#e78326d8] text-white font-bold px-8 py-3 rounded-full transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2">
                      {isLoading && (
                        <svg
                          className="animate-spin h-5 w-5"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24">
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          />
                        </svg>
                      )}
                      {isLoading ? "Creating account..." : "Create account"}
                    </button>
                  </form>
                ) : null}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex lg:max-w-[1000px] w-full mx-auto flex-col justify-center pb-9 lg:px-7">
      <Link
        className="flex items-center justify-center text-4xl font-extrabold mb-4 text-[#7F8119]"
        href="/">
        SWOM
      </Link>
      <h1 className="mb-4 text-center text-3xl font-bold md:text-3xl">
        {currentStep === STEP.ENTER_EMAIL && "Sign up with your email"}
        {currentStep === STEP.VERIFY_OTP && "Verify your email"}
        {currentStep === STEP.CREATE_PASSWORD && "Create your password"}
        {currentStep === STEP.LOADING_CHECKOUT && "Setting up your account"}
      </h1>
      <p className="mb-12 text-center text-gray-600">
        {currentStep === STEP.VERIFY_OTP &&
          `A verification code has been sent to ${email}`}
        {currentStep === STEP.ENTER_EMAIL &&
          "Be part of our global community and start traveling today!"}
        {currentStep === STEP.CREATE_PASSWORD &&
          "Choose a secure password for your account"}
        {currentStep === STEP.LOADING_CHECKOUT &&
          "Please wait while we prepare your checkout session"}
      </p>
      {renderStep()}
    </div>
  );
};

export default SignUpForm;
