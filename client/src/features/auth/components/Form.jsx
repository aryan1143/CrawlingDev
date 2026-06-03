import { CircleX, Eye, EyeOff } from "lucide-react";
import React, { useState } from "react";

export const FormCard = ({ children, className }) => {
  return (
    <div className="flex flex-col gap-2 items-center p-8 h-fit min-h-60 min-w-20 w-full max-w-[calc(8vw+300px)] lg:max-w-[calc(8vw+280px)] bg-card text-card-content shadow-lg rounded-2xl">
      <div className="flex flex-col gap-1 w-full justify-center items-center">
        <div className="flex gap-1 justify-center items-center">
          <img src="/icon-512.png" className="w-22/100 max-w-14" />
          <h1 className="font-bold text-2xl">CrawlingDev</h1>
        </div>
        <h3 className="text-card-content/60 text-sm">
          Join the Developer Community
        </h3>
        <form
          className="w-full mt-4 flex flex-col gap-2 lg:gap-4"
          onSubmit={(e) => e.preventDefault()}
        >
          {children}
        </form>
      </div>
    </div>
  );
};

export const Input = ({
  type,
  id,
  label,
  placeholder,
  className,
  lableIcon,
  autocomplete,
  validationRegex,
  validationMessage,
  onChange,
  value,
  handleValidation,
  name,
}) => {
  const [isValid, setIsValid] = useState(true);
  const [showPassword, setShowPassword] = useState(false);

  const validate = (e) => {
    if (validationRegex?.test(e.target.value.trim())) {
      setIsValid(true);
      if (handleValidation) handleValidation(name, true);
    } else {
      setIsValid(false);
      if (handleValidation) handleValidation(name, false);
    }
  };

  return (
    <div className="w-full">
      <label className="text-sm p-1 flex items-center gap-1" htmlFor={id}>
        <p className="font-semibold">{label}</p>
        {!isValid && (
          <span className="text-error flex items-center gap-1">
            <CircleX size={12} />
            <p>{validationMessage || "Invalid input"}</p>
          </span>
        )}
        {}
      </label>
      <div
        className={`p-1 px-2 flex gap-1 bg-card-content/5 focus-within:outline-2 rounded-md shadow-xsm ${!isValid && "outline-1 outline-error"} ${className}`}
      >
        <span className="flex justify-center items-center text-card-content/60">
          {lableIcon}
        </span>
        <input
          type={type === "password" && showPassword ? "text" : type || "text"}
          id={id || "input"}
          placeholder={placeholder}
          className="focus:outline-0 py-1.5 lg:py-0 w-full"
          autoComplete={autocomplete || "on"}
          onChange={(e) => {
            validate(e);
            onChange(e);
          }}
          required
          value={value}
        />
        {type === "password" && (
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="flex justify-center items-center text-card-content/60 hover:text-card-content"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}
      </div>
    </div>
  );
};

export const Button = ({ children, className, onClick, type, disabled }) => {
  return (
    <button
      onClick={onClick}
      type={type || "button"}
      disabled={disabled}
      className={`w-full bg-btn-primary hover:bg-btn-primary-hover text-btn-primary-text rounded-md p-3 lg:p-1 cursor-pointer mt-4 ${className}`}
    >
      {children}
    </button>
  );
};
