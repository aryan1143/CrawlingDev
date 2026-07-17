import React from "react";

const ReviewCardSkeleton = () => {
  return (
    <div className="w-full flex flex-col animate-pulse">
      <div className="w-full flex">
        <div className="relative w-fit max-w-7/10 flex p-2 gap-2 items-center">
          <span className="rounded-full h-8 w-8 shrink-0 bg-slate-200 dark:bg-zinc-700" />

          <div className="h-fit flex flex-col w-7/10 gap-1.5">
            <div className="h-3.5 w-24 bg-slate-200 dark:bg-zinc-700 rounded" />
            <div className="h-3 w-36 bg-slate-200 dark:bg-zinc-700 rounded" />
          </div>
        </div>
      </div>

      <div className="w-full h-content px-2 pl-10 -mt-1 flex flex-col gap-1">
        <div className="h-3 w-5/6 bg-slate-200 dark:bg-zinc-700 rounded" />
        <div className="h-3 w-2/3 bg-slate-200 dark:bg-zinc-700 rounded" />
      </div>
    </div>
  );
};

export default ReviewCardSkeleton;
