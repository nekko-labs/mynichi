export type Support = 'yes' | 'partial' | 'no';

export interface CompareCell {
  support: Support;
  note?: string;
}

export interface CompareRow {
  feature: string;
  detail?: string;
  mynichi: CompareCell;
  cells: Record<CompetitorId, CompareCell>;
}

export type CompetitorId = 'duolingo' | 'anki' | 'google-translate' | 'jisho';

export interface Competitor {
  id: CompetitorId;
  name: string;
  tagline: string;
  goodAt: string;
  but: string;
  verdict: string;
  highlightRows: number[];
}

export const compareRows: CompareRow[] = [
  {
    feature: 'Starts from your daily life',
    detail: 'The letter in your mailbox, the word your coworker used, the sign on the door',
    mynichi: { support: 'yes', note: 'Your day IS the curriculum' },
    cells: {
      duolingo: { support: 'no', note: 'Fixed course, unit by unit' },
      anki: { support: 'partial', note: 'Only if you build every card yourself' },
      'google-translate': { support: 'partial', note: 'Translates, then forgets you' },
      jisho: { support: 'no', note: 'Lookup only' }
    }
  },
  {
    feature: 'Practical "what to actually do" translation',
    detail: 'Literal meaning AND what the text wants from you',
    mynichi: { support: 'yes' },
    cells: {
      duolingo: { support: 'no' },
      anki: { support: 'no' },
      'google-translate': { support: 'partial', note: 'One literal line, no guidance' },
      jisho: { support: 'no' }
    }
  },
  {
    feature: 'Furigana + romaji on real text',
    mynichi: { support: 'yes', note: 'Proper ruby text, every layer' },
    cells: {
      duolingo: { support: 'partial', note: 'On lesson content only' },
      anki: { support: 'partial', note: 'Via add-ons, DIY' },
      'google-translate': { support: 'partial', note: 'Romaji only' },
      jisho: { support: 'partial', note: 'Per word, not per document' }
    }
  },
  {
    feature: 'Five-second capture into practice lists',
    detail: 'Type the word you overheard; reading, meaning, and example fill themselves in',
    mynichi: { support: 'yes' },
    cells: {
      duolingo: { support: 'no' },
      anki: { support: 'partial', note: 'Manual card authoring' },
      'google-translate': { support: 'partial', note: 'A flat phrasebook star' },
      jisho: { support: 'no', note: 'Copy-paste somewhere else' }
    }
  },
  {
    feature: 'Spaced-repetition review',
    mynichi: { support: 'yes', note: 'FSRS, per life-category list' },
    cells: {
      duolingo: { support: 'partial', note: 'Their schedule, their words' },
      anki: { support: 'yes', note: 'The gold standard, if you feed it' },
      'google-translate': { support: 'no' },
      jisho: { support: 'no' }
    }
  },
  {
    feature: 'Stroke-order writing practice with per-stroke feedback',
    detail: 'Trace with guidance, or draw blind and get corrected mid-character',
    mynichi: { support: 'yes' },
    cells: {
      duolingo: { support: 'partial', note: 'Basic tracing in some lessons' },
      anki: { support: 'partial', note: 'Add-ons, no live judgment' },
      'google-translate': { support: 'no' },
      jisho: { support: 'no', note: 'Shows stroke order, does not coach' }
    }
  },
  {
    feature: 'Draw a kanji you cannot type',
    mynichi: { support: 'yes', note: 'Plus radical picker' },
    cells: {
      duolingo: { support: 'no' },
      anki: { support: 'no' },
      'google-translate': { support: 'yes', note: 'Handwriting input' },
      jisho: { support: 'yes', note: 'Handwriting input' }
    }
  },
  {
    feature: 'Look-alike kanji, differences highlighted',
    detail: '未 vs 末 side by side, the differing strokes in color',
    mynichi: { support: 'yes' },
    cells: {
      duolingo: { support: 'no' },
      anki: { support: 'no' },
      'google-translate': { support: 'no' },
      jisho: { support: 'no' }
    }
  },
  {
    feature: 'AI speaking practice, judgment-free',
    detail: 'Rehearse the dentist call before the real one, using your own study words',
    mynichi: { support: 'yes', note: 'Cloud or fully on-device' },
    cells: {
      duolingo: { support: 'partial', note: 'Max roleplay, their scenarios' },
      anki: { support: 'no' },
      'google-translate': { support: 'no' },
      jisho: { support: 'no' }
    }
  },
  {
    feature: 'Works offline',
    mynichi: { support: 'yes', note: 'Free tier is local-first, incl. on-device AI' },
    cells: {
      duolingo: { support: 'partial', note: 'Some lessons, paid' },
      anki: { support: 'yes' },
      'google-translate': { support: 'partial', note: 'Language packs' },
      jisho: { support: 'no', note: 'Website' }
    }
  },
  {
    feature: 'Never trains on your data, voice never stored',
    mynichi: { support: 'yes', note: 'A promise, in writing, both modes' },
    cells: {
      duolingo: { support: 'no' },
      anki: { support: 'partial', note: 'Local, but sync is unencrypted' },
      'google-translate': { support: 'no' },
      jisho: { support: 'partial', note: 'It is a website' }
    }
  },
  {
    feature: 'No streaks, no guilt mechanics',
    mynichi: { support: 'yes' },
    cells: {
      duolingo: { support: 'no', note: 'The owl remembers' },
      anki: { support: 'partial', note: 'The due pile judges you' },
      'google-translate': { support: 'yes' },
      jisho: { support: 'yes' }
    }
  }
];

