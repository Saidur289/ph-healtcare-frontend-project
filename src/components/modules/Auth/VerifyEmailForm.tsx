"use client";
import {
  resendVerificationOtpAction,
  verifyEmailAction,
} from "@/app/(commonLayout)/(authRouteGroup)/verify-email/_action";
import AppField from "@/components/shared/form/AppField";
import AppSubmitButton from "@/components/shared/form/AppSubmitButton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
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
import { otpSchema, verifyEmailZodSchema } from "@/zod/auth.validation";
import { useForm } from "@tanstack/react-form";
import Link from "next/link";
import { useEffect, useState, useTransition } from "react";

const RESEND_COOLDOWN_SECONDS = 60;

const VerifyEmailForm = ({
  email: initialEmail,
  codeSent,
}: {
  email?: string;
  codeSent?: boolean;
}) => {
  const [serverError, setServerError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(
    codeSent ? "We sent a 6-digit code to your email. It is valid for 10 minutes." : null,
  );
  const [cooldown, setCooldown] = useState(codeSent ? RESEND_COOLDOWN_SECONDS : 0);
  const [isResending, startResend] = useTransition();

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown((value) => value - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  const form = useForm({
    defaultValues: { email: initialEmail ?? "", otp: "" },
    onSubmit: async ({ value }) => {
      setServerError(null);
      const result = await verifyEmailAction(value);
      // on success the action redirects to /login
      if (result && !result.success) setServerError(result.message);
    },
  });

  const handleResend = () => {
    setServerError(null);
    startResend(async () => {
      const result = await resendVerificationOtpAction(form.getFieldValue("email"));
      if (result.success) {
        setNotice(result.message);
        setCooldown(RESEND_COOLDOWN_SECONDS);
      } else {
        setServerError(result.message);
      }
    });
  };

  return (
    <Card className="w-full max-w-md mx-auto shadow-md">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold">Verify your email</CardTitle>
        <CardDescription>Enter the 6-digit code we emailed you.</CardDescription>
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
            name="email"
            validators={{ onChange: verifyEmailZodSchema.shape.email }}
          >
            {(field) => (
              <AppField field={field} label="Email" type="email" placeholder="you@example.com" />
            )}
          </form.Field>
          <form.Field name="otp" validators={{ onChange: otpSchema }}>
            {(field) => (
              <div className="space-y-1.5">
                <Label htmlFor="otp">Verification code</Label>
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
          {notice && !serverError && (
            <Alert>
              <AlertDescription>{notice}</AlertDescription>
            </Alert>
          )}
          {serverError && (
            <Alert variant="destructive">
              <AlertDescription>{serverError}</AlertDescription>
            </Alert>
          )}
          <form.Subscribe selector={(s) => [s.canSubmit, s.isSubmitting] as const}>
            {([canSubmit, isSubmitting]) => (
              <AppSubmitButton isPending={isSubmitting} disabled={!canSubmit} pendingLabel="Verifying...">
                Verify email
              </AppSubmitButton>
            )}
          </form.Subscribe>
        </form>
        <Button
          type="button"
          variant="link"
          className="mt-3 w-full"
          disabled={cooldown > 0 || isResending}
          onClick={handleResend}
        >
          {cooldown > 0 ? `Resend code in ${cooldown}s` : isResending ? "Sending..." : "Resend code"}
        </Button>
      </CardContent>
      <CardFooter className="justify-center border-t pt-4">
        <Link href="/login" className="text-sm text-primary hover:underline underline-offset-4">
          Back to login
        </Link>
      </CardFooter>
    </Card>
  );
};

export default VerifyEmailForm;
