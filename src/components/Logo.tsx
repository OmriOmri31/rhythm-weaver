import { motion } from "framer-motion";

const Logo = () => {
  return (
    <motion.div 
      className="flex items-center justify-center"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      <h1 className="font-display text-6xl md:text-8xl tracking-tight flex items-baseline">
        <span style={{ color: '#070604' }} className="drop-shadow-lg">N</span>
        <span style={{ color: '#db0c06' }} className="drop-shadow-lg">otella</span>
        <span className="disco-text disco-ball-bg relative ml-1">mix</span>
      </h1>
    </motion.div>
  );
};

export default Logo;
