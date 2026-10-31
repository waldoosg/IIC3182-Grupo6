import type { SVGProps } from "react"

export function GymSeatIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <ellipse cx="12" cy="5" rx="4.4" ry="2.7" />
      <path d="M9.1 5h5.8" />
      <path d="M9.3 4.1v1.8M10.2 4.1v1.8M13.8 4.1v1.8M14.7 4.1v1.8" />
      <path d="M4.2 9.2h15.6V18H4.2z" />
      <path d="M3 20.2h18" />
      <path d="M9.2 18V12.4h5.6V18" />
      <path d="M12 12.4V18" />
      <circle cx="10.6" cy="15.1" r="0.45" fill="currentColor" stroke="none" />
      <circle cx="13.4" cy="15.1" r="0.45" fill="currentColor" stroke="none" />
    </svg>
  )
}
