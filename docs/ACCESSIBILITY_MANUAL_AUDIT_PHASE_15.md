# Accessibility Manual Audit Phase 15

## Geprüfter Bereich

- `/lernplan`
- `/lernplan/heute`
- `/lernplan/woche`
- `/lernplan/pruefungsreife`
- `/lernplan/wiederholungen`
- `/lernplan/einstellungen`

## Ergebnis

- Tagesplan und Wochenplan verwenden semantische Listen/Karten.
- Gründe sind über `details/summary` tastaturbedienbar.
- Regeneration nutzt eine zurückhaltende `aria-live`-Region.
- Readiness-Bänder werden textlich angezeigt und nicht nur farblich codiert.
- Einstellungen verwenden native Formularfelder.
- Es werden keine PDF-Links exponiert.

## Screenreader-Status

Es wurde kein echter NVDA-, Narrator- oder VoiceOver-Test ausgeführt. Der Status bleibt daher: automatisierte und strukturelle Accessibility-Prüfung, echte Screenreader-Prüfung offen.
