export function StaticConstellationSVG() {
  return (
    <div className="absolute inset-0 flex items-center justify-center opacity-60">
      <svg width="100%" height="100%" viewBox="0 0 400 400" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="200" cy="200" r="40" fill="#0A0A22" stroke="#5B6CF7" strokeWidth="2" strokeOpacity="0.5" />
        <circle cx="280" cy="150" r="25" fill="#0A0A22" stroke="#5B6CF7" strokeWidth="2" strokeOpacity="0.5" />
        <circle cx="130" cy="120" r="20" fill="#0A0A22" stroke="#5B6CF7" strokeWidth="2" strokeOpacity="0.5" />
        <circle cx="160" cy="280" r="30" fill="#0A0A22" stroke="#5B6CF7" strokeWidth="2" strokeOpacity="0.5" />
        <circle cx="260" cy="270" r="15" fill="#0A0A22" stroke="#5B6CF7" strokeWidth="2" strokeOpacity="0.5" />
        
        <path d="M200 200 L280 150 M200 200 L130 120 M200 200 L160 280 M280 150 L260 270 M130 120 L160 280 M200 200 L260 270" stroke="#5B6CF7" strokeOpacity="0.3" strokeWidth="1" />
      </svg>
    </div>
  );
}
