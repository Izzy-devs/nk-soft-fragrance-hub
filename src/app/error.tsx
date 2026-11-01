"use client";

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <main className="container-x section text-center">
      <h1 className="text-4xl">Something went wrong</h1>
      <p className="mt-4 text-taupe">We could not load this page. Please try again.</p>
      <button onClick={reset} className="btn btn-dark mt-8">Try again</button>
    </main>
  );
}
