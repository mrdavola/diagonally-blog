"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import { Logo } from "@/components/logo";
import { NAV_LINKS } from "@/lib/constants";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { collection, getDocs, query, where, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";

type NavLink = { label: string; href: string }

export function Navbar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [onDark, setOnDark] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [navLinks, setNavLinks] = useState<NavLink[]>(NAV_LINKS);

  useEffect(() => {
    async function loadNav() {
      try {
        const snap = await getDocs(
          query(
            collection(db, "pages"),
            where("showInNav", "==", true),
            orderBy("navOrder")
          )
        );
        const links: NavLink[] = snap.docs.map((d) => {
          const data = d.data() as { navLabel?: string; title?: string };
          return {
            label: data.navLabel || data.title || d.id,
            href: d.id === "home" ? "/" : `/${d.id}`,
          };
        });
        // Always include Blog as a hardcoded entry
        links.push({ label: "Blog", href: "/blog" });
        if (links.length > 0) setNavLinks(links);
      } catch {
        // Fall back to hardcoded NAV_LINKS on error
      }
    }
    loadNav();
  }, []);

  const detectBackground = useCallback(() => {
    const navHeight = 64;
    const sampleY = navHeight / 2 + window.scrollY;

    // Find which section is behind the navbar by checking all sections
    const sections = document.querySelectorAll("main section, main > div");
    let targetEl: Element | null = null;

    for (const section of sections) {
      const rect = section.getBoundingClientRect();
      if (rect.top <= navHeight && rect.bottom > 0) {
        targetEl = section;
        break;
      }
    }

    // Fallback to first section
    if (!targetEl) {
      const main = document.querySelector("main");
      targetEl = main?.querySelector("section") || main?.firstElementChild || null;
    }

    if (!targetEl) return;

    // Walk up looking for a background color
    let current: Element | null = targetEl;
    while (current && current !== document.documentElement) {
      const styles = getComputedStyle(current);
      const bg = styles.backgroundColor;

      if (bg && bg !== "rgba(0, 0, 0, 0)" && bg !== "transparent") {
        // Parse the resolved color — browsers resolve to rgb()/rgba()
        const match = bg.match(/rgba?\(\s*([\d.]+),\s*([\d.]+),\s*([\d.]+)/);
        if (match) {
          const r = parseFloat(match[1]);
          const g = parseFloat(match[2]);
          const b = parseFloat(match[3]);
          const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
          setOnDark(luminance < 0.5);
          return;
        }

        // For oklch/lab/etc that browser didn't resolve to rgb,
        // use a temporary element to force conversion
        const temp = document.createElement("div");
        temp.style.backgroundColor = bg;
        temp.style.display = "none";
        document.body.appendChild(temp);
        const resolved = getComputedStyle(temp).backgroundColor;
        document.body.removeChild(temp);

        const resolvedMatch = resolved.match(/rgba?\(\s*([\d.]+),\s*([\d.]+),\s*([\d.]+)/);
        if (resolvedMatch) {
          const r = parseFloat(resolvedMatch[1]);
          const g = parseFloat(resolvedMatch[2]);
          const b = parseFloat(resolvedMatch[3]);
          const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
          setOnDark(luminance < 0.5);
          return;
        }

        // Last resort: check class names for known dark patterns
        break;
      }
      current = current.parentElement;
    }

    // Fallback: check if the target element or ancestors have dark-themed classes
    current = targetEl;
    while (current && current !== document.documentElement) {
      const classes = current.className || "";
      if (/bg-space|bg-dark|bg-black|bg-gray-9|bg-slate-9|bg-neutral-9/.test(classes)) {
        setOnDark(true);
        return;
      }
      if (/bg-white|bg-cream|bg-gray-[1-3]|bg-slate-[1-3]|bg-neutral-[1-3]/.test(classes)) {
        setOnDark(false);
        return;
      }
      current = current.parentElement;
    }

    setOnDark(false);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
      detectBackground();
    };
    // Try multiple times to catch the background once it's painted
    detectBackground();
    const raf = requestAnimationFrame(() => detectBackground());
    const t1 = setTimeout(() => detectBackground(), 100);
    const t2 = setTimeout(() => detectBackground(), 300);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(t1);
      clearTimeout(t2);
      window.removeEventListener("scroll", handleScroll);
    };
  }, [detectBackground]);

  // Re-detect on route changes (new page may have different background)
  useEffect(() => {
    setScrolled(false);
    // Try multiple times as new page content paints
    detectBackground();
    const raf = requestAnimationFrame(() => detectBackground());
    const t1 = setTimeout(() => detectBackground(), 100);
    const t2 = setTimeout(() => detectBackground(), 300);
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(t1);
      clearTimeout(t2);
    };
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
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`hover:text-blue-deep transition-colors duration-200 text-sm font-medium ${
                !onDark
                  ? "text-text-dark"
                  : "text-white"
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
                {navLinks.map((link) => (
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
