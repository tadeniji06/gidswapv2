import { AnimatedSection } from "@/src/components/ui/animate-section";
import { Play } from "lucide-react";
import Image from "next/image";
import React, { useRef, useState } from "react";
import { motion } from "framer-motion";

export default function VideoSection() {
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);

  const handleVideoPlay = () => {
    if (videoRef.current) {
      if (isVideoPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsVideoPlaying(!isVideoPlaying);
    }
  };
  return (
    <AnimatedSection>
      <div className="-mt-2 w-full lg:-mt-4 overflow-hidden ">
        <div className="mx-auto mb-20 w-full max-w-[62.75rem] scroll-mt-24 px-5 md:mb-48">
          <div className="relative mx-auto flex w-full max-w-[800px] items-center justify-center">
            <div className="relative w-full rounded-3xl">
              <div className="relative aspect-video w-full overflow-hidden rounded-[12px] lg:rounded-3xl">
                <div className="relative h-full w-full">
                  <video
                    ref={videoRef}
                    className="h-full w-full object-cover"
                    poster="/placeholder.svg?height=400&width=800"
                    playsInline
                  >
                    <source src="/videos/gidswap.mp4" type="video/mp4" />
                  </video>
                  <div
                    className={`absolute inset-0 z-10 bg-black/60 transition-colors duration-300 ${
                      isVideoPlaying ? "opacity-0" : "opacity-100"
                    }`}
                  />
                  <button
                    onClick={handleVideoPlay}
                    className={`absolute inset-0 z-20 flex h-full w-full flex-col items-center justify-center transition-opacity duration-300 focus:outline-none ${
                      isVideoPlaying ? "opacity-0" : "opacity-100"
                    }`}
                  >
                    <div className="h-16 w-16 sm:h-32 sm:w-32 rounded-full bg-white/5 flex items-center justify-center">
                      <div className="h-12 w-12 sm:h-24 sm:w-24 rounded-full bg-blue-500 flex items-center justify-center">
                        <Play className="h-6 w-6 sm:h-8 sm:w-8 text-white ml-1" />
                      </div>
                    </div>
                    <div className="mt-4 text-center">
                      <div className="text-base font-semibold text-white sm:text-lg md:text-xl">
                        Watch a quick walkthrough
                      </div>
                      <div className="mt-1 text-xs text-white/80 sm:text-sm">
                        45 seconds
                      </div>
                    </div>
                  </button>
                </div>
              </div>
            </div>
            <motion.div
              animate={{
                scale: [1, 0.4, 1],
                y: [10, 50, 10],
              }}
              transition={{
                duration: 3,
                repeat: Number.POSITIVE_INFINITY,
                ease: "easeInOut",
                delay: 1,
              }}
              className="pointer-events-none absolute -bottom-16 right-0 w-[320px] select-none max-lg:w-[220px] max-md:w-[180px] max-sm:w-[90px] sm:-bottom-20 sm:-right-8 md:-bottom-24 md:-right-16 lg:-bottom-32 lg:-right-24 z-10"
            >
              <Image
                src="/images/video-plane-img.svg"
                alt="Video Plane Image"
                data-nimg="1"
                draggable="false"
                width={100}
                height={100}
                className="h-auto w-full"
              />
            </motion.div>
          </div>
        </div>
      </div>
    </AnimatedSection>
  );
}
