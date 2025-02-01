"use client";

import Image from "next/image";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import SignIn from "@/components/SignIn";
import { toast } from "react-toastify";
import { usePathname, useRouter } from "next/navigation";
import { globalStateAtom } from "@/context/atoms";
import { useAtom } from "jotai";
import getUnreadMessageCount from "../utils/getUnreadMessageCount";
import { RealtimeChannel } from "@supabase/supabase-js";
import getUnreadConversations from "@/utils/getUnreadConversations";
import { getSupabaseClient } from "@/utils/supabaseClient";
import { MobileNav } from "./navigation/mobile-nav";
import { NavigationLinks } from "./navigation/navigation-links";
import { UserNav } from "./navigation/user-nav";
import { cn } from "@/lib/utils";

const Navigation = () => {
  const router = useRouter();
  const navigation = usePathname();
  const [signInActive, setSignInActive] = React.useState(false);
  const [state, setState] = useAtom(globalStateAtom);
  const { user } = state;
  const supabase = getSupabaseClient();
  const [isClient, setIsClient] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    setIsClient(true);
    setIsMounted(true);

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    let subscription: RealtimeChannel;
    const subscribeToChannel = async () => {
      try {
        subscription = supabase
          .channel(`read-receipts-channel-${user.id}`)
          .on(
            "postgres_changes",
            {
              event: "*",
              schema: "public",
              table: "read_receipts",
              // filter: `user_id=eq.${user.id}`,
            },
            (payload) => {
              console.log("Table Event Received:", {
                event: payload.eventType,
                payload,
                userId: user.id
              });
              const fetchUnreadCount = async () => {
                try {
                  console.log("Fetching unread count after table change");
                  const count = await getUnreadMessageCount(user.id);
                  console.log("New count:", count);
                  const unreadConverstaions = await getUnreadConversations(
                    state.user.id
                  );
                  setState((prevState) => ({
                    ...prevState,
                    unreadCount: count,
                    unreadConversations: unreadConverstaions,
                  }));
                } catch (err) {
                  console.error("Error fetching count:", err);
                }
              };
              fetchUnreadCount();
            }
          )
          .subscribe();

        console.log("Subscribed to channel with user ID:", user.id);

        if (!subscription) {
          throw new Error("Failed to subscribe to channel");
        }
      } catch (error) {
        console.error("Error subscribing to channel:", error);
      }
    };

    if (user.id) {
      subscribeToChannel();
    }

    return () => {
      try {
        if (subscription) {
          supabase.removeChannel(subscription);
        }
      } catch (error) {
        console.error("Error removing subscription:", error);
      }
    };
  }, [user.id]);

  useEffect(() => {
    if (
      navigation !== "/home" &&
      navigation !== "/become-member" &&
      navigation !== "/about-us" &&
      navigation !== "/how-it-works" &&
      navigation !== "/sign-up" &&
      navigation !== "/forgot-password" &&
      state.session === null
    ) {
      router.push("/home");
    }
  }, [navigation]);

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      localStorage.removeItem("SWOMGlobalState-v3");

      // Reset state with default values instead of clearing everything
      setState({
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
        showMobileMenu: false,
        noUser: false,
        imgUploadPopUp: false,
        isSubscribed: false,
        loggedInUser: null,
        activeNavButtons: false,
        unreadCount: 0,
        unreadConversations: [],
        signInActive: false,
        allListings: {
          listings: [],
          lastFetched: 0,
        },
      });

      router.push("/home");
      toast.success("Signed out successfully");
    } catch (error) {
      console.error("Error signing out:", error);
      toast.error("Error signing out");
    }
  };

  return (
    <header
      className={cn(
        "w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 transition-all duration-200",
        {
          "sticky top-0 z-[100000000]": isScrolled,
          relative: !isScrolled,
        }
      )}>
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-6">
          <Link
            href="/home"
            className="flex w-[150px] h-[40px] relative items-center">
            <Image
              className="object-contain"
              src="/swom-logo.jpg"
              alt="logo"
              fill
              sizes="(max-width: 768px) 30vw, (max-width: 1024px) 20vw, 15vw"
            />
          </Link>
        </div>

        {isMounted && (
          <>
            <div className="2xl:hidden">
              <MobileNav
                user={user}
                isClient={isClient}
                activeNavButtons={state.activeNavButtons}
                isSubscribed={state.isSubscribed}
                unreadCount={state.unreadCount}
                loggedInUser={state.loggedInUser}
                onSignIn={() => setState({ ...state, signInActive: true })}
                onSignOut={handleSignOut}
              />
            </div>
            <div className="hidden 2xl:flex items-center gap-6">
              <NavigationLinks
                user={user}
                isClient={isClient}
                activeNavButtons={state.activeNavButtons}
                isSubscribed={state.isSubscribed}
                unreadCount={state.unreadCount}
                loggedInUser={state.loggedInUser}
                onSignIn={() => setState({ ...state, signInActive: true })}
                onSignOut={handleSignOut}
              />
              {state.activeNavButtons && isClient && (
                <UserNav
                  user={user}
                  loggedInUser={state.loggedInUser}
                  onSignOut={handleSignOut}
                />
              )}
            </div>
          </>
        )}
      </div>
    </header>
  );
};

export default Navigation;
