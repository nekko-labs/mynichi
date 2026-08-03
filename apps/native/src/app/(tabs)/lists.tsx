import { useState } from 'react';
import { css, html } from 'react-strict-dom';
import { useRouter } from 'expo-router';
import { CATEGORY_META, LIST_CATEGORIES } from '@mynichi/core';

import { Enter } from '@/components/motion';
import { Screen } from '@/components/screen';
import { Button, Card, Chip, EmptyState, Field, Label, ListRow } from '@/components/ui';
import { useWideLayout } from '@/lib/layout';
import { useNow } from '@/lib/time';
import { useListForm } from '@/state/list-form';
import { useListsDoc } from '@/store/lists';
import { colors } from '../../theme/tokens.css';

export default function ListsScreen() {
  const router = useRouter();
  const doc = useListsDoc();
  const [creating, setCreating] = useState(false);
  const form = useListForm();
  const wide = useWideLayout();
  const now = useNow();

  function submit() {
    const list = form.submit();
    if (!list) return;
    setCreating(false);
    router.push(`/list/${list.id}`);
  }

  return (
    <Screen
      reading="れんしゅうちょう"
      kanji="練習帳"
      title="Lists"
      accent={colors.matcha}
      action={
        <Button
          label={creating ? 'Close' : '+ New list'}
          kind={creating ? 'soft' : 'solid'}
          accent={colors.matcha}
          tint={colors.matchaSoft}
          onClick={() => setCreating(!creating)}
        />
      }
    >
      {creating ? (
        <Enter kind="rise" speed="fast">
          <Card tint={colors.matchaSoft}>
            <Field
              label="Name the list"
              value={form.name}
              onChange={form.setName}
              onSubmit={submit}
              placeholder="e.g. Ward office runs"
              error={form.error}
              labelColor={colors.ink}
              autoFocus
            />
            <Label color={colors.ink}>Life category</Label>
            <html.div style={styles.chipRow}>
              {LIST_CATEGORIES.map((c) => (
                <Chip
                  key={c}
                  label={`${CATEGORY_META[c].kanji} ${CATEGORY_META[c].label}`}
                  selected={form.category === c}
                  accent={colors.matcha}
                  tint={colors.paperLift}
                  onClick={() => form.setCategory(c)}
                />
              ))}
            </html.div>
            <html.div style={styles.formActions}>
              <Button
                label="Create"
                accent={colors.matcha}
                onClick={submit}
                disabled={!form.canSubmit}
              />
            </html.div>
          </Card>
        </Enter>
      ) : null}

      {doc.lists.length === 0 && !creating ? (
        <EmptyState
          kanji="帳"
          title="Your life, as lists"
          hint="Not someone else's curriculum. Make a list for work, the ward office, the clinic, and capture the words your day hands you."
        />
      ) : (
        <html.div style={[styles.listCol, wide && styles.listGrid]}>
          {doc.lists.map((list, index) => {
            const due = list.items.filter((i) => i.srs.due <= now).length;
            return (
              <html.div key={list.id} style={wide ? styles.cellWide : styles.cell}>
                <Enter index={index}>
                  <ListRow
                    kanji={CATEGORY_META[list.category].kanji}
                    title={list.name}
                    meta={`${CATEGORY_META[list.category].label} · ${list.items.length} ${
                      list.items.length === 1 ? 'item' : 'items'
                    }`}
                    trailing={due > 0 ? `${due} due` : undefined}
                    accent={colors.matcha}
                    onClick={() => router.push(`/list/${list.id}`)}
                    ariaLabel={
                      due > 0 ? `${list.name}, ${due} cards due` : `${list.name}, nothing due`
                    }
                  />
                </Enter>
              </html.div>
            );
          })}
        </html.div>
      )}
    </Screen>
  );
}

const styles = css.create({
  chipRow: {
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 14
  },
  formActions: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-end'
  },
  listCol: {
    display: 'flex',
    flexDirection: 'column',
    rowGap: 10,
    marginTop: 4
  },
  listGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'stretch',
    gap: 12
  },
  cell: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'stretch'
  },
  cellWide: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'stretch',
    flexGrow: 1,
    flexBasis: '46%',
    minWidth: 300
  }
});
