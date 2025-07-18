import { motion } from 'framer-motion';

interface SkeletonProps {
  className?: string;
  variant?: 'rectangular' | 'circular' | 'text';
  height?: string | number;
  width?: string | number;
}

export function Skeleton({ className = '', variant = 'rectangular', height, width }: SkeletonProps) {
  const baseClasses = "relative overflow-hidden bg-gray-200 animate-pulse";

  const variantClasses = {
    rectangular: "rounded-lg",
    circular: "rounded-full",
    text: "rounded"
  };

  const styles = {
    height: height,
    width: width
  };

  return (
    <div
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      style={styles}
    >
      <motion.div
        className="absolute inset-0 -translate-x-full"
        animate={{
          translateX: ["0%", "100%"]
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: "linear"
        }}
        style={{
          background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)"
        }}
      />
    </div>
  );
}