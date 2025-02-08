import React from "react";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { User, Settings, CreditCard, LogOut } from "lucide-react";

interface UserNavProps {
  user: any;
  loggedInUser: any;
  onSignOut: () => void;
}

export function UserNav({ user, loggedInUser, onSignOut }: UserNavProps) {
  const [isMounted, setIsMounted] = React.useState(false);

  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            {loggedInUser?.profile_image ? (
              <AvatarImage
                src={loggedInUser.profile_image}
                alt={user.email}
                className="object-cover"
              />
            ) : (
              <AvatarFallback className="bg-primary/10">
                <User className="h-4 w-4 text-primary" />
              </AvatarFallback>
            )}
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-64 z-[100000001]"
        align="end"
        forceMount>
        <div className="flex items-center justify-start gap-2 p-2">
          <div className="flex items-center gap-2 rounded-md bg-secondary/50 p-2">
            <Avatar className="h-8 w-8">
              {loggedInUser?.profile_image ? (
                <AvatarImage
                  src={loggedInUser.profile_image}
                  alt={user.email}
                  className="object-cover"
                />
              ) : (
                <AvatarFallback className="bg-primary/10">
                  <User className="h-4 w-4 text-primary" />
                </AvatarFallback>
              )}
            </Avatar>
            <div className="flex flex-col space-y-0.5">
              <p className="text-sm font-medium line-clamp-1">
                {loggedInUser?.name || "SWOM Member"}
              </p>
              <p className="text-xs text-muted-foreground line-clamp-1">
                {user.email}
              </p>
            </div>
          </div>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link
            href="/profile"
            className="flex items-center gap-2 cursor-pointer">
            <Settings className="h-4 w-4" />
            <span>Profile Settings</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link
            href="/membership"
            className="flex items-center gap-2 cursor-pointer">
            <CreditCard className="h-4 w-4" />
            <span>Membership</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={onSignOut}
          className="flex items-center gap-2 cursor-pointer text-destructive focus:text-destructive">
          <LogOut className="h-4 w-4" />
          <span>Sign out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
