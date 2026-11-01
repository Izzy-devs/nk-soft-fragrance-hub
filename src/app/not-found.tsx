import Link from "next/link";

export default function NotFound() {
  return (
    <main className="container-x section text-center">
      <h1 className="text-5xl">Page not found</h1>
      <p className="mt-4 text-taupe">The page you are looking for does not exist or has moved.</p>
      <Link href="/shop" className="btn btn-dark mt-8">Browse the shop</Link>
    </main>
  );
}
