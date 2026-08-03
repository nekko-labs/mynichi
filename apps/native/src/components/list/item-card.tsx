import { css, html } from 'react-strict-dom';
import type { ListItem } from '@mynichi/core';

import { Furigana } from '../furigana';
import { Card } from '../ui';
import { leading, size } from '../../theme/contract.css';
import { colors, text } from '../../theme/tokens.css';

// A saved word in a list: reading over the word, meaning under it, and a
// delete affordance that says what it deletes.

export function ItemCard({ item, onDelete }: { item: ListItem; onDelete: () => void }) {
  return (
    <Card>
      <html.div style={styles.row}>
        <html.div style={styles.body}>
          <Furigana word={item.text} reading={item.reading ?? undefined} />
          {item.meaning ? <html.span style={styles.meaning}>{item.meaning}</html.span> : null}
        </html.div>
        <html.button
          style={styles.delete}
          onClick={onDelete}
          aria-label={`Delete ${item.text} from this list`}
        >
          ×
        </html.button>
      </html.div>
    </Card>
  );
}

const styles = css.create({
  row: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center'
  },
  body: {
    display: 'flex',
    flexDirection: 'column',
    flexGrow: 1,
    flexShrink: 1
  },
  meaning: {
    fontFamily: text.body,
    fontSize: size.bodySmall,
    lineHeight: leading.bodySmall,
    color: colors.inkSoft,
    marginTop: 3
  },
  delete: {
    fontFamily: text.body,
    fontSize: 20,
    lineHeight: leading.flat,
    color: colors.inkSoft,
    backgroundColor: 'transparent',
    borderStyle: 'none',
    borderWidth: 0,
    paddingLeft: 12,
    paddingRight: 4,
    cursor: 'pointer'
  }
});
