"use server";

import { z } from "zod";
import { signUpSchema } from "./sign-up-form";
import { prisma } from "@/lib/prisma";
import { lucia } from "@/lib/lucia";
import { cookies } from "next/headers";
import { signInSchema } from "./sign-in-form";
import { redirect } from "next/navigation";
import { generateCodeVerifier, generateState } from "arctic";
import { googleOAuthClient } from "@/lib/google-oauth";
import { promisify } from "util";
import crypto from "crypto";

const pbkdf2 = promisify(crypto.pbkdf2);

const hashPassword = async (password: string) => {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = (await pbkdf2(password, salt, 10000, 64, "sha512")).toString(
    "hex"
  );
  return `${salt}:${hash}`;
};

const verifyPassword = async ({
  password,
  hashedPassword,
}: {
  password: string;
  hashedPassword: string;
}) => {
  const [salt, hash] = hashedPassword.split(":");
  const hashToVerify = (
    await pbkdf2(password, salt, 10000, 64, "sha512")
  ).toString("hex");
  return hash === hashToVerify;
};

export const signup = async (values: z.infer<typeof signUpSchema>) => {
  try {
    //! if user already exists, throw an error
    const existingUser = await prisma.user.findUnique({
      where: {
        email: values.email,
      },
    });
    if (existingUser) {
      return {
        error: "User already exists",
        success: false,
      };
    }

    const hashedPassword = await hashPassword(values.password);

    const user = await prisma.user.create({
      data: {
        email: values.email.toLocaleLowerCase(),
        name: values.name,
        hashedPassword,
      },
    });

    const session = await lucia.createSession(user.id, {});
    const sessionCookie = lucia.createSessionCookie(session.id);
    cookies().set(
      sessionCookie.name,
      sessionCookie.value,
      sessionCookie.attributes
    );

    return { success: true };
  } catch (error) {
    return { error: "Something went wrong", success: false };
  }
};

export const signIn = async (values: z.infer<typeof signInSchema>) => {
  const user = await prisma.user.findUnique({
    where: {
      email: values.email,
    },
  });
  if (!user || !user.hashedPassword) {
    return { success: false, error: "Invalid credentials!" };
  }

  const passwordMatch = await verifyPassword({
    password: values.password,
    hashedPassword: user.hashedPassword,
  });
  if (!passwordMatch) {
    return { success: false, error: "Invalid credentials!" };
  }

  //! successfully login
  const session = await lucia.createSession(user.id, {});
  const sessionCookie = lucia.createSessionCookie(session.id);
  cookies().set(
    sessionCookie.name,
    sessionCookie.value,
    sessionCookie.attributes
  );

  return { success: true };
};

export const logout = () => {
  const sessionCookie = lucia.createBlankSessionCookie();
  cookies().set(
    sessionCookie.name,
    sessionCookie.value,
    sessionCookie.attributes
  );

  redirect("/authenticate");
};

export const getGoogleOAuthConsentUrl = async () => {
  try {
    const state = generateState();
    const codeVerifier = generateCodeVerifier();

    cookies().set("codeVerifier", codeVerifier, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
    });

    cookies().set("state", state, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
    });

    cookies().set("codeVerifier", codeVerifier, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
    });

    const authUrl = await googleOAuthClient.createAuthorizationURL(
      state,
      codeVerifier,
      {
        scopes: ["email", "profile"],
      }
    );
    return { success: true, url: authUrl.toString() };
  } catch (error) {
    return { success: false, error: "Something went wrong" };
  }
};
