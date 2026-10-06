import { z } from "zod";

const documentRegex = /^\d{3}\.\d{3}\.\d{3}-\d{2}$|^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/;

export const shopkeeperSignUpSchema = z.object({
  companyName: z.string().min(1, "Preencha o nome do estabelecimento"),

  ownerName: z.string().min(1, "Preencha o nome do proprietário"),

  email: z
    .string()
    .min(1, "Preencha o campo com seu email")
    .email("Email inválido"),

  documentId: z
    .string()
    .min(1, "Preencha o campo com seu CPF ou CNPJ")
    .regex(documentRegex, "CPF ou CNPJ inválido"),

  password: z
    .string()
    .min(1, "Preencha o campo com sua senha")
    .min(8, "A senha deve ter pelo menos 8 caracteres")
    .max(16, "A senha deve ter no máximo 16 caracteres")
    .regex(/[0-9]/, "A senha deve conter pelo menos um número")
    .regex(/[^a-zA-Z0-9]/, "A senha deve conter pelo menos um caractere especial"),

  confirmPassword: z.string().min(1, "Preencha o campo repetindo sua senha"),

  category: z.string().min(1, "Selecione uma categoria"),

  cityId: z.number().default(1),

  neighborhood: z.string().min(1, "Preencha o bairro"),

  street: z.string().min(1, "Preencha a rua"),

  description: z.string().min(1, "Preencha a descrição do estabelecimento"),

  poiDescription: z.string().optional(),

  image: z
    .string({ error: "Adicione uma foto do estabelecimento" })
    .min(1, "Adicione uma foto do estabelecimento"),

  location: z.object(
    {
      latitude: z.number(),
      longitude: z.number(),
    },
    { error: "Marque a localização da loja no mapa" }
  ),

  terms: z.literal(true, {
    error: () => ({ message: "Você precisa aceitar os Termos de Uso e a Política de Privacidade." }),
  }),
})
.refine((data) => data.password === data.confirmPassword, {
  message: "As senhas precisam ser iguais",
  path: ["confirmPassword"],
});

export type ShopkeeperSignUpData = z.infer<typeof shopkeeperSignUpSchema>;