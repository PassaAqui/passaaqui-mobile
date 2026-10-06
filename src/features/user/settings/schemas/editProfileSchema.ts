import { z } from "zod";

export const editProfileSchema = z.object({
  name: z.string().trim().min(3, "O nome deve ter pelo menos 3 caracteres.").max(50, "O nome deve ter no máximo 50 caracteres."),
});

export type EditProfileFormValues = z.infer<typeof editProfileSchema>;

export type EditProfileFormErrors = Partial<Record<"name", string>>;
