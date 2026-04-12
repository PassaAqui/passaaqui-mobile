import { z } from "zod";

const cpfRegex = /^\d{3}\.\d{3}\.\d{3}-\d{2}$/;

export const signUpSchema = z.object({
  name: z.string().min(1, "Preencha o campo com seu nome"),

  email: z
    .string()
    .min(1, "Preencha o campo com seu email")
    .email("Email inválido"),

  cpf: z
    .string()
    .min(1, "Preencha o campo com seu CPF")
    .regex(cpfRegex, "CPF inválido"),

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

export type SignUpData = z.infer<typeof signUpSchema>;