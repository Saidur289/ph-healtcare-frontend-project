import { z } from "zod";
export const loginZodSchema = z.object({
  email: z.email("Invalid email"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters long")
    .min(1, "Password is required"),
});
export type ILoginPayload = z.infer<typeof loginZodSchema>;
