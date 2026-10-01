"use client";
import AppField from "@/components/shared/form/AppField";
import { Button } from "@/components/ui/button";
import { AnyFieldApi } from "@tanstack/react-form";
import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";

// AppField + show/hide button (type="button" so it never submits the form)
const AppPasswordField = ({
  field,
  label,
  placeholder,
}: {
  field: AnyFieldApi;
  label: string;
  placeholder?: string;
}) => {
  const [visible, setVisible] = useState(false);
  return (
    <AppField
      field={field}
      label={label}
      type={visible ? "text" : "password"}
      placeholder={placeholder}
      append={
        <Button
          type="button"
          aria-label={visible ? "Hide password" : "Show password"}
          onClick={() => setVisible((value) => !value)}
          size="icon"
          variant="ghost"
          className="cursor-pointer"
        >
          {visible ? (
            <EyeOff className="size-4" aria-hidden="true" />
          ) : (
            <Eye className="size-4" aria-hidden="true" />
          )}
        </Button>
      }
    />
  );
};

export default AppPasswordField;
