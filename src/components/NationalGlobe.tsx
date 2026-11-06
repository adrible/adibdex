import { useId } from 'react';

/** A small illustrated globe for the National Pokédex. */
export function NationalGlobe() {
  const clipId = useId();
  return (
    <svg className="national-globe" viewBox="0 0 64 64" fill="none" aria-hidden="true">
      <defs>
        <clipPath id={clipId}>
          <circle cx="32" cy="31" r="22" />
        </clipPath>
      </defs>
      <circle cx="32" cy="32" r="27" fill="#0b385c" />
      <circle cx="32" cy="31" r="23" fill="#3799c6" stroke="#092c50" strokeWidth="2" />
      <g clipPath={`url(#${clipId})`}>
        <path
          d="M12 21c1-3 4-7 8-9 3-2 6-3 8-2l2 2c1 1 0 2-2 2l-3-1c-1 0-1 2-3 2s-3 0-3 2c0 2 1 3 2 2l2-3c1-1 3-1 4 0s0 2 1 3l1 2-4 1c-2 1-2 2-4 3s-1 2-2 3l-2 2-1 3-1-2c-1-2-4-1-5 0-1 2-1 4 0 5l2-1 1 1-1 1 2 2c0 2 1 3 3 3l2-1 2 1c2 0 2 1 3 2l2 1 3 3 4 3c1 1 0 3-1 4l-2 2-1 3-3 3-2 3c-1 0-2-1-3-2l-2-4-1-4-2-3-2-2c-2-1-2-3-1-5l1-2c0-1-2-2-3-3l-2-3-2-2c-1-1-1-2-2-3 0-2 1-3 1-5Z"
          fill="#b8e6a0"
          stroke="#497e61"
          strokeWidth="1"
          strokeLinejoin="round"
        />
        <path
          d="M30 9c4-1 8-1 11 1l1 3-3 2-3 1-1 3c-1 2-3 2-4 0l-1-2c-2-2 1-4 0-6l-2-2Zm13 4c4 2 7 5 9 9l-2 1-1-1c-1 0-1 3-2 3l-2 1 1 2-1 1 1 2 3 1 1-2 2 1 2 5-2 3-1 3-3 3-3 2-2 3c-1 1-3 1-2-1l2-4 1-3c1-2-1-4 0-6l1-3-2-2-3-1-2 1c-1 1-2 1-3 0l-2-2c-1-2 1-4 1-6l2-3 3-1 3 1 1-2-1-2-2-1 1-2c1-1 1-3 1-4Z"
          fill="#b8e6a0"
          stroke="#497e61"
          strokeWidth="1"
          strokeLinejoin="round"
        />
      </g>
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
