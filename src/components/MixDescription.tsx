import { motion } from "framer-motion";
import { CheckCircle2, Clock, Music2, Volume2, Sparkles } from "lucide-react";

interface MixStep {
  id: string;
  icon: "music" | "volume" | "effect" | "time";
  description: string;
  timeRange?: string;
}

interface MixDescriptionProps {
  steps: MixStep[];
}

const MixDescription = ({ steps }: MixDescriptionProps) => {
  const getIcon = (icon: string) => {
    switch (icon) {
      case "music":
        return <Music2 className="w-4 h-4" />;
      case "volume":
        return <Volume2 className="w-4 h-4" />;
      case "effect":
        return <Sparkles className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="glass-panel rounded-xl p-4"
    >
      <h3 className="text-sm font-medium text-muted-foreground mb-4 flex items-center gap-2">
        <CheckCircle2 className="w-4 h-4 text-primary" />
        מה המיקס יעשה
      </h3>
      
      <div className="space-y-3" dir="rtl">
        {steps.map((step, index) => (
          <motion.div
            key={step.id}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex items-start gap-3 p-3 rounded-lg bg-secondary/30 border border-border/30"
          >
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 text-primary">
              {getIcon(step.icon)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-foreground/90">{step.description}</p>
              {step.timeRange && (
                <span className="text-xs text-muted-foreground mt-1 block">
                  {step.timeRange}
                </span>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default MixDescription;
