import React from "react";
import { AnimatedSection } from "@/src/components/ui/animate-section";
import { useCaseNoExp, useWeb3Dengen } from "@/lib/constants";
import Image from "next/image";

export default function WaysToUse() {
  return (
    <AnimatedSection>
      <div className="mb-36 flex w-full flex-col items-center justify-center gap-11 px-5 sm:gap-14 md:mb-32">
        <div className="text-center dark:opacity-80">
          <span className="text-2xl font-semibold sm:text-4xl md:text-5xl">
            Ways you can use{" "}
          </span>
          <span className="text-3xl font-semibold sm:text-5xl md:text-6xl font-crimson italic">
            Gidswap
          </span>
        </div>

        <div className="container mx-auto grid w-full grid-cols-1 md:max-w-4xl md:grid-cols-1 md:gap-6 md:rounded-[28px] md:border md:border-gray-200 md:p-6 dark:md:border-white/10">
          <div className="flex flex-col gap-2 rounded-3xl bg-gray-50 px-2 pb-2 pt-4 dark:bg-white/5 md:gap-4 md:px-4 md:py-4">
            <h4 className="mb-4 text-base font-medium text-gray-700 dark:text-white/80 sm:text-lg">
              No Crypto Experience <span className="text-2xl font-bolder">.</span> Web3 Native and degen
            </h4>

            {useCaseNoExp.map((data, index) => (
              <div
                key={index}
                className="group flex cursor-pointer flex-col gap-2 rounded-[18px] bg-white p-2 transition-colors duration-300 hover:bg-blue-500 hover:text-white dark:bg-white/5 dark:hover:bg-blue-500 dark:hover:text-white md:gap-4 md:rounded-[20px] md:p-4"
              >
                <Image
                  src={data.icon}
                  alt={data.text}
                  width={100}
                  height={100}
                  className="w-14"
                />
                <span className="text-xs font-normal sm:text-sm lg:text-base">
                  {data.text}
                </span>
              </div>
            ))}
          </div>

          {/* <div className="flex flex-col gap-2 rounded-3xl bg-gray-50 px-2 pb-2 pt-4 dark:bg-white/5 md:gap-4 md:px-4 md:py-4">
            <h4 className="mb-4 text-base font-medium text-gray-700 dark:text-white/80 sm:text-lg">
              Web3 Native & Degen
            </h4>

            {useWeb3Dengen.map((data, index) => (
              <div
                key={index}
                className="group flex cursor-pointer flex-col gap-2 rounded-[18px] bg-white p-2 transition-colors duration-300 hover:bg-blue-500 hover:text-white dark:bg-white/5 dark:hover:bg-blue-500 dark:hover:text-white md:gap-4 md:rounded-[20px] md:p-4"
              >
                <Image
                  src={data.icon}
                  alt={data.text}
                  width={100}
                  height={100}
                  className="w-14"
                />
                <span className="text-xs font-normal sm:text-sm lg:text-base">
                  {data.text}
                </span>
              </div>
            ))}
          </div> */}
        </div>
      </div>
    </AnimatedSection>
  );
}
