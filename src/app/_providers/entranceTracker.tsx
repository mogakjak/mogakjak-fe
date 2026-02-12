"use client";

import { useEffect } from "react";
import { sendGAEvent } from "@next/third-parties/google";

export default function EntranceTracker() {
    useEffect(() => {
        const isFirstVisit = !sessionStorage.getItem("entrance_tracked");

        if (isFirstVisit) {
            sessionStorage.setItem("entrance_tracked", "true");

            sendGAEvent("event", "first_entrance", {
                entry_page: window.location.pathname,
                referrer: document.referrer || "direct",
            });

        }
    }, []);

    return null;
}