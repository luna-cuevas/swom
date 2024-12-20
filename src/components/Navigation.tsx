"use client";

import Image from "next/image";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import SignIn from "@/components/SignIn";
import { supabaseClient } from "@/utils/supabaseClient";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { usePathname, useRouter } from "next/navigation";
import { globalStateAtom } from "@/context/atoms";
import { useAtom } from "jotai";
import getUnreadMessageCount from "../utils/getUnreadMessageCount";
import { RealtimeChannel } from "@supabase/supabase-js";
import getUnreadConversations from "@/utils/getUnreadConversations";

import {
  Typography,
  Button,
  Menu,
  MenuHandler,
  MenuList,
  MenuItem,
  Avatar,
} from "@material-tailwind/react";
import {
  UserCircleIcon,
  ChevronDownIcon,
  Cog6ToothIcon,
  InboxArrowDownIcon,
  LifebuoyIcon,
  PowerIcon,
} from "@heroicons/react/24/solid";

type Props = {};

const Navigation = (props: Props) => {
  const supabase = supabaseClient();
  const router = useRouter();
  const navigation = usePathname();
  const [signInActive, setSignInActive] = React.useState(false);
  const [state, setState] = useAtom(globalStateAtom);
  const { user } = state;
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  const closeMenu = () => setIsMenuOpen(false);

  const [isClient, setIsClient] = useState(false);

  // profile menu component
  const profileMenuItems = [
    {
      label: "PROFILE",
      url: "/profile",
    },
    {
      label: "MEMBERSHIP",
      url: "/membership",
    },
    {
      label: "SIGN OUT",
      url: "",
    },
  ];

  useEffect(() => {
    setIsClient(true);
  }, [state.user.id]);

  useEffect(() => {
    let subscription: RealtimeChannel;
    const subscribeToChannel = async () => {
      try {
        subscription = supabase
          .channel(`read-receipts-channel-${user.id}`)
          .on(
            "postgres_changes",
            {
              event: "INSERT",
              schema: "public",
              table: "read_receipts",
              filter: `user_id=eq.${user.id}`,
            },
            (payload) => {
              const fetchUnreadCount = async () => {
                try {
                  await new Promise((resolve) => setTimeout(resolve, 100)); // delaying updating ui on insertion so users dont see a notification flicker
                  const count = await getUnreadMessageCount(user.id);
                  const unreadConverstaions = await getUnreadConversations(
                    state.user.id
                  );
                  setState((prevState) => ({
                    ...prevState,
                    unreadCount: count,
                    unreadConversations: unreadConverstaions,
                  }));
                } catch (err) {
                  console.error(err);
                }
              };
              fetchUnreadCount();
            }
          )
          .on(
            "postgres_changes",
            {
              event: "DELETE",
              schema: "public",
              table: "read_receipts",
              filter: `user_id=eq.${user.id}`,
            },
            (payload) => {
              const fetchUnreadCount = async () => {
                try {
                  const count = await getUnreadMessageCount(user.id);
                  const unreadConverstaions = await getUnreadConversations(
                    state.user.id
                  );
                  setState((prevState) => ({
                    ...prevState,
                    unreadCount: count,
                    unreadConversations: unreadConverstaions,
                  }));
                } catch (err) {
                  console.error(err);
                }
              };
              fetchUnreadCount();
            }
          )
          .subscribe();

        if (!subscription) {
          throw new Error("Failed to subscribe to channel");
        }
        console.log("Subscribed to channel:", subscription);
      } catch (error) {
        console.error("Error subscribing to channel:", error);
      }
    };

    subscribeToChannel();
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
      localStorage.clear();
      // Clear all atom states
      setState({
        ...state,
        user: {
          email: "",
        },
        loggedInUser: null,
        activeNavButtons: false,
        isSubscribed: false,
        allListings: [],
        unreadCount: 0,
        session: null,
      });
      router.push("/home");
      toast.success("Signed out successfully");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  useEffect(() => {
    setState({
      ...state,
      showMobileMenu: false,
    });
  }, [navigation]);

  return (
    <nav className=" relative  md:px-12 px-4 z-[100000] py-6 bg-[#fff] flex justify-between">
      <div className="flex w-[150px] h-auto relative   items-center">
        <Link href="/home">
          <Image
            className="object-contain"
            src="/swom-logo.jpg"
            alt="logo"
            fill
            sizes=" (max-width: 768px) 30vw, (max-width: 1024px) 20vw, 15vw"
          />
        </Link>
      </div>
      <div className="hidden 2xl:flex gap-4 align-middle">
        {!state.activeNavButtons && isClient && (
          <>
            <Link className="m-auto text-sm" href="/how-it-works">
              HOW IT WORKS
            </Link>

            <Link className="text-sm" href="/become-member">
              BECOME A MEMEBER
            </Link>
            <Link className="text-sm" href="/about-us">
              US
            </Link>
          </>
        )}

        {state.activeNavButtons && isClient ? (
          <>
            <Link className="text-sm" href="/messages">
              MESSAGES
              {state.unreadCount > 0 && (
                <span className=" ml-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-white text-xs">
                  {state.unreadCount}
                </span>
              )}
            </Link>
            <Link className="text-sm" href="/listings">
              LISTINGS
            </Link>
            <Link className="text-sm" href="/listings/my-listing">
              MY LISTING
            </Link>

            <Menu
              open={isMenuOpen}
              handler={setIsMenuOpen}
              placement="bottom-end">
              <MenuHandler>
                <Button
                  variant="text"
                  className="flex items-center gap-1 rounded-full py-0.5 pr-2 pl-0.5 lg:ml-auto">
                  {state.loggedInUser?.profile_image ? (
                    <Avatar
                      variant="circular"
                      size="sm"
                      alt="profile"
                      className="border border-gray-900 p-0.5"
                      src={state.loggedInUser?.profile_image}
                    />
                  ) : (
                    <UserCircleIcon className="h-6 w-6" />
                  )}

                  <ChevronDownIcon
                    strokeWidth={2.5}
                    className={`h-3 w-3 transition-transform ${
                      isMenuOpen ? "rotate-180" : ""
                    }`}
                  />
                </Button>
              </MenuHandler>
              <MenuList className="p-1 z-[100000]">
                {(user?.email == "anamariagomezc@gmail.com" ||
                  user?.email == "s.cuevas14@gmail.com" ||
                  user?.email == "ana@swom.travel") && (
                  <MenuItem
                    onClick={closeMenu}
                    className={`flex items-center gap-2 rounded `}>
                    <Link href="/studio" className="w-full">
                      <Typography
                        color="black"
                        as="span"
                        variant="small"
                        className="font-normal">
                        STUDIO
                      </Typography>
                    </Link>
                  </MenuItem>
                )}
                {profileMenuItems.map(({ label, url }, key) => {
                  const isLastItem = key === profileMenuItems.length - 1;
                  return (
                    <MenuItem
                      key={label}
                      onClick={() =>
                        !isLastItem ? closeMenu : handleSignOut()
                      }
                      className={`flex items-center gap-2 rounded ${
                        isLastItem
                          ? "hover:bg-red-500/10 focus:bg-red-500/10 active:bg-red-500/10"
                          : ""
                      }`}>
                      <Link className="w-full" href={isLastItem ? "" : url}>
                        <Typography
                          as="span"
                          variant="small"
                          className="font-normal"
                          color={isLastItem ? "red" : "black"}>
                          {label}
                        </Typography>
                      </Link>
                    </MenuItem>
                  );
                })}
              </MenuList>
            </Menu>
          </>
        ) : (
          <button
            className="m-auto text-sm"
            onClick={() => {
              setSignInActive(!signInActive);
            }}>
            SIGN IN
          </button>
        )}
      </div>

      {signInActive && <SignIn setSignInActive={setSignInActive} />}

      <div className="2xl:hidden">
        <button
          onClick={() =>
            setState({
              ...state,
              showMobileMenu: !state.showMobileMenu,
            })
          }>
          <svg
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg">
            <path
              d="M1.66667 3.33333H18.3333V5.83333H1.66667V3.33333ZM1.66667 8.33333H18.3333V10.8333H1.66667V8.33333ZM1.66667 13.3333H18.3333V15.8333H1.66667V13.3333Z"
              fill="#000000"
            />
          </svg>
        </button>
      </div>

      <div
        style={{
          maxHeight: state.showMobileMenu ? "100vh" : "0",
          borderTop: state.showMobileMenu ? "1px solid #a9a9a9" : "none",
          padding: state.showMobileMenu ? "20px 0" : "0",
          zIndex: state.showMobileMenu ? "5000" : "-100",
          opacity: state.showMobileMenu ? "1" : "0",
        }}
        className={`2xl:hidden  align-middle gap-4  box-border top-full flex flex-col justify-center text-center transition-all duration-300 ease-in-out overflow-hidden max-h-[100vh] left-0 bg-white w-full absolute`}>
        {!state.activeNavButtons && isClient && (
          <>
            <Link className="m-auto" href="/how-it-works">
              HOW IT WORKS
            </Link>

            <Link className="m-auto" href="/become-member">
              BECOME A MEMEBER
            </Link>
            <Link className="m-auto" href="/about-us">
              US
            </Link>
          </>
        )}
        {state && state.activeNavButtons && state.isSubscribed && isClient && (
          <>
            {(state.user?.email == "anamariagomezc@gmail.com" ||
              state.user?.email == "s.cuevas14@gmail.com" ||
              state.user?.email == "ana@swom.travel") && (
              <Link className="m-auto" href="/studio">
                STUDIO
              </Link>
            )}
            <Link className="m-auto" href="/messages">
              MESSAGES
              {state.unreadCount > 0 && (
                <span className=" ml-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-white text-xs">
                  {state.unreadCount}
                </span>
              )}
            </Link>
            <Link className="m-auto" href="/profile">
              PROFILE
            </Link>
            <Link className="m-auto" href="/membership">
              MEMBERSHIP
            </Link>
            <Link className="m-auto" href="/listings">
              LISTINGS
            </Link>
            <Link className="m-auto" href="/listings/my-listing">
              MY LISTING
            </Link>
          </>
        )}

        {state.activeNavButtons && isClient ? (
          <button
            className="m-auto"
            onClick={() => {
              handleSignOut();
            }}>
            SIGN OUT
          </button>
        ) : (
          <button
            className="m-auto"
            onClick={() => {
              setSignInActive(!signInActive);
            }}>
            SIGN IN
          </button>
        )}

        {/* <Menu>
          <MenuHandler>
            <Button className="bg-[#fff] mx-auto shadow-none">
              <Image
                alt="search"
                width={20}
                height={20}
                src="/search-icon.svg"></Image>
            </Button>
          </MenuHandler>
          <MenuList>
            <Input
              crossOrigin=""
              type="text"
              label="Search"
              containerProps={{
                classNsame: 'mb-4',
              }}
            />
            <MenuItem>Menu Item 1</MenuItem>
            <MenuItem>Menu Item 2</MenuItem>
            <MenuItem>Menu Item 3</MenuItem>
          </MenuList>
        </Menu> */}
      </div>
    </nav>
  );
};

export default Navigation;
