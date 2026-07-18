// mynichi SLM bake-off: literal + practical translation quality on real-life JP.
// Usage: bun test-slm.ts <model> [--plamo]

const OLLAMA = 'http://localhost:11434';

const SAMPLES = [
  {
    id: 'pension-letter',
    text: '保険料の納付期限までに納付が確認できない場合、督促状を送付することがあります。なお、本通知と行き違いに納付された場合は、ご容赦ください。'
  },
  {
    id: 'work-chat',
    text: '例の件、納期ちょっと巻きでお願いできますか？難しければ一旦持ち帰りで大丈夫です。'
  },
  {
    id: 'shop-sign',
    text: '本日貸切営業のため、一般のお客様のご入店はご遠慮いただいております。'
  }
];

const SYSTEM = `You are the translation engine inside a Japanese learning app for foreign residents of Japan.
For the given Japanese text, respond with JSON only:
{
  "literal": "a literal English translation that mirrors the Japanese structure and word choice",
  "practical": "what it actually means for the reader in plain everyday English, including what they should do if the text implies an action"
}`;

const model = process.argv[2];
const isPlamo = process.argv.includes('--plamo');
if (!model) {
  console.error('usage: bun test-slm.ts <model> [--plamo]');
  process.exit(1);
}

async function chatJson(text: string) {
  const res = await fetch(`${OLLAMA}/api/chat`, {
    method: 'POST',
    body: JSON.stringify({
      model,
      stream: false,
      think: false,
      options: { temperature: 0.2 },
      format: {
        type: 'object',
        properties: { literal: { type: 'string' }, practical: { type: 'string' } },
        required: ['literal', 'practical']
      },
      messages: [
        { role: 'system', content: SYSTEM },
        { role: 'user', content: text }
      ]
    })
  });
  return res.json();
}

async function plamoTranslate(text: string) {
  const res = await fetch(`${OLLAMA}/api/generate`, {
    method: 'POST',
    body: JSON.stringify({
      model,
      stream: false,
      raw: false,
      prompt: text,
      options: { temperature: 0, stop: ['<|plamo:op|>'] }
    })
  });
  return res.json();
}

for (const s of SAMPLES) {
  const t0 = performance.now();
  const r = isPlamo ? await plamoTranslate(s.text) : await chatJson(s.text);
  const ms = Math.round(performance.now() - t0);
  const tokS = r.eval_count && r.eval_duration ? Math.round((r.eval_count / r.eval_duration) * 1e9) : '?';
  console.log(`\n=== ${s.id} [${ms}ms, ${tokS} tok/s] (${model})`);
  console.log('JP:', s.text);
  if (isPlamo) {
    console.log('OUT:', (r.response ?? JSON.stringify(r)).trim());
  } else {
    try {
      const j = JSON.parse(r.message.content);
      console.log('LITERAL:  ', j.literal);
      console.log('PRACTICAL:', j.practical);
    } catch {
      console.log('RAW:', r.message?.content ?? JSON.stringify(r).slice(0, 500));
    }
  }
}
