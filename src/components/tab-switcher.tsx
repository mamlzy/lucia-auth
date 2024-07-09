"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type Props = {
  SignUpTab: React.ReactNode;
  SignInTab: React.ReactNode;
};

export function TabSwitcher({ SignUpTab, SignInTab }: Props) {
  return (
    <Tabs className="max-w-[500px]" defaultValue="sign-in">
      <TabsList>
        <TabsTrigger value="sign-in">Sign In</TabsTrigger>
        <TabsTrigger value="sign-up">Sign Up</TabsTrigger>
      </TabsList>

      <TabsContent value="sign-in">{SignInTab}</TabsContent>
      <TabsContent value="sign-up">{SignUpTab}</TabsContent>
    </Tabs>
  );
}
