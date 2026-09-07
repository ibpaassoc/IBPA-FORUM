/** Dense official places within one award. Equal averages share the same place. */
export function buildOfficialAwardRanks(
  rows: Array<{ id: string; awardId: string; averageScore: number | null }>,
) {
  const ranks = new Map<string, number>();
  const groups = new Map<string, typeof rows>();

  for (const row of rows) {
    const group = groups.get(row.awardId) ?? [];
    group.push(row);
    groups.set(row.awardId, group);
  }

  for (const group of groups.values()) {
    const scored = group
      .filter((row) => row.averageScore !== null)
      .sort(
        (left, right) =>
          (right.averageScore ?? 0) - (left.averageScore ?? 0) || left.id.localeCompare(right.id),
      );
    let place = 0;
    let previous: number | null = null;
    for (const row of scored) {
      if (previous === null || row.averageScore !== previous) place += 1;
      ranks.set(row.id, place);
      previous = row.averageScore;
    }
  }

  return ranks;
}
