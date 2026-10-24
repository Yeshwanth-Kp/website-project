const SIZE = 21;

function inFinder(row: number, col: number): boolean {
  return (
    (row < 7 && col < 7) ||
    (row < 7 && col >= SIZE - 7) ||
    (row >= SIZE - 7 && col < 7)
  );
}

function finderOn(row: number, col: number): boolean {
  const localRow = row < 7 ? row : row - (SIZE - 7);
  const localCol = col < 7 ? col : col - (SIZE - 7);
  const ring =
    localRow === 0 || localRow === 6 || localCol === 0 || localCol === 6;
  const center =
    localRow >= 2 && localRow <= 4 && localCol >= 2 && localCol <= 4;
  return ring || center;
}

function noiseOn(row: number, col: number): boolean {
  const hash = (row * 73_856_093) ^ (col * 19_349_663) ^ 0x5f3a;
  return (hash >>> 0) % 100 > 47;
}

const MODULES: Array<{ row: number; col: number }> = [];

for (let row = 0; row < SIZE; row += 1) {
  for (let col = 0; col < SIZE; col += 1) {
    const on = inFinder(row, col) ? finderOn(row, col) : noiseOn(row, col);
    if (on) MODULES.push({ row, col });
  }
}

/**
 * Decorative QR-style mark — not a scannable code. Real codes are generated
 * per property by the QR endpoint (`/r/[code]`).
 */
export function QrPattern({ className }: { className?: string }) {
  return (
    <svg
      viewBox={`-2 -2 ${SIZE + 4} ${SIZE + 4}`}
      className={className}
      shapeRendering="crispEdges"
      aria-hidden="true"
      focusable="false"
    >
      <rect x={-2} y={-2} width={SIZE + 4} height={SIZE + 4} fill="#ffffff" />
      {MODULES.map((module) => (
        <rect
          key={`${module.row}-${module.col}`}
          x={module.col}
          y={module.row}
          width={1}
          height={1}
          fill="#1c1917"
        />
      ))}
    </svg>
  );
}
