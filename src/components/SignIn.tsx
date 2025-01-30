"use client";
import React, { useEffect, useRef } from "react";
import { Auth } from "@supabase/auth-ui-react";
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

  async function isUserSubscribed(email: string): Promise<boolean> {
    console.log("checking subscription status");
    try {
      const response = await fetch("/api/subscription/checkSubscription", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

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
      const response = await fetch(`/api/getUser`, {
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
      hasShownToast.current = false;  // Reset the ref when user signs out
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

  if (!state.signInActive) {
    return null;
  }

  return (
    <div
      className={`fixed w-full h-full top-0 bottom-0 left-0 right-0     flex m-auto z-[200000000] `}>
      <div
        className="fixed w-full h-full bg-gray-600 opacity-50 top-0 bottom-0 left-0 right-0 z-[20000000]"
        onClick={() => {
          setState({
            ...state,
            signInActive: false,
          });
        }}
      />

      <div className="z-[20000001] rounded-2xl fixed max-w-[800px] md:w-2/3 bottom-0 m-auto top-0    left-0 right-0 h-fit pt-8 bg-[#F7F1EE] border-[6px] border-[#7F8019] ">
        <div className="lg:flex-row flex flex-col">
          <div className="flex lg:w-[40%] ">
            <h2 className="uppercase font-sans leading-[60px] p-4 lg:p-10 text-right tracking-[0.3rem] m-auto text-2xl lg:text-4xl">
              Members Login
            </h2>
          </div>
          <div className="flex lg:w-[60%] w-[90%] m-auto ">
            <div className="m-auto w-full">
              <Auth
                redirectTo={
                  process.env.NODE_ENV === "development"
                    ? "http://localhost:3000/forgot-password"
                    : "https://swom.travel/forgot-password"
                }
                supabaseClient={supabase}
                appearance={{
                  style: {
                    button: {
                      width: "fit-content",
                      maxWidth: "100%",
                      textTransform: "uppercase",
                      background: "#EB8828",
                      color: "white",
                      padding: "0.5rem 2rem",
                      borderRadius: "0.375rem",
                      fontFamily: "sans-serif",
                    },
                    input: {
                      letterSpacing: "0.25rem",
                      // textTransform: 'uppercase',
                      color: "#F7F1EE",
                      background: "#7F8019",
                      borderRadius: "0.375rem",
                      padding: "1rem 0.75rem",
                    },
                    message: {
                      fontSize: "18px",
                      color: "#ff0f0f",
                      margin: "0 0 20px 0",
                    },
                  },
                }}
                localization={{
                  variables: {
                    sign_in: {
                      email_label: "",
                      password_label: "",
                      email_input_placeholder: "Email address",
                      password_input_placeholder: "Password",
                      button_label: "Sign in",
                    },
                    sign_up: {
                      link_text: "",
                    },
                  },
                }}
                providers={[]}
              />
            </div>
          </div>
        </div>
        <div className="bg-[#7F8019]  w-fit m-auto px-4 py-1 rounded-t-xl flex">
          <div className="flex w-fit m-auto gap-2">
            <p className="text-[#F7F1EE]">Don&apos;t have an account?</p>
            <Link
              onClick={() => {
                setState({
                  ...state,
                  signInActive: false,
                });
              }}
              className="font-sans text-sm text-blue-300"
              href="/become-member">
              Sign up
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignIn;
