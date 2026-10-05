import { getTouristAvatarUrl } from "@/src/features/user/settings/utils/touristAvatar";
import {
  AVATAR_URL,
  UPDATED_AVATAR_URL,
} from "@/src/features/user/settings/__tests__/fixtures/profile";

describe("getTouristAvatarUrl", () => {
  it("prioriza imageUrl sobre image", () => {
    // Act
    const result = getTouristAvatarUrl({
      image: "http://localhost:9000/antiga.jpg",
      imageUrl: UPDATED_AVATAR_URL,
    });

    // Assert
    expect(result).toBe(UPDATED_AVATAR_URL);
  });

  it("usa image quando imageUrl é null", () => {
    // Act
    const result = getTouristAvatarUrl({ image: AVATAR_URL, imageUrl: null });

    // Assert
    expect(result).toBe(AVATAR_URL);
  });

  it("devolve null quando o turista não tem foto", () => {
    // Act
    const result = getTouristAvatarUrl({ image: null, imageUrl: null });

    // Assert
    expect(result).toBeNull();
  });

  it("devolve null quando o perfil ainda não carregou", () => {
    expect(getTouristAvatarUrl(undefined)).toBeNull();
    expect(getTouristAvatarUrl(null)).toBeNull();
  });
});
