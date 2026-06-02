import { IcsBusySlots } from 'shared';

/**
 * Builds a lookup of imported-calendar busy availability slots keyed by local-midnight day time, so it
 * matches the date produced by availabilityTransformer
 *
 * @param busy the per-day busy slots returned by the ICS busy-times endpoint (dateSet at UTC midnight)
 * @returns a map from local-midnight day time -> set of busy slot indices
 */
export const icsBusySlotsByDay = (busy: IcsBusySlots[]): Map<number, Set<number>> => {
  const map = new Map<number, Set<number>>();
  busy.forEach((day) => {
    const date = new Date(day.dateSet);
    const localMidnight = new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
    map.set(localMidnight.getTime(), new Set(day.busySlots));
  });
  return map;
};

/**
 * @returns whether the given availability slot on the given day is busy on the user's imported calendar
 */
export const isSlotBusy = (busyByDay: Map<number, Set<number>>, dateSet: Date, slot: number): boolean =>
  busyByDay.get(dateSet.getTime())?.has(slot) ?? false;
