// Sharp lightweight SVG flags for platform-agnostic color fidelity.
// Pure presentational components — no props, no state.

export const AustraliaFlag = () => (
  <svg className="w-5 h-5 rounded-full border border-gray-200 dark:border-slate-800 shrink-0" viewBox="0 0 30 30" fill="none">
    <rect width="30" height="30" fill="#00247D" />
    <path d="M0,0 L15,15 M15,0 L0,15" stroke="#FFFFFF" strokeWidth="2" />
    <path d="M0,0 L15,15 M15,0 L0,15" stroke="#E62212" strokeWidth="0.8" />
    <path d="M7.5,0 L7.5,15 M0,7.5 L15,7.5" stroke="#FFFFFF" strokeWidth="3" />
    <path d="M7.5,0 L7.5,15 M0,7.5 L15,7.5" stroke="#E62212" strokeWidth="1.2" />
    <polygon points="7.5,10.5 8.2,11.7 9.5,11.5 8.7,12.5 9.2,13.7 8,13.2 7,14 7,12.7 5.8,12.3 7,11.7" fill="#FFFFFF" transform="scale(0.8) translate(3, 4)" />
    <circle cx="22" cy="7" r="1" fill="#FFFFFF" />
    <circle cx="25" cy="12" r="1" fill="#FFFFFF" />
    <circle cx="22" cy="17" r="1" fill="#FFFFFF" />
    <circle cx="21" cy="22" r="1" fill="#FFFFFF" />
    <circle cx="18" cy="14" r="0.8" fill="#FFFFFF" />
  </svg>
);

export const MalaysiaFlag = () => (
  <svg className="w-5 h-5 rounded-full border border-gray-200 dark:border-slate-800 shrink-0" viewBox="0 0 30 30" fill="none">
    <rect width="30" height="30" fill="#FFFFFF" />
    {[0, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24, 26, 28].map((y, idx) => (
      idx % 2 === 0 && <rect key={y} x="0" y={y} width="30" height="2" fill="#E62212" />
    ))}
    <rect width="16" height="16" fill="#00247D" />
    <circle cx="6" cy="8" r="3.5" fill="#FFCC00" />
    <circle cx="7.5" cy="8" r="3.5" fill="#00247D" />
    <polygon points="11,8 12,9 13,8 12,7" fill="#FFCC00" />
    <polygon points="12,8 11,9 12,10 13,9" fill="#FFCC00" transform="rotate(45, 12, 8.5)" />
  </svg>
);

export const IndonesiaFlag = () => (
  <svg className="w-5 h-5 rounded-full border border-gray-200 dark:border-slate-800 shrink-0" viewBox="0 0 30 30" fill="none">
    <rect width="30" height="15" fill="#E62212" />
    <rect y="15" width="30" height="15" fill="#FFFFFF" />
  </svg>
);

export const SingaporeFlag = () => (
  <svg className="w-5 h-5 rounded-full border border-gray-200 dark:border-slate-800 shrink-0" viewBox="0 0 30 30" fill="none">
    <rect width="30" height="15" fill="#DF151A" />
    <rect y="15" width="30" height="15" fill="#FFFFFF" />
    <path d="M 5,4 A 3,3 0 0,0 5,10 A 2.5,2.5 0 0,1 5,4" fill="#FFFFFF" />
    <circle cx="8" cy="5" r="0.6" fill="#FFFFFF" />
    <circle cx="9.5" cy="6" r="0.6" fill="#FFFFFF" />
    <circle cx="9" cy="7.5" r="0.6" fill="#FFFFFF" />
    <circle cx="7.2" cy="7.5" r="0.6" fill="#FFFFFF" />
    <circle cx="6.5" cy="6" r="0.6" fill="#FFFFFF" />
  </svg>
);
