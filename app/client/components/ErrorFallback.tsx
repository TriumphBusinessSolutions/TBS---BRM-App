"use client";

import { useRouter } from "next/navigation";

import Icon from "./Icon";
import styles from "./ErrorFallback.module.css";
import { RefreshIcon } from "./icons";

type ErrorFallbackProps = {
  messages: string[];
  onRetry?: () => void;
};

export default function ErrorFallback({ messages, onRetry }: ErrorFallbackProps) {
  const router = useRouter();

  const handleRetry = () => {
    if (onRetry) {
      onRetry();
      return;
    }
    router.refresh();
  };

  return (
    <div className={styles.wrapper} role="alert">
      <p className={styles.title}>We couldn’t load your data</p>
      <ul className={styles.list}>
        {messages.map((message) => (
          <li key={message}>{message}</li>
        ))}
      </ul>
      <button type="button" className={styles.retryButton} onClick={handleRetry}>
        <Icon size="sm" aria-hidden>
          <RefreshIcon />
        </Icon>
        Retry
      </button>
    </div>
  );
}
