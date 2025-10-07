import Icon from "./Icon";
import styles from "./ChatPreview.module.css";
import type { MentorMessageRow } from "../dashboard-data";
import { ArrowIcon, ChatIcon } from "./icons";

type ChatPreviewProps = {
  messages: MentorMessageRow[];
  formatter: Intl.DateTimeFormat;
};

function formatSender(sender: string | null) {
  if (!sender) {
    return "Client";
  }
  return sender.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
}

export default function ChatPreview({ messages, formatter }: ChatPreviewProps) {
  if (messages.length === 0) {
    return (
      <section className={styles.panel}>
        <div className={styles.header}>
          <span className={styles.title}>Incoming chats</span>
          <Icon size="sm" aria-hidden>
            <ChatIcon />
          </Icon>
        </div>
        <p className={styles.empty}>No messages yet. Your mentor inbox is clear for now.</p>
      </section>
    );
  }

  return (
    <section className={styles.panel}>
      <div className={styles.header}>
        <span className={styles.title}>Incoming chats</span>
        <Icon size="sm" aria-hidden>
          <ChatIcon />
        </Icon>
      </div>
      <div className={styles.list}>
        {messages.map((message) => {
          const timestamp = message.created_at ? formatter.format(new Date(message.created_at)) : "Timestamp unavailable";
          const sender = formatSender(message.sender_role);
          return (
            <article key={message.id} className={styles.message}>
              <span className={styles.meta}>
                {sender} • {timestamp}
              </span>
              <p className={styles.body}>{message.body ?? "New message"}</p>
              <span className={styles.actions}>
                Reply
                <Icon size="sm" aria-hidden>
                  <ArrowIcon />
                </Icon>
              </span>
            </article>
          );
        })}
      </div>
    </section>
  );
}
