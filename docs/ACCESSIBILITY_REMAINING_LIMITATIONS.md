# Verbleibende Accessibility-Einschränkungen

## Offen für `1.0.0`

Der finale Screenreader-Gate ist offen. Es wurde kein echter Narrator-, NVDA-, JAWS-, VoiceOver- oder sonstiger Screenreader-Test durchgeführt. `1.0.0` bleibt deshalb blockiert.

## Nicht durch den Fallback abgedeckt

- Screenreader-Aussprache und Lesereihenfolge im realen Ausgabemodus.
- Browse-/Forms-Mode-Wechsel.
- Screenreader-Elementlisten, Rotoren und Tabellenmodus.
- Tatsächliche Wahrnehmung komplexer mathematischer KaTeX-Ausgaben.
- Manuelle Windows-Kontrastdesigns außerhalb der Browser-Emulation.
- Browser-Zoom-Varianten außerhalb des automatisierten 320-px-Reflow-Fallbacks.
- Öffentlicher Export-/Importdialog als sichtbarer Tastaturfluss; technische Persistenzübertragung ist getestet.

## Release-Folge

Der Fallback-Audit reduziert das Risiko für `1.0.0-rc.2`, ersetzt aber keine finale Barrierefreiheitsfreigabe. Vor `1.0.0` muss ein realer Screenreader-Durchlauf über Erststart, Diagnose, Trainer, Simulator, Lernplan, Spickzettel und Persistenztransfer erfolgen oder der offene Gate muss explizit als nicht erfüllte Einschränkung akzeptiert werden.
