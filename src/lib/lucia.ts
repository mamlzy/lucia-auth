import { Lucia } from "lucia";
import { PrismaAdapter } from "@lucia-auth/adapter-prisma";
import { prisma } from "./prisma";
import { cookies } from "next/headers";

const adapter = new PrismaAdapter(prisma.session, prisma.user);

export const lucia = new Lucia(adapter, {
  sessionCookie: {
    name: "lzy-auth-cookie",
    expires: false,
    attributes: {
      secure: process.env.NODE_ENV === "production",
    },
  },
});

export const getUser = async () => {
  const sessionId = cookies().get(lucia.sessionCookieName)?.value || null;

  if (!sessionId) {
    return null;
  }

  const { session, user } = await lucia.validateSession(sessionId);

  if (session && session.fresh) {
    //! refreshing their session cookie
    const sessionCookie = lucia.createSessionCookie(session.id);
    cookies().set(
      sessionCookie.name,
      sessionCookie.value,
      sessionCookie.attributes
    );
  }
  if (!session) {
    //! set a blank session cookie (deleting cookie)
    const sessionCookie = lucia.createBlankSessionCookie();
    cookies().set(
      sessionCookie.name,
      sessionCookie.value,
      sessionCookie.attributes
    );
  }

  const dbUser = await prisma.user.findUnique({
    where: {
      id: user?.id,
    },
    select: {
      name: true,
      email: true,
      picture: true,
    },
  });

  return dbUser;
};
