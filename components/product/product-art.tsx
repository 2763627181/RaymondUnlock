import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

const DEFAULT_COLOR = "#C9CCD2";

function clampChannel(value: number): number {
  return Math.max(0, Math.min(255, Math.round(value)));
}

/** amount > 0 aclara hacia blanco; amount < 0 oscurece hacia negro. */
function shade(hex: string, amount: number): string {
  const clean = hex.replace("#", "");
  const full =
    clean.length === 3
      ? clean
          .split("")
          .map((char) => char + char)
          .join("")
      : clean;
  const target = amount >= 0 ? 255 : 0;
  const ratio = Math.abs(amount);
  const channels = [0, 2, 4].map((offset) => {
    const value = Number.parseInt(full.slice(offset, offset + 2), 16);
    return clampChannel(value + (target - value) * ratio);
  });
  return `#${channels.map((channel) => channel.toString(16).padStart(2, "0")).join("")}`;
}

type ArtKind = "phone" | "tablet" | "headphones" | "watch" | "plug" | "speaker";

const KIND_BY_ICON: Record<string, ArtKind> = {
  smartphone: "phone",
  tablet: "tablet",
  headphones: "headphones",
  watch: "watch",
  plug: "plug",
  speaker: "speaker",
};

function Phone({ base, gradient }: { base: string; gradient: string }) {
  const lens = (cx: number, cy: number) => (
    <g key={`${cx}-${cy}`}>
      <circle cx={cx} cy={cy} r={7.5} fill="#14161a" />
      <circle cx={cx} cy={cy} r={4.6} fill="#2a2f3a" />
      <circle cx={cx - 1.4} cy={cy - 1.4} r={1.2} fill="#8fa0c0" opacity={0.7} />
    </g>
  );
  return (
    <>
      <rect x={78} y={22} width={84} height={184} rx={18} fill={`url(#${gradient})`} />
      <rect x={76} y={70} width={3} height={18} rx={1.5} fill={shade(base, -0.18)} />
      <rect x={76} y={96} width={3} height={18} rx={1.5} fill={shade(base, -0.18)} />
      <rect x={161} y={88} width={3} height={32} rx={1.5} fill={shade(base, -0.18)} />
      <rect x={88} y={32} width={40} height={44} rx={11} fill={shade(base, -0.08)} opacity={0.9} />
      {lens(99, 45)}
      {lens(117, 45)}
      {lens(108, 63)}
      <circle cx={120} cy={142} r={9} fill="#fff" opacity={0.14} />
    </>
  );
}

function Tablet({ base, gradient }: { base: string; gradient: string }) {
  return (
    <>
      <rect x={44} y={34} width={152} height={172} rx={16} fill={`url(#${gradient})`} />
      <rect x={52} y={42} width={136} height={156} rx={8} fill="#11141b" />
      <path d="M52 150 L188 96 V198 H52 Z" fill="#fff" opacity={0.04} />
      <circle cx={120} cy={38} r={1.8} fill={shade(base, -0.35)} />
    </>
  );
}

function Headphones({ base, gradient }: { base: string; gradient: string }) {
  return (
    <>
      <path
        d="M70 132 C70 40 170 40 170 132"
        fill="none"
        stroke={shade(base, -0.12)}
        strokeWidth={11}
        strokeLinecap="round"
      />
      <rect x={50} y={108} width={38} height={72} rx={18} fill={`url(#${gradient})`} />
      <rect x={152} y={108} width={38} height={72} rx={18} fill={`url(#${gradient})`} />
      <rect x={80} y={116} width={12} height={56} rx={6} fill={shade(base, -0.3)} opacity={0.7} />
      <rect x={148} y={116} width={12} height={56} rx={6} fill={shade(base, -0.3)} opacity={0.7} />
    </>
  );
}

function Watch({ base, gradient }: { base: string; gradient: string }) {
  return (
    <>
      <rect x={98} y={16} width={44} height={60} rx={10} fill={shade(base, -0.1)} />
      <rect x={98} y={164} width={44} height={60} rx={10} fill={shade(base, -0.1)} />
      <rect x={72} y={62} width={96} height={116} rx={28} fill={`url(#${gradient})`} />
      <rect x={168} y={98} width={5} height={18} rx={2.5} fill={shade(base, -0.25)} />
      <rect x={80} y={70} width={80} height={100} rx={22} fill="#0f1218" />
      <circle cx={120} cy={120} r={26} fill="none" stroke="#fff" strokeWidth={2} opacity={0.35} />
      <path
        d="M120 120 V102 M120 120 L133 128"
        stroke="#fff"
        strokeWidth={2.5}
        strokeLinecap="round"
        opacity={0.8}
      />
    </>
  );
}

function Plug({ base, gradient }: { base: string; gradient: string }) {
  return (
    <>
      <rect x={104} y={48} width={7} height={26} rx={2} fill="#b9bdc6" />
      <rect x={129} y={48} width={7} height={26} rx={2} fill="#b9bdc6" />
      <rect x={86} y={70} width={68} height={92} rx={12} fill={`url(#${gradient})`} />
      <rect x={106} y={144} width={28} height={8} rx={4} fill={shade(base, -0.45)} />
      <rect x={96} y={82} width={48} height={2} rx={1} fill={shade(base, -0.15)} />
    </>
  );
}

function SpeakerArt({ base, gradient }: { base: string; gradient: string }) {
  const dots: ReactNode[] = [];
  for (let row = 0; row < 4; row += 1) {
    for (let col = 0; col < 7; col += 1) {
      dots.push(
        <circle
          key={`${row}-${col}`}
          cx={92 + col * 9.3}
          cy={113 + row * 9.3}
          r={2.1}
          fill={shade(base, -0.4)}
          opacity={0.7}
        />,
      );
    }
  }
  return (
    <>
      <path
        d="M78 104 C78 78 92 72 104 72"
        fill="none"
        stroke={shade(base, -0.2)}
        strokeWidth={5}
        strokeLinecap="round"
      />
      <rect x={68} y={98} width={104} height={80} rx={30} fill={`url(#${gradient})`} />
      {dots}
    </>
  );
}

export function ProductArt({
  icon,
  color,
  label,
  className,
}: {
  icon: string | null;
  color?: string | null;
  label: string;
  className?: string;
}) {
  const base = color ?? DEFAULT_COLOR;
  const kind = (icon ? KIND_BY_ICON[icon] : undefined) ?? "phone";
  const gradient = `art-${kind}-${base.replace("#", "")}`;
  const props = { base, gradient };

  return (
    <svg viewBox="0 0 240 240" role="img" aria-label={label} className={cn("size-full", className)}>
      <defs>
        <linearGradient id={gradient} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={shade(base, 0.22)} />
          <stop offset="0.55" stopColor={base} />
          <stop offset="1" stopColor={shade(base, -0.2)} />
        </linearGradient>
      </defs>
      <ellipse cx={120} cy={228} rx={58} ry={6} fill="#000" opacity={0.07} />
      {kind === "phone" && <Phone {...props} />}
      {kind === "tablet" && <Tablet {...props} />}
      {kind === "headphones" && <Headphones {...props} />}
      {kind === "watch" && <Watch {...props} />}
      {kind === "plug" && <Plug {...props} />}
      {kind === "speaker" && <SpeakerArt {...props} />}
    </svg>
  );
}
