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
          transform="translate(9 8) scale(.46)"
          d="M 0,29 C 6,18 17,6 30,3 C 34,3 40,6 40,10 C 40,13 35,14 32,12 C 29,11 28,16 23,16 C 17,16 15,20 16,26 C 17,31 20,32 23,28 C 25,24 25,21 29,21 C 34,21 34,25 35,28 C 36,30 39,32 37,34 C 34,34 31,33 28,36 C 23,39 22,43 18,45 C 16,47 16,51 15,53 C 12,52 12,49 9,49 C 5,49 4,54 6,58 C 8,62 12,61 13,64 C 15,66 17,66 19,65 L 22,67 C 20,70 16,70 13,67 C 9,65 9,62 5,60 L 0,55 Z M 24,65 C 28,64 30,66 33,66 C 37,66 36,70 41,73 C 46,77 51,79 50,83 C 49,87 45,88 43,91 C 41,96 37,97 35,101 C 31,98 30,95 29,89 C 28,84 23,83 22,79 C 20,75 24,72 23,70 C 21,68 21,66 24,65 Z M 44,-2 C 51,-3 58,-1 62,1 L 63,7 C 61,10 57,9 55,12 C 54,15 54,20 51,21 C 48,22 47,18 46,16 C 42,13 45,9 45,7 C 46,4 43,2 44,-2 Z M 81,1 C 91,7 99,16 104,27 L 104,44 C 99,41 98,36 95,34 C 93,32 92,29 89,30 L 85,32 C 82,30 84,27 80,27 C 77,27 79,32 76,32 L 72,31 C 69,31 68,28 71,27 L 73,25 C 74,23 69,22 70,20 C 71,18 75,20 76,17 C 77,14 81,17 82,14 C 84,10 78,11 78,8 C 77,5 80,5 81,1 Z M 75,39 C 80,38 84,40 88,41 C 91,41 92,39 94,40 C 96,44 95,48 92,50 C 90,52 91,55 89,58 L 85,64 C 84,68 80,73 77,74 C 73,74 72,69 70,67 C 67,64 68,60 67,57 C 65,53 67,48 69,45 C 70,42 72,40 75,39 Z M 90,67 C 92,68 91,74 88,77 C 86,76 88,70 90,67 Z"
          fill="#afd770"
          stroke="#47794f"
          strokeWidth="1.5"
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
