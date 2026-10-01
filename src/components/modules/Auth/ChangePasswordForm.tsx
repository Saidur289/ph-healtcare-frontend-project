"use client";
import { changePasswordAction } from "@/app/(dashboardLayout)/(commonProtectedLayout)/change-password/_action";
import AppPasswordField from "@/components/shared/form/AppPasswordField";
import AppSubmitButton from "@/components/shared/form/AppSubmitButton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { changePasswordZodSchema, passwordSchema } from "@/zod/auth.validation";
import { useForm } from "@tanstack/react-form";
import { useState } from "react";

const ChangePasswordForm = ({ required }: { required?: boolean }) => {
  const [serverError, setServerError] = useState<string | null>(null);
  const form = useForm({
    defaultValues: { currentPassword: "", newPassword: "", confirmPassword: "" },
    validators: { onSubmit: changePasswordZodSchema },
    onSubmit: async ({ value }) => {
      setServerError(null);
      const result = await changePasswordAction(value);
      // on success the action redirects to the dashboard
      if (result && !result.success) setServerError(result.message);
    },
  });

  return (
    <Card className="w-full max-w-md shadow-sm">
      <CardHeader>
        <CardTitle className="text-xl font-semibold">Change password</CardTitle>
        <CardDescription>
          {required
            ? "Your account was created with a temporary password. Please choose your own password to continue."
            : "After changing your password, you will be logged out on all other devices."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form
          className="space-y-4"
          noValidate
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
        >
          <form.Field
            name="currentPassword"
            validators={{ onChange: ({ value }) => (value ? undefined : "Current password is required") }}
          >
            {(field) => (
              <AppPasswordField
                field={field}
                label={required ? "Temporary password" : "Current password"}
              />
            )}
          </form.Field>
          <form.Field name="newPassword" validators={{ onChange: passwordSchema }}>
            {(field) => (
              <AppPasswordField field={field} label="New password" placeholder="At least 8 characters, letters and numbers" />
            )}
          </form.Field>
          <form.Field
            name="confirmPassword"
            validators={{
              onChangeListenTo: ["newPassword"],
              onChange: ({ value, fieldApi }) =>
                value !== fieldApi.form.getFieldValue("newPassword")
                  ? "Passwords do not match"
                  : undefined,
            }}
          >
            {(field) => <AppPasswordField field={field} label="Confirm new password" />}
          </form.Field>
          {serverError && (
            <Alert variant="destructive">
              <AlertDescription>{serverError}</AlertDescription>
            </Alert>
          )}
          <form.Subscribe selector={(s) => [s.canSubmit, s.isSubmitting] as const}>
            {([canSubmit, isSubmitting]) => (
              <AppSubmitButton isPending={isSubmitting} disabled={!canSubmit} pendingLabel="Saving...">
                Change password
              </AppSubmitButton>
            )}
          </form.Subscribe>
        </form>
      </CardContent>
    </Card>
  );
};

export default ChangePasswordForm;
