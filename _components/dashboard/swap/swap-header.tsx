"use client";

interface SwapHeaderProps {
  title: string;
  description: string;
}

export function SwapHeader({ title, description }: SwapHeaderProps) {
  return (
    <div className="text-center mb-8">
      <div className="flex items-center justify-center mb-2">
        <h1 className="text-3xl md:text-4xl text-black dark:text-white font-bold">
          {title}
        </h1>
      </div>
      <p className="text-gray-400 text-sm md:text-base">{description}</p>
    </div>
  );
}
