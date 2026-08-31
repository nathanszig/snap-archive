import type { DateRange, ParsedMemory } from "./types";

export function filterMemoriesByRange(
  memories: ParsedMemory[],
  range: DateRange,
): ParsedMemory[] {
  return memories.filter((memory) => {
    if (range.from && memory.date < startOfDay(range.from)) return false;
    if (range.to && memory.date > endOfDay(range.to)) return false;
    return true;
  });
}

function startOfDay(date: Date): Date {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

function endOfDay(date: Date): Date {
  const copy = new Date(date);
  copy.setHours(23, 59, 59, 999);
  return copy;
}

export function getMemoryDateBounds(memories: ParsedMemory[]): {
  min: Date;
  max: Date;
} {
  const timestamps = memories.map((memory) => memory.date.getTime());
  return {
    min: new Date(Math.min(...timestamps)),
    max: new Date(Math.max(...timestamps)),
  };
}
