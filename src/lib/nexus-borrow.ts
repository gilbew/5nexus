import type { NexusSlot } from "@/components/NexusCard";

/**
 * Moves allocation seconds from lowest-priority active slots first (end of `activeIdsOrdered`).
 * Returns null if `needSeconds` could not be fully covered.
 */
export function applyBorrowFromDonors(
  entities: NexusSlot[],
  recipientId: string,
  activeIdsOrdered: string[],
  needSeconds: number,
  options: { markOverspent: boolean },
): NexusSlot[] | null {
  if (needSeconds <= 0) {
    return entities.map((e) => ({ ...e }));
  }

  const donors = [...activeIdsOrdered].reverse().filter((id) => id !== recipientId);
  const next = entities.map((e) => ({ ...e }));
  const find = (id: string) => next.find((x) => x.id === id);

  let left = needSeconds;
  for (const dId of donors) {
    if (left <= 0) {
      break;
    }
    const donor = find(dId);
    const recip = find(recipientId);
    if (!donor || !recip) {
      return null;
    }
    const avail = donor.durationSeconds - donor.elapsedSeconds;
    if (avail <= 0) {
      continue;
    }
    const take = Math.min(left, avail);
    donor.durationSeconds -= take;
    recip.durationSeconds += take;
    left -= take;
    if (take > 0 && options.markOverspent) {
      donor.donorAutoBorrow = true;
    }
  }

  if (left > 0) {
    return null;
  }

  if (options.markOverspent) {
    const recip = find(recipientId);
    if (recip) {
      recip.overspentAuto = true;
    }
  }
  return next;
}
