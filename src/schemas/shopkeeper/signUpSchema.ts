import { z } from "zod";

const cpfRegex = /^\d{3}\.\d{3}\.\d{3}-\d{2}$/;
const cnpjRegex = /^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/;

export const shopkeeperSignUpSchema = z.object({
  storeName: z
    .string()
    .min(1, "Preencha o campo com o nome do estabelecimento"),

  ownerName: z
    .string()
    .min(1, "Preencha o campo com o nome do proprietário"),

  email: z
    .string()
    .min(1, "Preencha o campo com seu email")
    .email("Email inválido"),

  cpfOrCnpj: z
    .string()
    .min(1, "Preencha o campo com seu CPF ou CNPJ")
    .refine(
      (val) => cpfRegex.test(val) || cnpjRegex.test(val),
      "CPF ou CNPJ inválido"
    ),

  password: z
    .string()
    .min(1, "Preencha o campo com sua senha")
    .min(8, "A senha deve ter pelo menos 8 caracteres")
    .regex(/[0-9]/, "A senha deve conter pelo menos um número")
    .regex(/[^a-zA-Z0-9]/, "A senha deve conter pelo menos um caractere especial"),

  confirmPassword: z.string().min(1, "Preencha o campo repetindo sua senha"),

  terms: z.literal(true, "Você precisa aceitar os Termos de Uso e a Política de Privacidade."),

}).refine(
  (data) => data.password === data.confirmPassword,
  {
    message: "As senhas precisam ser iguais",
    path: ["confirmPassword"],
  }
);

export type ShopkeeperSignUpData = z.infer<typeof shopkeeperSignUpSchema>;