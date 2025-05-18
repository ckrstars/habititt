import confetti from 'canvas-confetti';

export function useConfetti() {
  return (options?: confetti.Options) => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      ...options,
    });
  };
} 