"use client";

import { useEffect, useRef } from "react";

export function NotificationSound() {
  const bcRef = useRef<BroadcastChannel | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const unlockedRef = useRef(false);
  const seenRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    bcRef.current = new BroadcastChannel("notif");

    const ensureAudio = () => {
      if (!audioRef.current) {
        const a = new Audio("/new-notification-010-352755.mp3");
        a.preload = "auto";
        a.volume = 0.6;
        audioRef.current = a;
      }
      return audioRef.current;
    };

    const unlock = async () => {
      try {
        const a = ensureAudio();
        if (!a) return;
        a.muted = true;
        await a.play().catch(() => {});
        a.pause();
        a.currentTime = 0;
        a.muted = false;
        unlockedRef.current = true;
      } catch {}
      document.removeEventListener("pointerdown", unlock);
      document.removeEventListener("keydown", unlock);
    };

    document.addEventListener("pointerdown", unlock, { once: true });
    document.addEventListener("keydown", unlock, { once: true });

    const playSound = () => {
      try {
        const a = ensureAudio();
        if (!a) return;
        a.currentTime = 0;
        a.play().catch(() => {});
      } catch {}
    };

    const onChannel = (e: MessageEvent) => {
      try {
        if (e.data?.type !== "notif") return;
        if (e.data?.hydrating) return;
        const id = e.data?.payload?.id as string | undefined;
        if (!id) return;
        if (seenRef.current.has(id)) return;
        seenRef.current.add(id);
        if (seenRef.current.size > 500) {
          seenRef.current = new Set(Array.from(seenRef.current).slice(-200));
        }
        if (unlockedRef.current) playSound();
      } catch {}
    };

    const onWindow = (e: Event) => {
      try {
        const detail: any = (e as CustomEvent).detail;
        if (!detail || detail.hydrating) return;
        const id: string | undefined = detail.id;
        if (!id) return;
        if (seenRef.current.has(id)) return;
        seenRef.current.add(id);
        if (seenRef.current.size > 500) {
          seenRef.current = new Set(Array.from(seenRef.current).slice(-200));
        }
        if (unlockedRef.current) playSound();
      } catch {}
    };

    bcRef.current.onmessage = onChannel as any;
    window.addEventListener("p2p:new-notification", onWindow as any);

    return () => {
      window.removeEventListener("p2p:new-notification", onWindow as any);
      bcRef.current?.close();
    };
  }, []);

  return null;
}
