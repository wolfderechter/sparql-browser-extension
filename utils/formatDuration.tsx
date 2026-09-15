// Source: https://github.com/Chalarangelo/30-seconds-of-code/blob/master/content/snippets/js/s/number-formatting.md#format-duration

export const formatDuration = (ms: number) => {
  if (ms < 0) ms = -ms;
  const time = {
    day: Math.floor(ms / 86_400_000),
    hour: Math.floor(ms / 3_600_000) % 24,
    minute: Math.floor(ms / 60_000) % 60,
    second: Math.floor(ms / 1_000) % 60,
    millisecond: Math.floor(ms) % 1_000
  };
  return Object.entries(time)
    .filter(val => val[1] !== 0)
    .map(([key, val]) => `${val} ${key}${val !== 1 ? 's' : ''}`)
    .join(', ');
};
