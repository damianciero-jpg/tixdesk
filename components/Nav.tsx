import Link from "next/link";

export function Nav() {
  return (
    <header className="sticky top-0 z-40 border-b border-neutral-800 bg-neutral-950/90 backdrop-blur">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <Link
          href="/"
          className="text-xl font-black tracking-tight text-white"
        >
          TIX<span className="text-pink-500">DESK</span>
        </Link>
        <div className="flex items-center gap-5 text-sm font-medium text-neutral-300">
          <Link href="/" className="transition hover:text-white">
            Events
          </Link>
          <Link href="/careers" className="transition hover:text-white">
            Careers
          </Link>
          <Link href="/worker" className="transition hover:text-white">
            Worker
          </Link>
          <Link href="/admin" className="transition hover:text-white">
            Admin
          </Link>
        </div>
      </nav>
    </header>
  );
}
