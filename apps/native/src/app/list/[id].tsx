import { useState } from 'react';
import { css, html } from 'react-strict-dom';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { CATEGORY_META } from '@mynichi/core';

import { CaptureBar } from '@/components/list/capture-bar';
import { DraftCard } from '@/components/list/draft-card';
import { ItemCard } from '@/components/list/item-card';
import { Enter } from '@/components/motion';
import { Screen } from '@/components/screen';
import { Button, EmptyState } from '@/components/ui';
import { useNow } from '@/lib/time';
import { useCapture } from '@/state/capture';
import { deleteItem, deleteList, useListsDoc } from '@/store/lists';
import { leading, size } from '../../theme/contract.css';
import { colors, text } from '../../theme/tokens.css';

// One list: capture into it, correct what was filled in, review what is due.
// The capture machinery lives in state/capture; the pieces of the page live in
// components/list. This file is the page.
export default function ListDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const doc = useListsDoc();
  const now = useNow();
  const list = doc.lists.find((l) => l.id === id);
  const capture = useCapture(list?.id);
  const [confirmDelete, setConfirmDelete] = useState(false);

  if (!list) {
    return (
      <Screen reading="れんしゅうちょう" kanji="練習帳" accent={colors.matcha} back>
        <EmptyState kanji="?" title="List not found" hint="It may have been deleted." />
      </Screen>
    );
  }

  const due = list.items.filter((i) => i.srs.due <= now).length;

  // Deleting a list takes two taps rather than a modal: the second tap is the
  // confirmation, and the label says exactly what it will do.
  function removeList() {
    if (!list) return;
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }
    deleteList(list.id);
    router.back();
  }

  return (
    <Screen
      reading={CATEGORY_META[list.category].label.toLowerCase()}
      kanji={list.name}
      accent={colors.matcha}
      back
      action={
        due > 0 ? (
          <Button
            label={`Review ${due}`}
            accent={colors.matcha}
            onClick={() => router.push(`/review/${list.id}`)}
            ariaLabel={`Review ${due} cards due in ${list.name}`}
          />
        ) : undefined
      }
    >
      {capture.draft === null ? <CaptureBar capture={capture} /> : <DraftCard capture={capture} />}

      {list.items.length === 0 ? (
        <EmptyState
          kanji="聞"
          title="Nothing captured yet"
          hint="A coworker says a word you don't know. Type it above; reading and meaning fill themselves in."
        />
      ) : (
        <html.div style={styles.items}>
          {list.items.map((item, index) => (
            <Enter key={item.id} index={index}>
              <ItemCard item={item} onDelete={() => deleteItem(list.id, item.id)} />
            </Enter>
          ))}
        </html.div>
      )}

      <html.div style={styles.footer}>
        <html.button style={styles.deleteList} onClick={removeList}>
          {confirmDelete ? 'Tap again to delete this list and its items' : 'Delete this list'}
        </html.button>
      </html.div>
    </Screen>
  );
}

const styles = css.create({
  items: {
    display: 'flex',
    flexDirection: 'column',
    rowGap: 10,
    marginTop: 20
  },
  footer: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 32
  },
  deleteList: {
    fontFamily: text.body,
    fontSize: size.caption,
    lineHeight: leading.caption,
    color: colors.hanko,
    backgroundColor: 'transparent',
    borderStyle: 'none',
    borderWidth: 0,
    cursor: 'pointer',
    opacity: 0.8
  }
});
