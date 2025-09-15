"use client";
import dynamic from "next/dynamic";

const VideoFrame = dynamic(() => import("./video-frame"), {
  ssr: false,
  loading: () => (
    <div className="relative w-full overflow-hidden rounded-xl shadow-md bg-black/10 aspect-video" />
  ),
});

export default VideoFrame;
