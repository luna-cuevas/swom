"use client";

import { useEffect, useState } from "react";
import { supabaseClient } from "@/utils/supabaseClient";
import { useRouter, useSearchParams } from "next/navigation";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useAtom } from "jotai";
import { globalStateAtom } from "@/context/atoms";
import Stripe from "stripe";

const ResetPassword = () => {
  const supabase = supabaseClient();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const accessToken = searchParams.get("access_token");
  const type = searchParams.get("type");

  const stripeActivation = new Stripe(
    process.env.NEXT_PUBLIC_STRIPE_SECRET_KEY!,
    {
      apiVersion: "2023-08-16",
    }
  );

  const [state, setState] = useAtom(globalStateAtom);

  async function isUserSubscribed(
    email: string,
    stripe: any
  ): Promise<boolean> {
    console.log("checking subscription status");
    try {
      if (!stripe) {
        console.log("Stripe.js has not loaded yet.");
        return false;
      }
      // Retrieve the customer by email
      const customers = await stripe.customers.list({ email: email });
      const customer = customers.data[0]; // Assuming the first customer is the desired one

      if (customer) {
        // Retrieve the customer's subscriptions
        const subscriptions = await stripe.subscriptions.list({
          customer: customer.id,
          limit: 1, // Assuming only checking the latest subscription
        });

        return subscriptions.data.length > 0; // User is subscribed if there's at least one subscription
      } else {
        // Customer not found
        console.log("Customer not found");
        return false;
      }
    } catch (error) {
      console.error("Error checking subscription status:", error);
      throw error;
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
    console.log("session", session);
    console.log("event", event);
    if (
      (event === "SIGNED_IN" ||
        event === "INITIAL_SESSION" ||
        event === "TOKEN_REFRESHED" ||
        event === "USER_UPDATED" ||
        event === "PASSWORD_RECOVERY") &&
      session !== null
    ) {
      console.log("session", session);
      toast.success("Signed in successfully");
      const loggedInUser = await fetchLoggedInUser(session.user);
      const subbed = await isUserSubscribed(
        session.user.email,
        stripeActivation
      );
      setState({
        ...state,
        session,
        user: session.user,
        loggedInUser: loggedInUser,
        isSubscribed: subbed,
        activeNavButtons: true,
      });
    } else if (event === "SIGNED_OUT") {
      console.log("session", event);
      console.log("SignIn Failed");

      toast.error("Sign in failed");
    }
  };

  useEffect(() => {
    const handleRecovery = async () => {
      if (type === "recovery" && accessToken) {
        const { error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: "",
        });
        if (error) {
          toast.error("Error setting session: " + error.message);
        }
      }
    };
    handleRecovery();
  }, [type, accessToken]);

  const handlePasswordUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: password,
      });
      if (error) throw error;
      toast.success("Password updated successfully!");
      router.push("/"); // Redirect to home or login page
    } catch (error: any) {
      toast.error("Error updating password: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex my-[20vh] justify-center min-h-screen">
      <form onSubmit={handlePasswordUpdate} className="w-full max-w-md">
        <h1 className="text-2xl mb-4">Set New Password</h1>
        <div className="mb-4">
          <label htmlFor="password" className="block mb-2">
            Enter your new password
          </label>
          <input
            type="password"
            id="password"
            className="w-full border px-3 py-2"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2"
          disabled={loading}>
          {loading ? "Updating..." : "Update Password"}
        </button>
      </form>
    </div>
  );
};

export default ResetPassword;
