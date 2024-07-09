"use client";

import { logout } from "@/app/authenticate/auth.action";
import { Button } from "@/components/ui/button";

type Props = {
  children: React.ReactNode;
};

export function SignOutButton({ children }: Props) {
  return <Button onClick={() => logout()}>{children}</Button>;
}
