import { getCurrentPositionAsync, LocationAccuracy } from "expo-location";

export async function waitForLocation(
  maxRetries: number = 5,
  delayMs: number = 1000
): Promise<boolean> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      await getCurrentPositionAsync({ accuracy: LocationAccuracy.Balanced });
      return true;
    } catch {
      console.log(`[waitForLocation WARN] Falhou na tentativa ${attempt}. Tentando novamente...`);
      if (attempt <= maxRetries) {
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      }
    }
  }

  return false;
}
