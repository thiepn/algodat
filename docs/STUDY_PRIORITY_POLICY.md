# Study Priority Policy

`data/study-priority-policy.json` versioniert alle Gewichte.

Faktoren:

- `masteryDeficit`
- `examSlotWeight`
- `reviewDueUrgency`
- `repeatedErrorWeight`
- `confidenceMismatchWeight`
- `evidenceRecencyWeight`
- `unsupportedCoveragePenalty`
- `prerequisitePenalty`
- `timeFit`
- `activityVariety`
- `recentRepetitionPenalty`
- `userPinnedPriority`
- `examDateUrgency`

Die Domain berechnet einen transparenten Score und zeigt in der UI höchstens die drei wichtigsten Gründe. Tie-Breaker: Aufgabennummer, Aktivitätstyp, Aktivitäts-ID.
