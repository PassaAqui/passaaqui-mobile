import { z } from "zod";

export const createProductSchema = z.object({
  name: z.string().trim().min(1, "Nome é obrigatório"),
  category: z.object({
    id: z.number(),
    name: z.string(),
  }, { error: "Categoria é obrigatória" }),
  description: z.string().optional(),
  price: z.number().min(0.01, "Preço deve ser maior que zero"),
  quantity: z.number().min(1, "Quantidade deve ser maior que zero"),
  images: z.array(z.object({ uri: z.string(), name: z.string() })).min(1, "Adicione ao menos uma foto"),
});

export type CreateProductFormValues = z.infer<typeof createProductSchema>;

export interface CreateProductFormErrors {
  name?: string;
  category?: string;
  description?: string;
  price?: string;
  quantity?: string;
  images?: string;
}