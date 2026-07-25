import { css, html } from 'react-strict-dom';
import { useLocalSearchParams, useRouter } from 'expo-router';
import type { SrsGrade } from '@mynichi/core';

import { Furigana } from '@/components/furigana';
import { Enter } from '@/components/motion';
import { Screen } from '@/components/screen';
import { Button, EmptyState, ReviewCard } from '@/components/ui';
import { useReviewSession } from '@/state/review';
import { getList } from '@/store/lists';
import { leading, measure, size } from '../../theme/contract.css';
import { colors, text } from '../../theme/tokens.css';

const GRADES: { grade: SrsGrade; label: string; accent: string }[] = [
  { grade: 'again', label: 'Again', accent: colors.hanko },
  { grade: 'hard', label: 'Hard', accent: colors.yuzu },
  { grade: 'good', label: 'Good', accent: colors.matcha },
  { grade: 'easy', label: 'Easy', accent: colors.indigo }
];

// The review session. The queue, the tally and the grading live in
// state/review; this file is the card face and the buttons under it.
export default function ReviewScreen() {
  const { listId } = useLocalSearchParams<{ listId: string }>();
  const router = useRouter();
  const session = useReviewSession(listId);
  const list = listId ? getList(listId) : undefined;

  if (!list) {
    return (
      <Screen reading="ふくしゅう" kanji="復習" accent={colors.matcha} back>
        <EmptyState kanji="?" title="List not found" hint="It may have been deleted." />
      </Screen>
    );
  }

  if (session.queue.length === 0) {
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

  const { item, done, revealed, graded, queue, index } = session;

  return (
    <Screen reading="ふくしゅう" kanji="復習" title="Review" accent={colors.matcha} back>
      {done ? (
        <Enter kind="rise">
          <html.div style={styles.doneWrap}>
            <html.span style={styles.doneKanji} aria-hidden>
              完
            </html.span>
            <html.p style={styles.doneTitle}>
              {queue.length} {queue.length === 1 ? 'card' : 'cards'} reviewed
            </html.p>
            <html.p style={styles.doneMeta}>
              again {graded.again} · hard {graded.hard} · good {graded.good} · easy {graded.easy}
            </html.p>
            <Button label="Back to the list" accent={colors.matcha} onClick={() => router.back()} />
          </html.div>
        </Enter>
      ) : item ? (
        <html.div style={styles.cardWrap}>
          <html.span style={styles.progress} aria-live="polite">
            {index + 1} / {queue.length}
          </html.span>

          <ReviewCard>
            {!revealed ? (
              <html.span style={styles.front}>{item.text}</html.span>
            ) : (
              <Enter kind="fade" speed="fast">
                <html.div style={styles.backSide}>
                  <Furigana
                    word={item.text}
                    reading={item.reading ?? undefined}
                    variant="display"
                    center
                  />
                  {item.reading && !item.text.includes(item.reading) ? (
                    <html.span style={styles.reading}>{item.reading}</html.span>
                  ) : null}
                  {item.meaning ? <html.p style={styles.meaning}>{item.meaning}</html.p> : null}
                  {item.example ? <html.p style={styles.example}>{item.example}</html.p> : null}
                </html.div>
              </Enter>
            )}
          </ReviewCard>

          {!revealed ? (
            <Button label="Show answer" accent={colors.matcha} onClick={session.reveal} />
          ) : (
            <html.div style={styles.gradeRow}>
              {GRADES.map((g) => (
                <Button
                  key={g.grade}
                  label={g.label}
                  accent={g.accent}
                  grow
                  onClick={() => session.grade(g.grade)}
                  ariaLabel={`${g.label}: schedule this card again`}
                />
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
    fontSize: size.caption,
    lineHeight: leading.caption,
    color: colors.inkSoft,
    textAlign: 'center'
  },
  front: {
    fontFamily: text.bodyBold,
    fontSize: 40,
    lineHeight: leading.title,
    color: colors.ink,
    textAlign: 'center'
  },
  backSide: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center'
  },
  reading: {
    fontFamily: text.body,
    fontSize: size.body,
    lineHeight: leading.bodySmall,
    color: colors.inkSoft,
    marginTop: 6
  },
  meaning: {
    fontFamily: text.body,
    fontSize: size.heading,
    lineHeight: leading.heading,
    color: colors.ink,
    marginTop: 14,
    marginBottom: 0,
    textAlign: 'center',
    maxWidth: measure.note
  },
  example: {
    fontFamily: text.body,
    fontSize: size.bodySmall,
    lineHeight: leading.bodySmall,
    color: colors.inkSoft,
    marginTop: 10,
    marginBottom: 0,
    textAlign: 'center',
    maxWidth: measure.note
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
    lineHeight: leading.display,
    color: colors.matcha
  },
  doneTitle: {
    fontFamily: text.bodyBold,
    fontSize: size.heading,
    lineHeight: leading.heading,
    color: colors.ink,
    margin: 0
  },
  doneMeta: {
    fontFamily: text.body,
    fontSize: size.bodySmall,
    lineHeight: leading.bodySmall,
    color: colors.inkSoft,
    margin: 0,
    marginBottom: 10
  }
});
