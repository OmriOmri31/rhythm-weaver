import { motion } from "framer-motion";

interface WaveformVisualizerProps {
  isPlaying?: boolean;
}

const WaveformVisualizer = ({ isPlaying = false }: WaveformVisualizerProps) => {
  const bars = Array.from({ length: 40 }, (_, i) => i);
  
  return (
    <div className="flex items-center justify-center gap-[2px] h-12">
      {bars.map((i) => (
        <motion.div
          key={i}
          className="w-1 bg-gradient-to-t from-primary to-accent rounded-full"
          initial={{ height: 8 }}
          animate={
            isPlaying
              ? {
                  height: [8, Math.random() * 32 + 8, 8],
                }
              : { height: 8 }
          }
          transition={{
            duration: 0.4 + Math.random() * 0.3,
            repeat: isPlaying ? Infinity : 0,
            ease: "easeInOut",
            delay: i * 0.02,
          }}
        />
      ))}
    </div>
  );
};

export default WaveformVisualizer;
