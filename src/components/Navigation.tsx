"use client";

import Image from "next/image";
import Link from "next/link";
import React, { useEffect, useState, useRef } from "react";
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
  const subscriptionRef = useRef<RealtimeChannel | null>(null);

  // Add local state for unread counts
  const [localUnreadCount, setLocalUnreadCount] = useState(0);
  const [localUnreadConversations, setLocalUnreadConversations] = useState<
    any[]
  >([]);

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
    console.log("Setting up initial subscription for user:", user?.id);

    const setupSubscription = () => {
      try {
        // Clean up any existing subscription
        if (subscriptionRef.current) {
          console.log("Cleaning up existing subscription");
          supabase.removeChannel(subscriptionRef.current);
          subscriptionRef.current = null;
        }

        if (!user?.id) {
          console.log("No user ID, skipping subscription setup");
          return;
        }

        // Create a channel for message status updates
        const channel = supabase.channel("message_status_room", {
          config: {
            broadcast: {
              self: true,
              ack: true,
            },
          },
        });

        // Add broadcast handler
        channel.on(
          "broadcast",
          { event: "message_status" },
          async (payload) => {
            console.log("Received broadcast message in Navigation:", payload);

            // Only process if we have a user and the message is for this user
            if (
              user.id &&
              payload.payload &&
              payload.payload.user_id === user.id
            ) {
              try {
                console.log(
                  "Processing message status in Navigation:",
                  payload.payload.action
                );

                // For new messages, increment the count immediately
                if (payload.payload.action === "new_message") {
                  // Only increment if we're not the sender
                  if (payload.payload.sender_id !== user.id) {
                    setLocalUnreadCount((prev) => prev + 1);
                  }
                }

                // For mark_as_read, update from server
                if (payload.payload.action === "mark_as_read") {
                  // Fetch the actual count from server to ensure accuracy
                  const response = await fetch(
                    "/api/members/messages/get-unread-count",
                    {
                      method: "POST",
                      headers: {
                        "Content-Type": "application/json",
                      },
                      body: JSON.stringify({ userId: user.id }),
                    }
                  );
                  const data = await response.json();
                  console.log(
                    "Navigation: Server unread count response:",
                    data
                  );
                  if (!data.error) {
                    setLocalUnreadCount(data.totalUnread);
                    setLocalUnreadConversations(data.conversationCounts);
                    console.log(
                      "Navigation: Updated count from server:",
                      data.totalUnread
                    );
                  }
                }
              } catch (err) {
                console.error("Error updating Navigation unread count:", err);
              }
            }
          }
        );

        // Subscribe to the channel
        channel.subscribe((status) => {
          console.log("Navigation subscription status:", status);
          if (status === "SUBSCRIBED") {
            console.log("Navigation successfully subscribed to broadcasts");
            // Fetch initial counts when subscription is established
            fetch("/api/members/messages/get-unread-count", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ userId: user.id }),
            })
              .then((response) => response.json())
              .then((data) => {
                if (!data.error) {
                  setLocalUnreadCount(data.totalUnread);
                  setLocalUnreadConversations(data.conversationCounts);
                  console.log(
                    "Navigation: Initial unread count set:",
                    data.totalUnread
                  );
                }
              })
              .catch((error) => {
                console.error(
                  "Error fetching initial Navigation counts:",
                  error
                );
              });
          } else if (status === "CHANNEL_ERROR") {
            console.error("Navigation broadcast subscription failed");
          }
        });

        subscriptionRef.current = channel;
      } catch (error) {
        console.error("Error setting up Navigation subscription:", error);
      }
    };

    setupSubscription();

    // Cleanup on unmount or user change
    return () => {
      console.log("Cleaning up Navigation subscription");
      if (subscriptionRef.current) {
        supabase.removeChannel(subscriptionRef.current);
        subscriptionRef.current = null;
      }
    };
  }, [user?.id, supabase]); // Only re-run when user ID changes

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
                unreadCount={localUnreadCount}
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
                unreadCount={localUnreadCount}
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
