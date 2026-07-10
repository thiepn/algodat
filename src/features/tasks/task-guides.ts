export interface TaskGuide {
  taskNumber: number;
  tests: string;
  typicalStructure: string[];
  expectedAnswerComponents: string[];
  solvingWorkflow: string[];
  timeManagement: string;
  markingLogic: string;
  workedExample: { title: string; steps: string[]; modelAnswer: string[] };
  commonMistakes: string[];
  submissionChecklist: string[];
  practiceSet: string[];
}

export const taskGuides: TaskGuide[] = [
  {
    taskNumber: 1,
    tests: 'Grundlagen, kurze Laufzeitentscheidungen, Pseudocodeverständnis und Begriffe.',
    typicalStructure: [
      'mehrere kurze Teilfragen',
      'kleine Code- oder Tabellenfragmente',
      'kurze Begründungen',
    ],
    expectedAnswerComponents: [
      'Antwort',
      'ein Satz Begründung',
      'bei Laufzeitfragen relevante Zählgröße',
    ],
    solvingWorkflow: [
      'erst alle Teilfragen überfliegen',
      'sichere Punkte sofort lösen',
      'unklare Teilfragen markieren und später zurückkehren',
    ],
    timeManagement:
      'Plane höchstens 1–2 Minuten pro kurzem Teil; verliere dich nicht in einem Unterpunkt.',
    markingLogic:
      'Punkte entstehen durch korrekte Entscheidung plus nachvollziehbare Begründung, nicht durch lange Essays.',
    workedExample: {
      title: 'Mini-Laufzeitentscheidung',
      steps: [
        'Gegeben ist eine äußere Schleife über n und eine innere Schleife bis i.',
        'Zähle die Arbeit als Summe 1+…+n.',
        'Vereinfache zu Θ(n²).',
      ],
      modelAnswer: [
        'Die Laufzeit ist Θ(n²).',
        'Begründung: Die innere Arbeit summiert sich zu n(n+1)/2.',
      ],
    },
    commonMistakes: [
      'nur O statt gefordertem Θ',
      'Begriff genannt, aber nicht angewendet',
      'zu lange an einem Kurzpunkt hängen',
    ],
    submissionChecklist: [
      'jede Teilfrage beantwortet',
      'bei Laufzeit eine Klasse sichtbar',
      'bei wahr/falsch ein Grund genannt',
    ],
    practiceSet: [
      'zwei Schleifen analysieren',
      'drei O/Θ-Aussagen prüfen',
      'einen Pseudocode-Rückgabewert bestimmen',
    ],
  },
  {
    taskNumber: 2,
    tests: 'Tracing von dynamischer Programmierung oder Datenstrukturen.',
    typicalStructure: [
      'vorgegebene Operationen',
      'Tabellen- oder Zustandsfolge',
      'Zwischenstände nach Checkpoints',
    ],
    expectedAnswerComponents: [
      'vollständiger Zustand',
      'Index-/Repräsentantenangaben',
      'kurze Regelbegründung',
    ],
    solvingWorkflow: [
      'Startzustand abschreiben',
      'Operationen einzeln ausführen',
      'nach jedem Schritt Invariante prüfen',
    ],
    timeManagement:
      'Reserviere Zeit für eine saubere Endkontrolle; Tracing-Folgefehler sind teuer.',
    markingLogic: 'Teilpunkte gibt es für korrekte Zwischenstände, nicht nur für das Endergebnis.',
    workedExample: {
      title: 'Union-Find-Checkpoint',
      steps: [
        'Start: {a}, {b}, {c}.',
        'Union(a,b): Vertreter a, Größe 2.',
        'Union(a,c): c wird an die größere Liste gehängt.',
      ],
      modelAnswer: ['Menge {a,b,c} mit Vertreter a.', 'rep(a)=a, rep(b)=a, rep(c)=a.'],
    },
    commonMistakes: [
      'nur Kopfzeiger aktualisiert',
      'Tabellenzeile übersprungen',
      'Tie-Break-Regel geändert',
    ],
    submissionChecklist: [
      'alle Operationen verarbeitet',
      'Endzustand und Checkpoints sichtbar',
      'Repräsentanten oder DP-Achsen beschriftet',
    ],
    practiceSet: [
      'Union-Find-Folge tracen',
      'kleine Rucksack-DP-Tabelle füllen',
      'Rot-Schwarz-Fall benennen',
    ],
  },
  {
    taskNumber: 3,
    tests: 'Graphentracing: kürzeste Wege, Matrixverfahren oder Spannbäume.',
    typicalStructure: [
      'Graph mit Gewichten',
      'Algorithmusvorgabe',
      'Tabelle oder Matrix pro Runde',
    ],
    expectedAnswerComponents: [
      'Rundenstatus',
      'Distanzen/Predecessor oder MST-Eltern',
      'Tie-Breaks',
    ],
    solvingWorkflow: [
      'Startwerte setzen',
      'pro Runde aktive Wahl markieren',
      'nur erlaubte Updates durchführen',
    ],
    timeManagement:
      'Nutze eine feste Tabelle; Graphenaufgaben werden langsam, wenn du jedes Mal neu suchst.',
    markingLogic:
      'Zwischentabellen, gewählte Knoten/Kanten und korrekte Updates erzeugen Teilpunkte.',
    workedExample: {
      title: 'Dijkstra-Relaxierung',
      steps: ['dist(u)=4, Kante u→v mit Gewicht 3.', 'Aktuell dist(v)=9.', '4+3=7 ist besser.'],
      modelAnswer: [
        'Setze dist(v)=7.',
        'Setze pred(v)=u.',
        'Markiere v noch nicht abgeschlossen, falls es nur relaxiert wurde.',
      ],
    },
    commonMistakes: [
      'Vorgänger vergessen',
      'abgeschlossene Knoten geändert',
      'Floyd-Warshall-k falsch interpretiert',
    ],
    submissionChecklist: [
      'Startknoten klar',
      'jede Runde beschriftet',
      '∞ konsistent behandelt',
      'Tie-Break notiert',
    ],
    practiceSet: ['eine Dijkstra-Runde', 'eine Floyd-Warshall-Matrixstufe', 'zwei Prim-Updates'],
  },
  {
    taskNumber: 4,
    tests: 'Datenstrukturen, Bäume, Hash-/Graphzustände oder gemischtes Tracing.',
    typicalStructure: ['Operationenfolge', 'Zustandsdiagramm', 'kurze Regelabfrage'],
    expectedAnswerComponents: [
      'vollständiger Zustand',
      'geänderte Zeiger/Farben/Kanten',
      'Invariantenkontrolle',
    ],
    solvingWorkflow: [
      'Operation verstehen',
      'lokale Änderung durchführen',
      'globale Eigenschaft prüfen',
    ],
    timeManagement:
      'Plane nach jeder größeren Operation zehn Sekunden für die Invariantenprüfung ein.',
    markingLogic: 'Bewertet werden Zustandstreue und konsistente Anwendung der Datenstrukturregel.',
    workedExample: {
      title: 'Rot-Schwarz-Reparatur',
      steps: [
        'Neuer Knoten ist rot.',
        'Elternknoten ist rot, Onkel rot.',
        'Eltern und Onkel schwarz, Großelternknoten rot.',
      ],
      modelAnswer: [
        'Roter Konflikt ist lokal behoben.',
        'Am Ende muss die Wurzel schwarz gesetzt werden.',
      ],
    },
    commonMistakes: [
      'Farbe nach Rotation vergessen',
      'Hash-/Baumzustand nur teilweise gezeichnet',
      'Prim und Kruskal gemischt',
    ],
    submissionChecklist: [
      'alle Knoten/Kanten sichtbar',
      'Farben oder Schlüsselwerte beschriftet',
      'Endinvariante geprüft',
    ],
    practiceSet: [
      'Rot-Schwarz-Fall bestimmen',
      'Prim-Elternkante aktualisieren',
      'Union-Find-Zustand rekonstruieren',
    ],
  },
  {
    taskNumber: 5,
    tests: 'Korrektheitsbeweis mit Schleifeninvariante.',
    typicalStructure: [
      'Pseudocode',
      'Invariante formulieren',
      'Initialisierung, Erhaltung, Abschluss',
    ],
    expectedAnswerComponents: [
      'präzise Invariante',
      'Initialisierung',
      'Erhaltung',
      'Terminierung/Abschluss',
    ],
    solvingWorkflow: [
      'Zustand im Code finden',
      'Invariante mit Indexbereich formulieren',
      'Dreischritt ausfüllen',
    ],
    timeManagement: 'Schreibe zuerst das Beweisgerüst; danach füllst du Lücken gezielt.',
    markingLogic:
      'Eine gute Invariante bringt nur Punkte, wenn Erhaltung und Abschluss wirklich gezeigt werden.',
    workedExample: {
      title: 'Summenvariable',
      steps: [
        'Nach i Iterationen enthält s die Summe der ersten i Elemente.',
        'Vor Start ist i=0 und s=0.',
        'Iteration i+1 addiert genau das nächste Element.',
      ],
      modelAnswer: [
        'Initialisierung: leere Summe ist 0.',
        'Erhaltung: Aus Summe der ersten i Elemente wird Summe der ersten i+1.',
        'Abschluss: Bei i=n ist die Gesamtsumme berechnet.',
      ],
    },
    commonMistakes: [
      'Invariante ist nur Endergebnis',
      'Erhaltung nur mit Beispiel',
      'Terminierung fehlt',
    ],
    submissionChecklist: [
      'Indexbereich genannt',
      'alle drei Beweisteile überschrieben',
      'Spezifikation am Ende abgeleitet',
    ],
    practiceSet: [
      'Invariante für Maximum-Scan',
      'Invariante für binäre Suche',
      'Terminierung eines while-Loops begründen',
    ],
  },
  {
    taskNumber: 6,
    tests: 'Rekurrenz, Master-Theorem und Laufzeitbeweis.',
    typicalStructure: ['rekursiver Algorithmus', 'Rekurrenz aufstellen', 'lösen und begründen'],
    expectedAnswerComponents: ['T(n)-Rekurrenz', 'Parameter a,b,f(n)', 'Fallprüfung', 'Endklasse'],
    solvingWorkflow: [
      'Aufrufe zählen',
      'Problemgrößen bestimmen',
      'Nichtrekursionsarbeit bestimmen',
      'Master oder Induktion anwenden',
    ],
    timeManagement:
      'Nicht zu früh lösen: Eine falsche Rekurrenz macht die restliche Aufgabe wertlos.',
    markingLogic:
      'Teilpunkte gibt es für Rekurrenz, Parameter, Fallbegründung und Ergebnis getrennt.',
    workedExample: {
      title: 'MergeSort-artige Rekurrenz',
      steps: ['Zwei rekursive Aufrufe auf n/2.', 'Lineares Zusammenführen.', 'T(n)=2T(n/2)+Θ(n).'],
      modelAnswer: ['a=2,b=2,f(n)=n.', 'n^{log_b a}=n.', 'Ausgeglichener Fall, also Θ(n log n).'],
    },
    commonMistakes: [
      'Combine-Kosten fehlen',
      'Fallnummer ohne Bedingung',
      'Induktionskonstante nicht gewählt',
    ],
    submissionChecklist: [
      'Rekurrenz vollständig',
      'Basisfall erwähnt',
      'Vergleichsgröße notiert',
      'Endklasse eindeutig',
    ],
    practiceSet: [
      'T(n)=4T(n/2)+n lösen',
      'D&C-Rekurrenz aufstellen',
      'Induktionsschritt skizzieren',
    ],
  },
  {
    taskNumber: 7,
    tests: 'Algorithmusentwurf mit Greedy oder Divide-and-Conquer.',
    typicalStructure: ['Problemtext', 'Algorithmusidee', 'Pseudocode', 'Korrektheit', 'Laufzeit'],
    expectedAnswerComponents: [
      'präzise Regel/Zerlegung',
      'Pseudocode',
      'Beweisidee',
      'Komplexität',
    ],
    solvingWorkflow: [
      'Paradigma erkennen',
      'Entscheidung oder Zerlegung isolieren',
      'Beweisstruktur wählen',
      'Laufzeit ableiten',
    ],
    timeManagement:
      'Verteile Zeit gleichmäßig: Code ohne Beweis oder Beweis ohne Algorithmus bleibt unvollständig.',
    markingLogic: 'Bewertet wird der komplette Entwurf, nicht nur die Idee.',
    workedExample: {
      title: 'Greedy-Intervallauswahl',
      steps: [
        'Sortiere Intervalle nach Endzeit.',
        'Wähle immer das erste kompatible Intervall.',
        'Begründe per Austauschargument.',
      ],
      modelAnswer: [
        'Algorithmus: sortieren, linear scannen, kompatible Intervalle aufnehmen.',
        'Korrektheit: frühestes Ende lässt maximalen Restspielraum.',
        'Laufzeit: O(n log n).',
      ],
    },
    commonMistakes: ['Pseudocode fehlt', 'Beweis nur intuitiv', 'D&C-Combine-Fall unvollständig'],
    submissionChecklist: [
      'Algorithmus ausführbar',
      'Korrektheit mit Argument',
      'Laufzeit inklusive Sortieren/Combine',
      'Randfälle erwähnt',
    ],
    practiceSet: [
      'Greedy-Regel formulieren',
      'Austauschargument skizzieren',
      'D&C-Fallliste schreiben',
    ],
  },
  {
    taskNumber: 8,
    tests: 'Dynamische Programmierung als Entwurfsaufgabe.',
    typicalStructure: [
      'Optimierungsproblem',
      'Zustandsdefinition',
      'Rekurrenz',
      'Berechnung',
      'Korrektheit/Laufzeit',
    ],
    expectedAnswerComponents: [
      'Zustand mit Bedeutung',
      'Randfälle',
      'Übergang',
      'Auswertungsreihenfolge',
      'Antwortzelle',
    ],
    solvingWorkflow: [
      'Teilproblem finden',
      'Zustand prüfen',
      'letzte Entscheidung formulieren',
      'Reihenfolge aus Abhängigkeiten ableiten',
    ],
    timeManagement:
      'Nimm dir Zeit für den Zustand; ein schwacher Zustand zerstört Rekurrenz und Beweis.',
    markingLogic: 'Die meisten Punkte liegen auf Zustandsdefinition, Rekurrenz und Begründung.',
    workedExample: {
      title: '0/1-Auswahlentscheidung',
      steps: [
        'DP[i,w] nutzt die ersten i Elemente.',
        'Entscheidung: Element i nicht nehmen oder nehmen.',
        'Nehmen verweist auf DP[i−1,w−gewicht_i].',
      ],
      modelAnswer: [
        'DP[i,w]=max(DP[i−1,w], wert_i+DP[i−1,w−gewicht_i]) falls passend.',
        'Rand: DP[0,w]=0.',
        'Zeit: Θ(nW).',
      ],
    },
    commonMistakes: [
      'Zustand ohne Bedeutung',
      'Randfälle fehlen',
      'aktuelle statt vorheriger Zeile',
    ],
    submissionChecklist: [
      'Zustand in Worten',
      'alle Randfälle',
      'gültige Reihenfolge',
      'Komplexität aus Zuständen × Übergängen',
    ],
    practiceSet: [
      'Rucksack-Rekurrenz erklären',
      'DP-Tabelle dimensionieren',
      'Korrektheitsinduktion skizzieren',
    ],
  },
  {
    taskNumber: 9,
    tests: 'Transferaufgabe mit gemischten Themen und selbstständiger Strategie.',
    typicalStructure: [
      'mehrere Teilfragen',
      'bekannte Verfahren in neuer Form',
      'Begründung und Kontrolle',
    ],
    expectedAnswerComponents: [
      'Problemklassifikation',
      'passende Methode',
      'saubere Zwischenschritte',
      'Reflexion über Grenzen',
    ],
    solvingWorkflow: [
      'Aufgabentyp identifizieren',
      'bekannte Module zuordnen',
      'kleine Beispiele zur Kontrolle nutzen',
      'Antwort strukturieren',
    ],
    timeManagement: 'Erst sichere Teilpunkte einsammeln, dann schwierige Transferteile bearbeiten.',
    markingLogic:
      'Teilpunkte entstehen durch nachvollziehbare Methode und saubere Zwischenergebnisse.',
    workedExample: {
      title: 'Transfer von Dijkstra zu DP-Denken',
      steps: [
        'Erkenne: Es geht um optimale Werte mit Abhängigkeiten.',
        'Prüfe, ob Graphgewichtung oder Tabellenzustand passender ist.',
        'Formuliere die gewählte Methode mit Bedingungen.',
      ],
      modelAnswer: [
        'Wenn Kanten nichtnegativ und Startwege gefragt sind: Dijkstra.',
        'Wenn Teilprobleme tabellarisch mit Entscheidungen entstehen: DP.',
        'Bedingungen offen nennen.',
      ],
    },
    commonMistakes: [
      'Methode gewählt ohne Voraussetzung',
      'alle Themen gleichzeitig bearbeiten',
      'keine Kontrollrechnung',
    ],
    submissionChecklist: [
      'Methode begründet',
      'Voraussetzungen genannt',
      'Zwischenstände lesbar',
      'unsichere Annahmen markiert',
    ],
    practiceSet: [
      'Transferfrage klassifizieren',
      'eine kleine Instanz rechnen',
      'Lernlücke im Plan markieren',
    ],
  },
];

export function getTaskGuide(taskNumber: number): TaskGuide {
  const guide = taskGuides.find((candidate) => candidate.taskNumber === taskNumber);
  if (!guide) throw new Error(`Aufgabe ${taskNumber} hat keinen Phase-18-Guide.`);
  return guide;
}
