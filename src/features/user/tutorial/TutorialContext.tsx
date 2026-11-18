import AsyncStorage from "@react-native-async-storage/async-storage";
import { usePathname } from "expo-router";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { TOURIST_TUTORIAL_KEY, touristTutorialSteps } from "./tutorialConfig";

interface TutorialContextValue {
  active: boolean;
  stepIndex: number;
  start: () => void;
  next: () => void;
  completeStep: (id: (typeof touristTutorialSteps)[number]["id"]) => void;
  skip: () => void;
  reopen: () => void;
  registerFirstProduct: (id: number | null) => void;
}

const TutorialContext = createContext<TutorialContextValue | null>(null);

export function TouristTutorialProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [active, setActive] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);

  const finish = useCallback(async () => {
    setActive(false);
    await AsyncStorage.setItem(TOURIST_TUTORIAL_KEY, "seen");
  }, []);

  const start = useCallback(() => {
    setStepIndex(0);
    setActive(true);
  }, []);

  const skip = useCallback(() => { void finish(); }, [finish]);

  const next = useCallback(() => {
    const step = touristTutorialSteps[stepIndex];
    if (step.id === "welcome" || step.id === "product") {
      if (stepIndex >= touristTutorialSteps.length - 1) void finish();
      else setStepIndex((current) => current + 1);
    }
  }, [finish, stepIndex]);

  const completeStep = useCallback((id: (typeof touristTutorialSteps)[number]["id"]) => {
    if (!active) return;
    if (id === "route") {
      setTimeout(() => setStepIndex(4), 80);
      return;
    }
    const actionIndex = touristTutorialSteps.findIndex((step) => step.id === id);
    if (actionIndex < 0 || actionIndex < stepIndex) return;
    setTimeout(() => {
      if (id === "product") void finish();
      else setStepIndex(actionIndex + 1);
    }, 80);
  }, [active, finish, stepIndex]);

  useEffect(() => {
    if (!active || pathname.includes("/product")) return;
    if (touristTutorialSteps[stepIndex]?.id === "product" && pathname.includes("/shop")) {
      return;
    }
  }, [active, pathname, stepIndex]);

  const value = useMemo(() => ({
    active, stepIndex, start, next, completeStep, skip, reopen: start,
    registerFirstProduct: () => undefined,
  }), [active, completeStep, next, skip, start, stepIndex]);

  return <TutorialContext.Provider value={value}>{children}</TutorialContext.Provider>;
}

export function useTouristTutorial() {
  const context = useContext(TutorialContext);
  if (context) return context;

  return {
    active: false,
    stepIndex: 0,
    start: () => undefined,
    next: () => undefined,
    completeStep: () => undefined,
    skip: () => undefined,
    reopen: () => undefined,
    registerFirstProduct: () => undefined,
  };
}
