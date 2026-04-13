"use client"

import Image from "next/image"

/**
 * Lightweight, non-interactive preview of the site navbar and footer
 * rendered inside the editor canvas iframe for WYSIWYG fidelity.
 */

const NAV_LABELS = ["Home", "About", "For Schools", "For Parents", "Blog", "Research"]

export function PreviewNavbar() {
  return (
    <nav
      className="sticky top-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-b border-text-dark/5"
      style={{ pointerEvents: "none" }}
    >
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <span className="inline-flex items-center gap-2 font-display font-bold tracking-tight text-2xl text-text-dark">
          <Image
            src="/images/logo.svg"
            alt="Diagonally logo"
            width={34}
            height={34}
          />
          <span>
            <span className="text-blue-deep">D</span>
            <span>iagonal</span>
            <span
              className="text-blue-deep inline-block"
              style={{ transform: "skewX(-12deg)", display: "inline-block" }}
            >
              l
            </span>
            <span>y</span>
          </span>
        </span>

        {/* Nav links */}
        <div className="hidden lg:flex items-center gap-8">
          {NAV_LABELS.map((label) => (
            <span
              key={label}
              className="text-text-dark text-sm font-medium"
            >
              {label}
            </span>
          ))}
        </div>

        {/* CTA */}
        <div className="hidden lg:block">
          <span className="inline-flex items-center justify-center bg-blue-deep text-white px-5 py-2.5 rounded-xl text-sm font-semibold">
            Request a Demo
          </span>
        </div>
      </div>
    </nav>
  )
}

export function PreviewFooter() {
  return (
    <footer
      className="bg-space-deep text-text-light"
      style={{ pointerEvents: "none" }}
    >
      {/* Gradient accent line */}
      <div className="h-px bg-gradient-to-r from-blue-primary via-emerald to-gold" />

      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <span className="inline-flex items-center gap-2 font-display font-bold tracking-tight text-xl text-white">
              <Image
                src="/images/logo.svg"
                alt="Diagonally logo"
                width={28}
                height={28}
                className="brightness-0 invert"
              />
              <span>
                <span className="text-blue-primary">D</span>
                <span>iagonal</span>
                <span
                  className="text-blue-primary inline-block"
                  style={{ transform: "skewX(-12deg)", display: "inline-block" }}
                >
                  l
                </span>
                <span>y</span>
              </span>
            </span>
            <p className="mt-3 text-sm text-text-light/60 leading-relaxed">
              Math games built by students, for students.
            </p>
          </div>

          {/* Placeholder columns */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-4">Platform</h4>
            <div className="flex flex-col gap-2 text-sm text-text-light/60">
              <span>For Schools</span>
              <span>For Parents</span>
              <span>Research</span>
            </div>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-white mb-4">Company</h4>
            <div className="flex flex-col gap-2 text-sm text-text-light/60">
              <span>About</span>
              <span>Blog</span>
              <span>Contact</span>
            </div>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-white mb-4">Connect</h4>
            <div className="flex flex-col gap-2 text-sm text-text-light/60">
              <span>Newsletter</span>
              <span>YouTube</span>
              <span>GitHub</span>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-white/10 text-center text-xs text-text-light/40">
          &copy; {new Date().getFullYear()} Diagonally. All rights reserved.
        </div>
      </div>
    </footer>
  )
}
