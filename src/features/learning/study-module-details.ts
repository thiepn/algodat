import type { SourceRef } from '../../domain/study-content/types';

export interface StudyMiniExercise {
  prompt: string;
  solution: string;
}

export interface RichStudyModule {
  moduleId: string;
  slug: string;
  title: string;
  shortDescription: string;
  topicIds: string[];
  taskNumbers: number[];
  prerequisites: string[];
  learningObjectives: string[];
  introduction: string;
  intuitionSections: string[];
  definitionSections: string[];
  theoremSections: string[];
  algorithmSections: string[];
  pseudocodeBlocks: Array<{ title: string; code: string }>;
  workedExamples: Array<{ title: string; steps: string[] }>;
  proofSections: string[];
  complexitySections: string[];
  commonMistakes: string[];
  examTips: string[];
  miniExercises: StudyMiniExercise[];
  trainerIds: string[];
  diagnosticCompetencyIds: string[];
  relatedModuleIds: string[];
  sourceRefs: SourceRef[];
  verificationStatus: 'verified_against_official_source' | 'partially_verified' | 'needs_review';
  publicDistributionStatus: 'public_safe';
}

const lectureBasics = { sourceId: 'src-25d6340b518c', page: 17 };
const lectureProofs = { sourceId: 'src-25d6340b518c', page: 11 };
const clrsDp = { sourceId: 'src-baa07f0a207a', page: 390 };
const clrsGraphs = { sourceId: 'src-baa07f0a207a', page: 846 };
const clrsMst = { sourceId: 'src-baa07f0a207a', page: 955 };
const mockUnionFind = { sourceId: 'src-8f16b2505bbd', page: 6 };
const mockDp = { sourceId: 'src-8f16b2505bbd', page: 10 };
const rbExam = { sourceId: 'src-97414623dd81', page: 4 };
const dcSource = { sourceId: 'src-88179ac88dc5', page: 7 };

function module(input: RichStudyModule): RichStudyModule {
  return input;
}

