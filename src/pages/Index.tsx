import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Logo from "@/components/Logo";
import ChatMessage from "@/components/ChatMessage";
import ChatInput from "@/components/ChatInput";
import MixTimeline from "@/components/MixTimeline";
import MixDescription from "@/components/MixDescription";
import WaveformVisualizer from "@/components/WaveformVisualizer";
import DiscoBall from "@/components/DiscoBall";
import { Play, Download, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: string;
}

interface MixResult {
  events: Array<{
    id: string;
    type: "song" | "fade-in" | "fade-out" | "effect";
    songName?: string;
    startTime: number;
    duration: number;
    color: string;
  }>;
  steps: Array<{
    id: string;
    icon: "music" | "volume" | "effect" | "time";
    description: string;
    timeRange?: string;
  }>;
  totalDuration: number;
}

const Index = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      content: "שלום! אני Notellamix 🎵\nתאר לי את המיקס שאתה רוצה ליצור ואני אבנה אותו עבורך. אתה יכול לכתוב בעברית בשפה טבעית.",
      isUser: false,
      timestamp: new Date().toLocaleTimeString("he-IL", { hour: "2-digit", minute: "2-digit" }),
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [mixResult, setMixResult] = useState<MixResult | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const handleSendMessage = async (content: string) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      content,
      isUser: true,
      timestamp: new Date().toLocaleTimeString("he-IL", { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, newMessage]);
    setIsLoading(true);

    // Simulate AI response - in production this would call the backend
    setTimeout(() => {
      // Parse the example prompt and generate a response
      const mockResponse = generateMockResponse(content);
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: mockResponse.message,
        isUser: false,
        timestamp: new Date().toLocaleTimeString("he-IL", { hour: "2-digit", minute: "2-digit" }),
      };

      setMessages((prev) => [...prev, aiMessage]);
      setMixResult(mockResponse.mixResult);
      setIsLoading(false);
    }, 2000);
  };

  const generateMockResponse = (input: string): { message: string; mixResult: MixResult } => {
    // This is a mock - the real implementation would use AI
    const isHebrewMixRequest = input.includes("אהבתיה") || input.includes("פייד") || input.includes("תתחיל");

    if (isHebrewMixRequest) {
      return {
        message: `הבנתי את הבקשה! הנה מה שאני הולך לעשות:

✅ מתחיל את "אהבתיה" מההתחלה
✅ אחרי 20 שניות - מתחיל Fade Out של 10 שניות
✅ במקביל - מתחיל Fade In של "What's Love" מדקה 0:47
✅ "What's Love" ינוגן למשך 35 שניות
✅ סיום עם אפקט בום ענק

סה"כ אורך המיקס: 65 שניות`,
        mixResult: {
          totalDuration: 65,
          events: [
            { id: "1", type: "song", songName: "אהבתיה", startTime: 0, duration: 30, color: "hsla(160, 100%, 30%, 0.8)" },
            { id: "2", type: "fade-out", songName: "Fade Out", startTime: 20, duration: 10, color: "hsla(0, 0%, 50%, 0.6)" },
            { id: "3", type: "song", songName: "What's Love", startTime: 20, duration: 35, color: "hsla(0, 93%, 45%, 0.8)" },
            { id: "4", type: "fade-in", songName: "Fade In", startTime: 20, duration: 8, color: "hsla(200, 80%, 50%, 0.6)" },
            { id: "5", type: "effect", songName: "בום!", startTime: 55, duration: 5, color: "hsla(40, 100%, 50%, 0.9)" },
          ],
          steps: [
            { id: "s1", icon: "music", description: "מתחיל לנגן את 'אהבתיה' מההתחלה", timeRange: "0:00 - 0:30" },
            { id: "s2", icon: "volume", description: "Fade Out של 'אהבתיה' - יורד בהדרגה במשך 10 שניות", timeRange: "0:20 - 0:30" },
            { id: "s3", icon: "music", description: "מתחיל את 'What's Love' מנקודה 0:47 של השיר המקורי", timeRange: "0:20" },
            { id: "s4", icon: "volume", description: "Fade In של 'What's Love' - עולה בהדרגה", timeRange: "0:20 - 0:28" },
            { id: "s5", icon: "effect", description: "אפקט סיום: בום ענק!", timeRange: "0:55 - 1:00" },
          ],
        },
      };
    }

    return {
      message: "אשמח לעזור לך ליצור מיקס! תאר לי אילו שירים אתה רוצה, מתי להתחיל כל שיר, האם לעשות מעברים הדרגתיים (fades), ואילו אפקטים להוסיף.",
      mixResult: null as unknown as MixResult,
    };
  };

  const handleReset = () => {
    setMixResult(null);
    setIsPlaying(false);
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Disco ball decoration */}
      <DiscoBall />
      
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-bottle-dark via-background to-bottle-dark opacity-50" />
      
      {/* Main content */}
      <div className="relative z-10 container mx-auto px-4 py-8 min-h-screen flex flex-col">
        {/* Header */}
        <header className="text-center mb-8 pt-8">
          <Logo />
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-muted-foreground mt-4 text-lg"
          >
            יוצר מיקסים לכוריאוגרפים בשפה טבעית
          </motion.p>
        </header>

        {/* Main area */}
        <div className="flex-1 flex flex-col lg:flex-row gap-6 max-w-7xl mx-auto w-full">
          {/* Chat section */}
          <div className="flex-1 flex flex-col min-w-0">
            {/* Messages */}
            <div className="flex-1 overflow-y-auto space-y-4 mb-4 max-h-[50vh] lg:max-h-[60vh] pr-2">
              <AnimatePresence mode="popLayout">
                {messages.map((msg) => (
                  <ChatMessage
                    key={msg.id}
                    message={msg.content}
                    isUser={msg.isUser}
                    timestamp={msg.timestamp}
                  />
                ))}
              </AnimatePresence>
              
              {isLoading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center gap-2 text-muted-foreground"
                >
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-accent rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="w-2 h-2 bg-accent rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="w-2 h-2 bg-accent rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                  <span className="text-sm">מעבד את הבקשה...</span>
                </motion.div>
              )}
            </div>

            {/* Input */}
            <ChatInput
              onSend={handleSendMessage}
              isLoading={isLoading}
              placeholder="תאר את המיקס שאתה רוצה ליצור..."
            />
          </div>

          {/* Mix visualization section */}
          <AnimatePresence>
            {mixResult && (
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 50 }}
                className="lg:w-[450px] space-y-4"
              >
                {/* Timeline */}
                <MixTimeline events={mixResult.events} totalDuration={mixResult.totalDuration} />

                {/* Description */}
                <MixDescription steps={mixResult.steps} />

                {/* Waveform */}
                <div className="glass-panel rounded-xl p-4">
                  <WaveformVisualizer isPlaying={isPlaying} />
                </div>

                {/* Action buttons */}
                <div className="flex gap-3">
                  <Button
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="flex-1 bg-primary hover:bg-primary/80 glow-green"
                  >
                    <Play className={`w-4 h-4 mr-2 ${isPlaying ? "text-accent" : ""}`} />
                    {isPlaying ? "עצור" : "נגן תצוגה מקדימה"}
                  </Button>
                  
                  <Button
                    variant="outline"
                    className="border-border hover:bg-secondary"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    הורד
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleReset}
                    className="hover:bg-secondary"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer hint */}
        <motion.footer
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center mt-8 text-sm text-muted-foreground"
        >
          💡 טיפ: תוכל לציין שמות שירים, זמנים, מעברי פייד, ואפקטים בשפה טבעית
        </motion.footer>
      </div>
    </div>
  );
};

export default Index;
