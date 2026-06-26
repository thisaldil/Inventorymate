import { useEffect, useRef, useState, type ReactNode } from 'react';
import { motion, useReducedMotion } from 'framer-motion';

type ScrollRevealProps = {
  children: ReactNode;
  delay?: number;
};

export function ScrollReveal({ children, delay = 0 }: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [visible, setVisible] = useState(false);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (reduceMotion || visible) return undefined;

    let frame = 0;
    const checkVisibility = () => {
      if (!ref.current) return;

      const rect = ref.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
      const entersView = rect.top < viewportHeight * 0.88 && rect.bottom > viewportHeight * 0.12;

      if (entersView) {
        setVisible(true);
        window.removeEventListener('scroll', scheduleCheck);
        window.removeEventListener('resize', scheduleCheck);
      }
    };

    const scheduleCheck = () => {
      window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(checkVisibility);
    };

    scheduleCheck();
    window.addEventListener('scroll', scheduleCheck, { passive: true });
    window.addEventListener('resize', scheduleCheck);

    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener('scroll', scheduleCheck);
      window.removeEventListener('resize', scheduleCheck);
    };
  }, [reduceMotion, visible]);

  if (reduceMotion) {
    return <div>{children}</div>;
  }

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 64, filter: 'blur(10px)' }}
      animate={visible ? { opacity: 1, y: 0, filter: 'blur(0px)' } : { opacity: 0, y: 64, filter: 'blur(10px)' }}
      transition={{
        duration: 0.75,
        delay,
        ease: [0.16, 1, 0.3, 1],
      }}
      style={{ willChange: 'opacity, transform, filter' }}
    >
      {children}
    </motion.div>
  );
}
