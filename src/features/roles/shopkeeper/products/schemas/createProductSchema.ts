import { z } from "zod";

export const createProductSchema = z.object({
  name: z.string().trim().min(1, "Informe o nome do produto"),
  category: z.string().min(1, "Selecione uma categoria"),
  description: z.string().optional(),
  originalPrice: z
    .number({ error: "Informe um preço válido" })
    .positive("Informe um preço válido"),
  discount: z.number().min(0).optional(),
  xpCost: z.number().min(0).optional(),
  quantity: z
    .number({ error: "Informe a quantidade em estoque" })
    .int()
    .positive("Informe a quantidade em estoque"),
  images: z
    .array(z.object({ uri: z.string(), name: z.string() }))
    .min(1, "Adicione ao menos uma foto do produto"),
});

export type CreateProductFormData = z.infer<typeof createProductSchema>;
export type CreateProductFormErrors = Partial<Record<keyof CreateProductFormData, string>>;