import { LogOut, PanelLeftOpen } from "lucide-react";
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
import { Button } from "../ui/button";

export default function Header({
  setIsCollapsed,
}: {
  setIsCollapsed: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const { data: session, status } = useSession();

  return (
    <>
      <header className="z-10 h-14 w-full border-b bg-background shadow-sm max-lg:sticky max-lg:top-0">
        <div className="container flex h-full w-full items-center justify-between px-4 py-2 lg:px-0">
          <div className="lg:hidden">
            <Button
              type="button"
              variant="link"
              className="m-0 p-0 text-foreground"
              onClick={() => {
                setIsCollapsed((prev) => !prev);
              }}
            >
              <PanelLeftOpen height={24} width={24} />
            </Button>
          </div>
          <Image
            src="/logo-light.svg"
            alt="TimetablePRO Logo Light"
            height={56}
            width={230}
          />
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
                  {session?.user.role === "SUPERADMIN"
                    ? "Superadmin"
                    : session?.user.memberRole === "MANAGER"
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
