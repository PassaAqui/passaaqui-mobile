import { useState } from "react";

export function useRedemptionCheck() {
  const [hasRedeemed, setRedeemed] = useState<boolean>(false);

  return { hasRedeemed, setRedeemed };
}