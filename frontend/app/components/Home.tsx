// WelcomeScreen.tsx
import React from 'react';
import {
  ImageBackground,
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

export default function WelcomeScreen({
  onStart,
  onLearnMore,
}: WelcomeScreenProps) {
  return (
    <View style={styles.screen}>
      <StatusBar barStyle="light-content" backgroundColor="#0B1020" />

      <ImageBackground
        source={require('../assets/nature-bg.jpg')}
        resizeMode="cover"
        style={styles.background}
      >
        <View style={styles.overlay}>
          <View style={styles.topRow}>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>Level 1 • Nature Scout</Text>
            </View>
          </View>

          <View style={styles.content}>
            <Text style={styles.eyebrow}>AI + Citizen Science</Text>

            <Text style={styles.title}>
              Turn nature photos into{'\n'}
              discoveries.
            </Text>

            <Text style={styles.subtitle}>
              Explore a game-style world where players upload images of plants,
              insects, clouds, and wildlife. Our AI helps identify what’s in the
              image, and your actions support real citizen science research.
            </Text>

            <View style={styles.featureRow}>
              <View style={styles.featureCard}>
                <Text style={styles.featureEmoji}>📷</Text>
                <Text style={styles.featureTitle}>Capture</Text>
                <Text style={styles.featureText}>Take or upload nature images</Text>
              </View>

              <View style={styles.featureCard}>
                <Text style={styles.featureEmoji}>🤖</Text>
                <Text style={styles.featureTitle}>Analyze</Text>
                <Text style={styles.featureText}>Use AI to classify findings</Text>
              </View>

              <View style={styles.featureCard}>
                <Text style={styles.featureEmoji}>🌍</Text>
                <Text style={styles.featureTitle}>Contribute</Text>
                <Text style={styles.featureText}>Help science with every quest</Text>
              </View>
            </View>

            <View style={styles.statsRow}>
              <View style={styles.statPill}>
                <Text style={styles.statValue}>+50 XP</Text>
                <Text style={styles.statLabel}>per verified find</Text>
              </View>
              <View style={styles.statPill}>
                <Text style={styles.statValue}>Daily Quests</Text>
                <Text style={styles.statLabel}>new nature challenges</Text>
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
              <Text style={styles.primaryButtonText}>Start Exploring</Text>
            </Pressable>

            <Pressable
              style={({ pressed }) => [
                styles.secondaryButton,
                pressed && styles.buttonPressed,
              ]}
              onPress={onLearnMore}
            >
              <Text style={styles.secondaryButtonText}>How It Works</Text>
            </Pressable>
          </View>
        </View>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#0B1020',
  },
  background: {
    flex: 1,
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
    alignItems: 'flex-start',
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