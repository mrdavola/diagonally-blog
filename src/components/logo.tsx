import Link from "next/link";

interface LogoProps {
  variant?: "light" | "dark";
  size?: "sm" | "md" | "lg";
}

const sizeClasses = {
  sm: "text-xl",
  md: "text-2xl",
  lg: "text-4xl",
};

const variantClasses = {
  light: "text-white",
  dark: "text-text-dark",
};

export function Logo({ variant = "dark", size = "md" }: LogoProps) {
  return (
    <Link
      href="/"
      className={`inline-flex items-center font-display font-bold tracking-tight no-underline ${sizeClasses[size]} ${variantClasses[variant]}`}
      style={{ fontFamily: "var(--font-display)" }}
    >
      {/* D with blue-primary accent */}
      <span className="text-blue-primary">D</span>
      <span>iagonal</span>
      {/* The "l" gets a slight italic tilt to evoke the diagonal */}
      <span
        className="text-blue-primary inline-block"
        style={{ transform: "skewX(-12deg)", display: "inline-block" }}
      >
        l
      </span>
      <span>y</span>
    </Link>
  );
}

export default Logo;
