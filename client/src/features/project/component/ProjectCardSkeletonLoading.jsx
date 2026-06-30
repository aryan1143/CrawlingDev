import React from "react";

const ProjectCardSkeletonLoading = ({
  className = "",
  buttons = false,
  isSmall = false,
}) => {
  return (
    <article
      className={`flex flex-col max h-full justify-around grow w-full ${
        isSmall ? "" : "h-[calc(90%-2.5rem)] md:h-[calc(85%-2.5rem)]"
      } ${className} animate-pulse`}
    >
      <div
        className={`relative flex flex-col bg-card mx-auto md:mt-4 rounded-xl md:border border-card-content/20 
          ${
            isSmall
              ? "overflow-hidden w-full h-fit border border-card-content/30"
              : "w-full md:w-9/10 grow"
          }`}
      >
        {/* Image Skeleton */}
        <div className="w-full aspect-video bg-card-content/10 rounded-t-xl" />

        <section className="flex flex-col w-full grow p-2">
          {/* Header Skeleton */}
          <header
            className={`border-b-2 border-gray-400/30 px-2 mt-2 ${
              isSmall ? "pb-2" : "pb-4"
            }`}
          >
            <div className="flex justify-between items-center w-full">
              {/* Category Badge Skeleton */}
              <div
                className={`rounded-xl bg-card-content/10 ${
                  isSmall ? "w-16 h-6" : "w-24 h-7"
                }`}
              />
              {/* Ellipsis Skeleton */}
              <div
                className={`rounded-full bg-card-content/10 ${
                  isSmall ? "w-4 h-4" : "w-5 h-5"
                }`}
              />
            </div>

            {/* Title Skeleton */}
            <div
              className={`bg-card-content/20 rounded-md max-w-9/10 ml-2 ${
                isSmall ? "h-6 mt-2 w-3/4" : "h-8 mt-4 w-2/3"
              }`}
            />

            {/* Description Skeleton (2 lines) */}
            <div
              className={`ml-2 flex flex-col gap-2 ${isSmall ? "mt-2" : "mt-4"}`}
            >
              <div className="bg-card-content/10 rounded-md h-3 w-full" />
              {!isSmall && (
                <div className="bg-card-content/10 rounded-md h-3 w-5/6" />
              )}
            </div>
          </header>

          {/* Tech Stacks Skeleton */}
          <div
            className={`border-b-2 border-gray-400/30 px-2 ${
              isSmall ? "pb-0 mt-2" : "pb-4 mt-3"
            }`}
          >
            <div className="flex justify-between items-center">
              <div
                className={`bg-card-content/20 rounded-md ${
                  isSmall ? "w-20 h-3" : "w-24 h-4"
                }`}
              />
              <div
                className={`bg-card-content/10 rounded-md ${
                  isSmall ? "w-10 h-2" : "w-12 h-3"
                }`}
              />
            </div>
            <div
              className={`flex flex-wrap ${
                isSmall ? "gap-1 mt-2 pb-2" : "gap-2 mt-4 pb-2"
              }`}
            >
              {/* Pill Skeletons */}
              <div className="bg-card-content/10 rounded-full w-16 h-6" />
              <div className="bg-card-content/10 rounded-full w-20 h-6" />
            </div>
          </div>

          {/* Footer Skeleton */}
          <footer
            className={`flex w-full items-center px-2 md:px-4 gap-4 ${
              isSmall ? "pb-1 mt-2" : "pb-4 mt-5"
            }`}
          >
            {/* GitHub / Live Links Skeleton */}
            <div
              className={`bg-card-content/10 rounded-md ${isSmall ? "w-5 h-5" : "w-20 h-6"}`}
            />
            <div
              className={`bg-card-content/10 rounded-md ${isSmall ? "w-5 h-5" : "w-24 h-6"}`}
            />

            {/* Date Skeleton */}
            <div
              className={`bg-card-content/10 rounded-md ml-auto ${
                isSmall ? "w-16 h-3" : "w-24 h-4"
              }`}
            />
          </footer>
        </section>
      </div>

      {/* Action Buttons Skeleton */}
      {buttons && (
        <nav className="w-full h-fit py-2 flex gap-2 justify-between items-center px-2 md:px-6">
          <div className="w-full h-11 bg-card-content/20 rounded-md" />
          <div className="w-full h-11 bg-card-content/20 rounded-md" />
        </nav>
      )}
    </article>
  );
};

export default ProjectCardSkeletonLoading;
