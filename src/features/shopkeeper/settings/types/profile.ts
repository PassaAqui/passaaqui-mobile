export interface UpdateShopkeeperProfilePayload {
  name?: string;
  documentId?: string;
  companyName?: string;
  description?: string;
  categoryId?: number;
  theme?: "LIGHT" | "DARK";
  poiName?: string;
  poiDescription?: string;
}
