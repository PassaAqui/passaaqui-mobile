import { z } from "zod";

export const editShopkeeperProfileSchema = z.object({
  companyName: z.string().trim().min(3, "O nome da loja deve ter pelo menos 3 caracteres.").max(50, "O nome da loja deve ter no máximo 50 caracteres."),
});

export type EditShopkeeperProfileFormValues = z.infer<typeof editShopkeeperProfileSchema>;

export type EditShopkeeperProfileFormErrors = Partial<Record<"companyName", string>>;
