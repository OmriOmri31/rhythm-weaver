import { motion } from "framer-motion";
import { User, Sparkles } from "lucide-react";

interface ChatMessageProps {
  message: string;
  isUser: boolean;
  timestamp?: string;
}

const ChatMessage = ({ message, isUser, timestamp }: ChatMessageProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`flex gap-3 ${isUser ? "flex-row-reverse" : "flex-row"}`}
    >
      <div
        className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
          isUser
            ? "bg-primary/30 border border-primary/50"
            : "bg-accent/20 border border-accent/40"
        }`}
      >
        {isUser ? (
          <User className="w-5 h-5 text-primary-foreground" />
        ) : (
          <Sparkles className="w-5 h-5 text-accent" />
        )}
      </div>
      
      <div
        className={`max-w-[80%] rounded-2xl px-4 py-3 ${
          isUser ? "chat-bubble-user" : "chat-bubble"
        }`}
      >
        <p className="text-foreground/90 text-sm md:text-base leading-relaxed whitespace-pre-wrap" dir="auto">
          {message}
        </p>
        {timestamp && (
          <span className="text-xs text-muted-foreground mt-2 block">
            {timestamp}
          </span>
        )}
      </div>
    </motion.div>
  );
};

export default ChatMessage;
