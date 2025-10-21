"use client";

import { useAuthState } from "@/app/_api/auth/useAuthState";
import Header from "../Header";

export default function ConditionalHeader() {
  const { isLoggedIn, ready } = useAuthState();

  if (!ready || !isLoggedIn) {
    return null;
  }

  return <Header />;
}
