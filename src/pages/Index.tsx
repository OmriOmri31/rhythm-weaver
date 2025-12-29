import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Logo from "@/components/Logo";
import ChatMessage from "@/components/ChatMessage";
import ChatInput from "@/components/ChatInput";
import MixTimeline from "@/components/MixTimeline";
import MixDescription from "@/components/MixDescription";
import WaveformVisualizer from "@/components/WaveformVisualizer";
import DiscoBall from "@/components/DiscoBall";
import FileDropZone from "@/components/FileDropZone";
import { useMixParser, ParsedMix, MixEvent, MixStep } from "@/hooks/useMixParser";
import { Play, Download, RotateCcw, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: string;
}

interface UploadedFile {
  id: string;
  file: File;
  name: string;
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
      content: "שלום! אני Notellamix 🎵\nתאר לי את המיקס שאתה רוצה ליצור ואני אבנה אותו עבורך.\n\nאתה יכול:\n• לכתוב בעברית בשפה טבעית\n• להדביק קישורי Spotify\n• לגרור קבצי אודיו למעלה\n\nנסה לתאר אילו שירים, מתי להתחיל, fades, ואפקטים.",
      isUser: false,
      timestamp: new Date().toLocaleTimeString("he-IL", { hour: "2-digit", minute: "2-digit" }),
    },
  ]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [mixResult, setMixResult] = useState<MixResult | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [showFileUpload, setShowFileUpload] = useState(false);
  
  const { parseMix, isLoading } = useMixParser();

  const handleSendMessage = async (content: string) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      content,
      isUser: true,
      timestamp: new Date().toLocaleTimeString("he-IL", { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, newMessage]);

    // Add uploaded file names to context if any
    let enrichedPrompt = content;
    if (uploadedFiles.length > 0) {
      const fileNames = uploadedFiles.map(f => f.name).join(", ");
      enrichedPrompt = `${content}\n\n[קבצי אודיו שהועלו: ${fileNames}]`;
    }

    const { mix, message } = await parseMix(enrichedPrompt);
    
    const aiMessage: Message = {
      id: (Date.now() + 1).toString(),
      content: message,
      isUser: false,
      timestamp: new Date().toLocaleTimeString("he-IL", { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, aiMessage]);

    if (mix) {
      // Convert ParsedMix to MixResult format
      const result: MixResult = {
        events: mix.events.map(e => ({
          id: e.id,
          type: e.type,
          songName: e.songName,
          startTime: e.startTime,
          duration: e.duration,
          color: e.color,
        })),
        steps: mix.steps,
        totalDuration: mix.totalDuration,
      };
      setMixResult(result);
    }
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
            {/* File upload toggle */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4"
            >
              <Button
                variant="ghost"
                onClick={() => setShowFileUpload(!showFileUpload)}
                className="w-full justify-between text-muted-foreground hover:text-foreground"
              >
                <span>העלאת קבצי אודיו ({uploadedFiles.length})</span>
                {showFileUpload ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </Button>
              
              <AnimatePresence>
                {showFileUpload && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-2"
                  >
                    <FileDropZone 
                      files={uploadedFiles} 
                      onFilesChange={setUploadedFiles} 
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

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
                  <span className="text-sm">מנתח את הבקשה עם AI...</span>
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
          💡 טיפ: תוכל לציין שמות שירים, קישורי Spotify, זמנים, מעברי פייד, ואפקטים בשפה טבעית
        </motion.footer>
      </div>
    </div>
  );
};

export default Index;
