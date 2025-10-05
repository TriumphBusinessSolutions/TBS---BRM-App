"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";

import LoginForm from "./LoginForm";

const heroImageSrc =
  "https://drive.google.com/uc?export=view&id=1QBmt10l53-TTZIrYMz2DWE5d6ZzgpGhy";

type LoginHeroProps = {
  supabaseConfigured: boolean;
};

export default function LoginHero({ supabaseConfigured }: LoginHeroProps) {
  const cardRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const card = cardRef.current;
    if (!card) {
      return;
    }

    let animationFrame: number | null = null;

    const setCardStyles = (xDeg: number, yDeg: number, glowX: number, glowY: number) => {
      card.style.setProperty("--tiltX", `${xDeg}deg`);
      card.style.setProperty("--tiltY", `${yDeg}deg`);
      card.style.setProperty("--glowX", `${glowX}%`);
      card.style.setProperty("--glowY", `${glowY}%`);
    };

    const handlePointerMove = (event: PointerEvent) => {
      if (!card) {
        return;
      }

      const rect = card.getBoundingClientRect();
      const relativeX = (event.clientX - rect.left) / rect.width;
      const relativeY = (event.clientY - rect.top) / rect.height;
      const rotateY = (relativeX - 0.5) * 16;
      const rotateX = (0.5 - relativeY) * 12;
      const glowX = 50 + (relativeX - 0.5) * 60;
      const glowY = 50 + (relativeY - 0.5) * 60;

      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }

      animationFrame = requestAnimationFrame(() => {
        setCardStyles(rotateX, rotateY, glowX, glowY);
      });
    };

    const resetCard = () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
        animationFrame = null;
      }

      setCardStyles(0, 0, 50, 50);
    };

    card.addEventListener("pointermove", handlePointerMove);
    card.addEventListener("pointerleave", resetCard);
    card.addEventListener("pointerup", resetCard);

    return () => {
      card.removeEventListener("pointermove", handlePointerMove);
      card.removeEventListener("pointerleave", resetCard);
      card.removeEventListener("pointerup", resetCard);
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, []);

  return (
    <main className="login-stage">
      <div className="brand-header">
        <div className="brand-mark">
          <Image src="/triumph-logo.svg" alt="Triumph Business Solutions logo" width={84} height={84} priority />
        </div>
        <p className="brand-subtitle">Triumph Business Solutions</p>
        <h1 className="brand-title">Business Revenue Model App</h1>
        <p className="brand-description">
          Step into a vibrant control center built to help mentors and clients co-create profitable pathways in record time.
        </p>
      </div>

      <div className="login-card" ref={cardRef}>
        <div className="card-illustration" aria-hidden="true">
          <span>
            <Image
              src={heroImageSrc}
              alt="Triumph Business Solutions safari illustration"
              width={320}
              height={320}
              priority
              unoptimized
            />
          </span>
        </div>
        <LoginForm supabaseConfigured={supabaseConfigured} />
      </div>
    </main>
  );
}
