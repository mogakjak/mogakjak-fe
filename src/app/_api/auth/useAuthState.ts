"use client";

import { useEffect, useState } from "react";

const ACCESS_TOKEN_KEY = "mg_access_token";

type AuthStatus = "loading" | "loggedIn" | "loggedOut";

export function useAuthState() {
  const [status, setStatus] = useState<AuthStatus>("loading");

  useEffect(() => {
    try {
      const token = localStorage.getItem(ACCESS_TOKEN_KEY);
      setStatus(token ? "loggedIn" : "loggedOut");
    } catch {
      setStatus("loggedOut");
    }

    const onStorage = (e: StorageEvent) => {
      if (e.key === ACCESS_TOKEN_KEY) {
        setStatus(e.newValue ? "loggedIn" : "loggedOut");
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  return {
    isLoggedIn: status === "loggedIn",
    ready: status !== "loading",
  };
}
