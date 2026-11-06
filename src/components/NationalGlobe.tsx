/** A small illustrated globe for the National Pokédex. */
export function NationalGlobe() {
  return (
    <svg className="national-globe" viewBox="0 0 64 64" fill="none" aria-hidden="true">
      <circle cx="32" cy="32" r="27" fill="#0b385c" />
      <circle cx="32" cy="31" r="23" fill="#3799c6" stroke="#092c50" strokeWidth="2" />
      <path
        d="M15 20c3-4 7-7 12-8l5 3-1 4-5 1-2 4-5 1-1 5-5-2a22 22 0 0 1 2-8Zm8 12 5-2 5 3 3 5-2 4-1 5-4 3-2-6-3-4-3-3 2-5Zm14-17 4-2a23 23 0 0 1 11 11l-5 2-4-2-1 4-5-1-3-5 3-3Zm5 22 6-2 4 3a22 22 0 0 1-6 9l-5-2-1-4 2-4Z"
        fill="#b7e69d"
        stroke="#427c63"
        strokeWidth="1.3"
        strokeLinejoin="round"
      />
      <path
        d="M15 31h34M32 10c-5 5-7 12-7 20m7-20c5 5 7 12 7 20"
        stroke="#d5f6f4"
        strokeWidth="1"
        opacity=".36"
      />
      <path
        d="M16 18a23 23 0 0 1 12-8"
        stroke="#effcff"
        strokeWidth="2.5"
        strokeLinecap="round"
        opacity=".8"
      />
      <path d="M23 58h18" stroke="#d4f0ff" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}
