import { useState } from 'react';
import { css, html } from 'react-strict-dom';
import { useRouter } from 'expo-router';
import { CATEGORY_META, LIST_CATEGORIES, type ListCategory } from '@mynichi/core';

import { Screen } from '@/components/screen';
import { Button, Card, Chip, EmptyState, Label } from '@/components/ui';
import { createList, useListsDoc } from '@/store/lists';
import { colors, text } from '../../theme/tokens.css';

export default function ListsScreen() {
  const router = useRouter();
  const doc = useListsDoc();
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState('');
  const [category, setCategory] = useState<ListCategory>('life');
  const now = Date.now();

  function submit() {
    if (!name.trim()) return;
    const list = createList(name, category);
    setCreating(false);
    setName('');
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
        <Card tint={colors.matchaSoft}>
          <Label color={colors.ink}>Name the list</Label>
          <html.input
            style={styles.input}
            placeholder="e.g. Ward office runs"
            value={name}
            onChange={(e: { target: { value: string } }) => setName(e.target.value)}
            autoFocus
          />
          <Label color={colors.ink}>Life category</Label>
          <html.div style={styles.chipRow}>
            {LIST_CATEGORIES.map((c) => (
              <Chip
                key={c}
                label={`${CATEGORY_META[c].kanji} ${CATEGORY_META[c].label}`}
                selected={category === c}
                accent={colors.matcha}
                tint={colors.paperLift}
                onClick={() => setCategory(c)}
              />
            ))}
          </html.div>
          <html.div style={styles.formActions}>
            <Button label="Create" accent={colors.matcha} onClick={submit} disabled={!name.trim()} />
          </html.div>
        </Card>
      ) : null}

      {doc.lists.length === 0 && !creating ? (
        <EmptyState
          kanji="帳"
          title="Your life, as lists"
          hint="Not someone else's curriculum. Make a list for work, the ward office, the clinic, and capture the words your day hands you."
        />
      ) : (
        <html.div style={styles.listCol}>
          {doc.lists.map((list) => {
            const due = list.items.filter((i) => i.srs.due <= now).length;
            return (
              <Card key={list.id} onClick={() => router.push(`/list/${list.id}`)}>
                <html.div style={styles.cardRow}>
                  <html.span style={styles.catKanji}>{CATEGORY_META[list.category].kanji}</html.span>
                  <html.div style={styles.cardBody}>
                    <html.span style={styles.listName}>{list.name}</html.span>
                    <html.span style={styles.listMeta}>
                      {CATEGORY_META[list.category].label} · {list.items.length}{' '}
                      {list.items.length === 1 ? 'item' : 'items'}
                    </html.span>
                  </html.div>
                  {due > 0 ? <html.span style={styles.due}>{due} due</html.span> : null}
                </html.div>
              </Card>
            );
          })}
        </html.div>
      )}
    </Screen>
  );
}

const styles = css.create({
  input: {
    fontFamily: text.body,
    fontSize: 16,
    color: colors.ink,
    backgroundColor: colors.paperLift,
    borderRadius: 10,
    borderStyle: 'none',
    borderWidth: 0,
    padding: 12,
    marginBottom: 14
  },
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
  cardRow: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: 14
  },
  catKanji: {
    fontFamily: text.brandBold,
    fontSize: 26,
    color: colors.matcha
  },
  cardBody: {
    display: 'flex',
    flexDirection: 'column',
    flexGrow: 1
  },
  listName: {
    fontFamily: text.bodyBold,
    fontSize: 16,
    color: colors.ink
  },
  listMeta: {
    fontFamily: text.body,
    fontSize: 13,
    color: colors.inkSoft,
    marginTop: 1
  },
  due: {
    fontFamily: text.bodyBold,
    fontSize: 13,
    color: colors.matcha
  }
});
