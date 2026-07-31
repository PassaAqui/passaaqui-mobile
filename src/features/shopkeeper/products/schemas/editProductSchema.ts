import { z } from "zod";

export const editProductSchema = z.object({
  name: z.string().trim().min(1, "Informe o nome do produto"),
  category: z.object({ id: z.number(), name: z.string() }).nullable().refine((v) => v !== null, {
    message: "Selecione uma categoria",
  }),
  description: z.string().optional(),
  price: z.number().min(0.01, "Informe um preço válido"),
  quantity: z.number().min(0, "Quantidade não pode ser negativa"),
});

export type EditProductFormErrors = Partial<Record<"name" | "category" | "price" | "quantity", string>>;