export function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`rounded-md bg-surface motion-safe:animate-pulse ${className}`} />;
}
