import type { SVGProps } from "react";

export function HomeIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} {...props}>
      <path
        d="M4.5 10.5 12 4l7.5 6.5V20a1.5 1.5 0 0 1-1.5 1.5h-3a1.5 1.5 0 0 1-1.5-1.5v-3a1.5 1.5 0 0 0-1.5-1.5h-1.5A1.5 1.5 0 0 0 9 17v3a1.5 1.5 0 0 1-1.5 1.5h-3A1.5 1.5 0 0 1 3 20v-6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function UsersIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} {...props}>
      <path
        d="M15.5 7.5a3.5 3.5 0 1 1 7 0 3.5 3.5 0 0 1-7 0zm-14 0a3.5 3.5 0 1 1 7 0 3.5 3.5 0 0 1-7 0zM12 11.5a4 4 0 1 0-4-4 4 4 0 0 0 4 4zm7.5 5.5c-1.1 0-2.3.3-3.1.8a5.2 5.2 0 0 0-1.2 1.2M4.5 17c1.1 0 2.3.3 3.1.8a5.2 5.2 0 0 1 1.2 1.2M12 14c-1.5 0-3 .4-4 1.1A5.2 5.2 0 0 0 6 18m6-4c1.5 0 3 .4 4 1.1a5.2 5.2 0 0 1 2 2.9"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function ChatIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} {...props}>
      <path
        d="M5 20.5 6.4 17A8.5 8.5 0 1 1 12 20h-1.5a1.5 1.5 0 0 0-1.4 1l-.6 1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M8 11.5h8M8 8.5h6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function BookIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} {...props}>
      <path
        d="M4.5 5h9A2.5 2.5 0 0 1 16 7.5V21a.5.5 0 0 1-.8.4l-2.4-1.8a2.5 2.5 0 0 0-1.5-.6H4.5A1.5 1.5 0 0 1 3 17.5v-11A1.5 1.5 0 0 1 4.5 5z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M16 7.5a2.5 2.5 0 0 1 2.5-2.5H20a1 1 0 0 1 1 1V19a1 1 0 0 1-1 1h-.5A2.5 2.5 0 0 0 16 22" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function SparkleIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} {...props}>
      <path
        d="M12 3.5 13 7a5 5 0 0 0 3.9 3.9l3.6.7-3.6.7A5 5 0 0 0 13 15.3L12 18.5 11 15.3A5 5 0 0 0 7.1 11.6L3.5 10.9l3.6-.7A5 5 0 0 0 11 7z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M6 4 5.4 6 4 6.6 5.4 7.2 6 9 6.6 7.2 8 6.6 6.6 6 6 4z" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M18 4.8 17.4 7l-1.8.6L17.4 8.2 18 10l.6-1.8L20.4 7 18.6 6z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function CogIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} {...props}>
      <path
        d="m12 3 1 2.7c.2.6.7 1 1.3 1.1l2.6.4-1.9 2a1.5 1.5 0 0 0-.4 1.4l.6 2.5-2.4-.9a1.5 1.5 0 0 0-1.4.2l-2.1 1.5.2-2.6a1.5 1.5 0 0 0-.8-1.4L6 9.6l2.5-.6c.6-.1 1-.5 1.2-1L10.5 6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx={12} cy={12} r={2.6} />
    </svg>
  );
}

export function ArrowIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.8} {...props}>
      <path d="M5 10h10M11.5 6.5 15 10l-3.5 3.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
