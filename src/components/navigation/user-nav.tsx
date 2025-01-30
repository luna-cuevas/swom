import React from "react";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { User } from "lucide-react";

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
              <AvatarImage src={loggedInUser.profile_image} alt={user.email} />
            ) : (
              <AvatarFallback>
                <User className="h-4 w-4" />
              </AvatarFallback>
            )}
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-56 z-[100000001]"
        align="end"
        forceMount>
        <DropdownMenuItem asChild>
          <Link href="/profile">PROFILE</Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/membership">MEMBERSHIP</Link>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onSignOut}>SIGN OUT</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
