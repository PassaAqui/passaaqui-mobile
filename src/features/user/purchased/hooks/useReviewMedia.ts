import { useState } from "react";
import * as ImagePicker from "expo-image-picker";

const MAX_PHOTOS = 4;
const MAX_VIDEOS = 1;

export interface ReviewMedia {
  uri: string;
  name: string;
  type: "image" | "video";
}

export function useReviewMedia() {
  const [photos, setPhotos] = useState<ReviewMedia[]>([]);
  const [videos, setVideos] = useState<ReviewMedia[]>([]);

  const pickPhotos = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== "granted") {
      alert("Precisamos de acesso à sua galeria para selecionar fotos.");
      return;
    }

    const remainingSlots = MAX_PHOTOS - photos.length;
    if (remainingSlots <= 0) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      quality: 0.8,
      allowsMultipleSelection: true,
      selectionLimit: remainingSlots,
    });

    if (result.canceled) return;

    const newPhotos: ReviewMedia[] = result.assets.map((asset) => ({
      uri: asset.uri,
      name: asset.fileName ?? asset.uri.split("/").pop() ?? "foto.jpg",
      type: "image",
    }));

    setPhotos((prev) => [...prev, ...newPhotos].slice(0, MAX_PHOTOS));
  };

  const pickVideos = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== "granted") {
      alert("Precisamos de acesso à sua galeria para selecionar vídeos.");
      return;
    }

    const remainingSlots = MAX_VIDEOS - videos.length;
    if (remainingSlots <= 0) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["videos"],
      allowsMultipleSelection: true,
      selectionLimit: remainingSlots,
    });

    if (result.canceled) return;

    const newVideos: ReviewMedia[] = result.assets.map((asset) => ({
      uri: asset.uri,
      name: asset.fileName ?? asset.uri.split("/").pop() ?? "video.mp4",
      type: "video",
    }));

    setVideos((prev) => [...prev, ...newVideos].slice(0, MAX_VIDEOS));
  };

  const removePhoto = (uri: string) => {
    setPhotos((prev) => prev.filter((photo) => photo.uri !== uri));
  };

  const removeVideo = (uri: string) => {
    setVideos((prev) => prev.filter((video) => video.uri !== uri));
  };

  return {
    photos,
    videos,
    maxPhotos: MAX_PHOTOS,
    maxVideos: MAX_VIDEOS,
    pickPhotos,
    pickVideos,
    removePhoto,
    removeVideo,
  };
}