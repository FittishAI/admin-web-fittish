const NICE_STEPS = [
  1, 2, 5, 10, 20, 25, 50, 100, 200, 250, 500, 1000, 2000, 2500, 5000, 10000,
];

const MAX_INTERVALS = 5;

export function niceIntegerTicks(peak: number): {
  max: number;
  ticks: number[];
} {
  if (!Number.isFinite(peak) || peak <= 0) return { max: 1, ticks: [0, 1] };

  const step =
    NICE_STEPS.find((s) => peak / s <= MAX_INTERVALS) ??
    Math.ceil(peak / MAX_INTERVALS);

  const max = Math.ceil(peak / step) * step;

  const ticks: number[] = [];
  for (let v = 0; v <= max; v += step) ticks.push(v);

  return { max, ticks };
}
