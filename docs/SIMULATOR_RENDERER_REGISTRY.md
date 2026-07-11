# Simulator-Renderer-Registry

`src/features/simulator/ExamTaskRenderer.tsx` ist der gemeinsame Vertrag für Klausurantworten. Jeder Renderer liefert Initialwert, Serialisierung, Wiederherstellung, Vollständigkeitsprüfung, deterministische Bewertung über die bestehende Trainer-Engine und Zugänglichkeitsmetadaten.

Vor der Abgabe zeigt der Renderer ausschließlich Eingabe- und Vollständigkeitshinweise. Erst nach der endgültigen Abgabe werden Rubrik, Modelllösung und Remediation gezeigt.
