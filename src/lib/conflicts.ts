/**
 * Pure conflict-detection logic for confirmed appointment slots. Kept
 * separate from the Supabase query layer so it can be unit tested without a
 * database.
 */

export interface SlotBooking {
  id: string;
  branch: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
}

export interface CandidateSlot {
  branch: string;
  date: string;
  time: string;
  /** Exclude this appointment id from the conflict check (editing itself). */
  excludeId?: string;
}

/**
 * Returns the conflicting booking, if any, for the same branch/date/time.
 */
export function findSlotConflict(
  existingConfirmed: SlotBooking[],
  candidate: CandidateSlot,
): SlotBooking | null {
  return (
    existingConfirmed.find(
      (booking) =>
        booking.id !== candidate.excludeId &&
        booking.branch === candidate.branch &&
        booking.date === candidate.date &&
        booking.time === candidate.time,
    ) ?? null
  );
}

export function hasSlotConflict(
  existingConfirmed: SlotBooking[],
  candidate: CandidateSlot,
): boolean {
  return findSlotConflict(existingConfirmed, candidate) !== null;
}
