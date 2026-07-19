import { useMemo, useState } from 'react';
import { css, html } from 'react-strict-dom';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { fitFurigana, type SrsGrade } from '@mynichi/core';

import { Screen } from '@/components/screen';
import { Button, EmptyState } from '@/components/ui';
import { getList, gradeItem } from '@/store/lists';
import { colors, text } from '../../theme/tokens.css';

const GRADES: { grade: SrsGrade; label: string; accent: string }[] = [
  { grade: 'again', label: 'Again', accent: colors.hanko },
  { grade: 'hard', label: 'Hard', accent: colors.yuzu },
  { grade: 'good', label: 'Good', accent: colors.matcha },
  { grade: 'easy', label: 'Easy', accent: colors.indigo }
];

export default function ReviewScreen() {
  const { listId } = useLocalSearchParams<{ listId: string }>();
  const router = useRouter();

  // Snapshot the due queue once so grading doesn't reshuffle the session.
  const queue = useMemo(() => {
    const list = listId ? getList(listId) : undefined;
    if (!list) return [];
    const now = Date.now();
    return list.items.filter((i) => i.srs.due <= now).map((i) => ({ ...i }));
  }, [listId]);

  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [graded, setGraded] = useState({ again: 0, hard: 0, good: 0, easy: 0 });

  const list = listId ? getList(listId) : undefined;

  if (!list) {
    return (
      <Screen reading="ふくしゅう" kanji="復習" accent={colors.matcha} back>
        <EmptyState kanji="?" title="List not found" hint="It may have been deleted." />
      </Screen>
    );
  }

  if (queue.length === 0) {
    return (
      <Screen reading="ふくしゅう" kanji="復習" title="Review" accent={colors.matcha} back>
        <EmptyState
          kanji="休"
          title="Nothing due right now"
          hint="Come back later, or capture something new. No streak guilt here."
        />
      </Screen>
    );
  }

  const done = index >= queue.length;
  const item = done ? null : queue[index];

  function grade(g: SrsGrade) {
    if (!item || !listId) return;
    gradeItem(listId, item.id, g);
    setGraded((prev) => ({ ...prev, [g]: prev[g] + 1 }));
    setRevealed(false);
    setIndex(index + 1);
  }

  return (
    <Screen reading="ふくしゅう" kanji="復習" title="Review" accent={colors.matcha} back>
      {done ? (
        <html.div style={styles.doneWrap}>
          <html.span style={styles.doneKanji}>完</html.span>
          <html.p style={styles.doneTitle}>
            {queue.length} {queue.length === 1 ? 'card' : 'cards'} reviewed
          </html.p>
          <html.p style={styles.doneMeta}>
            again {graded.again} · hard {graded.hard} · good {graded.good} · easy {graded.easy}
          </html.p>
          <Button label="Back to the list" accent={colors.matcha} onClick={() => router.back()} />
        </html.div>
      ) : item ? (
        <html.div style={styles.cardWrap}>
          <html.span style={styles.progress}>
            {index + 1} / {queue.length}
          </html.span>

          <html.div style={styles.card}>
            {!revealed ? (
              <html.span style={styles.front}>{item.text}</html.span>
            ) : (
              <html.div style={styles.backSide}>
                <html.div style={styles.rubyRow}>
                  {fitFurigana(item.text, item.reading ?? '').map((part, i) => (
                    <html.div key={`${part.text}-${i}`} style={styles.rubyPart}>
                      <html.span style={styles.ruby}>{part.ruby ?? ' '}</html.span>
                      <html.span style={styles.backText}>{part.text}</html.span>
                    </html.div>
                  ))}
                </html.div>
                {item.reading && !item.text.includes(item.reading) ? (
                  <html.span style={styles.reading}>{item.reading}</html.span>
                ) : null}
                {item.meaning ? <html.p style={styles.meaning}>{item.meaning}</html.p> : null}
                {item.example ? <html.p style={styles.example}>{item.example}</html.p> : null}
              </html.div>
            )}
          </html.div>

          {!revealed ? (
            <Button label="Show answer" accent={colors.matcha} onClick={() => setRevealed(true)} />
          ) : (
            <html.div style={styles.gradeRow}>
              {GRADES.map((g) => (
                <Button key={g.grade} label={g.label} accent={g.accent} grow onClick={() => grade(g.grade)} />
              ))}
            </html.div>
          )}
        </html.div>
      ) : null}
    </Screen>
  );
}

const styles = css.create({
  cardWrap: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'stretch',
    rowGap: 16,
    flexGrow: 1
  },
  progress: {
    fontFamily: text.bodyMedium,
    fontSize: 13,
    color: colors.inkSoft,
    textAlign: 'center'
  },
  card: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.paperLift,
    borderRadius: 20,
    minHeight: 260,
    padding: 24
  },
  front: {
    fontFamily: text.bodyBold,
    fontSize: 40,
    lineHeight: 1.3,
    color: colors.ink,
    textAlign: 'center'
  },
  backSide: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center'
  },
  rubyRow: {
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'flex-end',
    justifyContent: 'center'
  },
  rubyPart: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center'
  },
  ruby: {
    fontFamily: text.body,
    fontSize: 13,
    lineHeight: 1,
    color: colors.inkSoft
  },
  backText: {
    fontFamily: text.bodyBold,
    fontSize: 34,
    lineHeight: 1.3,
    color: colors.ink
  },
  reading: {
    fontFamily: text.body,
    fontSize: 16,
    color: colors.inkSoft,
    marginTop: 6
  },
  meaning: {
    fontFamily: text.body,
    fontSize: 18,
    lineHeight: 1.5,
    color: colors.ink,
    marginTop: 14,
    marginBottom: 0,
    textAlign: 'center'
  },
  example: {
    fontFamily: text.body,
    fontSize: 14,
    lineHeight: 1.6,
    color: colors.inkSoft,
    marginTop: 10,
    marginBottom: 0,
    textAlign: 'center'
  },
  gradeRow: {
    display: 'flex',
    flexDirection: 'row',
    columnGap: 8
  },
  doneWrap: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    paddingTop: 40,
    rowGap: 10
  },
  doneKanji: {
    fontFamily: text.brandBold,
    fontSize: 64,
    color: colors.matcha
  },
  doneTitle: {
    fontFamily: text.bodyBold,
    fontSize: 18,
    color: colors.ink,
    margin: 0
  },
  doneMeta: {
    fontFamily: text.body,
    fontSize: 14,
    color: colors.inkSoft,
    margin: 0,
    marginBottom: 10
  }
});
