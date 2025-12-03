import { motion, type HTMLMotionProps } from "framer-motion";
import { useLocation } from "react-router-dom";
import { cn } from "../../lib/cn";

interface PageWrapperProps extends HTMLMotionProps<"main"> {
  children: React.ReactNode;
  withParallax?: boolean;
  stagger?: boolean;
  className?: string;
}

export const PageWrapper = ({
  children,
  withParallax = false,
  stagger = true,
  className,
  ...props
}: PageWrapperProps) => {
  const location = useLocation();

  return (
    <motion.main
      key={location.pathname}
      initial={{ opacity: 0, y: 20 }}
      animate={{
        opacity: 1,
        y: 0,
        transition: {
          duration: 0.35,
          ease: "easeOut",
          ...(stagger && {
            staggerChildren: 0.1,
            delayChildren: 0.1,
          }),
        },
      }}
      exit={{ opacity: 0, y: -15 }}
      className={cn(
        "min-h-screen w-full",
        "bg-linear-to-b from-gray-950 via-gray-900 to-gray-950",
        withParallax && "overflow-hidden relative",
        className
      )}
      {...props}
    >
      {/* Background Parallax Layer */}
      {withParallax && (
        <motion.div
          className="absolute inset-0 opacity-10 bg-[url('/noise.svg')] pointer-events-none"
          initial={{ y: 0 }}
          animate={{ y: [-20, 20, -20] }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
        />
      )}

      {/* Content */}
      <div className="relative z-10">{children}</div>
    </motion.main>
  );
};

