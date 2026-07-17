import React from "react";

export default function Spinner({
  colorClass = "border-blue-600",
  sizeClass = "h-8 w-8",
}) {
  return (
    <div role="status" className="flex items-center justify-center">
      <span
        className={`animate-spin inline-block rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite] ${sizeClass} ${colorClass}`}
      />
      <span className="sr-only">Loading...</span>
    </div>
  );
}
