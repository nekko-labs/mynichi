export interface PracticeTurn {
  who: 'ai' | 'you';
  jp: string;
  romaji: string;
  en: string;
}

export const practiceScenario = 'Reschedule a dentist appointment by phone';

export const practiceTurns: PracticeTurn[] = [
  {
    who: 'ai',
    jp: 'もしもし、さくら歯科です。ご用件をどうぞ。',
    romaji: 'moshimoshi, sakura shika desu. go-yōken o dōzo.',
    en: 'Hello, Sakura Dental. How can I help you?'
  },
  {
    who: 'you',
    jp: 'すみません、明日の予約を変更したいんですが。',
    romaji: 'sumimasen, ashita no yoyaku o henkō shitain desu ga.',
    en: 'Sorry, I would like to change my appointment for tomorrow.'
  },
  {
    who: 'ai',
    jp: 'かしこまりました。お名前をお願いできますか。',
    romaji: 'kashikomarimashita. o-namae o onegai dekimasu ka.',
    en: 'Of course. May I have your name?'
  },
  {
    who: 'you',
    jp: 'スミスです。明日の午後3時に予約しています。',
    romaji: 'sumisu desu. ashita no gogo san-ji ni yoyaku shite imasu.',
    en: 'It is Smith. I have an appointment tomorrow at 3pm.'
  },
  {
    who: 'ai',
    jp: 'スミス様ですね。それでは、金曜日の同じ時間はいかがですか。',
    romaji: 'sumisu-sama desu ne. soredewa, kin-yōbi no onaji jikan wa ikaga desu ka.',
    en: 'Mx. Smith, noted. Then how about Friday at the same time?'
  },
  {
    who: 'you',
    jp: 'はい、大丈夫です。お願いします。',
    romaji: 'hai, daijōbu desu. onegai shimasu.',
    en: 'Yes, that works. Please.'
  },
  {
    who: 'ai',
    jp: 'では、金曜日の15時にお待ちしております。お大事に。',
    romaji: 'dewa, kin-yōbi no jū-go-ji ni o-machi shite orimasu. o-daiji ni.',
    en: 'Then we will see you Friday at 15:00. Take care.'
  }
];

// Words the demo pretends were injected from the user's "Health" list.
export const injectedWords = [
  { word: '予約', reading: 'よやく', meaning: 'appointment, reservation' },
  { word: '変更', reading: 'へんこう', meaning: 'change, modification' }
];
