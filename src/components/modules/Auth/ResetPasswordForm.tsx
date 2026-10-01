"use client";
import { resetPasswordAction } from "@/app/(commonLayout)/(authRouteGroup)/reset-password/_action";
import AppField from "@/components/shared/form/AppField";
import AppPasswordField from "@/components/shared/form/AppPasswordField";
import AppSubmitButton from "@/components/shared/form/AppSubmitButton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Label } from "@/components/ui/label";
import { otpSchema, passwordSchema, resetPasswordZodSchema } from "@/zod/auth.validation";
import { useForm } from "@tanstack/react-form";
import Link from "next/link";
import { useState } from "react";

const ResetPasswordForm = ({ email }: { email?: string }) => {
  const [serverError, setServerError] = useState<string | null>(null);
  const form = useForm({
    defaultValues: { email: email ?? "", otp: "", newPassword: "", confirmPassword: "" },
    validators: { onSubmit: resetPasswordZodSchema },
    onSubmit: async ({ value }) => {
      setServerError(null);
      const result = await resetPasswordAction(value);
      // on success the action redirects to /login
      if (result && !result.success) setServerError(result.message);
    },
  });

  return (
    <Card className="w-full max-w-md mx-auto shadow-md">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold">Reset password</CardTitle>
        <CardDescription>
          If an account exists for this email, we sent a 6-digit code to it.
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
          <form.Field name="email" validators={{ onChange: resetPasswordZodSchema.shape.email }}>
            {(field) => (
              <AppField field={field} label="Email" type="email" placeholder="you@example.com" />
            )}
          </form.Field>
          <form.Field name="otp" validators={{ onChange: otpSchema }}>
            {(field) => (
              <div className="space-y-1.5">
                <Label htmlFor="otp">Reset code</Label>
                <InputOTP
                  id="otp"
                  maxLength={6}
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  value={field.state.value}
                  onChange={(value) => field.handleChange(value.replace(/\D/g, ""))}
                  onBlur={field.handleBlur}
                >
                  <InputOTPGroup>
                    {[0, 1, 2, 3, 4, 5].map((slot) => (
                      <InputOTPSlot key={slot} index={slot} />
                    ))}
                  </InputOTPGroup>
                </InputOTP>
              </div>
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
                Reset password
              </AppSubmitButton>
            )}
          </form.Subscribe>
        </form>
      </CardContent>
      <CardFooter className="justify-between border-t pt-4 text-sm">
        <Link href="/forgot-password" className="text-primary hover:underline underline-offset-4">
          Send a new code
        </Link>
        <Link href="/login" className="text-primary hover:underline underline-offset-4">
          Back to login
        </Link>
      </CardFooter>
    </Card>
  );
};

export default ResetPasswordForm;
