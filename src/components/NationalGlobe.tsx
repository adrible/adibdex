/** Original pixel globe artwork, drawn on a 64-unit grid. No emoji font or external icon. */
export function NationalGlobe() {
  return (
    <svg
      className="national-globe"
      viewBox="0 0 64 64"
      fill="none"
      aria-hidden="true"
      shapeRendering="crispEdges"
    >
      <path
        d="M24 3h16v4h8v4h5v6h4v7h4v16h-4v8h-4v5h-6v4h-7v4H24v-4h-8v-4h-5v-6H7v-7H3V24h4v-8h4v-5h6V7h7Z"
        fill="#092c50"
      />
      <path
        d="M24 6h16v4h8v4h4v10h5v16h-4v8h-6v5h-7v4H24v-4h-8v-6h-5v-7H7V24h4v-8h6v-5h7Z"
        fill="#79d4fa"
      />
      <path
        d="M40 10h8v4h4v10h5v16h-4v8h-6v5h-7v4H24v-4h16v-5h7V37h5V24h-5v-8h-7Z"
        fill="#3c9bd4"
      />
      <path d="M17 12h14v5h-6v5h-8v5h6v5h8v6h-7v-4h-7v-6h-6V17h6Z" fill="#a0e7a0" />
      <path d="M24 34h12v5h5v7h-5v6h-5v-5h-5v-7h-5v-6Z" fill="#9bdf91" />
      <path d="M39 15h9v7h5v7h-7v5h-7v-6h-5v-7h5Z" fill="#b4ecad" />
      <path d="M45 40h7v8h-9v-5h2Z" fill="#b4ecad" />
      <path d="M24 6h16v3H24Zm-7 5h7v3h-7Zm-6 6h3v7h-3Z" fill="#effbff" />
      <path d="M24 58h16v3H24Z" fill="#d4f0ff" />
    </svg>
  );
}
