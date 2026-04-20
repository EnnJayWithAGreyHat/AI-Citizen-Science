// WelcomeScreen.tsx
import React, { useMemo, useState } from 'react';
import {
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';

type WelcomeScreenProps = {
  onStart?: () => void;
  onLearnMore?: () => void;
};

type Language = 'en' | 'id';

const translations = {
  en: {
    badge: 'Level 1 • Nature Scout',
    eyebrow: 'AI + Citizen Science',
    titleLine1: 'Turn nature photos into',
    titleLine2: 'discoveries.',
    subtitle:
      'Explore a game-style world where players upload images of plants, insects, clouds, and wildlife. Our AI helps identify what’s in the image, and your actions support real citizen science research.',
    feature1Title: 'Capture',
    feature1Text: 'Take or upload nature images',
    feature2Title: 'Analyze',
    feature2Text: 'Use AI to classify findings',
    feature3Title: 'Contribute',
    feature3Text: 'Help science with every quest',
    stat1Value: '+50 XP',
    stat1Label: 'per verified find',
    stat2Value: 'Daily Quests',
    stat2Label: 'new nature challenges',
    startButton: 'Start Exploring',
    learnMoreButton: 'How It Works',
    languageLabel: 'Language',
    english: 'English',
    bahasa: 'Bahasa Indonesia',
  },
  id: {
    badge: 'Level 1 • Penjelajah Alam',
    eyebrow: 'AI + Sains Warga',
    titleLine1: 'Ubah foto alam menjadi',
    titleLine2: 'penemuan.',
    subtitle:
      'Jelajahi dunia bergaya gim tempat pemain mengunggah gambar tumbuhan, serangga, awan, dan satwa liar. AI kami membantu mengidentifikasi isi gambar, dan tindakanmu mendukung riset sains warga di dunia nyata.',
    feature1Title: 'Ambil Gambar',
    feature1Text: 'Ambil atau unggah gambar alam',
    feature2Title: 'Analisis',
    feature2Text: 'Gunakan AI untuk mengklasifikasikan temuan',
    feature3Title: 'Berkontribusi',
    feature3Text: 'Bantu sains di setiap misi',
    stat1Value: '+50 XP',
    stat1Label: 'untuk tiap temuan terverifikasi',
    stat2Value: 'Misi Harian',
    stat2Label: 'tantangan alam baru',
    startButton: 'Mulai Menjelajah',
    learnMoreButton: 'Cara Kerjanya',
    languageLabel: 'Bahasa',
    english: 'English',
    bahasa: 'Bahasa Indonesia',
  },
};

export default function WelcomeScreen({
  onStart,
  onLearnMore,
}: WelcomeScreenProps) {
  const [language, setLanguage] = useState<Language>('en');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const t = useMemo(() => translations[language], [language]);

  const handleSelectLanguage = (value: Language) => {
    setLanguage(value);
    setIsDropdownOpen(false);
  };

  return (
    <View style={styles.screen}>
      <StatusBar barStyle="light-content" backgroundColor="#0B1020" />

      <View style={styles.overlay}>
        <View style={styles.topRow}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{t.badge}</Text>
          </View>

          <View style={styles.languageWrapper}>
            <Pressable
              style={({ pressed }) => [
                styles.languageButton,
                pressed && styles.buttonPressed,
              ]}
              onPress={() => setIsDropdownOpen((prev) => !prev)}
            >
              <Text style={styles.languageButtonText}>
                {language === 'en' ? t.english : t.bahasa} ▾
              </Text>
            </Pressable>

            {isDropdownOpen && (
              <View style={styles.dropdown}>
                <Pressable
                  style={styles.dropdownItem}
                  onPress={() => handleSelectLanguage('en')}
                >
                  <Text style={styles.dropdownText}>{t.english}</Text>
                </Pressable>

                <Pressable
                  style={styles.dropdownItem}
                  onPress={() => handleSelectLanguage('id')}
                >
                  <Text style={styles.dropdownText}>{t.bahasa}</Text>
                </Pressable>
              </View>
            )}
          </View>
        </View>

        <View style={styles.content}>
          <Text style={styles.eyebrow}>{t.eyebrow}</Text>

          <Text style={styles.title}>
            {t.titleLine1}
            {'\n'}
            {t.titleLine2}
          </Text>

          <Text style={styles.subtitle}>{t.subtitle}</Text>

          <View style={styles.featureRow}>
            <View style={styles.featureCard}>
              <Text style={styles.featureEmoji}>📷</Text>
              <Text style={styles.featureTitle}>{t.feature1Title}</Text>
              <Text style={styles.featureText}>{t.feature1Text}</Text>
            </View>

            <View style={styles.featureCard}>
              <Text style={styles.featureEmoji}>🤖</Text>
              <Text style={styles.featureTitle}>{t.feature2Title}</Text>
              <Text style={styles.featureText}>{t.feature2Text}</Text>
            </View>

            <View style={styles.featureCard}>
              <Text style={styles.featureEmoji}>🌍</Text>
              <Text style={styles.featureTitle}>{t.feature3Title}</Text>
              <Text style={styles.featureText}>{t.feature3Text}</Text>
            </View>
          </View>

          <View style={styles.statsRow}>
            <View style={styles.statPill}>
              <Text style={styles.statValue}>{t.stat1Value}</Text>
              <Text style={styles.statLabel}>{t.stat1Label}</Text>
            </View>
            <View style={styles.statPill}>
              <Text style={styles.statValue}>{t.stat2Value}</Text>
              <Text style={styles.statLabel}>{t.stat2Label}</Text>
            </View>
          </View>
        </View>

        <View style={styles.footer}>
          <Pressable
            style={({ pressed }) => [
              styles.primaryButton,
              pressed && styles.buttonPressed,
            ]}
            onPress={onStart}
          >
            <Text style={styles.primaryButtonText}>{t.startButton}</Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [
              styles.secondaryButton,
              pressed && styles.buttonPressed,
            ]}
            onPress={onLearnMore}
          >
            <Text style={styles.secondaryButtonText}>{t.learnMoreButton}</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#0B1020',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(8, 14, 28, 0.68)',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 28,
    justifyContent: 'space-between',
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    zIndex: 10,
  },
  badge: {
    backgroundColor: 'rgba(120, 255, 194, 0.14)',
    borderWidth: 1,
    borderColor: 'rgba(120, 255, 194, 0.4)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
  },
  badgeText: {
    color: '#C6FFE8',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.4,
  },
  languageWrapper: {
    position: 'relative',
  },
  languageButton: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    minWidth: 140,
    alignItems: 'center',
  },
  languageButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  dropdown: {
    position: 'absolute',
    top: 44,
    right: 0,
    width: 170,
    backgroundColor: '#121A2D',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    overflow: 'hidden',
  },
  dropdownItem: {
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  dropdownText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  content: {
    gap: 18,
  },
  eyebrow: {
    color: '#9EE6B8',
    fontSize: 14,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 34,
    lineHeight: 40,
    fontWeight: '800',
  },
  subtitle: {
    color: '#D5DDF0',
    fontSize: 16,
    lineHeight: 24,
    maxWidth: 520,
  },
  featureRow: {
    gap: 12,
  },
  featureCard: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  featureEmoji: {
    fontSize: 22,
    marginBottom: 8,
  },
  featureTitle: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 4,
  },
  featureText: {
    color: '#D5DDF0',
    fontSize: 13,
    lineHeight: 18,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    flexWrap: 'wrap',
  },
  statPill: {
    backgroundColor: 'rgba(18, 26, 45, 0.9)',
    borderRadius: 16,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  statValue: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  statLabel: {
    color: '#AEB9D6',
    fontSize: 12,
    marginTop: 2,
  },
  footer: {
    gap: 12,
  },
  primaryButton: {
    backgroundColor: '#7CF29A',
    borderRadius: 18,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: {
    color: '#0B1020',
    fontSize: 16,
    fontWeight: '800',
  },
  secondaryButton: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 18,
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)',
  },
  secondaryButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  buttonPressed: {
    opacity: 0.88,
    transform: [{ scale: 0.99 }],
  },
});