"use client";

import { axiosAuth } from "@/libs/axios";
import { useSession, signOut } from "next-auth/react";
import { useEffect } from "react";

const useAxiosAuth = () => {
  const { data: session } = useSession();

  useEffect(() => {
    const requestIntercept = axiosAuth.interceptors.request.use(
      (config) => {
        if (!config.headers["Authorization"]) {
          // 🟢 FIX: Removed @ts-ignore because types/next-auth.d.ts now handles the typing.
          // We also check if the token exists to avoid "Bearer undefined"
          if (session?.user?.accessToken) {
            config.headers["Authorization"] = `Bearer ${session.user.accessToken}`;
          }
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    const responseIntercept = axiosAuth.interceptors.response.use(
      (response) => response,
      async (error) => {
        const prevRequest = error?.config;
        if (error?.response?.status === 401 && !prevRequest?.sent) {
          prevRequest.sent = true;
          await signOut({ callbackUrl: "/auth/login" });
          return Promise.reject(error);
        }
        return Promise.reject(error);
      }
    );

    return () => {
      axiosAuth.interceptors.request.eject(requestIntercept);
      axiosAuth.interceptors.response.eject(responseIntercept);
    };
  }, [session]);

  return axiosAuth;
};

export default useAxiosAuth;