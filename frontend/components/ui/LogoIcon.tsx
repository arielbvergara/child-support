interface LogoIconProps {
  className?: string;
}

export function LogoIcon({ className = 'bg-primary' }: LogoIconProps) {
  return (
    <div className={`flex h-9 w-9 items-center justify-center rounded-lg text-white ${className}`}>
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-5 w-5"
        aria-hidden="true"
      >
        <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2" />
        <path d="M12 8v4l3 3" />
      </svg>
    </div>
  );
}
