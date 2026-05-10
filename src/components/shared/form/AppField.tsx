import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { AnyFieldApi } from "@tanstack/react-form";
const getErrorMessage = (error: unknown): string => {
  if (typeof error === "string") return error;
  if (error && typeof error === "object") {
    if ("message" in error && typeof error.message === "string") {
      return error.message;
    }
  }
  return String(error);
};
type AppFieldProps = {
  field: AnyFieldApi;
  label: string;
  type?: "text" | "email" | "password" | "number";
  placeholder?: string;
  disabled?: boolean;
  append?: React.ReactNode;
  prepend?: React.ReactNode;
  className?: string;
};
import React from "react";

const AppField = ({
  field,
  label,
  type = "text",
  placeholder,
  append,
  prepend,
  className,
  disabled = false,
}: AppFieldProps) => {
  const firstError =
    field.state.meta.isTouched && field.state.meta.errors.length > 0
      ? getErrorMessage(field.state.meta.errors[0])
      : null;
  const hasError = firstError !== null;
  return (
    <div className={cn("space-y-1.5", className)}>
      <Label
        htmlFor={field.name}
        className={cn(hasError && "text-destructive")}
      >
        {label}
      </Label>
      <div className="relative">
        {prepend && (
          <div className="absolute inset-y-0 left-0 items-center pl-3  z-10">
            {prepend}
          </div>
        )}
        <Input
          id={field.name}
          type={type}
          placeholder={placeholder}
          name={field.name}
          value={field.state.value}
          onChange={(e) => field.handleChange(e.target.value)}
          disabled={disabled}
          onBlur={field.handleBlur}
          aria-invalid={hasError}
          aria-describedby={hasError ? `${field.name}-error` : undefined}
          className={cn(
            prepend && "pl10",
            append && "pr-10",
            hasError &&
              "border-destructive focus-visible:border-destructive/20",
          )}
        />
        {append && (
          <div className="absolute inset-y-0 right-0 items-center pr-3  z-10">
            {append}
          </div>
        )}
        {hasError && (
          <p
            id={`${field.name}-error`}
            role="alert"
            className=" text-sm text-destructive"
          >
            {firstError}
          </p>
        )}
      </div>
    </div>
  );
};

export default AppField;
