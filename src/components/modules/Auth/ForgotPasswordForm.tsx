"use client";
import { forgotPasswordAction } from "@/app/(commonLayout)/(authRouteGroup)/forgot-password/_action";
import AppField from "@/components/shared/form/AppField";
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
import { emailOnlyZodSchema } from "@/zod/auth.validation";
import { useForm } from "@tanstack/react-form";
import Link from "next/link";
import { useState } from "react";

const ForgotPasswordForm = () => {
  const [serverError, setServerError] = useState<string | null>(null);
  const form = useForm({
    defaultValues: { email: "" },
    onSubmit: async ({ value }) => {
      setServerError(null);
      const result = await forgotPasswordAction(value.email);
      // on success the action redirects to /reset-password
      if (result && !result.success) setServerError(result.message);
    },
  });

  return (
    <Card className="w-full max-w-md mx-auto shadow-md">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold">Forgot password</CardTitle>
        <CardDescription>
          Enter your email and we will send you a code to reset your password.
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
          <form.Field name="email" validators={{ onChange: emailOnlyZodSchema.shape.email }}>
            {(field) => (
              <AppField field={field} label="Email" type="email" placeholder="you@example.com" />
            )}
          </form.Field>
          {serverError && (
            <Alert variant="destructive">
              <AlertDescription>{serverError}</AlertDescription>
            </Alert>
          )}
          <form.Subscribe selector={(s) => [s.canSubmit, s.isSubmitting] as const}>
            {([canSubmit, isSubmitting]) => (
              <AppSubmitButton isPending={isSubmitting} disabled={!canSubmit} pendingLabel="Sending...">
                Send reset code
              </AppSubmitButton>
            )}
          </form.Subscribe>
        </form>
      </CardContent>
      <CardFooter className="justify-center border-t pt-4">
        <Link href="/login" className="text-sm text-primary hover:underline underline-offset-4">
          Back to login
        </Link>
      </CardFooter>
    </Card>
  );
};

export default ForgotPasswordForm;
