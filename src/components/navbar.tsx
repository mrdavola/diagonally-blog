"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import { Logo } from "@/components/logo";
import { NAV_LINKS } from "@/lib/constants";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

export function Navbar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [onDark, setOnDark] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);

  const detectBackground = useCallback(() => {
    // Sample the element directly behind the navbar center
    const navHeight = 64;
    const sampleY = navHeight / 2;
    const sampleX = window.innerWidth / 2;

    // Temporarily hide the navbar so elementFromPoint hits what's behind it
    const nav = document.querySelector("nav");
    if (!nav) return;
    const prevPointerEvents = nav.style.pointerEvents;
    const prevVisibility = nav.style.visibility;
    nav.style.pointerEvents = "none";
    nav.style.visibility = "hidden";

    const el = document.elementFromPoint(sampleX, sampleY);

    nav.style.pointerEvents = prevPointerEvents;
    nav.style.visibility = prevVisibility;

    if (!el) return;

    // Walk up to find the section/element with a background
    let current: Element | null = el;
    while (current && current !== document.body) {
      const bg = getComputedStyle(current).backgroundColor;
      if (bg && bg !== "rgba(0, 0, 0, 0)" && bg !== "transparent") {
        // Parse rgb values to determine lightness
        const match = bg.match(/\d+/g);
        if (match) {
          const [r, g, b] = match.map(Number);
          const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
          setOnDark(luminance < 0.5);
        }
        return;
      }
      current = current.parentElement;
    }
    // Default to light background if nothing found
    setOnDark(false);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
      detectBackground();
    };
    detectBackground();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [detectBackground]);

  // Re-detect on route changes (new page may have different background)
  useEffect(() => {
    setScrolled(false);
    // Small delay to let the new page render before sampling
    const timeout = setTimeout(detectBackground, 50);
    return () => clearTimeout(timeout);
  }, [pathname, detectBackground]);

  const isDark = onDark;

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? onDark
            ? "bg-space-deep/95 backdrop-blur-md shadow-lg"
            : "bg-white/95 backdrop-blur-md shadow-sm border-b border-text-dark/5"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Logo variant={!onDark ? "dark" : "light"} size="md" />

        {/* Desktop Nav */}
        <div className="hidden lg:flex items-center gap-8">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`hover:text-blue-deep transition-colors duration-200 text-sm font-medium ${
                !onDark
                  ? "text-text-dark"
                  : "text-white/80"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Desktop CTA */}
        <div className="hidden lg:block">
          <Link
            href="/schools"
            className="inline-flex items-center justify-center bg-blue-deep text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-deep/80 transition-colors duration-200"
          >
            Request a Demo
          </Link>
        </div>

        {/* Mobile Hamburger */}
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger
            className={`lg:hidden p-2 rounded-md transition-colors ${
              !onDark
                ? "text-text-dark hover:bg-text-dark/5"
                : "text-white hover:bg-white/10"
            }`}
            aria-label="Open navigation menu"
          >
            <Menu size={24} />
          </SheetTrigger>
          <SheetContent side="right" className="bg-space-deep border-space-mid w-72">
            <div className="flex flex-col h-full pt-8">
              <div className="mb-8">
                <Logo variant="light" size="sm" />
              </div>

              <nav className="flex flex-col gap-2 flex-1">
                {NAV_LINKS.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className="text-text-light/80 hover:text-blue-primary transition-colors duration-200 py-3 px-2 text-base font-medium border-b border-white/5"
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>

              <div className="pb-8 pt-6">
                <Link
                  href="/schools"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center justify-center bg-blue-deep text-white px-5 py-3 rounded-xl text-sm font-semibold hover:bg-blue-deep/80 transition-colors duration-200 w-full"
                >
                  Request a Demo
                </Link>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </nav>
  );
}

export default Navbar;
