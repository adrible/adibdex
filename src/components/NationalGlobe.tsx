/** A small illustrated globe for the National Pokédex. */
export function NationalGlobe() {
  return (
    <svg className="national-globe" viewBox="0 0 64 64" fill="none" aria-hidden="true">
      <circle cx="32" cy="32" r="27" fill="#0b385c" />
      <circle cx="32" cy="31" r="23" fill="#3799c6" stroke="#092c50" strokeWidth="2" />
      <path
        d="M13 20c2-4 7-7 12-9l4 2 3 1-1 4-4 1-2 3-4 1-1 3-3 1-4-2c-.4-2 0-4 0-5Zm9 10 5-1 4 2 3 3 1 4-2 3-1 5-3 4-2-2-1-5-3-3-2-4-2-2 3-4Zm13-14 4-3 3 1c4 2 8 6 10 10l-4 2-4-2-2 3-4-1-1-3-3-2-2-3 3-2Zm6 22 5-3 4 1 2 3c-1 3-3 6-6 8l-4-1-2-3 1-5Z"
        fill="#b8e6a0"
        stroke="#497e61"
        strokeWidth="1.3"
        strokeLinejoin="round"
      />
      <path
        d="M16 20c2-3 5-5 8-6m2 19 3 1 2 4m8-20 3-2 4 2m-2 22 3-2"
        stroke="#dcf4bf"
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity=".8"
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
