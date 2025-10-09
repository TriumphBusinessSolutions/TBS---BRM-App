"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";

import RegisterForm from "./RegisterForm";

const heroImageSrc =
  "https://drive.google.com/uc?export=view&id=1QBmt10l53-TTZIrYMz2DWE5d6ZzgpGhy";
const logoSrc =
  "https://jkdxxystdtqfbqlmyzrt.supabase.co/storage/v1/object/public/Brand-Assets/TBS%20Logo%20-%20Horizontal%20(2).png";

export default function RegisterHero() {
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
    <main className="login-frame">
      <div className="login-card" ref={cardRef}>
        <section className="card-info">
          <div className="info-logo">
            <span>
              <Image
                src={logoSrc}
                alt="Triumph Business Solutions logo"
                width={320}
                height={120}
                priority
                unoptimized
                className="info-logo__image"
              />
            </span>
          </div>
          <p className="info-kicker">Triumph Business Solutions</p>
          <h1>Launch your Business Revenue Model workspace</h1>
          <p>
            Choose the plan that fits your journey today and grow without friction tomorrow. Every
            account includes Triumph mentor onboarding and the playbooks you need to move with
            confidence.
          </p>
          <ul>
            <li>
              <span className="icon" aria-hidden="true">
                <svg viewBox="0 0 20 20" focusable="false">
                  <path d="M7.6 13.2 4.8 10.4l1.4-1.4 1.4 1.4 4.3-4.3 1.4 1.4Z" fill="currentColor" />
                </svg>
              </span>
              Guided activation call with a Triumph mentor
            </li>
            <li>
              <span className="icon" aria-hidden="true">
                <svg viewBox="0 0 20 20" focusable="false">
                  <path d="m8.2 14.2-3.4-3.4 1.4-1.4 2 2L13.6 6l1.4 1.4Z" fill="currentColor" />
                </svg>
              </span>
              Access to the revenue roadmap, templates, and reporting suite
            </li>
            <li>
              <span className="icon" aria-hidden="true">
                <svg viewBox="0 0 20 20" focusable="false">
                  <path d="m8.3 14.4-3.5-3.5 1.4-1.4 2.1 2.1 4.5-4.5 1.4 1.4Z" fill="currentColor" />
                </svg>
              </span>
              Flexible seats for mentors and team collaborators
            </li>
          </ul>
        </section>

        <div className="card-form">
          <RegisterForm />
        </div>

        <div className="card-illustration" aria-hidden="true">
          <span>
            <Image
              src={heroImageSrc}
              alt="Triumph Business Solutions safari illustration"
              width={340}
              height={340}
              priority
              unoptimized
            />
          </span>
        </div>
      </div>
    </main>
  );
}
