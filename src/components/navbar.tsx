"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { Logo } from "@/components/logo";
import { NAV_LINKS } from "@/lib/constants";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-space-deep/95 backdrop-blur-md shadow-lg"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Logo variant="light" size="md" />

        {/* Desktop Nav */}
        <div className="hidden lg:flex items-center gap-8">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-white/80 hover:text-blue-primary transition-colors duration-200 text-sm font-medium"
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Desktop CTA */}
        <div className="hidden lg:block">
          <Link
            href="/demo"
            className="inline-flex items-center justify-center bg-blue-deep text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-deep/80 transition-colors duration-200"
          >
            Request a Demo
          </Link>
        </div>

        {/* Mobile Hamburger */}
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger
            className="lg:hidden text-white p-2 rounded-md hover:bg-white/10 transition-colors"
            aria-label="Open navigation menu"
          >
            <Menu size={24} />
          </SheetTrigger>
          <SheetContent side="right" className="bg-space-deep border-space-mid w-72">
            <div className="flex flex-col h-full pt-8">
              {/* Mobile Logo */}
              <div className="mb-8">
                <Logo variant="light" size="sm" />
              </div>

              {/* Mobile Nav Links */}
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

              {/* Mobile CTA */}
              <div className="pb-8 pt-6">
                <Link
                  href="/demo"
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
