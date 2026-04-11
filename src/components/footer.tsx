"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
import { BookOpen, PlayCircle, GitFork } from "lucide-react";
import { Logo } from "@/components/logo";
import { NAV_LINKS, SOCIAL_LINKS, BRAND } from "@/lib/constants";
import { addNewsletterSubscriber } from "@/lib/submissions";

const ICON_MAP: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  BookOpen,
  Youtube: PlayCircle,
  Github: GitFork,
};

const RESOURCE_LINKS = [
  { label: "Blog", href: "/blog" },
  { label: "Research", href: "/research" },
  { label: "Press", href: "/press" },
  { label: "Newsletter", href: "/newsletter" },
];

export function Footer() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubscribe = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong.");
        return;
      }
      // Client-side Firestore write
      await addNewsletterSubscriber(email);
      setSuccess(true);
      setEmail("");
    } catch {
      setError("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <footer className="bg-space-deep text-text-light">
      {/* Gradient accent line */}
      <div className="h-0.5 bg-gradient-to-r from-blue-primary via-emerald to-gold" />

      {/* Main content */}
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">

          {/* Column 1: Brand */}
          <div className="flex flex-col gap-4">
            <Logo variant="light" size="md" />
            <p className="text-text-light/70 text-sm font-display tracking-wide italic">
              {BRAND.tagline}
            </p>
            <p className="text-text-light/60 text-sm leading-relaxed">
              {BRAND.description}
            </p>
          </div>

          {/* Column 2: Navigation */}
          <div className="flex flex-col gap-4">
            <h3
              className="text-white text-sm uppercase tracking-wider font-display font-semibold"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Navigate
            </h3>
            <ul className="flex flex-col gap-2">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-text-light/60 hover:text-white transition-colors duration-200 text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Resources */}
          <div className="flex flex-col gap-4">
            <h3
              className="text-white text-sm uppercase tracking-wider font-display font-semibold"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Resources
            </h3>
            <ul className="flex flex-col gap-2">
              {RESOURCE_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-text-light/60 hover:text-white transition-colors duration-200 text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Connect */}
          <div className="flex flex-col gap-4">
            <h3
              className="text-white text-sm uppercase tracking-wider font-display font-semibold"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Connect
            </h3>

            {/* Social links */}
            <ul className="flex flex-col gap-2 mb-2">
              {SOCIAL_LINKS.map((link) => {
                const Icon = ICON_MAP[link.icon];
                return (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-text-light/60 hover:text-white transition-colors duration-200 text-sm"
                    >
                      {Icon && <Icon size={14} className="shrink-0" />}
                      {link.label}
                    </Link>
                  </li>
                );
              })}
            </ul>

            {/* Newsletter signup */}
            <div className="flex flex-col gap-2">
              <p className="text-text-light/60 text-xs uppercase tracking-wide">
                Stay in the loop
              </p>
              {success ? (
                <p className="text-emerald text-sm font-medium">You&rsquo;re subscribed!</p>
              ) : (
                <form onSubmit={handleSubscribe} className="flex flex-col gap-2">
                  <input
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="bg-white/5 border border-white/10 text-text-light placeholder:text-text-light/30 px-3 py-2 rounded-lg text-sm focus:outline-none focus:border-blue-primary transition-colors"
                  />
                  <button
                    type="submit"
                    disabled={loading}
                    className="bg-blue-deep hover:bg-blue-deep/80 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? "Subscribing…" : "Subscribe"}
                  </button>
                  {error && <p className="text-red-400 text-xs">{error}</p>}
                </form>
              )}
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-16 pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-text-light/40 text-sm">
          <p>© 2026 Diagonally. All rights reserved.</p>
          <p>
            Open source at heart.{" "}
            <Link
              href="https://github.com/mrdavola/option-c"
              target="_blank"
              rel="noopener noreferrer"
              className="text-text-light/60 hover:text-white transition-colors duration-200 inline-flex items-center gap-1"
            >
              <GitFork size={12} />
              GitHub
            </Link>
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
