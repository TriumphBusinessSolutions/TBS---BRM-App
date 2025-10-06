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

export function LayersIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} {...props}>
      <path
        d="M12 3 4 7.5 12 12l8-4.5L12 3zm0 18-8-4.5 3.6-2.1M12 21l8-4.5-3.6-2.1M12 12v9"
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

export function RefreshIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.8} {...props}>
      <path
        d="M4.5 6.5A6 6 0 0 1 16 9h-2.3M15.5 13.5A6 6 0 0 1 4 11h2.3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M6.3 4.5 4 6.5l2.3 2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M13.7 15.5 16 13.5l-2.3-2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
