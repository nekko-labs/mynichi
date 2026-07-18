// Canned outputs of the real mynichi translate pipeline (kuromoji segmentation
// + furigana, PLaMo-grounded translation, practical-explanation layer).
// The 巻きで example is the one the shipped pipeline is verified against:
// most translators invert it to "extend the deadline". mynichi does not.

export interface RubyPart {
  t: string;
  r?: string;
}

export interface SaveableWord {
  word: string;
  reading: string;
  meaning: string;
  list: string;
}

export interface TranslateSample {
  id: string;
  label: string;
  scenario: string;
  segments: RubyPart[][];
  romaji: string;
  literal: string;
  practical: string;
  saveable: Record<number, SaveableWord>;
}

export const translateSamples: TranslateSample[] = [
  {
    id: 'work-chat',
    label: 'Work chat',
    scenario: 'Your coworker drops this in Slack at 4:58pm.',
    segments: [
      [{ t: '納期', r: 'のうき' }],
      [{ t: 'ちょっと' }],
      [{ t: '巻', r: 'ま' }, { t: 'きで' }],
      [{ t: 'お' }, { t: '願', r: 'ねが' }, { t: 'いします' }],
      [{ t: '。' }]
    ],
    romaji: 'nōki chotto maki de onegai shimasu.',
    literal: 'The delivery deadline, a little rolled up, please.',
    practical:
      'They want the deadline moved EARLIER, please deliver ahead of schedule. 巻きで is workplace slang for "ahead of schedule". Most translation apps flip this into "please extend the deadline", which is exactly the mistake you cannot afford at work.',
    saveable: {
      0: { word: '納期', reading: 'のうき', meaning: 'delivery deadline', list: 'Work' },
      2: { word: '巻きで', reading: 'まきで', meaning: 'ahead of schedule (slang)', list: 'Work' }
    }
  },
  {
    id: 'pension-letter',
    label: 'Scary letter',
    scenario: 'An envelope from city hall. Your pulse rises.',
    segments: [
      [{ t: '国民年金', r: 'こくみんねんきん' }],
      [{ t: '保険料', r: 'ほけんりょう' }],
      [{ t: '免除', r: 'めんじょ' }],
      [{ t: 'の' }],
      [{ t: '申請', r: 'しんせい' }],
      [{ t: 'について' }],
      [{ t: '、' }],
      [{ t: '下記', r: 'かき' }],
      [{ t: 'の' }],
      [{ t: '書類', r: 'しょるい' }],
      [{ t: 'を' }],
      [{ t: '添', r: 'そ' }, { t: 'えて' }],
      [{ t: '期限', r: 'きげん' }],
      [{ t: 'までに' }],
      [{ t: '提出', r: 'ていしゅつ' }],
      [{ t: 'してください' }],
      [{ t: '。' }]
    ],
    romaji:
      'kokumin nenkin hokenryō menjo no shinsei ni tsuite, kaki no shorui o soete kigen made ni teishutsu shite kudasai.',
    literal:
      'Regarding the application for National Pension insurance premium exemption, please submit it together with the documents below by the deadline.',
    practical:
      'Good news hiding in scary paper: if money is tight, you can apply to SKIP pension payments. Nothing is wrong and you owe nothing extra. Gather the documents listed, attach them, and send everything back before the deadline.',
    saveable: {
      2: { word: '免除', reading: 'めんじょ', meaning: 'exemption, waiver', list: 'City hall' },
      9: { word: '書類', reading: 'しょるい', meaning: 'documents, paperwork', list: 'City hall' },
      14: { word: '提出', reading: 'ていしゅつ', meaning: 'submission, to hand in', list: 'City hall' }
    }
  },
  {
    id: 'shop-sign',
    label: 'Sign on a door',
    scenario: 'Taped to the door of your favorite izakaya.',
    segments: [
      [{ t: '本日', r: 'ほんじつ' }],
      [{ t: 'は' }],
      [{ t: '貸切', r: 'かしきり' }],
      [{ t: '営業', r: 'えいぎょう' }],
      [{ t: 'のため' }],
      [{ t: '、' }],
      [{ t: 'ご' }, { t: '入店', r: 'にゅうてん' }],
      [{ t: 'いただけません' }],
      [{ t: '。' }]
    ],
    romaji: 'honjitsu wa kashikiri eigyō no tame, go-nyūten itadakemasen.',
    literal:
      'Today, because of reserved-business operation, entering the store cannot be received.',
    practical:
      'The whole place is booked for a private party today, so you cannot go in. It is only for today, not a closure. 貸切 (kashikiri, "fully reserved") is a word you will meet on doors, karaoke rooms, and buses.',
    saveable: {
      2: { word: '貸切', reading: 'かしきり', meaning: 'fully reserved, private booking', list: 'Food & town' },
      6: { word: '入店', reading: 'にゅうてん', meaning: 'entering a shop', list: 'Food & town' }
    }
  }
];
