interface WaveDividerProps {
  topColor: string;
  bottomColor: string;
  className?: string;
}

export function WaveDivider({ topColor, bottomColor, className = "" }: WaveDividerProps) {
  return (
    <div className={`relative overflow-hidden ${className}`} aria-hidden="true">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 1440 100"
        preserveAspectRatio="none"
        width="100%"
        height="100"
        style={{ display: "block" }}
      >
        {/* Top color fill */}
        <rect width="1440" height="55" fill={topColor} />
        {/* Wave path — bottom color fills from the curve down */}
        <path
          d="M0,55 C240,100 480,10 720,55 C960,100 1200,10 1440,55 L1440,100 L0,100 Z"
          fill={bottomColor}
        />
        {/* Smooth wave on top of that in top color for clean edge */}
        <path
          d="M0,55 C240,100 480,10 720,55 C960,100 1200,10 1440,55 L1440,0 L0,0 Z"
          fill={topColor}
        />
      </svg>
    </div>
  );
}

export default WaveDivider;
