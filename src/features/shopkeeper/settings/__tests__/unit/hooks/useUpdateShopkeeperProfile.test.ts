import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react-native";
import React from "react";
import { useUpdateShopkeeperProfile } from "@/src/features/shopkeeper/settings/hooks/useUpdateShopkeeperProfile";
import * as profileService from "@/src/features/shopkeeper/settings/services/profileService";
import type { ReactNode } from "react";
import type { ShopkeeperMe } from "@/src/features/shopkeeper/auth/services/shopkeeperService";
import {
  createAxiosError,
  localStoreImageUri,
  shopkeeperProfile,
  updatedShopkeeperProfile,
} from "@/src/features/shopkeeper/settings/__tests__/fixtures/shopkeeperProfile";

jest.mock("@/src/features/shopkeeper/settings/services/profileService", () => ({
  updateShopkeeperProfile: jest.fn(),
}));

const updateShopkeeperProfileMock =
  profileService.updateShopkeeperProfile as jest.Mock;

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  queryClient.setQueryData(["shopkeeper-me"], shopkeeperProfile);

  const wrapper = ({ children }: { children: ReactNode }) =>
    React.createElement(QueryClientProvider, { client: queryClient }, children);

  return { wrapper, queryClient };
}

describe("useUpdateShopkeeperProfile", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("envia o payload e a imagem da loja ao service", async () => {
    // Arrange
    updateShopkeeperProfileMock.mockResolvedValueOnce(updatedShopkeeperProfile);
    const { wrapper } = createWrapper();
    const { result } = renderHook(() => useUpdateShopkeeperProfile(), { wrapper });

    // Act
    await act(async () => {
      result.current.mutate({
        payload: { companyName: "Maria Artesanatos LTDA" },
        poiImageUri: localStoreImageUri,
      });
    });

    // Assert
    await waitFor(() => {
      expect(updateShopkeeperProfileMock).toHaveBeenCalledWith(
        { companyName: "Maria Artesanatos LTDA" },
        localStoreImageUri
      );
    });
  });

  it("atualiza a cache de shopkeeper-me com a resposta do PUT", async () => {
    // Arrange
    updateShopkeeperProfileMock.mockResolvedValueOnce(updatedShopkeeperProfile);
    const { wrapper, queryClient } = createWrapper();
    const { result } = renderHook(() => useUpdateShopkeeperProfile(), { wrapper });

    // Act
    await act(async () => {
      result.current.mutate({
        payload: { companyName: "Maria Artesanatos LTDA" },
      });
    });

    // Assert
    await waitFor(() => {
      expect(queryClient.getQueryData(["shopkeeper-me"])).toEqual(
        updatedShopkeeperProfile
      );
    });
  });

  it("marca a mutation como pendente enquanto o PUT está em voo", async () => {
    // Arrange
    let resolveMutation: (value: ShopkeeperMe) => void = () => {};
    updateShopkeeperProfileMock.mockImplementationOnce(
      () =>
        new Promise<ShopkeeperMe>((resolve) => {
          resolveMutation = resolve;
        })
    );
    const { wrapper } = createWrapper();
    const { result } = renderHook(() => useUpdateShopkeeperProfile(), { wrapper });

    // Act
    act(() => {
      result.current.mutate({ payload: { companyName: "Maria Artesanatos LTDA" } });
    });

    // Assert
    await waitFor(() => expect(result.current.isPending).toBe(true));

    await act(async () => {
      resolveMutation(updatedShopkeeperProfile);
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.isPending).toBe(false);
  });

  it("expõe o erro quando o PUT falha", async () => {
    // Arrange
    updateShopkeeperProfileMock.mockRejectedValueOnce(createAxiosError(400));
    const { wrapper } = createWrapper();
    const { result } = renderHook(() => useUpdateShopkeeperProfile(), { wrapper });

    // Act
    await act(async () => {
      result.current.mutate({ payload: { companyName: "Maria" } });
    });

    // Assert
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(
      (result.current.error as Error & { response: { status: number } }).response
        .status
    ).toBe(400);
  });

  it("não altera a cache quando o PUT falha", async () => {
    // Arrange
    updateShopkeeperProfileMock.mockRejectedValueOnce(createAxiosError(500));
    const { wrapper, queryClient } = createWrapper();
    const { result } = renderHook(() => useUpdateShopkeeperProfile(), { wrapper });

    // Act
    await act(async () => {
      result.current.mutate({ payload: { companyName: "Maria" } });
    });

    // Assert
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(queryClient.getQueryData(["shopkeeper-me"])).toEqual(shopkeeperProfile);
  });
});
