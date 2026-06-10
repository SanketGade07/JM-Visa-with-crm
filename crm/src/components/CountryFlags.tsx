import React from "react";

// Sharp lightweight SVG flags for platform-agnostic color fidelity.
// Pure presentational components — no props, no state.

const ROUND_FLAG = "w-5 h-5 rounded-full border border-gray-200 dark:border-slate-800 shrink-0";
const RECT_FLAG = "w-5 h-3.5 rounded-[2px] border border-gray-200 dark:border-slate-700/40 shrink-0";

function RectFlag({ children }: { children: React.ReactNode }) {
  return (
    <svg className={RECT_FLAG} viewBox="0 0 30 20" fill="none" aria-hidden>
      {children}
    </svg>
  );
}

export const AustraliaFlag = () => (
  <svg className={ROUND_FLAG} viewBox="0 0 30 30" fill="none">
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
  <svg className={ROUND_FLAG} viewBox="0 0 30 30" fill="none">
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
  <svg className={ROUND_FLAG} viewBox="0 0 30 30" fill="none">
    <rect width="30" height="15" fill="#E62212" />
    <rect y="15" width="30" height="15" fill="#FFFFFF" />
  </svg>
);

export const SingaporeFlag = () => (
  <svg className={ROUND_FLAG} viewBox="0 0 30 30" fill="none">
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

const RectAustraliaFlag = () => (
  <RectFlag>
    <rect width="30" height="20" fill="#00247D" />
    <path d="M0,0 L10,10 M10,0 L0,10" stroke="#FFFFFF" strokeWidth="1.2" />
    <path d="M0,0 L10,10 M10,0 L0,10" stroke="#E62212" strokeWidth="0.5" />
    <path d="M5,0 L5,10 M0,5 L10,5" stroke="#FFFFFF" strokeWidth="1.8" />
    <path d="M5,0 L5,10 M0,5 L10,5" stroke="#E62212" strokeWidth="0.7" />
    <circle cx="22" cy="5" r="0.8" fill="#FFFFFF" />
    <circle cx="25" cy="10" r="0.8" fill="#FFFFFF" />
    <circle cx="22" cy="15" r="0.8" fill="#FFFFFF" />
  </RectFlag>
);

const RectUKFlag = () => (
  <RectFlag>
    <rect width="30" height="20" fill="#012169" />
    <path d="M0,0 L30,20 M30,0 L0,20" stroke="#FFFFFF" strokeWidth="3" />
    <path d="M0,0 L30,20 M30,0 L0,20" stroke="#C8102E" strokeWidth="1.2" />
    <path d="M15,0 L15,20 M0,10 L30,10" stroke="#FFFFFF" strokeWidth="5" />
    <path d="M15,0 L15,20 M0,10 L30,10" stroke="#C8102E" strokeWidth="2.5" />
  </RectFlag>
);

const RectUSAFlag = () => (
  <RectFlag>
    <rect width="30" height="20" fill="#B22234" />
    {[2, 4, 6, 8, 10, 12, 14, 16, 18].map((y) => (
      <rect key={y} x="0" y={y} width="30" height="1.4" fill="#FFFFFF" />
    ))}
    <rect width="12" height="11" fill="#3C3B6E" />
    {[2, 5, 8].map((cy) =>
      [2, 5, 8, 11].map((cx) => <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="0.5" fill="#FFFFFF" />)
    )}
  </RectFlag>
);

const RectFranceFlag = () => (
  <RectFlag>
    <rect width="10" height="20" fill="#002395" />
    <rect x="10" width="10" height="20" fill="#FFFFFF" />
    <rect x="20" width="10" height="20" fill="#ED2939" />
  </RectFlag>
);

const RectGermanyFlag = () => (
  <RectFlag>
    <rect width="30" height="6.67" fill="#000000" />
    <rect y="6.67" width="30" height="6.67" fill="#DD0000" />
    <rect y="13.34" width="30" height="6.66" fill="#FFCE00" />
  </RectFlag>
);

const RectCanadaFlag = () => (
  <RectFlag>
    <rect width="30" height="20" fill="#FF0000" />
    <rect x="7" width="16" height="20" fill="#FFFFFF" />
    <path d="M15 4 L17 9 L22 9 L18 12 L19 17 L15 14 L11 17 L12 12 L8 9 L13 9 Z" fill="#FF0000" />
  </RectFlag>
);

const RectIndiaFlag = () => (
  <RectFlag>
    <rect width="30" height="6.67" fill="#FF9933" />
    <rect y="6.67" width="30" height="6.67" fill="#FFFFFF" />
    <rect y="13.34" width="30" height="6.66" fill="#138808" />
    <circle cx="15" cy="10" r="2.2" fill="none" stroke="#000080" strokeWidth="0.5" />
  </RectFlag>
);

const RectSwedenFlag = () => (
  <RectFlag>
    <rect width="30" height="20" fill="#006AA7" />
    <rect x="8" width="3" height="20" fill="#FECC00" />
    <rect y="8" width="30" height="3" fill="#FECC00" />
  </RectFlag>
);

const RectIrelandFlag = () => (
  <RectFlag>
    <rect width="10" height="20" fill="#169B62" />
    <rect x="10" width="10" height="20" fill="#FFFFFF" />
    <rect x="20" width="10" height="20" fill="#FF883E" />
  </RectFlag>
);

const RectNetherlandsFlag = () => (
  <RectFlag>
    <rect width="30" height="6.67" fill="#AE1C28" />
    <rect y="6.67" width="30" height="6.67" fill="#FFFFFF" />
    <rect y="13.34" width="30" height="6.66" fill="#21468B" />
  </RectFlag>
);

const RectNewZealandFlag = () => (
  <RectFlag>
    <rect width="30" height="20" fill="#00247D" />
    <rect width="12" height="10" fill="#00247D" />
    <path d="M0,0 L12,10 M12,0 L0,10" stroke="#FFFFFF" strokeWidth="1.2" />
    <path d="M6,0 L6,10 M0,5 L12,5" stroke="#FFFFFF" strokeWidth="1.8" />
    <path d="M0,0 L12,10 M12,0 L0,10" stroke="#C8102E" strokeWidth="0.5" />
    <circle cx="20" cy="6" r="1.2" fill="#FFFFFF" />
    <circle cx="24" cy="10" r="0.9" fill="#FFFFFF" />
    <circle cx="21" cy="14" r="0.8" fill="#FFFFFF" />
  </RectFlag>
);

const RectJapanFlag = () => (
  <RectFlag>
    <rect width="30" height="20" fill="#FFFFFF" />
    <circle cx="15" cy="10" r="5" fill="#BC002D" />
  </RectFlag>
);

const RectMalaysiaFlag = () => (
  <RectFlag>
    <rect width="30" height="20" fill="#FFFFFF" />
    {[0, 2, 4, 6, 8, 10, 12, 14, 16, 18].map((y, idx) =>
      idx % 2 === 0 ? <rect key={y} x="0" y={y} width="30" height="2" fill="#CC0001" /> : null
    )}
    <rect width="14" height="10" fill="#010066" />
    <circle cx="5" cy="5" r="2.5" fill="#FFCC00" />
    <circle cx="6.2" cy="5" r="2.5" fill="#010066" />
  </RectFlag>
);

const RectIndonesiaFlag = () => (
  <RectFlag>
    <rect width="30" height="10" fill="#E62212" />
    <rect y="10" width="30" height="10" fill="#FFFFFF" />
  </RectFlag>
);

const RectSingaporeFlag = () => (
  <RectFlag>
    <rect width="30" height="10" fill="#DF151A" />
    <rect y="10" width="30" height="10" fill="#FFFFFF" />
    <circle cx="6" cy="5" r="2" fill="#FFFFFF" />
  </RectFlag>
);

const RectEuropeFlag = () => (
  <RectFlag>
    <rect width="30" height="20" fill="#003399" />
    {[...Array(8)].map((_, i) => {
      const angle = (i * Math.PI) / 4 - Math.PI / 2;
      const cx = 15 + Math.cos(angle) * 5;
      const cy = 10 + Math.sin(angle) * 5;
      return <circle key={i} cx={cx} cy={cy} r="1" fill="#FFCC00" />;
    })}
  </RectFlag>
);

const COUNTRY_FLAG_MAP: Record<string, () => React.ReactElement> = {
  Australia: RectAustraliaFlag,
  Malaysia: RectMalaysiaFlag,
  Indonesia: RectIndonesiaFlag,
  Singapore: RectSingaporeFlag,
  UK: RectUKFlag,
  "United Kingdom": RectUKFlag,
  USA: RectUSAFlag,
  "United States": RectUSAFlag,
  France: RectFranceFlag,
  Germany: RectGermanyFlag,
  Canada: RectCanadaFlag,
  India: RectIndiaFlag,
  Sweden: RectSwedenFlag,
  Ireland: RectIrelandFlag,
  Netherlands: RectNetherlandsFlag,
  "New Zealand": RectNewZealandFlag,
  Japan: RectJapanFlag,
  Europe: RectEuropeFlag,
};

export function getCountryFlag(country: string): React.ReactElement {
  const Flag = COUNTRY_FLAG_MAP[country];
  if (Flag) return <Flag />;

  const code = country.slice(0, 2).toUpperCase();
  return (
    <span className={`${RECT_FLAG} inline-flex items-center justify-center text-[6px] font-bold text-slate-300 uppercase bg-gradient-to-br from-slate-600 to-slate-700`}>
      {code}
    </span>
  );
}
