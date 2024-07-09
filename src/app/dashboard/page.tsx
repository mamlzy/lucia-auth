import { SignOutButton } from "@/components/sign-out-button";
import { getUser } from "@/lib/lucia";
import Image from "next/image";
import { redirect } from "next/navigation";

export default async function Page() {
  const user = await getUser();
  if (!user) {
    redirect("/authenticate");
  }

  return (
    <>
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
        <div className="flex items-center gap-2 border p-4 rounded-lg bg-gray-100 transition-all cursor-pointer hover:shadow">
          {user.picture ? (
            <Image
              src={user.picture}
              alt="Profile Picture"
              width="0"
              height="0"
              sizes="100vw"
              className="rounded-full size-16 object-cover"
              quality={100}
            />
          ) : null}
          <div className="flex flex-col">
            <span className="font-semibold text-xl">{user.name}</span>
            <span className="text-gray-500">{user.email}</span>
          </div>
        </div>
      </div>
      <div className="absolute right-4 top-4">
        <SignOutButton>Sign Out</SignOutButton>
      </div>
    </>
  );
}