export const competitors: Competitor[] = [
  {
    id: 'duolingo',
    name: 'Duolingo',
    tagline: 'A course about Japan. mynichi is for your life in Japan.',
    goodAt:
      'Duolingo is genuinely good at building a daily habit from zero, and its gamified path is a friendly on-ramp if Japanese is a hobby.',
    but:
      'But if you live here, the Japanese that matters does not arrive in curriculum order. It arrives as a pension letter, a door sign, and a coworker saying 巻きで. Duolingo cannot teach Tuesday\'s mail, and its streak turns learning into an obligation you owe an owl.',
    verdict:
      'Keep Duolingo if the game keeps you going. Choose mynichi when your life, not a lesson plan, decides what you need to know today.',
    highlightRows: [0, 1, 3, 8, 11]
  },
  {
    id: 'anki',
    name: 'Anki',
    tagline: 'The power tool that makes you build the tool first.',
    goodAt:
      'Anki\'s spaced repetition is the gold standard, and infinitely customizable. Nothing beats it if you enjoy engineering your own decks.',
    but:
      'But every card is homework before the homework: find the reading, the meaning, an example sentence, format the furigana, maintain the add-ons. Most people\'s decks die in week three. mynichi does the card-making for you in five seconds, reviews with the same class of scheduler (FSRS), and adds what Anki never had: live stroke-order writing practice.',
    verdict:
      'If you love tinkering, Anki will always be yours. If you want the capture-review loop without the engineering, mynichi is that loop, pre-built.',
    highlightRows: [3, 4, 5, 8, 1]
  },
  {
    id: 'google-translate',
    name: 'Google Translate',
    tagline: 'It decodes. mynichi makes sure you understood.',
    goodAt:
      'Google Translate is fast, free, and its camera mode is genuinely useful for a first pass at any text.',
    but:
      'But it hands you one literal line and walks away. Was that pension letter a bill or a discount? Should you reply? By when? And the words you painfully decoded today are gone tomorrow. mynichi gives you furigana, romaji, the literal translation AND the practical one ("here is what to do"), then saves the words into your practice loop. Also: 巻きで. Google Translate tells you the deadline was extended. It was not.',
    verdict:
      'Keep Google Translate for a quick gist of anything. Use mynichi when the text is YOUR life and getting it wrong has consequences.',
    highlightRows: [1, 0, 2, 3, 10]
  },
  {
    id: 'jisho',
    name: 'Jisho',
    tagline: 'A lovely dictionary tab. mynichi is the dictionary that feeds your practice.',
    goodAt:
      'Jisho.org is a beloved, free JMdict dictionary with solid search and handwriting input. We use the same open data and gladly credit it.',
    but:
      'But a browser tab does not work in the ward-office basement, does not tell 未 from 末 when they blur together, and every lookup evaporates when you close it. mynichi bundles the dictionary offline, highlights exactly which strokes differ between look-alike kanji, animates stroke order you can actually practice, and turns any entry into a reviewed list item in one tap.',
    verdict:
      'Jisho is a great reference. mynichi is a reference plus a memory: look it up once, keep it forever.',
    highlightRows: [7, 9, 5, 3, 0]
  }
];
