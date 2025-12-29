import { motion } from "framer-motion";

const DiscoBall = () => {
  return (
    <div className="fixed top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-0">
      {/* String */}
      <div className="w-px h-20 bg-gradient-to-b from-transparent to-disco-silver mx-auto" />
      
      {/* Ball */}
      <motion.div
        animate={{ rotateY: 360 }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        className="w-32 h-32 rounded-full relative"
        style={{
          background: `
            radial-gradient(ellipse at 30% 30%, rgba(255,255,255,0.9) 0%, transparent 50%),
            radial-gradient(circle at 50% 50%, #c0c0c0 0%, #808080 50%, #404040 100%)
          `,
          boxShadow: `
            inset -10px -10px 30px rgba(0,0,0,0.3),
            inset 10px 10px 30px rgba(255,255,255,0.2),
            0 0 40px rgba(255,255,255,0.2)
          `,
        }}
      >
        {/* Mirror tiles */}
        {Array.from({ length: 50 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-3 h-3 rounded-sm"
            style={{
              background: `linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(192,192,192,0.6) 100%)`,
              top: `${Math.random() * 80 + 10}%`,
              left: `${Math.random() * 80 + 10}%`,
              transform: `rotate(${Math.random() * 45}deg)`,
            }}
            animate={{
              opacity: [0.4, 1, 0.4],
            }}
            transition={{
              duration: 1 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </motion.div>
      
      {/* Light rays */}
      {Array.from({ length: 8 }).map((_, i) => (
        <motion.div
          key={`ray-${i}`}
          className="absolute top-16 left-1/2 w-1 h-96 origin-top"
          style={{
            background: `linear-gradient(to bottom, rgba(255,255,255,0.3) 0%, transparent 100%)`,
            transform: `translateX(-50%) rotate(${i * 45}deg)`,
          }}
          animate={{
            opacity: [0.1, 0.4, 0.1],
            rotate: [i * 45, i * 45 + 10, i * 45],
          }}
          transition={{
            duration: 3 + Math.random() * 2,
            repeat: Infinity,
            delay: i * 0.2,
          }}
        />
      ))}
    </div>
  );
};

export default DiscoBall;
