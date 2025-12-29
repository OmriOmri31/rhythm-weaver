import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface MixEvent {
  id: string;
  type: "song" | "fade-in" | "fade-out" | "effect";
  songName: string;
  songQuery?: string;
  spotifyUrl?: string;
  startTime: number;
  duration: number;
  songStartOffset?: number;
  color: string;
}

export interface MixStep {
  id: string;
  icon: "music" | "volume" | "effect" | "time";
  description: string;
  timeRange?: string;
}

export interface ParsedMix {
  events: MixEvent[];
  steps: MixStep[];
  totalDuration: number;
  summary: string;
}

export const useMixParser = () => {
  const [isLoading, setIsLoading] = useState(false);

  const parseMix = async (prompt: string): Promise<{ mix: ParsedMix | null; message: string }> => {
    setIsLoading(true);
    
    try {
      console.log("Sending prompt to parse-mix:", prompt);
      
      const { data, error } = await supabase.functions.invoke("parse-mix", {
        body: { prompt },
      });

      if (error) {
        console.error("Error calling parse-mix:", error);
        toast.error("שגיאה בעיבוד הבקשה");
        return { mix: null, message: "שגיאה בעיבוד הבקשה. נסה שוב." };
      }

      if (!data.success) {
        console.error("Parse-mix failed:", data.error);
        toast.error(data.error || "שגיאה בהבנת הבקשה");
        return { mix: null, message: data.error || "לא הצלחתי להבין את הבקשה. נסה לנסח אחרת." };
      }

      console.log("Parsed mix result:", data.mix);
      return { mix: data.mix, message: data.message };

    } catch (err) {
      console.error("Unexpected error:", err);
      toast.error("שגיאה בלתי צפויה");
      return { mix: null, message: "שגיאה בלתי צפויה. נסה שוב." };
    } finally {
      setIsLoading(false);
    }
  };

  return { parseMix, isLoading };
};
