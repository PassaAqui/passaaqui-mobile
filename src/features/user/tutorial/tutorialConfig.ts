export type TutorialStepId =
  | "welcome"
  | "poi"
  | "destination"
  | "route"
  | "simulation"
  | "progress"
  | "reward"
  | "shop"
  | "productList"
  | "product";

export interface TutorialStep {
  id: TutorialStepId;
  title: string;
  description: string;
  cta: string;
}

export const TOURIST_TUTORIAL_KEY = "tutorial_turista_v1";

export const touristTutorialSteps: TutorialStep[] = [
  {
    id: "welcome",
    title: "Explore o mapa",
    description: "Arraste o mapa, observe os marcadores e descubra o que existe ao seu redor.",
    cta: "Entendi, explorar",
  },
  {
    id: "poi",
    title: "Encontre um POI",
    description: "Toque em um marcador do mapa para conhecer um lugar e ver sua recompensa.",
    cta: "Próximo",
  },
  {
    id: "destination",
    title: "Escolha seu destino",
    description: "No cartão do lugar, confira a recompensa e toque em “Ir agora”.",
    cta: "Próximo",
  },
  {
    id: "route",
    title: "Escolha como chegar",
    description: "Selecione a pé, carro ou bicicleta para traçar sua rota.",
    cta: "Próximo",
  },
  {
    id: "simulation",
    title: "Simule sua rota",
    description: "Toque no botão destacado “Simular rota” para acompanhar a chegada no mapa.",
    cta: "Próximo",
  },
  {
    id: "progress",
    title: "Acompanhe o trajeto",
    description: "Siga a rota no mapa. Ao chegar, você receberá XP como recompensa pelo deslocamento.",
    cta: "Aguardando chegada",
  },
  {
    id: "reward",
    title: "Você ganhou XP",
    description: "Confira sua recompensa e toque no botão destacado para continuar.",
    cta: "Ver recompensa",
  },
  {
    id: "shop",
    title: "Troque XP por descontos",
    description: "Na Loja, seu saldo mostra quanto você já pode economizar.",
    cta: "Ver a Loja",
  },
  {
    id: "productList",
    title: "Escolha um produto",
    description: "Toque em um produto da Loja para ver seus detalhes e as condições do desconto.",
    cta: "Aguardando produto",
  },
  {
    id: "product",
    title: "Confira cada detalhe",
    description: "Veja o desconto, o progresso em XP e as condições antes de resgatar.",
    cta: "Concluir",
  },
];
