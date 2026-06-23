import React from "react";

const Page = ({ children, className }) => {
  return (
    <div className="bg-background w-full h-full flex justify-center page">
      <main
        className={`p-4 lg:p-8 h-full w-full max-w-[calc(50vw+360px)] ${className}`}
      >
        {children}
      </main>
    </div>
  );
};

export default Page;
