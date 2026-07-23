import { useState } from 'react';
import { css, html } from 'react-strict-dom';
import { CATEGORY_META, LIST_CATEGORIES, type ListCategory } from '@mynichi/core';

import { Button, Chip, Label } from '@/components/ui';
import { createList, useListsDoc } from '@/store/lists';
import { colors, text } from '../theme/tokens.css';

type Props = {
  /** Soft tint for the list chips (feature accent). */
  tint?: string;
  accent?: string;
  /** Called with the chosen (possibly just-created) list. */
  onPick: (listId: string, listName: string) => void;
};

/**
 * Pick a destination list, or create one on the spot. Used anywhere a word
 * can be saved (dictionary results, translate tap-to-save later).
 */
export function ListPicker({ tint, accent, onPick }: Props) {
  const doc = useListsDoc();
  const [creating, setCreating] = useState(doc.lists.length === 0);
  const [name, setName] = useState('');
  const [category, setCategory] = useState<ListCategory>('life');
  const accentColor = accent ?? colors.matcha;

  function createAndPick() {
    const trimmed = name.trim();
    if (!trimmed) return;
    const list = createList(trimmed, category);
    setName('');
    setCreating(false);
    onPick(list.id, list.name);
  }

  return (
    <html.div style={styles.wrap}>
      {doc.lists.length > 0 ? (
        <>
          <Label>Add to a list</Label>
          <html.div style={styles.chips}>
            {doc.lists.map((l) => (
              <Chip
                key={l.id}
                label={`${CATEGORY_META[l.category].kanji} ${l.name}`}
                tint={tint ?? colors.paperShade}
                onClick={() => onPick(l.id, l.name)}
              />
            ))}
            <Chip
              label={creating ? '× Cancel' : '＋ New list'}
              tint={colors.paperLift}
              onClick={() => setCreating(!creating)}
            />
          </html.div>
        </>
      ) : (
        <Label>Save it to your first list</Label>
      )}

      {creating ? (
        <html.div style={styles.form}>
          <html.input
            style={styles.input}
            placeholder="Name the list… e.g. Ward office runs"
            value={name}
            onChange={(e: { target: { value: string } }) => setName(e.target.value)}
            onKeyDown={(e: { key: string }) => {
              if (e.key === 'Enter') createAndPick();
            }}
            autoFocus
          />
          <html.div style={styles.catRow}>
            {LIST_CATEGORIES.map((c) => (
              <Chip
                key={c}
                label={`${CATEGORY_META[c].kanji} ${CATEGORY_META[c].label}`}
                selected={category === c}
                accent={accentColor}
                tint={colors.paperLift}
                onClick={() => setCategory(c)}
              />
            ))}
          </html.div>
          <html.div style={styles.formActions}>
            <Button
              label="Create and save here"
              accent={accentColor}
              onClick={createAndPick}
              disabled={!name.trim()}
            />
          </html.div>
        </html.div>
      ) : null}
    </html.div>
  );
}

const styles = css.create({
  wrap: {
    display: 'flex',
    flexDirection: 'column'
  },
  chips: {
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    marginTop: 12
  },
  input: {
    fontFamily: text.body,
    fontSize: 15,
    color: colors.ink,
    backgroundColor: colors.paperLift,
    borderRadius: 10,
    borderStyle: 'none',
    borderWidth: 0,
    padding: 11,
    marginBottom: 10
  },
  catRow: {
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 10
  },
  formActions: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-end'
  }
});
