import { css, html } from 'react-strict-dom';
import Constants from 'expo-constants';

import { Screen } from '@/components/screen';
import { Card, Chip, Label } from '@/components/ui';
import { API_URL } from '@/lib/api';
import { colors, text } from '../../theme/tokens.css';

const LOCALES = ['English', 'Deutsch', '中文', 'Español', 'Português', 'Français', 'Italiano', 'Tagalog', 'ไทย', '한국어'];

export default function SettingsScreen() {
  const version = Constants.expoConfig?.version ?? '0.1.0';

  return (
    <Screen reading="せってい" kanji="設定" title="Settings" accent={colors.hanko}>
      <html.div style={styles.section}>
        <Label color={colors.hanko}>Language</Label>
        <html.p style={styles.body}>
          English for now. These arrive at launch, following your device language:
        </html.p>
        <html.div style={styles.chipWrap}>
          {LOCALES.map((l) => (
            <Chip key={l} label={l} tint={colors.paperShade} />
          ))}
        </html.div>
      </html.div>

      <html.div style={styles.section}>
        <Label color={colors.hanko}>Appearance</Label>
        <html.p style={styles.body}>
          mynichi follows your system light or dark setting, like paper follows the daylight.
        </html.p>
      </html.div>

      <html.div style={styles.section}>
        <Label color={colors.hanko}>Privacy</Label>
        <Card>
          <html.p style={styles.cardBody}>
            Your lists and review history live on this device; they are yours. Cloud sync is
            optional and premium-only. Translation and practice never train on your data, and
            your voice never leaves the device. There is no analytics SDK reading what you write.
          </html.p>
        </Card>
      </html.div>

      <html.div style={styles.section}>
        <Label color={colors.hanko}>Engine</Label>
        <html.p style={styles.body}>
          {API_URL
            ? 'Translate and practice engines: connected.'
            : 'Translate and practice engines: connecting soon. Lists, review, and the dictionary work fully offline.'}
        </html.p>
      </html.div>

      <html.div style={styles.section}>
        <Label color={colors.hanko}>Dictionary licences</Label>
        <Card>
          <html.p style={styles.cardBody}>
            The offline dictionary uses JMdict, property of the Electronic Dictionary Research
            and Development Group (EDRDG), used in conformance with the EDRDG licence, via
            jmdict-simplified (CC BY-SA 4.0). Kanji stroke data will use KanjiVG (CC BY-SA)
            when writing practice ships.
          </html.p>
        </Card>
      </html.div>

      <html.div style={styles.section}>
        <Label color={colors.hanko}>About</Label>
        <html.p style={styles.body}>
          mynichi {version} · my日, a play on 毎日. Your day is the curriculum.
        </html.p>
        <html.a style={styles.link} href="https://mynichi.app">
          mynichi.app
        </html.a>
        <html.a style={styles.link} href="mailto:hello@mynichi.app?subject=mynichi%20feedback">
          Send feedback
        </html.a>
      </html.div>
    </Screen>
  );
}

const styles = css.create({
  section: {
    display: 'flex',
    flexDirection: 'column',
    marginBottom: 26
  },
  body: {
    fontFamily: text.body,
    fontSize: 14,
    lineHeight: 1.6,
    color: colors.inkSoft,
    margin: 0,
    marginBottom: 10,
    maxWidth: 460
  },
  cardBody: {
    fontFamily: text.body,
    fontSize: 13,
    lineHeight: 1.7,
    color: colors.inkSoft,
    margin: 0
  },
  chipWrap: {
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8
  },
  link: {
    fontFamily: text.bodyMedium,
    fontSize: 14,
    color: colors.indigo,
    textDecoration: 'none',
    marginBottom: 6
  }
});
