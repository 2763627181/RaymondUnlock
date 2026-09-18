import type { SVGProps } from "react";

/**
 * lucide-react retiró los iconos de marca (Instagram, Threads, etc.) de su
 * catálogo. Se implementan aquí como SVG propios en vez de sumar una
 * dependencia nueva solo para dos iconos.
 */

export function InstagramIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <rect x={2} y={2} width={20} height={20} rx={5} ry={5} />
      <path d="M16 11.37a4 4 0 1 1-7.914 1.174A4 4 0 0 1 16 11.37Z" />
      <line x1={17.5} y1={6.5} x2={17.51} y2={6.5} />
    </svg>
  );
}

export function ThreadsIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M12.2 22c-2.9 0-5.2-.9-6.8-2.7-1.5-1.6-2.3-3.9-2.3-6.9v-.8c0-3 .8-5.4 2.3-7C7 2.9 9.2 2 12 2c2.7 0 4.9.8 6.4 2.3 1.4 1.4 2.2 3.3 2.4 5.6l-2.2.2c-.2-1.8-.7-3.2-1.7-4.2C15.8 4.7 14.1 4.1 12 4.1c-2.2 0-3.9.7-5.1 2-1.2 1.3-1.8 3.2-1.8 5.7v.7c0 2.5.6 4.4 1.8 5.7 1.2 1.3 2.9 2 5.1 2 1.9 0 3.4-.5 4.4-1.4.9-.8 1.4-1.9 1.5-3.2-.7.3-1.6.5-2.7.5-1.6 0-2.9-.4-3.8-1.2-.9-.8-1.4-1.9-1.4-3.1 0-1.3.5-2.4 1.5-3.2 1-.8 2.3-1.2 3.9-1.2 1 0 2 .2 2.8.5-.1-.8-.4-1.4-.9-1.9-.6-.6-1.5-.9-2.6-.9-1.3 0-2.4.4-3.2 1.2l-1.7-1.4C9 3.8 10.7 3.2 12.6 3.2c1.7 0 3.1.5 4.1 1.5 1 1 1.6 2.4 1.7 4.1l.1 2.1c1 .5 1.7 1.2 2.2 2.1.6 1 .9 2.2.9 3.6 0 2-.7 3.6-2 4.8-1.4 1.2-3.3 1.9-5.6 1.9Zm.6-9.9c-1 0-1.8.2-2.4.7-.5.4-.8 1-.8 1.6 0 .6.3 1.1.8 1.5.6.4 1.4.6 2.3.6 1 0 1.9-.2 2.6-.5.5-.2.9-.5 1.2-.8-.1-.7-.3-1.3-.7-1.8-.6-.8-1.6-1.3-3-1.3Z" />
    </svg>
  );
}
