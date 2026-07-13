import React from "react";
import useMediaQuery from "../../../shared/hooks/useMediaQuery";

const FeedProjectCardSkeleton = ({ className = "" }) => {
  const isDesktop = useMediaQuery("(min-width: 768px)");

  return (
    <article
      className={`flex flex-col min-h-fit justify-around grow w-full h-[calc(90%-2.5rem)] md:h-[calc(85%-2.5rem)] animate-pulse ${className}`}
    >
      <div className="relative flex flex-col bg-card/50 mx-auto border md:rounded-xl border-card-content/10 w-full grow">
        <div className="relative w-fit max-w-7/10 flex p-2 px-3 gap-2 items-center">
          <div className="rounded-full h-10 w-10 shrink-0 bg-gray-300 dark:bg-gray-400" />
          <div className="h-fit flex flex-col w-32 gap-2">
            <div className="h-4 bg-gray-300 dark:bg-gray-400 rounded w-3/4" />
            <div className="h-3 bg-gray-300 dark:bg-gray-400 rounded w-full" />
          </div>
        </div>

        <header className="px-2 pb-2 space-y-2">
          <div className="flex justify-between items-center w-full">
            <div className="h-5 bg-gray-300 dark:bg-gray-400 rounded w-1/3 ml-2" />
            <div className="h-6 bg-gray-300 dark:bg-gray-400 rounded-md md:rounded-xl w-16" />
          </div>

          <div className="space-y-1.5 ml-2">
            <div className="h-4 bg-gray-300 dark:bg-gray-400 rounded w-11/12" />
            <div className="h-4 bg-gray-300 dark:bg-gray-400 rounded w-3/4" />
          </div>
        </header>

        <div className="w-full aspect-video bg-gray-200 dark:bg-gray-400 p-1" />

        <section className="flex flex-col w-full grow p-2">
          <div className="border-b-2 border-gray-400/10 px-2 pb-2 mt-1">
            <div className="h-4 bg-gray-300 dark:bg-gray-400 rounded w-20 mb-3" />
            <div className="flex flex-wrap gap-2 mt-3 pb-2">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="h-6 w-16 bg-gray-300 dark:bg-gray-400 rounded-full"
                />
              ))}
            </div>
          </div>

          <footer className="flex w-full px-2 md:px-4 gap-6 mt-3 pb-1 items-center">
            <div className="h-6 w-10 bg-gray-300 dark:bg-gray-400 rounded" />
            <div className="h-6 w-10 bg-gray-300 dark:bg-gray-400 rounded" />
            <div className="h-6 w-16 bg-gray-300 dark:bg-gray-400 rounded ml-auto" />
            <div className="h-6 w-20 bg-gray-300 dark:bg-gray-400 rounded" />
          </footer>
        </section>
      </div>
    </article>
  );
};

export default FeedProjectCardSkeleton;
