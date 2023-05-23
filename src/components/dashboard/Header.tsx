import { LogOut } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { useSession, signOut } from "next-auth/react";
import { Avatar } from "../ui/avatar";
import { AvatarImage } from "../ui/avatar";
import { AvatarFallback } from "../ui/avatar";
import Image from "next/image";

export default function Header() {
  const { data: session, status } = useSession();

  return (
    <>
      <header className="h-14 w-full border-b bg-background shadow-sm">
        <div className="container flex h-full w-full items-center justify-between px-4 py-2 lg:px-0">
          <Image src="/logo-light.svg" alt="TimetablePRO Logo Light" height={56} width={200} />
          {status === "loading" ? (
            <div>Loading...</div>
          ) : (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Avatar className="cursor-pointer">
                  <AvatarImage
                    alt={session?.user.name}
                    src={session?.user.image ? session.user.image : ""}
                  />
                  <AvatarFallback>
                    {session?.user.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuLabel>
                  {session?.user.name} {session?.user.surname}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuLabel className="font-normal">
                  {session?.user.memberRole === "MANAGER"
                    ? "Manager"
                    : "Teacher"}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="focus:bg-foreground focus:text-secondary"
                  onClick={() => signOut({ callbackUrl: "/" })}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </header>
    </>
  );
}
