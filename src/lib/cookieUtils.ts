import { cookies } from "next/headers";

export const setCookie = async (
  name: string,
  value: string,
  maxAgeSeconds: number,
) => {
  const cookie = await cookies();
  cookie.set(name, value, {
    httpOnly: true,
    path: "/",

    secure: true,
    maxAge: maxAgeSeconds,
    sameSite: "strict",
  });
};
export const getCookie = async (name: string) => {
  const cookie = await cookies();
  return cookie.get(name)?.value;
};

export const deleteCookie = async (name: string) => {
  const cookie = await cookies();
  cookie.delete(name);
};
