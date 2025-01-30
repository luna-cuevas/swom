import React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Home,
  Info,
  UserPlus,
  MessageSquare,
  ListTodo,
  ClipboardList,
  Shield,
  LogIn,
} from "lucide-react";

interface NavigationLinksProps {
  user: any;
  isClient: boolean;
  activeNavButtons: boolean;
  isSubscribed: boolean;
  unreadCount: number;
  loggedInUser: any;
  onSignIn: () => void;
  onSignOut: () => void;
  className?: string;
  isMobile?: boolean;
  onNavigate?: () => void;
}

export function NavigationLinks({
  user,
  isClient,
  activeNavButtons,
  isSubscribed,
  unreadCount,
  loggedInUser,
  onSignIn,
  onSignOut,
  className,
  isMobile = false,
  onNavigate,
}: NavigationLinksProps) {
  const linkClassName = cn(
    "flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-all hover:bg-accent",
    isMobile ? "w-full" : ""
  );

  if (!isClient) {
    return null;
  }

  const handleClick = () => {
    onNavigate?.();
  };

  return (
    <nav
      className={cn("flex items-center gap-1", className, {
        "flex-col items-stretch": isMobile,
        "flex-row items-center": !isMobile,
      })}>
      {!activeNavButtons && (
        <>
          <Link
            href="/how-it-works"
            className={linkClassName}
            onClick={handleClick}>
            <Info className="h-4 w-4" />
            HOW IT WORKS
          </Link>
          <Link
            href="/become-member"
            className={linkClassName}
            onClick={handleClick}>
            <UserPlus className="h-4 w-4" />
            BECOME A MEMBER
          </Link>
          <Link
            href="/about-us"
            className={linkClassName}
            onClick={handleClick}>
            <Home className="h-4 w-4" />
            US
          </Link>
          <Button
            variant="ghost"
            className={cn(linkClassName, "justify-start font-normal")}
            onClick={onSignIn}>
            <LogIn className="h-4 w-4" />
            SIGN IN
          </Button>
        </>
      )}

      {activeNavButtons && (
        <>
          {loggedInUser?.role === "admin" && (
            <Link href="/admin" className={linkClassName} onClick={handleClick}>
              <Shield className="h-4 w-4" />
              ADMIN
            </Link>
          )}
          <Link
            href="/messages"
            className={linkClassName}
            onClick={handleClick}>
            <MessageSquare className="h-4 w-4" />
            MESSAGES
            {unreadCount > 0 && (
              <span className="ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white">
                {unreadCount}
              </span>
            )}
          </Link>
          <Link
            href="/listings"
            className={linkClassName}
            onClick={handleClick}>
            <ListTodo className="h-4 w-4" />
            LISTINGS
          </Link>
          <Link
            href="/listings/my-listing"
            className={linkClassName}
            onClick={handleClick}>
            <ClipboardList className="h-4 w-4" />
            MY LISTINGS
          </Link>
          {isMobile && (
            <>
              <Link
                href="/profile"
                className={linkClassName}
                onClick={handleClick}>
                <UserPlus className="h-4 w-4" />
                PROFILE
              </Link>
              <Link
                href="/membership"
                className={linkClassName}
                onClick={handleClick}>
                <Shield className="h-4 w-4" />
                MEMBERSHIP
              </Link>
              <Button
                variant="ghost"
                className={cn(linkClassName, "justify-start font-normal")}
                onClick={onSignOut}>
                <LogIn className="h-4 w-4" />
                SIGN OUT
              </Button>
            </>
          )}
        </>
      )}
    </nav>
  );
}
