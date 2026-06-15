import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground px-6 text-center">
      <h1 className="text-8xl font-bold text-primary font-display">404</h1>
      <p className="mt-4 text-lg text-muted-foreground max-w-md">
        This section of the wall is blank. No rank marker here.
      </p>
      <Link
        href="/"
        className="mt-8 px-8 py-3 bg-primary text-primary-foreground font-semibold rounded text-sm tracking-wide"
      >
        Return to the Arena
      </Link>
    </div>
  );
}
