import { motion } from "framer-motion";
import { Music, Volume2, VolumeX, Zap } from "lucide-react";

interface MixEvent {
  id: string;
  type: "song" | "fade-in" | "fade-out" | "effect";
  songName?: string;
  startTime: number;
  duration: number;
  color: string;
}

interface MixTimelineProps {
  events: MixEvent[];
  totalDuration: number;
}

const MixTimeline = ({ events, totalDuration }: MixTimelineProps) => {
  const getEventIcon = (type: string) => {
    switch (type) {
      case "fade-in":
        return <Volume2 className="w-3 h-3" />;
      case "fade-out":
        return <VolumeX className="w-3 h-3" />;
      case "effect":
        return <Zap className="w-3 h-3" />;
      default:
        return <Music className="w-3 h-3" />;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-panel rounded-xl p-4 glow-green"
    >
      <h3 className="text-sm font-medium text-muted-foreground mb-4 flex items-center gap-2">
        <Music className="w-4 h-4" />
        ציר זמן של המיקס
      </h3>
      
      <div className="relative h-24 bg-secondary/30 rounded-lg overflow-hidden">
        {/* Time markers */}
        <div className="absolute inset-x-0 top-0 h-6 flex items-center justify-between px-2 text-xs text-muted-foreground border-b border-border/30">
          <span>0:00</span>
          <span>{Math.floor(totalDuration / 2)}s</span>
          <span>{totalDuration}s</span>
        </div>
        
        {/* Events */}
        <div className="absolute inset-x-0 top-6 bottom-0 p-2">
          {events.map((event, index) => {
            const left = (event.startTime / totalDuration) * 100;
            const width = (event.duration / totalDuration) * 100;
            
            return (
              <motion.div
                key={event.id}
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: index * 0.1, duration: 0.4 }}
                className="absolute h-8 rounded flex items-center gap-1 px-2 text-xs font-medium overflow-hidden origin-left"
                style={{
                  left: `${left}%`,
                  width: `${Math.max(width, 5)}%`,
                  backgroundColor: event.color,
                  top: event.type === "effect" ? "50%" : index % 2 === 0 ? "0" : "40%",
                }}
              >
                {getEventIcon(event.type)}
                <span className="truncate">{event.songName || event.type}</span>
              </motion.div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
};

export default MixTimeline;
