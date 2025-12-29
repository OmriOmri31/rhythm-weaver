import { useState } from "react";
import { motion } from "framer-motion";
import { Send, Mic, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface ChatInputProps {
  onSend: (message: string) => void;
  isLoading?: boolean;
  placeholder?: string;
}

const ChatInput = ({ onSend, isLoading = false, placeholder }: ChatInputProps) => {
  const [message, setMessage] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !isLoading) {
      onSend(message.trim());
      setMessage("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <motion.form
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      onSubmit={handleSubmit}
      className="glass-panel rounded-2xl p-3 glow-green"
    >
      <div className="flex items-end gap-3">
        <Textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder || "תאר את המיקס שאתה רוצה ליצור..."}
          className="min-h-[60px] max-h-[200px] resize-none bg-transparent border-0 focus-visible:ring-0 text-foreground placeholder:text-muted-foreground text-right"
          dir="rtl"
          disabled={isLoading}
        />
        
        <div className="flex flex-col gap-2">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="rounded-full hover:bg-primary/20 text-muted-foreground hover:text-foreground"
            disabled={isLoading}
          >
            <Mic className="w-5 h-5" />
          </Button>
          
          <Button
            type="submit"
            size="icon"
            className="rounded-full bg-accent hover:bg-accent/80 glow-accent"
            disabled={!message.trim() || isLoading}
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </Button>
        </div>
      </div>
    </motion.form>
  );
};

export default ChatInput;