export const richStudyModules: RichStudyModule[] = [
  module({
    moduleId: 'module-asymptotik',
    slug: 'asymptotische-notation',
    title: 'Asymptotische Notation',
    shortDescription: 'Wie O, Ω und Θ als präzise Aussagen über Wachstum gelesen werden.',
    topicIds: ['topic-916a9f1645f2'],
    taskNumbers: [1, 6, 9],
    prerequisites: ['Terme vereinfachen', 'Logarithmen und Potenzen vergleichen'],
    learningObjectives: [
      'du erkennst, welche Terme für große Eingaben dominieren',
      'du formulierst obere, untere und scharfe Schranken ohne Bauchgefühl',
      'du begründest Laufzeitaussagen in kurzen Klausurantworten',
    ],
    introduction:
      'Asymptotik ist die Sprache, mit der Algorithmen unabhängig von konkreter Hardware verglichen werden. In der Klausur zählt nicht nur das Symbol, sondern die Begründung, warum konstante Faktoren und niedrigere Terme verschwinden dürfen.',
    intuitionSections: [
      'Stell dir zwei Laufzeitkurven vor: Für kleine n kann die langsamere Klasse zufällig besser aussehen. Asymptotik fragt bewusst nach dem Verhalten ab einer hinreichend großen Eingabe.',
      'O ist eine obere Schranke: Der Algorithmus wächst höchstens so schnell wie die Vergleichsfunktion, bis auf konstante Faktoren.',
    ],
    definitionSections: [
      'f(n) ∈ O(g(n)) bedeutet: Es gibt Konstanten c > 0 und n₀, sodass für alle n ≥ n₀ gilt: f(n) ≤ c · g(n).',
      'f(n) ∈ Θ(g(n)) bedeutet gleichzeitig obere und untere asymptotische Schranke.',
    ],
    theoremSections: [
      'Dominanzregel: Bei Summen von Standardfunktionen bestimmt der asymptotisch größte Term die Θ-Klasse, sofern keine Auslöschung vorliegt.',
    ],
    algorithmSections: [
      'Bei Code-Analyse zählst du zuerst Schleifenläufe und rekursive Aufrufe, vereinfachst dann die Summe und gibst zuletzt die asymptotische Klasse an.',
    ],
    pseudocodeBlocks: [
      {
        title: 'Laufzeit aus verschachtelten Schleifen',
        code: 'for i = 1 to n:\n  for j = 1 to i:\n    konstante Arbeit',
      },
    ],
    workedExamples: [
      {
        title: 'Dreieckssumme',
        steps: [
          'Die innere Schleife läuft für festes i genau i-mal.',
          'Gesamtzahl der Schritte ist 1 + 2 + … + n = n(n+1)/2.',
          'Der quadratische Term dominiert, also Θ(n²).',
        ],
      },
    ],
    proofSections: [
      'Für O(n²) wähle c = 1 und n₀ = 1, denn n(n+1)/2 ≤ n² für n ≥ 1 gilt nach einfacher Umformung nicht direkt; sicher ist c = 1 und n₀ = 2 oder c = 2 und n₀ = 1.',
    ],
    complexitySections: ['Die Analyse liefert Θ(n²) Zeit und O(1) zusätzlichen Speicher.'],
    commonMistakes: [
      'O und Θ werden vertauscht.',
      'Die innere Schleife wird fälschlich immer mit n statt mit i gezählt.',
      'Konstanten werden gestrichen, bevor die eigentliche Summe bestimmt ist.',
    ],
    examTips: [
      'Schreibe zuerst die Summenformel hin; das verhindert viele Folgefehler.',
      'Wenn nur eine obere Schranke verlangt ist, nicht unnötig eine exakte Θ-Aussage behaupten.',
    ],
    miniExercises: [
      { prompt: 'Bestimme die Klasse von 3n log n + 7n + 20.', solution: 'Θ(n log n).' },
      { prompt: 'Ist n² ∈ O(n log n)?', solution: 'Nein, n² wächst asymptotisch schneller.' },
    ],
    trainerIds: ['trainer-rekurrenz-master-fall1-v1'],
    diagnosticCompetencyIds: ['foundation-asymptotics'],
    relatedModuleIds: ['module-rekurrenz-master'],
    sourceRefs: [lectureBasics, { sourceId: 'src-baa07f0a207a', page: 44 }],
    verificationStatus: 'verified_against_official_source',
    publicDistributionStatus: 'public_safe',
  }),
  module({
    moduleId: 'module-pseudocode',
    slug: 'pseudocode-lesen-und-schreiben',
    title: 'Pseudocode lesen und schreiben',
    shortDescription: 'Von der informellen Idee zur prüfbaren Algorithmusbeschreibung.',
    topicIds: ['topic-05cbaf0c71b3', 'topic-cd03b101b7ca'],
    taskNumbers: [1, 7, 8],
    prerequisites: ['Kontrollstrukturen', 'Arrays und Indizes'],
    learningObjectives: [
      'du trennst Eingabe, Zustand, Schleifen und Rückgabewert',
      'du vermeidest mehrdeutige Indexgrenzen',
      'du formulierst Pseudocode so, dass er bewertbar ist',
    ],
    introduction:
      'Pseudocode ist kein JavaScript und kein Fließtext. Er muss so präzise sein, dass eine andere Person denselben Algorithmus ausführen könnte.',
    intuitionSections: [
      'Guter Pseudocode ist eine Landkarte: Er lässt Implementierungsdetails weg, aber nicht die Entscheidungspunkte.',
    ],
    definitionSections: [
      'Eine Variable ist im Pseudocode ein benannter Zustand. Eine Schleifeninvariante oder Rekurrenz bezieht sich später genau auf diesen Zustand.',
    ],
    theoremSections: [
      'Keine eigene Theorem-Aussage; Pseudocode ist die Grundlage für Korrektheits- und Laufzeitargumente.',
    ],
    algorithmSections: [
      'Schreibe erst Signatur und Eingabeannahmen, dann Initialisierung, Hauptschleife oder Rekursion, schließlich Rückgabe.',
    ],
    pseudocodeBlocks: [
      {
        title: 'Schema',
        code: 'Algorithmus Name(Eingabe):\n  initialisiere Zustand\n  solange Bedingung gilt:\n    aktualisiere Zustand\n  return Ergebnis',
      },
    ],
    workedExamples: [
      {
        title: 'Maximum in einem Array',
        steps: [
          'Setze best auf A[1].',
          'Durchlaufe die restlichen Elemente.',
          'Aktualisiere best nur bei größerem Wert.',
          'Gib best zurück.',
        ],
      },
    ],
    proofSections: [
      'Die Korrektheit folgt typischerweise aus einer Invariante: Nach i verarbeiteten Elementen enthält best das Maximum dieses Präfixes.',
    ],
    complexitySections: [
      'Ein einfacher Scan über n Elemente benötigt Θ(n) Zeit und O(1) Zusatzspeicher.',
    ],
    commonMistakes: [
      'Unklare Indexbasis.',
      'Rückgabe fehlt.',
      'Zustandsvariablen werden im Beweis anders genannt als im Code.',
    ],
    examTips: [
      'Wenn Zeit knapp ist, schreibe trotzdem Eingabe, Schleifenbedingung und Rückgabe explizit.',
    ],
    miniExercises: [
      {
        prompt: 'Welche drei Bestandteile sollte ein Pseudocode immer enthalten?',
        solution: 'Eingabe/Annahmen, Verarbeitungsschritte, Rückgabe.',
      },
    ],
    trainerIds: ['trainer-dp-entwurf-mine-v1', 'trainer-dc-entwurf-maxwertdifferenz-v1'],
    diagnosticCompetencyIds: ['foundation-paradigms'],
    relatedModuleIds: ['module-schleifeninvariante'],
    sourceRefs: [lectureProofs],
    verificationStatus: 'partially_verified',
    publicDistributionStatus: 'public_safe',
  }),
  module({
    moduleId: 'module-binary-search',
    slug: 'binaere-suche',
    title: 'Binäre Suche',
    shortDescription: 'Halbierung, Suchintervall und Schleifeninvariante sicher verbinden.',
    topicIds: ['topic-aa4a4148523b'],
    taskNumbers: [1, 5, 7],
    prerequisites: ['sortierte Arrays', 'Indexgrenzen'],
    learningObjectives: [
      'du formulierst das Suchintervall korrekt',
      'du begründest Terminierung über Intervallverkleinerung',
    ],
    introduction:
      'Binäre Suche ist klein, aber prüfungsreich: Fast alle Fehler entstehen an Intervallgrenzen oder an der Frage, ob mid erneut betrachtet werden darf.',
    intuitionSections: [
      'Jeder Vergleich verwirft die Hälfte, in der das gesuchte Element nicht liegen kann.',
    ],
    definitionSections: [
      'Die Invariante lautet: Falls x im Array vorkommt, liegt x im aktuellen Intervall [l, r].',
    ],
    theoremSections: [
      'Nach O(log n) Halbierungen ist ein Intervall der Länge n leer oder auf ein Element reduziert.',
    ],
    algorithmSections: [
      'Vergleiche A[mid] mit x; verschiebe l oder r so, dass die Invariante erhalten bleibt.',
    ],
    pseudocodeBlocks: [
      {
        title: 'Binäre Suche',
        code: 'l = 1; r = n\nwhile l <= r:\n  m = floor((l+r)/2)\n  if A[m] == x: return m\n  if A[m] < x: l = m + 1\n  else: r = m - 1\nreturn nicht gefunden',
      },
    ],
    workedExamples: [
      {
        title: 'Suche 14 in [3, 8, 14, 20]',
        steps: ['l=1,r=4,m=2: A[m]=8 < 14.', 'Setze l=3.', 'm=3: A[m]=14, gefunden.'],
      },
    ],
    proofSections: [
      'Die Invariante bleibt erhalten, weil bei A[m] < x alle Positionen ≤ m ausgeschlossen werden können.',
    ],
    complexitySections: ['Zeit Θ(log n), Zusatzspeicher O(1).'],
    commonMistakes: [
      'm statt m+1 als neue linke Grenze.',
      'while l < r ohne passende Nachbehandlung.',
      'Sortiertheit nicht erwähnt.',
    ],
    examTips: ['Zeige bei Beweisen die Intervallinvariante und die strikte Verkleinerung.'],
    miniExercises: [
      {
        prompt: 'Warum braucht binäre Suche sortierte Eingaben?',
        solution: 'Nur dann erlaubt der Vergleich mit A[m] das sichere Verwerfen einer Hälfte.',
      },
    ],
    trainerIds: ['trainer-schleifeninvariante-summe-v1'],
    diagnosticCompetencyIds: ['foundation-sorting-search'],
    relatedModuleIds: ['module-schleifeninvariante', 'module-asymptotik'],
    sourceRefs: [lectureProofs],
    verificationStatus: 'partially_verified',
    publicDistributionStatus: 'public_safe',
  }),
  module({
    moduleId: 'module-mergesort',
    slug: 'mergesort',
    title: 'MergeSort',
    shortDescription: 'Teile-und-herrsche-Sortieren mit Merge-Schritt und Rekurrenz.',
    topicIds: ['topic-64b84f2856b9', 'topic-e48203925235'],
    taskNumbers: [1, 6, 7],
    prerequisites: ['Arrays', 'Rekursion', 'Asymptotik'],
    learningObjectives: [
      'du konstruierst die Rekurrenz T(n)=2T(n/2)+Θ(n)',
      'du erklärst den Merge-Schritt korrekt',
    ],
    introduction:
      'MergeSort ist das Standardbeispiel dafür, dass ein linearer Combine-Schritt zusammen mit zwei Halbproblemen zu Θ(n log n) führt.',
    intuitionSections: [
      'Sortieren wird einfacher, wenn zwei bereits sortierte Hälften nur noch gemischt werden müssen.',
    ],
    definitionSections: [
      'Der Merge-Schritt erhält zwei sortierte Listen und erzeugt eine sortierte Gesamtliste.',
    ],
    theoremSections: ['Für T(n)=2T(n/2)+Θ(n) ergibt das Master-Theorem Θ(n log n).'],
    algorithmSections: [
      'Teile das Array, sortiere beide Hälften rekursiv, merge die sortierten Resultate.',
    ],
    pseudocodeBlocks: [
      {
        title: 'MergeSort',
        code: 'MergeSort(A):\n  if |A| <= 1: return A\n  L,R = teile A\n  return Merge(MergeSort(L), MergeSort(R))',
      },
    ],
    workedExamples: [
      {
        title: 'Merge [2,7] und [1,5]',
        steps: [
          'Vergleiche 2 und 1: nimm 1.',
          'Vergleiche 2 und 5: nimm 2.',
          'Vergleiche 7 und 5: nimm 5.',
          'Hänge 7 an.',
        ],
      },
    ],
    proofSections: [
      'Induktion über n: Die rekursiven Aufrufe liefern sortierte Hälften; Merge erhält Sortiertheit und Vollständigkeit.',
    ],
    complexitySections: ['Zeit Θ(n log n), zusätzlicher Speicher je nach Implementierung Θ(n).'],
    commonMistakes: [
      'Merge-Kosten vergessen.',
      'Basisfall unklar.',
      'Stabilität behauptet, ohne Merge-Regel zu nennen.',
    ],
    examTips: ['Bei Rekurrenzen: a=2, b=2, f(n)=n sichtbar markieren.'],
    miniExercises: [
      { prompt: 'Welche Rekurrenz beschreibt MergeSort?', solution: 'T(n)=2T(n/2)+Θ(n).' },
    ],
    trainerIds: ['trainer-rekurrenz-master-fall1-v1'],
    diagnosticCompetencyIds: ['foundation-recurrences', 'foundation-sorting-search'],
    relatedModuleIds: ['module-rekurrenz-master', 'module-dc-maxwertdifferenz'],
    sourceRefs: [lectureBasics],
    verificationStatus: 'verified_against_official_source',
    publicDistributionStatus: 'public_safe',
  }),
  module({
    moduleId: 'module-rekurrenz-master',
    slug: 'rekurrenzen-und-master-theorem',
    title: 'Rekurrenzen und Master-Theorem',
    shortDescription: 'Rekurrenz lesen, Master-Fall prüfen und Laufzeit sauber begründen.',
    topicIds: [
      'topic-e48203925235',
      'topic-99af8a8bfb20',
      'topic-2b335556483f',
      'topic-64b84f2856b9',
    ],
    taskNumbers: [1, 6, 9],
    prerequisites: ['asymptotische Notation', 'Rekursion'],
    learningObjectives: [
      'du erkennst a, b und f(n)',
      'du begründest den Master-Fall',
      'du trennst Ergebnis und Beweis',
    ],
    introduction:
      'Rekurrenzen beschreiben Laufzeiten rekursiver Algorithmen. Das Master-Theorem ist ein Werkzeug, aber keine Rateschablone.',
    intuitionSections: [
      'a zählt die Teilprobleme, b die Schrumpfung, f(n) die Arbeit außerhalb der Rekursion.',
    ],
    definitionSections: ['Eine typische Form ist T(n)=aT(n/b)+f(n) mit a ≥ 1 und b > 1.'],
    theoremSections: [
      'Verglichen wird f(n) mit n^{log_b a}; der passende Fall liefert die asymptotische Lösung unter seinen Bedingungen.',
    ],
    algorithmSections: [
      'Erst Rekurrenz aus dem Algorithmus ableiten, dann Parameter markieren, dann Fallbedingung prüfen.',
    ],
    pseudocodeBlocks: [
      {
        title: 'Master-Checkliste',
        code: 'a = Anzahl rekursiver Aufrufe\nb = Verkleinerungsfaktor\nf(n) = Arbeit im aktuellen Aufruf\nvergleiche f(n) mit n^(log_b a)',
      },
    ],
    workedExamples: [
      {
        title: 'T(n)=2T(n/2)+n',
        steps: [
          'a=2, b=2, f(n)=n.',
          'n^{log_2 2}=n.',
          'f(n)=Θ(n), also ausgeglichener Fall.',
          'Ergebnis Θ(n log n).',
        ],
      },
    ],
    proofSections: [
      'Eine formale Begründung nennt die Fallbedingung und verweist nicht nur auf die Fallnummer.',
    ],
    complexitySections: [
      'Das Ergebnis ist eine Laufzeitklasse; Speicher muss separat betrachtet werden.',
    ],
    commonMistakes: [
      'f(n) wird mit T(n) verwechselt.',
      'Logarithmusbasis wird unnötig problematisiert.',
      'Regularitätsbedingungen werden ignoriert, wenn sie benötigt werden.',
    ],
    examTips: ['Schreibe die Vergleichsgröße n^{log_b a} immer hin.'],
    miniExercises: [
      {
        prompt: 'Löse T(n)=4T(n/2)+n.',
        solution: 'n^{log_2 4}=n², f(n)=n ist kleiner; Ergebnis Θ(n²).',
      },
    ],
    trainerIds: ['trainer-rekurrenz-master-fall1-v1'],
    diagnosticCompetencyIds: [
      'foundation-recurrences',
      'foundation-asymptotics',
      'foundation-proofs',
    ],
    relatedModuleIds: ['module-asymptotik', 'module-mergesort'],
    sourceRefs: [lectureBasics, { sourceId: 'src-baa07f0a207a', page: 194 }],
    verificationStatus: 'verified_against_official_source',
    publicDistributionStatus: 'public_safe',
  }),
  module({
    moduleId: 'module-schleifeninvariante',
    slug: 'schleifeninvarianten',
    title: 'Schleifeninvarianten',
    shortDescription:
      'Initialisierung, Erhaltung und Abschluss einer Invariante beweisbar formulieren.',
    topicIds: ['topic-e05ae3743b24', 'topic-2b335556483f'],
    taskNumbers: [5, 9],
    prerequisites: ['Pseudocode', 'Induktion'],
    learningObjectives: [
      'du formulierst eine prüfbare Invariante',
      'du führst den Dreischritt vollständig aus',
    ],
    introduction:
      'Eine Schleifeninvariante ist eine Aussage, die an einer festen Stelle jeder Iteration gilt. Sie ist der rote Faden des Korrektheitsbeweises.',
    intuitionSections: [
      'Die Invariante beschreibt, was bereits erledigt ist, nicht nur, was am Ende herauskommen soll.',
    ],
    definitionSections: [
      'Dreischritt: Initialisierung vor der ersten Iteration, Erhaltung von einer Iteration zur nächsten, Abschluss nach Terminierung.',
    ],
    theoremSections: [
      'Wenn Initialisierung, Erhaltung und Abschluss gezeigt sind, folgt partielle Korrektheit; Terminierung muss zusätzlich begründet werden.',
    ],
    algorithmSections: [
      'Suche im Code den Zustand, der sich monoton erweitert: Präfix, Menge markierter Knoten, sortierter Teilbereich oder akkumulierte Summe.',
    ],
    pseudocodeBlocks: [
      {
        title: 'Beweisgerüst',
        code: 'Invariante I(i): ...\nInitialisierung: ...\nErhaltung: nehme I(i) an, zeige I(i+1)\nAbschluss: aus I(n) folgt Spezifikation',
      },
    ],
    workedExamples: [
      {
        title: 'Summe eines Präfixes',
        steps: [
          'Nach i Iterationen enthält s die Summe der ersten i Elemente.',
          'Vor Iteration 0 ist s=0.',
          'Die nächste Iteration addiert genau A[i+1].',
          'Am Ende i=n, also enthält s die Gesamtsumme.',
        ],
      },
    ],
    proofSections: [
      'Der Erhaltungsschritt darf nicht mit einem Zahlenbeispiel ersetzt werden; er muss für ein beliebiges i gelten.',
    ],
    complexitySections: ['Der betrachtete Summenalgorithmus läuft in Θ(n) Zeit und O(1) Speicher.'],
    commonMistakes: [
      'Invariante ist identisch mit der Endbehauptung.',
      'Indexbereich fehlt.',
      'Terminierung wird vergessen.',
    ],
    examTips: [
      'Nutze explizite Überschriften: Initialisierung, Erhaltung, Abschluss, Terminierung.',
    ],
    miniExercises: [
      {
        prompt: 'Was ist falsch an „Die Schleife berechnet die richtige Summe“ als Invariante?',
        solution: 'Die Aussage beschreibt nur das Endziel und keinen stabilen Zwischenzustand.',
      },
    ],
    trainerIds: ['trainer-schleifeninvariante-summe-v1'],
    diagnosticCompetencyIds: ['foundation-proofs'],
    relatedModuleIds: ['module-pseudocode', 'module-induktion'],
    sourceRefs: [lectureProofs, { sourceId: 'src-baa07f0a207a', page: 132 }],
    verificationStatus: 'verified_against_official_source',
    publicDistributionStatus: 'public_safe',
  }),
  module({
    moduleId: 'module-induktion',
    slug: 'induktion-fuer-korrektheit-und-laufzeit',
    title: 'Induktion für Korrektheit und Laufzeit',
    shortDescription:
      'Induktionsbeweise als Werkzeug für Algorithmen, Rekursionen und Invarianten.',
    topicIds: ['topic-2b335556483f', 'topic-1e43393edfb4'],
    taskNumbers: [5, 6, 7, 8, 9],
    prerequisites: ['Aussagenlogik', 'Pseudocode'],
    learningObjectives: [
      'du wählst die richtige Induktionsgröße',
      'du formulierst die Induktionsvoraussetzung nutzbar',
    ],
    introduction:
      'Induktion ist in AlgoDat selten Selbstzweck. Sie beweist, dass ein rekursiver Schritt, ein DP-Übergang oder eine Schleife allgemein funktioniert.',
    intuitionSections: [
      'Wenn jeder korrekte kleinere Fall den nächsten Fall trägt und der Anfang stimmt, fällt keine Lücke mehr heraus.',
    ],
    definitionSections: [
      'Bestandteile: Induktionsanfang, Induktionsvoraussetzung, Induktionsschritt.',
    ],
    theoremSections: [
      'Vollständige Induktion erlaubt die Nutzung aller kleineren Fälle, nicht nur des direkten Vorgängers.',
    ],
    algorithmSections: [
      'Wähle n, i oder die Teilproblemgröße so, dass der Algorithmus im Schritt wirklich darauf zurückgreift.',
    ],
    pseudocodeBlocks: [
      {
        title: 'Induktionsstruktur',
        code: 'IA: zeige A(1)\nIV: A(k) gelte für k < n\nIS: zeige A(n) mithilfe der IV',
      },
    ],
    workedExamples: [
      {
        title: 'MergeSort-Korrektheit',
        steps: [
          'Basis: Länge 1 ist sortiert.',
          'IV: Kleinere Arrays werden korrekt sortiert.',
          'IS: Beide Hälften sind sortiert, Merge erzeugt daraus eine sortierte Gesamtliste.',
        ],
      },
    ],
    proofSections: [
      'Die Induktionsvoraussetzung muss genau die Aussage enthalten, die im Schritt gebraucht wird.',
    ],
    complexitySections: [
      'Laufzeitinduktionen zeigen häufig T(n) ≤ c·g(n), wobei c passend gewählt wird.',
    ],
    commonMistakes: [
      'IV wird erwähnt, aber nicht eingesetzt.',
      'Induktionsgröße passt nicht zum Algorithmus.',
      'Basisfall fehlt.',
    ],
    examTips: ['Markiere im Beweis den Moment, in dem du die IV verwendest.'],
    miniExercises: [
      {
        prompt: 'Warum reicht bei D&C oft vollständige Induktion besser als einfache Induktion?',
        solution:
          'Weil Teilprobleme nicht zwingend Größe n−1 haben, sondern beliebige kleinere Größen.',
      },
    ],
    trainerIds: ['trainer-rekurrenz-master-fall1-v1', 'trainer-schleifeninvariante-summe-v1'],
    diagnosticCompetencyIds: ['foundation-proofs'],
    relatedModuleIds: ['module-schleifeninvariante', 'module-rekurrenz-master'],
    sourceRefs: [lectureProofs, lectureBasics],
    verificationStatus: 'verified_against_official_source',
    publicDistributionStatus: 'public_safe',
  }),
  module({
    moduleId: 'module-datenstrukturen',
    slug: 'arrays-stacks-queues-und-zeiger',
    title: 'Arrays, Stacks, Queues und Zeigerrepräsentationen',
    shortDescription: 'Grundzustände von Datenstrukturen lesen, aktualisieren und prüfen.',
    topicIds: ['topic-0ba342914656', 'topic-595ab7b2682c'],
    taskNumbers: [1, 2, 4, 9],
    prerequisites: ['Pseudocode', 'Speichermodell-Grundidee'],
    learningObjectives: [
      'du unterscheidest logische Operation und konkrete Repräsentation',
      'du dokumentierst Zustandsänderungen vollständig',
    ],
    introduction:
      'Viele Klausurfehler entstehen nicht durch falsche Algorithmen, sondern durch unvollständige Zustandsdarstellung: Zeiger, Kopf, Ende, Größe oder Repräsentant fehlen.',
    intuitionSections: [
      'Eine Datenstruktur ist ein Vertrag: Operationen versprechen Verhalten, die Repräsentation erklärt, wie dieses Verhalten erreicht wird.',
    ],
    definitionSections: [
      'Stack: LIFO. Queue: FIFO. Array: indexierter Speicher mit direktem Zugriff. Verkettete Liste: Knoten mit Nachfolgerbezug.',
    ],
    theoremSections: [
      'Für Standardrepräsentationen ergeben sich typische O(1)-Operationen, sofern die nötigen Zeiger gepflegt werden.',
    ],
    algorithmSections: [
      'Beim Tracing nach jeder Operation den vollständigen Zustand neu prüfen: Elemente, Zeiger, Größe und Sonderfälle.',
    ],
    pseudocodeBlocks: [
      {
        title: 'Queue mit Kopf/Ende',
        code: 'enqueue(x): füge x hinter tail ein; tail = x\ndequeue(): entferne head; head = head.next',
      },
    ],
    workedExamples: [
      {
        title: 'Queue-Zustand',
        steps: [
          'Start leer.',
          'enqueue(4): head=tail=4.',
          'enqueue(7): 4.next=7, tail=7.',
          'dequeue(): head=7, tail bleibt 7.',
        ],
      },
    ],
    proofSections: [
      'Die Korrektheit einfacher Operationen folgt aus der Erhaltung der Repräsentationsinvariante.',
    ],
    complexitySections: ['Mit Kopf- und Endzeiger sind enqueue und dequeue in O(1) möglich.'],
    commonMistakes: [
      'tail nach Entfernen des letzten Elements nicht korrigiert.',
      'logische Reihenfolge und Speicherreihenfolge vermischt.',
    ],
    examTips: [
      'Zeichne nach jeder Operation nur die geänderten Zeiger neu, aber prüfe den ganzen Zustand.',
    ],
    miniExercises: [
      {
        prompt: 'Welche Queue-Regel gilt?',
        solution: 'First in, first out: Das zuerst eingefügte Element wird zuerst entfernt.',
      },
    ],
    trainerIds: ['trainer-union-find-listen-v1'],
    diagnosticCompetencyIds: ['foundation-data-structures'],
    relatedModuleIds: ['module-union-find-listen', 'module-rot-schwarz'],
    sourceRefs: [mockUnionFind],
    verificationStatus: 'partially_verified',
    publicDistributionStatus: 'public_safe',
  }),
  module({
    moduleId: 'module-union-find-listen',
    slug: 'union-find-mit-listen',
    title: 'Union-Find mit verketteten Listen',
    shortDescription: 'Mengen, Repräsentanten und gewichtete Union sauber tracen.',
    topicIds: ['topic-0ba342914656', 'topic-595ab7b2682c'],
    taskNumbers: [2, 4, 9],
    prerequisites: ['Listen', 'Zeigerzustände'],
    learningObjectives: [
      'du aktualisierst alle Repräsentantenzeiger',
      'du erkennst die kleinere Liste bei gewichteter Union',
    ],
    introduction:
      'Union-Find verwaltet disjunkte Mengen. In der Listenvariante ist der sichtbare Zustand wichtiger als eine einzelne Rückgabe.',
    intuitionSections: [
      'Find fragt: Wer ist mein Vertreter? Union fragt: Welche zwei Mengen werden zu einer Menge zusammengeführt?',
    ],
    definitionSections: [
      'MakeSet erzeugt eine Einermenge. Find liefert den Repräsentanten. Union vereinigt zwei Mengen.',
    ],
    theoremSections: [
      'Gewichtete Union begrenzt die Anzahl der Repräsentantenänderungen pro Element, weil immer die kleinere Liste umgehängt wird.',
    ],
    algorithmSections: [
      'Bestimme beide Repräsentanten, vergleiche Listengrößen, hänge die kleinere Liste an und aktualisiere deren Vertreterzeiger.',
    ],
    pseudocodeBlocks: [
      {
        title: 'Weighted Union',
        code: 'Union(x,y):\n  rx = Find(x); ry = Find(y)\n  if rx == ry: return\n  hänge kleinere Liste an größere\n  aktualisiere rep für alle Elemente der kleineren Liste',
      },
    ],
    workedExamples: [
      {
        title: 'Union({a,b},{c})',
        steps: [
          'Repräsentanten bestimmen: a und c.',
          'Kleinere Liste {c} an {a,b} hängen.',
          'rep(c)=a setzen, Größe der neuen Liste ist 3.',
        ],
      },
    ],
    proofSections: [
      'Die Mengen bleiben disjunkt, weil nur zwei vorhandene disjunkte Listen verkettet werden und alle Elemente der kleineren Liste denselben neuen Repräsentanten erhalten.',
    ],
    complexitySections: [
      'Find ist in der Listenrepräsentation O(1), Union kostet proportional zur umgehängten Liste.',
    ],
    commonMistakes: [
      'Nur den Listenkopf aktualisiert.',
      'Bei Gleichstand still die Regel gewechselt.',
      'Find-Ergebnis aus altem Zustand übernommen.',
    ],
    examTips: ['Nach jeder Union eine Menge-Repräsentant-Tabelle schreiben.'],
    miniExercises: [
      {
        prompt: 'Was muss bei Union außer dem next-Zeiger aktualisiert werden?',
        solution: 'Die Repräsentantenzeiger aller Elemente der kleineren Liste und die Größe.',
      },
    ],
    trainerIds: ['trainer-union-find-listen-v1'],
    diagnosticCompetencyIds: ['foundation-data-structures'],
    relatedModuleIds: ['module-datenstrukturen'],
    sourceRefs: [mockUnionFind, { sourceId: 'src-baa07f0a207a', page: 943 }],
    verificationStatus: 'verified_against_official_source',
    publicDistributionStatus: 'public_safe',
  }),
  module({
    moduleId: 'module-rot-schwarz',
    slug: 'rot-schwarz-baeume-und-einfuegen',
    title: 'Rot-Schwarz-Bäume und Einfügen',
    shortDescription: 'Eigenschaften, Reparaturfälle und Rotationen verständlich anwenden.',
    topicIds: ['topic-7ae0552985f1', 'topic-c3a4ee956f66'],
    taskNumbers: [2, 4, 9],
    prerequisites: ['binäre Suchbäume', 'Baumrotationen'],
    learningObjectives: [
      'du prüfst alle Rot-Schwarz-Eigenschaften',
      'du wählst Reparaturfälle nach Eltern- und Onkelfarbe',
    ],
    introduction:
      'Rot-Schwarz-Bäume halten Suchbäume balanciert. Beim Einfügen wird zunächst wie im binären Suchbaum eingefügt und danach die Färbung repariert.',
    intuitionSections: [
      'Schwarzhöhe begrenzt die Höhe indirekt; rote Knoten dürfen nicht direkt unter roten Knoten stehen.',
    ],
    definitionSections: [
      'Wurzel schwarz, NIL-Blätter schwarz, rote Knoten haben schwarze Kinder, alle Pfade zu NIL-Blättern haben gleiche Schwarzhöhe.',
    ],
    theoremSections: [
      'Die Eigenschaften garantieren logarithmische Höhe und damit O(log n)-Suche und -Einfügen.',
    ],
    algorithmSections: [
      'Füge den neuen Knoten rot ein. Solange ein roter Elternkonflikt existiert, unterscheide roten Onkel, Innenfall und Außenfall.',
    ],
    pseudocodeBlocks: [
      {
        title: 'Insert-Fixup',
        code: 'z rot einfügen\nwhile parent(z) rot:\n  if uncle(z) rot: umfärben\n  else: ggf. Vorrotation, dann Rotation und Farben tauschen\nroot schwarz setzen',
      },
    ],
    workedExamples: [
      {
        title: 'Roter Onkel',
        steps: [
          'Neuer Knoten z ist rot, Elternknoten ist rot.',
          'Onkel ist rot.',
          'Eltern und Onkel schwarz färben, Großelternknoten rot färben.',
          'Konflikt wandert nach oben.',
        ],
      },
    ],
    proofSections: [
      'Rotationen erhalten die Suchbaumeigenschaft; Umfärbungen und Rotation stellen die Rot-Schwarz-Eigenschaften lokal wieder her.',
    ],
    complexitySections: [
      'Suche des Einfügeorts O(log n), Fixup mit O(log n) Umfärbungen und konstant vielen Rotationen pro Ebene.',
    ],
    commonMistakes: [
      'Wurzel am Ende nicht schwarz.',
      'Innen- und Außenfall verwechselt.',
      'Schwarzhöhe nur auf einem Pfad geprüft.',
    ],
    examTips: ['Notiere vor jeder Reparatur: z, parent, grandparent, uncle und deren Farben.'],
    miniExercises: [
      {
        prompt: 'Warum wird ein neuer Knoten zunächst rot eingefügt?',
        solution:
          'Damit die Schwarzhöhe zunächst nicht verändert wird; rote Konflikte lassen sich lokal reparieren.',
      },
    ],
    trainerIds: ['trainer-rot-schwarz-einfuegen-v1'],
    diagnosticCompetencyIds: ['foundation-data-structures'],
    relatedModuleIds: ['module-datenstrukturen'],
    sourceRefs: [rbExam, { sourceId: 'src-5c9eadb17ccc', page: 15 }],
    verificationStatus: 'verified_against_official_source',
    publicDistributionStatus: 'public_safe',
  }),
  module({
    moduleId: 'module-dp-grundlagen',
    slug: 'dynamische-programmierung-grundlagen',
    title: 'Dynamische Programmierung: Idee, Zustand und Reihenfolge',
    shortDescription: 'DP als kontrollierte Wiederverwendung überlappender Teilprobleme.',
    topicIds: ['topic-c0af8532bb72', 'topic-f5b57f47447c'],
    taskNumbers: [1, 2, 8, 9],
    prerequisites: ['Rekursion', 'Tabellen lesen'],
    learningObjectives: [
      'du findest Teilprobleme',
      'du formulierst Zustände und Auswertungsreihenfolge',
    ],
    introduction:
      'Dynamische Programmierung löst Probleme, indem sie passende Teilprobleme definiert und deren Lösungen in einer sicheren Reihenfolge kombiniert.',
    intuitionSections: [
      'Statt dieselbe Frage mehrfach rekursiv zu beantworten, speichert DP Antworten und baut größere Antworten daraus auf.',
    ],
    definitionSections: [
      'Ein Zustand enthält genau die Information, die ein Teilproblem eindeutig macht. Die Rekurrenz beschreibt, wie Zustände voneinander abhängen.',
    ],
    theoremSections: [
      'Optimale Teilstruktur und überlappende Teilprobleme sind die typischen Voraussetzungen für DP.',
    ],
    algorithmSections: [
      'Wähle Zustand, Randfälle, Übergang, Auswertungsreihenfolge und Antwortzelle.',
    ],
    pseudocodeBlocks: [
      {
        title: 'DP-Entwurfsschema',
        code: 'definiere DP-Zustand\ninitialisiere Randfälle\nfor Zustände in gültiger Reihenfolge:\n  DP[state] = Kombination früherer Zustände\nreturn Antwortzustand',
      },
    ],
    workedExamples: [
      {
        title: 'Pfad in Gitter',
        steps: [
          'Zustand: beste Lösung bis Zelle (i,j).',
          'Rand: erste Zeile/Spalte.',
          'Übergang: aus oben oder links.',
          'Antwort: Zielzelle.',
        ],
      },
    ],
    proofSections: [
      'Korrektheit wird meist per Induktion über die Auswertungsreihenfolge gezeigt.',
    ],
    complexitySections: [
      'Zeit = Anzahl Zustände · Kosten pro Übergang; Speicher = Größe der Tabelle, sofern nicht optimiert.',
    ],
    commonMistakes: [
      'Zustand speichert zu wenig.',
      'Randfälle fehlen.',
      'Reihenfolge verletzt Abhängigkeiten.',
    ],
    examTips: ['Schreibe Zustand und Bedeutung vor jeder Formel in Worten.'],
    miniExercises: [
      {
        prompt: 'Was ist wichtiger: Code oder Zustandsdefinition?',
        solution: 'Die Zustandsdefinition; ohne sie ist die Rekurrenz nicht bewertbar.',
      },
    ],
    trainerIds: ['trainer-dp-entwurf-mine-v1', 'trainer-rucksack-dp-v1'],
    diagnosticCompetencyIds: ['foundation-paradigms'],
    relatedModuleIds: ['module-rucksack-dp', 'module-dp-entwurf-mine'],
    sourceRefs: [clrsDp, mockDp],
    verificationStatus: 'verified_against_official_source',
    publicDistributionStatus: 'public_safe',
  }),
  module({
    moduleId: 'module-rucksack-dp',
    slug: 'null-eins-rucksack-dp',
    title: '0/1-Rucksack-DP',
    shortDescription: 'Tabelle, Rekurrenz und Auswahlentscheidung für das Rucksackproblem.',
    topicIds: ['topic-f5b57f47447c', 'topic-c0af8532bb72'],
    taskNumbers: [1, 2, 8],
    prerequisites: ['DP-Grundlagen', 'Tabellen'],
    learningObjectives: [
      'du füllst die Tabelle zeilenweise',
      'du begründest jede Zelle aus übernehmen oder einpacken',
    ],
    introduction:
      'Beim 0/1-Rucksack darf jeder Gegenstand höchstens einmal gewählt werden. Die Tabelle verhindert, dass Entscheidungen mehrfach oder mit falscher Kapazität gezählt werden.',
    intuitionSections: [
      'Für jeden Gegenstand entscheidest du: nehme ich ihn nicht, oder nehme ich ihn und nutze den besten Restplatz der vorherigen Zeile?',
    ],
    definitionSections: [
      'DP[i,w] ist der beste Wert mit den ersten i Gegenständen und Kapazität w.',
    ],
    theoremSections: [
      'Die Rekurrenz ist DP[i,w]=DP[i−1,w], falls Gegenstand i zu schwer ist, sonst max(DP[i−1,w], Wert_i + DP[i−1,w−Gewicht_i]).',
    ],
    algorithmSections: ['Initialisiere Zeile 0 mit 0 und fülle dann i von 1 bis n, w von 0 bis W.'],
    pseudocodeBlocks: [
      {
        title: 'Rucksack-DP',
        code: 'for w=0..W: DP[0,w]=0\nfor i=1..n:\n  for w=0..W:\n    if weight[i] > w: DP[i,w]=DP[i-1,w]\n    else: DP[i,w]=max(DP[i-1,w], value[i]+DP[i-1,w-weight[i]])',
      },
    ],
    workedExamples: [
      {
        title: 'Kapazität 3, Gegenstände (2,4),(3,5)',
        steps: [
          'Mit Gegenstand 1 ist bei w=2 und w=3 der Wert 4 möglich.',
          'Bei Gegenstand 2 und w=3 vergleiche übernehmen 4 mit einpacken 5.',
          'DP[2,3]=5.',
        ],
      },
    ],
    proofSections: [
      'Induktion über i: Jede optimale Lösung nutzt Gegenstand i entweder nicht oder genau einmal; beide Fälle stehen in der Rekurrenz.',
    ],
    complexitySections: [
      'Zeit Θ(nW), Speicher Θ(nW), bei reiner Wertberechnung optimierbar auf Θ(W).',
    ],
    commonMistakes: [
      'Aktuelle Zeile statt vorheriger Zeile genutzt.',
      'Kapazität und Gewicht verwechselt.',
      'Antwort aus falscher Zelle gelesen.',
    ],
    examTips: ['Markiere bei jeder Konfliktzelle die beiden Kandidatenwerte.'],
    miniExercises: [
      {
        prompt: 'Warum steht bei 0/1-Rucksack DP[i−1,w−Gewicht_i] und nicht DP[i,w−Gewicht_i]?',
        solution: 'Weil Gegenstand i höchstens einmal verwendet werden darf.',
      },
    ],
    trainerIds: ['trainer-rucksack-dp-v1'],
    diagnosticCompetencyIds: ['foundation-paradigms'],
    relatedModuleIds: ['module-dp-grundlagen', 'module-dp-entwurf-mine'],
    sourceRefs: [{ sourceId: 'src-25d6340b518c', page: 33 }, clrsDp],
    verificationStatus: 'verified_against_official_source',
    publicDistributionStatus: 'public_safe',
  }),
  module({
    moduleId: 'module-dp-entwurf-mine',
    slug: 'dp-entwurf-mine',
    title: 'DP-Entwurf: Mine',
    shortDescription: 'Klausurnaher DP-Entwurf mit Zustand, Rekurrenz, Beweis und Aufwand.',
    topicIds: ['topic-c0af8532bb72', 'topic-2b335556483f'],
    taskNumbers: [8, 9],
    prerequisites: ['DP-Grundlagen', 'Induktion'],
    learningObjectives: [
      'du leitest Zustände aus Teilproblemen ab',
      'du formulierst Randfälle und Übergänge vollständig',
    ],
    introduction:
      'Die Mine-Aufgabe prüft DP-Entwurf, nicht bloß Tabellenfüllen. Bewertet wird der vollständige Weg von Teilproblem bis Laufzeit.',
    intuitionSections: ['Jeder Zustand beantwortet eine kleinere Version derselben Planungsfrage.'],
    definitionSections: [
      'Zustand, Randfall, Übergang, Auswertungsreihenfolge und Ergebnisextraktion sind getrennte Antwortteile.',
    ],
    theoremSections: [
      'Die Korrektheit folgt aus vollständiger Fallunterscheidung der letzten Entscheidung.',
    ],
    algorithmSections: [
      'Arbeite zuerst mathematisch, dann in Pseudocode. Leite die Schleifenreihenfolge aus den Abhängigkeiten ab.',
    ],
    pseudocodeBlocks: [
      {
        title: 'Entwurfsantwort',
        code: 'Zustand: DP[...]\nRandfälle: ...\nÜbergang: ...\nBerechnung: for ...\nAntwort: ...',
      },
    ],
    workedExamples: [
      {
        title: 'Entscheidung aus Vorgängern',
        steps: [
          'Bestimme, welche vorherigen Zustände legal sind.',
          'Nimm den besten Kandidaten plus aktuellem Beitrag.',
          'Speichere zusätzlich Rekonstruktionsinfo, falls verlangt.',
        ],
      },
    ],
    proofSections: [
      'Induktion über die Auswertungsreihenfolge: Wenn alle Vorgängerzustände optimal sind, wählt der Übergang den besten zulässigen letzten Schritt.',
    ],
    complexitySections: [
      'Anzahl Zustände mal Anzahl Kandidaten pro Zustand; Speicher entspricht der gespeicherten Tabelle.',
    ],
    commonMistakes: [
      'Nur Intuition, keine Rekurrenz.',
      'Randfall fehlt.',
      'Pseudocode berechnet Zustände in falscher Reihenfolge.',
    ],
    examTips: ['Nutze die fünf Überschriften Zustand, Rand, Übergang, Reihenfolge, Laufzeit.'],
    miniExercises: [
      {
        prompt: 'Was muss eine DP-Rekurrenz immer zusätzlich angeben?',
        solution: 'Die Bedeutung des Zustands und die Randfälle.',
      },
    ],
    trainerIds: ['trainer-dp-entwurf-mine-v1'],
    diagnosticCompetencyIds: ['foundation-paradigms', 'foundation-proofs'],
    relatedModuleIds: ['module-dp-grundlagen', 'module-rucksack-dp'],
    sourceRefs: [mockDp, { sourceId: 'src-35405e721f05', page: 11 }],
    verificationStatus: 'verified_against_official_source',
    publicDistributionStatus: 'public_safe',
  }),
  module({
    moduleId: 'module-greedy-entwurf',
    slug: 'greedy-entwurf-und-austauschargument',
    title: 'Greedy-Entwurf und Austauschargument',
    shortDescription: 'Lokale Wahl, globale Optimalität und Beweisstrategie.',
    topicIds: ['topic-3e0e72f97f6e'],
    taskNumbers: [7, 9],
    prerequisites: ['Sortieren', 'Induktion oder Widerspruch'],
    learningObjectives: [
      'du formulierst eine Greedy-Regel präzise',
      'du beweist sie mit einem Austauschargument',
    ],
    introduction:
      'Greedy wirkt einfach, ist aber nur korrekt, wenn die lokale Wahl sicher ist. Die Klausur bewertet deshalb Regel und Beweis zusammen.',
    intuitionSections: [
      'Eine Greedy-Regel nimmt jetzt eine Entscheidung und schaut nicht zurück. Das ist nur erlaubt, wenn eine optimale Lösung existiert, die diese Entscheidung enthält.',
    ],
    definitionSections: [
      'Greedy choice: eine lokal beste Wahl, die Teil einer global optimalen Lösung sein kann.',
    ],
    theoremSections: [
      'Austauschargument: Wandle eine optimale Lösung ohne die Greedy-Wahl in eine mindestens ebenso gute Lösung mit der Greedy-Wahl um.',
    ],
    algorithmSections: [
      'Sortiere oder priorisiere Kandidaten, wähle legal nach Regel, aktualisiere Zustand.',
    ],
    pseudocodeBlocks: [
      {
        title: 'Greedy-Schema',
        code: 'sortiere Kandidaten nach Regel\nS = leer\nfor Kandidat in Reihenfolge:\n  if Kandidat passt zu S:\n    füge Kandidat hinzu\nreturn S',
      },
    ],
    workedExamples: [
      {
        title: 'Intervallauswahl',
        steps: [
          'Sortiere Intervalle nach frühestem Ende.',
          'Wähle das erste kompatible Intervall.',
          'Wiederhole mit dem nächsten Intervall, das nach dem Ende startet.',
        ],
      },
    ],
    proofSections: [
      'Das früh endende Intervall lässt mindestens so viel Restspielraum wie jedes andere erste Intervall; daher kann eine optimale Lösung entsprechend ausgetauscht werden.',
    ],
    complexitySections: [
      'Häufig dominiert Sortieren mit O(n log n); der anschließende Scan ist O(n).',
    ],
    commonMistakes: [
      'Regel nur vage beschrieben.',
      'Beweis durch Beispiel ersetzt.',
      'Sortierkosten fehlen.',
    ],
    examTips: ['Schreibe zuerst „Greedy-Regel:“ als eigenen Satz.'],
    miniExercises: [
      {
        prompt: 'Warum reicht „sieht plausibel aus“ nicht für Greedy?',
        solution:
          'Weil lokale Plausibilität keine globale Optimalität beweist; nötig ist z. B. ein Austauschargument.',
      },
    ],
    trainerIds: ['trainer-greedy-entwurf-fitnesspunkte-v1'],
    diagnosticCompetencyIds: ['foundation-paradigms', 'foundation-proofs'],
    relatedModuleIds: ['module-dc-maxwertdifferenz', 'module-induktion'],
    sourceRefs: [
      { sourceId: 'src-97414623dd81', page: 8 },
      { sourceId: 'src-8a588d5ddc35', page: 8 },
    ],
    verificationStatus: 'verified_against_official_source',
    publicDistributionStatus: 'public_safe',
  }),
  module({
    moduleId: 'module-dc-maxwertdifferenz',
    slug: 'divide-and-conquer-maximale-wertdifferenz',
    title: 'Divide-and-Conquer: maximale Wertdifferenz',
    shortDescription: 'Zerlegung, Combine-Fall und Rekurrenz einer D&C-Entwurfsaufgabe.',
    topicIds: ['topic-00cf6dec50ed'],
    taskNumbers: [7, 9],
    prerequisites: ['Rekursion', 'Rekurrenzen'],
    learningObjectives: [
      'du deckst linke, rechte und grenzübergreifende Fälle ab',
      'du leitest die Rekurrenz aus dem Combine-Schritt ab',
    ],
    introduction:
      'Divide-and-Conquer-Aufgaben prüfen, ob du nicht nur teilst, sondern die Teillösungen vollständig kombinierst.',
    intuitionSections: [
      'Das Optimum liegt entweder links, rechts oder überschreitet die Mitte. Der Combine-Schritt darf keinen dieser Fälle verlieren.',
    ],
    definitionSections: [
      'Teilproblem: löse dieselbe Fragestellung auf einem Intervall. Combine: berechne Kandidaten, die beide Hälften betreffen.',
    ],
    theoremSections: [
      'Vollständige Fallabdeckung plus korrekte rekursive Teillösungen liefert Korrektheit per Induktion.',
    ],
    algorithmSections: [
      'Teile das Array, löse beide Hälften rekursiv, berechne Grenzkandidat, gib den besten Kandidaten zurück.',
    ],
    pseudocodeBlocks: [
      {
        title: 'D&C-Schema',
        code: 'Solve(l,r):\n  if l == r: return Basis\n  m = floor((l+r)/2)\n  L = Solve(l,m)\n  R = Solve(m+1,r)\n  C = Combine(l,m,r)\n  return best(L,R,C)',
      },
    ],
    workedExamples: [
      {
        title: 'Grenzfall',
        steps: [
          'Bestimme beste linke Vorinformation.',
          'Bestimme beste rechte Nachinformation.',
          'Kombiniere nur zulässige Reihenfolge.',
          'Vergleiche mit linken und rechten Optima.',
        ],
      },
    ],
    proofSections: [
      'Jede zulässige Lösung fällt in genau einen der drei Fälle links, rechts oder grenzübergreifend.',
    ],
    complexitySections: ['Wenn Combine linear ist: T(n)=2T(n/2)+O(n), also Θ(n log n).'],
    commonMistakes: [
      'Grenzübergreifender Fall fehlt.',
      'Combine-Kosten nicht in Rekurrenz.',
      'Basisfall nicht definiert.',
    ],
    examTips: ['Schreibe vor Pseudocode die drei Fälle hin.'],
    miniExercises: [
      {
        prompt: 'Welche drei Kandidaten vergleicht der Combine-Rückgabeschritt?',
        solution:
          'Bestes linkes Optimum, bestes rechtes Optimum, bester grenzübergreifender Kandidat.',
      },
    ],
    trainerIds: ['trainer-dc-entwurf-maxwertdifferenz-v1'],
    diagnosticCompetencyIds: [
      'foundation-recurrences',
      'foundation-paradigms',
      'foundation-proofs',
    ],
    relatedModuleIds: ['module-rekurrenz-master', 'module-mergesort'],
    sourceRefs: [dcSource],
    verificationStatus: 'verified_against_official_source',
    publicDistributionStatus: 'public_safe',
  }),
  module({
    moduleId: 'module-graphen',
    slug: 'graphen-bfs-dfs-und-begriffe',
    title: 'Graphbegriffe, BFS und DFS',
    shortDescription: 'Knoten, Kanten, Nachbarschaften und Traversierungszustände sicher lesen.',
    topicIds: ['topic-f5f6e171c082'],
    taskNumbers: [1, 3, 4, 9],
    prerequisites: ['Mengen und Relationen', 'Queues und Stacks'],
    learningObjectives: [
      'du unterscheidest gerichtete und ungerichtete Graphen',
      'du erklärst BFS/DFS-Zustände',
    ],
    introduction:
      'Graphaufgaben sind oft Tracing-Aufgaben: Entscheidend ist, den aktuellen Zustand aus Distanzen, Vorgängern, Farben oder Baumkanten vollständig zu halten.',
    intuitionSections: [
      'BFS breitet sich in Schichten aus; DFS verfolgt einen Pfad tief, bevor es zurückkehrt.',
    ],
    definitionSections: [
      'Ein Graph besteht aus Knoten V und Kanten E. Bei gerichteten Graphen haben Kanten eine Richtung.',
    ],
    theoremSections: [
      'BFS liefert in ungewichteten Graphen kürzeste Kantenzahlen vom Startknoten.',
    ],
    algorithmSections: [
      'BFS nutzt eine Queue; DFS nutzt Rekursion oder Stack. Beide markieren besuchte Knoten, um Wiederholungen zu vermeiden.',
    ],
    pseudocodeBlocks: [
      {
        title: 'BFS',
        code: 'dist[s]=0; Q=[s]\nwhile Q nicht leer:\n  u = dequeue(Q)\n  for v in Adj[u]:\n    if v unbesucht:\n      dist[v]=dist[u]+1; pred[v]=u; enqueue(v)',
      },
    ],
    workedExamples: [
      {
        title: 'BFS-Schicht',
        steps: [
          'Start s hat Distanz 0.',
          'Alle unbesuchten Nachbarn erhalten Distanz 1.',
          'Danach werden deren unbesuchte Nachbarn Distanz 2.',
        ],
      },
    ],
    proofSections: [
      'Queue-Reihenfolge stellt sicher, dass Knoten in nichtfallender Distanz entdeckt werden.',
    ],
    complexitySections: ['Mit Adjazenzlisten laufen BFS und DFS in O(|V|+|E|).'],
    commonMistakes: [
      'Besucht erst beim Entfernen statt beim Einfügen markiert und dadurch Duplikate erzeugt.',
      'Vorgänger vergessen.',
    ],
    examTips: ['Führe Tabelle mit Knoten, Status, Distanz und Vorgänger.'],
    miniExercises: [
      { prompt: 'Welche Datenstruktur nutzt BFS typischerweise?', solution: 'Eine Queue.' },
    ],
    trainerIds: ['trainer-graph-dijkstra-v1', 'trainer-graph-floyd-warshall-v1'],
    diagnosticCompetencyIds: ['foundation-graph-basics'],
    relatedModuleIds: ['module-dijkstra', 'module-floyd-warshall', 'module-prim-mst'],
    sourceRefs: [clrsGraphs],
    verificationStatus: 'verified_against_official_source',
    publicDistributionStatus: 'public_safe',
  }),
  module({
    moduleId: 'module-dijkstra',
    slug: 'dijkstra',
    title: 'Dijkstra',
    shortDescription: 'Nichtnegative kürzeste Wege mit Distanz- und Vorgängertabelle.',
    topicIds: ['topic-e8b80c23286d', 'topic-f5f6e171c082'],
    taskNumbers: [3, 9],
    prerequisites: ['Graphbegriffe', 'Prioritätsauswahl'],
    learningObjectives: [
      'du relaxierst Kanten korrekt',
      'du markierst abgeschlossene Knoten stabil',
    ],
    introduction:
      'Dijkstra berechnet kürzeste Wege bei nichtnegativen Kantengewichten. Im Tracing zählt jeder Relaxierungsschritt.',
    intuitionSections: [
      'Der aktuell kleinste temporäre Abstand kann nicht mehr verbessert werden, wenn alle Kantengewichte nichtnegativ sind.',
    ],
    definitionSections: [
      'Relaxierung prüft, ob dist[u]+w(u,v) eine bessere Distanz für v liefert.',
    ],
    theoremSections: [
      'Nach dem Extrahieren eines Knotens mit minimaler temporärer Distanz ist dessen Distanz endgültig.',
    ],
    algorithmSections: [
      'Initialisiere dist[s]=0, alle anderen ∞. Wiederholt: wähle offenen Knoten mit kleinster Distanz, relaxiere seine ausgehenden Kanten.',
    ],
    pseudocodeBlocks: [
      {
        title: 'Dijkstra',
        code: 'dist[s]=0; pred[*]=⊥\nwhile offene Knoten existieren:\n  u = Knoten mit minimaler dist\n  markiere u abgeschlossen\n  for (u,v) in E:\n    if dist[u]+w(u,v) < dist[v]:\n      dist[v]=dist[u]+w(u,v); pred[v]=u',
      },
    ],
    workedExamples: [
      {
        title: 'Eine Relaxierung',
        steps: [
          'dist[u]=5, Kante u→v hat Gewicht 2.',
          'Aktuell dist[v]=9.',
          '5+2=7 < 9, also dist[v]=7 und pred[v]=u.',
        ],
      },
    ],
    proofSections: [
      'Nichtnegative Gewichte verhindern, dass ein späterer Umweg zu einem bereits abgeschlossenen Knoten noch kürzer wird.',
    ],
    complexitySections: [
      'Mit einfacher Auswahl O(|V|²+|E|), mit geeigneter Priority Queue typischerweise O((|V|+|E|) log |V|).',
    ],
    commonMistakes: [
      'Negative Kanten ignoriert.',
      'Vorgänger bei Distanzupdate nicht geändert.',
      'Abgeschlossene Knoten erneut verbessert.',
    ],
    examTips: ['Notiere pro Runde: gewählter Knoten, relaxierte Kanten, geänderte Tabellenzellen.'],
    miniExercises: [
      {
        prompt: 'Warum ist Dijkstra bei negativen Kanten problematisch?',
        solution:
          'Eine später gefundene negative Kante könnte eine bereits endgültig gesetzte Distanz verbessern.',
      },
    ],
    trainerIds: ['trainer-graph-dijkstra-v1'],
    diagnosticCompetencyIds: ['foundation-graph-algorithms'],
    relatedModuleIds: ['module-graphen', 'module-floyd-warshall'],
    sourceRefs: [clrsGraphs, { sourceId: 'src-011d1ee23245', page: 4 }],
    verificationStatus: 'verified_against_official_source',
    publicDistributionStatus: 'public_safe',
  }),
  module({
    moduleId: 'module-floyd-warshall',
    slug: 'floyd-warshall',
    title: 'Floyd-Warshall',
    shortDescription: 'All-pairs shortest paths als Matrixfolge über erlaubte Zwischenknoten.',
    topicIds: ['topic-1fa208a0ed89', 'topic-f5f6e171c082'],
    taskNumbers: [3, 9],
    prerequisites: ['Graphen', 'Matrizen', 'DP-Grundidee'],
    learningObjectives: [
      'du interpretierst k als erlaubte Zwischenknotenmenge',
      'du aktualisierst Matrixzellen nachvollziehbar',
    ],
    introduction:
      'Floyd-Warshall ist dynamische Programmierung auf Graphen: Jede Matrixstufe erlaubt einen weiteren Zwischenknoten.',
    intuitionSections: [
      'Für jeden Paarweg fragst du: Ist der alte Weg besser oder der Weg über den neuen Zwischenknoten k?',
    ],
    definitionSections: [
      'Dᵏ[i,j] ist die Länge eines kürzesten Weges von i nach j, der nur Zwischenknoten aus {1,…,k} verwendet.',
    ],
    theoremSections: ['Dᵏ[i,j] = min(Dᵏ⁻¹[i,j], Dᵏ⁻¹[i,k] + Dᵏ⁻¹[k,j]).'],
    algorithmSections: [
      'Für k von 1 bis n prüfst du alle Paare i,j und aktualisierst bei echter Verbesserung.',
    ],
    pseudocodeBlocks: [
      {
        title: 'Floyd-Warshall',
        code: 'D = Gewichtsmatrix\nfor k=1..n:\n  for i=1..n:\n    for j=1..n:\n      D[i,j] = min(D[i,j], D[i,k] + D[k,j])',
      },
    ],
    workedExamples: [
      {
        title: 'Update über k',
        steps: [
          'Alter Wert D[i,j]=10.',
          'D[i,k]=3 und D[k,j]=4.',
          '3+4=7 ist besser, also neuer Wert 7.',
        ],
      },
    ],
    proofSections: [
      'Ein kürzester Weg mit Zwischenknoten aus {1,…,k} benutzt k entweder nicht oder zerfällt in i→k und k→j.',
    ],
    complexitySections: ['Drei geschachtelte Schleifen ergeben Θ(n³) Zeit und Θ(n²) Speicher.'],
    commonMistakes: [
      'k als Start- oder Zielknoten gelesen.',
      '∞ wie normale Zahl addiert.',
      'Matrixstufen vermischt.',
    ],
    examTips: ['Beschrifte jede Matrix mit der aktuellen k-Stufe.'],
    miniExercises: [
      {
        prompt: 'Was bedeutet Dᵏ[i,j]?',
        solution: 'Kürzester i-j-Weg mit Zwischenknoten nur aus den ersten k Knoten.',
      },
    ],
    trainerIds: ['trainer-graph-floyd-warshall-v1'],
    diagnosticCompetencyIds: ['foundation-graph-algorithms'],
    relatedModuleIds: ['module-graphen', 'module-dijkstra'],
    sourceRefs: [
      { sourceId: 'src-8f16b2505bbd', page: 4 },
      { sourceId: 'src-c4dde22523d3', page: 4 },
    ],
    verificationStatus: 'verified_against_official_source',
    publicDistributionStatus: 'public_safe',
  }),
  module({
    moduleId: 'module-prim-mst',
    slug: 'prim-und-minimale-spannbaeume',
    title: 'Prim und minimale Spannbäume',
    shortDescription: 'MST-Aufbau über sichere Kanten, Schlüsselwerte und Elternkanten.',
    topicIds: ['topic-6a47a10f37e0', 'topic-c4a698fc939e'],
    taskNumbers: [3, 4, 9],
    prerequisites: ['ungerichtete gewichtete Graphen', 'Baumbegriffe'],
    learningObjectives: [
      'du führst Schlüsselwerte und Elternkanten',
      'du trennst Prim von Kruskal',
    ],
    introduction:
      'Prim wächst einen Baum von einem Startknoten aus. In jeder Runde kommt der Knoten mit der billigsten Verbindung zum aktuellen Baum hinzu.',
    intuitionSections: [
      'Der Baum hält eine zusammenhängende Komponente; die nächste sichere Kante verbindet diese Komponente möglichst günstig nach außen.',
    ],
    definitionSections: [
      'Ein Spannbaum verbindet alle Knoten ohne Zyklus. Ein minimaler Spannbaum minimiert die Summe der Kantenkosten.',
    ],
    theoremSections: [
      'Schnitt-Eigenschaft: Eine leichteste Kante über einen passenden Schnitt ist sicher für einen MST.',
    ],
    algorithmSections: [
      'Initialisiere Start mit Schlüssel 0. Wähle wiederholt offenen Knoten mit minimalem Schlüssel und aktualisiere seine Nachbarn.',
    ],
    pseudocodeBlocks: [
      {
        title: 'Prim',
        code: 'key[s]=0; parent[*]=⊥\nwhile offene Knoten:\n  u = min-key Knoten\n  füge u zum Baum hinzu\n  for Nachbar v offen:\n    if w(u,v) < key[v]: key[v]=w(u,v); parent[v]=u',
      },
    ],
    workedExamples: [
      {
        title: 'Elternupdate',
        steps: [
          'v hat key 8 über a.',
          'Neue Kante u-v hat Gewicht 5.',
          'Setze key[v]=5 und parent[v]=u.',
        ],
      },
    ],
    proofSections: [
      'Jede gewählte Kante ist über die Schnitt-Eigenschaft sicher; der zusammenhängende azyklische Aufbau liefert einen Spannbaum.',
    ],
    complexitySections: [
      'Mit einfacher Tabelle O(|V|²); mit Priority Queue abhängig von Implementierung O(|E| log |V|).',
    ],
    commonMistakes: [
      'Kruskal-Kantenliste statt Prim-Baumzustand geführt.',
      'parent bei key-Update vergessen.',
      'Startknoten als Kante gezählt.',
    ],
    examTips: ['Halte drei Spalten: im Baum?, key, parent.'],
    miniExercises: [
      {
        prompt: 'Was speichert parent[v] bei Prim?',
        solution: 'Die aktuell beste Kante, über die v in den Baum aufgenommen würde.',
      },
    ],
    trainerIds: ['trainer-graph-prim-mst-v1'],
    diagnosticCompetencyIds: ['foundation-graph-algorithms'],
    relatedModuleIds: ['module-graphen', 'module-datenstrukturen'],
    sourceRefs: [{ sourceId: 'src-8f16b2505bbd', page: 3 }, clrsMst],
    verificationStatus: 'verified_against_official_source',
    publicDistributionStatus: 'public_safe',
  }),
];

export function getRichModuleBySlug(slug: string): RichStudyModule | undefined {
  return richStudyModules.find((module) => module.slug === slug);
}

export function getRichModule(moduleId: string): RichStudyModule | undefined {
  return richStudyModules.find((module) => module.moduleId === moduleId);
}

export function getRichModulesForTopic(topicId: string): RichStudyModule[] {
  return richStudyModules.filter((module) => module.topicIds.includes(topicId));
}

export function getRichModulesForTask(taskNumber: number): RichStudyModule[] {
  return richStudyModules.filter((module) => module.taskNumbers.includes(taskNumber));
}
