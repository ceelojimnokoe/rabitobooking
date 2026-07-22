"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { getPendingUnviewedCountAction } from "@/lib/actions/appointment-actions";
import { useToast } from "@/components/toast-provider";

const POLL_INTERVAL_MS = 20_000;

/**
 * Polls for pending requests no administrator has opened yet and shows a
 * toast (plus a soft dashboard refresh) the moment a new one arrives.
 * Renders nothing — it's a background behavior, not a visible component.
 */
export function NewRequestNotifier({ initialCount }: { initialCount: number }) {
  const { showToast } = useToast();
  const router = useRouter();
  const lastKnownCount = useRef(initialCount);

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const count = await getPendingUnviewedCountAction();
        if (count > lastKnownCount.current) {
          const arrived = count - lastKnownCount.current;
          showToast(
            arrived === 1
              ? "A new appointment request just came in."
              : `${arrived} new appointment requests just came in.`,
            "info",
          );
          router.refresh();
        }
        lastKnownCount.current = count;
      } catch {
        // Transient network/auth hiccup — try again on the next tick.
      }
    }, POLL_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [showToast, router]);

  return null;
}
