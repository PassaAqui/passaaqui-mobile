import { Stack } from "expo-router";
import { TouristTutorialProvider } from "@/src/features/user/tutorial/TutorialContext";
import TutorialOverlay from "@/src/features/user/tutorial/TutorialOverlay";

export default function UserPrivateLayout() {
  return (
    <TouristTutorialProvider>
      <Stack screenOptions={{ headerShown: false }} />
      <TutorialOverlay />
    </TouristTutorialProvider>
  );
}
