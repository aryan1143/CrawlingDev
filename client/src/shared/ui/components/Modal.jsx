import { createPortal } from "react-dom";

const Modal = ({ isOpen, onClose, title, children, className = "" }) => {
  if (!isOpen) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div
        className={`w-full max-w-md rounded-xl bg-card shadow-xl ${className}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b px-5 py-4">
          <h2 className="text-lg font-semibold">{title}</h2>

          <button
            onClick={onClose}
            className="rounded-md p-1 text-gray-500 transition hover:bg-gray-100"
          >
            ✕
          </button>
        </div>

        <div className="p-5">{children}</div>
      </div>
    </div>,
    document.body,
  );
};

export default Modal;
