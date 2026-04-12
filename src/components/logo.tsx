import Link from "next/link";
import Image from "next/image";

interface LogoProps {
  variant?: "light" | "dark";
  size?: "sm" | "md" | "lg";
}

const sizeConfig = {
  sm: { text: "text-xl", icon: 28 },
  md: { text: "text-2xl", icon: 34 },
  lg: { text: "text-4xl", icon: 48 },
};

const variantClasses = {
  light: "text-white",
  dark: "text-text-dark",
};

export function Logo({ variant = "dark", size = "md" }: LogoProps) {
  const accentColor = variant === "dark" ? "text-blue-deep" : "text-blue-primary";
  const config = sizeConfig[size];

  return (
    <Link
      href="/"
      className={`inline-flex items-center gap-2 font-display font-bold tracking-tight no-underline ${config.text} ${variantClasses[variant]}`}
    >
      <Image
        src="/images/logo.svg"
        alt="Diagonally logo"
        width={config.icon}
        height={config.icon}
        className={variant === "light" ? "brightness-0 invert" : ""}
      />
      <span>
        <span className={accentColor}>D</span>
        <span>iagonal</span>
        <span
          className={`${accentColor} inline-block`}
          style={{ transform: "skewX(-12deg)", display: "inline-block" }}
        >
          l
        </span>
        <span>y</span>
      </span>
    </Link>
  );
}

export default Logo;
