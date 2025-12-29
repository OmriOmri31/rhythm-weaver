import { useState } from "react";
import { toast } from "sonner";

// Backend server URL - update this after deploying to Render
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

interface DownloadedTrack {
  id: string;
  title: string;
  fileUrl: string;
  audioBuffer?: AudioBuffer;
}

interface DownloadProgress {
  query: string;
  status: "pending" | "downloading" | "done" | "error";
  title?: string;
  error?: string;
}

export const useAudioDownloader = () => {
  const [isDownloading, setIsDownloading] = useState(false);
  const [progress, setProgress] = useState<DownloadProgress[]>([]);
  const [downloadedTracks, setDownloadedTracks] = useState<DownloadedTrack[]>([]);

  const checkServerHealth = async (): Promise<boolean> => {
    try {
      const response = await fetch(`${BACKEND_URL}/health`, {
        method: "GET",
        mode: "cors",
      });
      return response.ok;
    } catch (error) {
      console.error("Server health check failed:", error);
      return false;
    }
  };

  const downloadTrack = async (query: string): Promise<DownloadedTrack | null> => {
    try {
      // Update progress
      setProgress((prev) => [
        ...prev.filter((p) => p.query !== query),
        { query, status: "downloading" },
      ]);

      // Request download from server
      const response = await fetch(`${BACKEND_URL}/download`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Download failed");
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || "Download failed");
      }

      const track: DownloadedTrack = {
        id: data.file_id,
        title: data.title,
        fileUrl: `${BACKEND_URL}/file/${data.file_id}`,
      };

      // Update progress
      setProgress((prev) =>
        prev.map((p) =>
          p.query === query ? { ...p, status: "done", title: data.title } : p
        )
      );

      return track;
    } catch (error) {
      console.error("Download error:", error);
      setProgress((prev) =>
        prev.map((p) =>
          p.query === query
            ? { ...p, status: "error", error: (error as Error).message }
            : p
        )
      );
      return null;
    }
  };

  const downloadMultipleTracks = async (
    queries: string[]
  ): Promise<DownloadedTrack[]> => {
    setIsDownloading(true);
    setProgress(queries.map((query) => ({ query, status: "pending" })));

    // Check server health first
    const serverHealthy = await checkServerHealth();
    if (!serverHealthy) {
      toast.error("לא ניתן להתחבר לשרת ההורדות. וודא שהשרת פועל.");
      setIsDownloading(false);
      return [];
    }

    const tracks: DownloadedTrack[] = [];

    // Download tracks sequentially to avoid overloading the server
    for (const query of queries) {
      const track = await downloadTrack(query);
      if (track) {
        tracks.push(track);
        setDownloadedTracks((prev) => [...prev, track]);
      }
    }

    setIsDownloading(false);

    if (tracks.length === queries.length) {
      toast.success(`הורדו ${tracks.length} שירים בהצלחה!`);
    } else if (tracks.length > 0) {
      toast.warning(
        `הורדו ${tracks.length} מתוך ${queries.length} שירים`
      );
    } else {
      toast.error("לא הצלחתי להוריד שירים");
    }

    return tracks;
  };

  const loadAudioBuffer = async (
    track: DownloadedTrack
  ): Promise<AudioBuffer | null> => {
    try {
      const response = await fetch(track.fileUrl);
      const arrayBuffer = await response.arrayBuffer();
      const audioContext = new AudioContext();
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
      return audioBuffer;
    } catch (error) {
      console.error("Error loading audio buffer:", error);
      return null;
    }
  };

  const cleanupTrack = async (trackId: string): Promise<void> => {
    try {
      await fetch(`${BACKEND_URL}/cleanup/${trackId}`, {
        method: "DELETE",
      });
      setDownloadedTracks((prev) => prev.filter((t) => t.id !== trackId));
    } catch (error) {
      console.error("Cleanup error:", error);
    }
  };

  const cleanupAllTracks = async (): Promise<void> => {
    for (const track of downloadedTracks) {
      await cleanupTrack(track.id);
    }
    setDownloadedTracks([]);
    setProgress([]);
  };

  return {
    isDownloading,
    progress,
    downloadedTracks,
    checkServerHealth,
    downloadTrack,
    downloadMultipleTracks,
    loadAudioBuffer,
    cleanupTrack,
    cleanupAllTracks,
  };
};
