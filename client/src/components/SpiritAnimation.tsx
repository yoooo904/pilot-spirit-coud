import { motion } from "framer-motion";

export function SpiritAnimation({ intensity = 1 }: { intensity?: number }) {
  // Base duration affected by intensity (higher intensity = faster/more chaotic)
  const duration = 10 / intensity;

  return (
    <div className="relative w-64 h-64 md:w-96 md:h-96 flex items-center justify-center opacity-80 pointer-events-none">
      {/* Core Glow */}
      <motion.div
        className="absolute inset-0 bg-white/5 rounded-full blur-[60px]"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: duration * 0.8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Orbiting Ring 1 - Vertical Ellipse */}
      <motion.div
        className="absolute w-full h-full border border-white/20 rounded-[50%] blur-[1px]"
        style={{ borderRadius: "40% 60% 70% 30% / 40% 50% 60% 50%" }}
        animate={{
          rotate: 360,
          scale: [0.9, 1.1, 0.9],
        }}
        transition={{
          rotate: { duration: duration * 2, repeat: Infinity, ease: "linear" },
          scale: { duration: duration, repeat: Infinity, ease: "easeInOut" },
        }}
      />

      {/* Orbiting Ring 2 - Horizontal Ellipse */}
      <motion.div
        className="absolute w-3/4 h-3/4 border border-white/10 rounded-[50%]"
        style={{ borderRadius: "60% 40% 30% 70% / 60% 30% 70% 40%" }}
        animate={{
          rotate: -360,
          scale: [1.1, 0.9, 1.1],
        }}
        transition={{
          rotate: { duration: duration * 2.5, repeat: Infinity, ease: "linear" },
          scale: { duration: duration * 1.2, repeat: Infinity, ease: "easeInOut" },
        }}
      />

      {/* Inner Core */}
      <motion.div
        className="w-1/4 h-1/4 bg-white/90 rounded-full blur-xl"
        animate={{
          scale: [1, 1.5, 1],
          opacity: [0.5, 0.8, 0.5],
        }}
        transition={{
          duration: duration * 0.5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      
      {/* Particles/Sparks */}
      {[...Array(5)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 bg-white rounded-full"
          animate={{
            x: [0, Math.random() * 100 - 50],
            y: [0, Math.random() * 100 - 50],
            opacity: [0, 1, 0],
          }}
          transition={{
            duration: duration * 0.8,
            repeat: Infinity,
            repeatDelay: Math.random() * 2,
            ease: "easeOut",
          }}
        />
      ))}
    </div>
  );
}
