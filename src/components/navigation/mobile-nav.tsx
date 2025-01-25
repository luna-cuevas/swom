import React from "react";
import Link from "next/link";
import { Menu } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetHeader,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { NavigationLinks } from "./navigation-links";
import Image from "next/image";
import { Separator } from "@/components/ui/separator";

interface MobileNavProps {
  user: any;
  isClient: boolean;
  activeNavButtons: boolean;
  isSubscribed: boolean;
  unreadCount: number;
  loggedInUser: any;
  onSignIn: () => void;
  onSignOut: () => void;
}

export function MobileNav({
  user,
  isClient,
  activeNavButtons,
  isSubscribed,
  unreadCount,
  loggedInUser,
  onSignIn,
  onSignOut,
}: MobileNavProps) {
  const [open, setOpen] = React.useState(false);

  if (!isClient) {
    return null;
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          className="mr-2 px-0 text-base hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0">
          <Menu className="h-6 w-6" />
          <span className="sr-only">Toggle menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent
        side="top"
        className="flex h-[96vh] w-full flex-col border-b bg-background/95 p-0 backdrop-blur supports-[backdrop-filter]:bg-background/60 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:slide-out-to-top data-[state=open]:slide-in-from-top">
        <SheetHeader className="p-4">
          <Link
            href="/home"
            onClick={() => setOpen(false)}
            className="flex items-center space-x-2">
            <Image
              src="/swom-logo.jpg"
              alt="logo"
              width={120}
              height={32}
              className="object-contain"
            />
          </Link>
        </SheetHeader>
        <Separator />
        <div className="flex-1 overflow-auto">
          <div className="flex h-full flex-col py-4">
            <NavigationLinks
              user={user}
              isClient={isClient}
              activeNavButtons={activeNavButtons}
              isSubscribed={isSubscribed}
              unreadCount={unreadCount}
              loggedInUser={loggedInUser}
              onSignIn={() => {
                setOpen(false);
                onSignIn();
              }}
              onSignOut={() => {
                setOpen(false);
                onSignOut();
              }}
              className="flex flex-col space-y-1 px-4"
              isMobile={true}
              onNavigate={() => setOpen(false)}
            />
          </div>
        </div>
        {activeNavButtons && loggedInUser && (
          <>
            <Separator />
            <div className="p-4">
              <div className="flex items-center gap-2">
                {loggedInUser?.profile_image ? (
                  <Image
                    src={loggedInUser.profile_image}
                    alt={user.email}
                    width={32}
                    height={32}
                    className="rounded-full"
                  />
                ) : (
                  <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                    <span className="text-sm font-medium">
                      {user.email?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
                <div className="flex flex-col">
                  <p className="text-sm font-medium">{user.email}</p>
                  {loggedInUser?.role === "admin" && (
                    <p className="text-xs text-muted-foreground">Admin</p>
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
