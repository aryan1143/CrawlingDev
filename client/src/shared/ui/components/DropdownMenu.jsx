import { useEffect, useRef, useState } from "react";

const DropdownMenu = ({ trigger, options = [], className = "" }) => {
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div ref={containerRef} className="relative inline-block">
      <button onClick={() => setOpen((prev) => !prev)}>{trigger}</button>

      {open && (
        <div
          className={`absolute right-0 top-full z-50 mt-2 min-w-40 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg ${className}`}
        >
          {options.map((option, index) => (
            <button
              key={index}
              onClick={() => {
                option.onClick?.();
                setOpen(false);
              }}
              className={`flex w-full items-center gap-2 px-4 py-2 text-left text-sm transition hover:bg-gray-100 ${
                option.danger ? "text-red-600" : "text-gray-700"
              }`}
            >
              {option.icon}
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default DropdownMenu;
