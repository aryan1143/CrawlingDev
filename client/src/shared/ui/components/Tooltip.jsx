import React, { useState } from "react";

export default function Tooltip({ text, children, trigger = "hover" }) {
  const [isVisible, setIsVisible] = useState(false);

  const showTooltip = () => trigger === "hover" && setIsVisible(true);
  const hideTooltip = () => trigger === "hover" && setIsVisible(false);
  const toggleTooltip = () => trigger === "click" && setIsVisible(!isVisible);

  return (
    <div
      className="relative"
      onMouseEnter={showTooltip}
      onMouseLeave={hideTooltip}
      onClick={toggleTooltip}
    >
      {children}
      {isVisible && (
        <div className="absolute bottom-1/2 left-full bg-card border border-gray-400 p-2 py-1 rounded-xl whitespace-nowrap">
          {text}
        </div>
      )}
    </div>
  );
}
