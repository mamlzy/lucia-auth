"use client";

import { getGoogleOAuthConsentUrl } from "@/app/authenticate/auth.action";
import { Button } from "@/components/ui/button";
import { RiGoogleFill } from "react-icons/ri";
import { toast } from "sonner";

export function GoogleOAuthButton() {
  return (
    <Button
      onClick={async () => {
        const res = await getGoogleOAuthConsentUrl();
        if (res.url) {
          window.location.href = res.url;
        } else {
          toast.error(res.error);
        }
      }}
    >
      <RiGoogleFill className="size-4 mr-2" /> Continue with Google!
    </Button>
  );
}
