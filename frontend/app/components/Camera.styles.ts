import { StyleSheet } from 'react-native';

// ── Tokens ────────────────────────────────────────────────────────────────────

const colors = {
  ink:        '#1a1a1a',
  inkSoft:    '#6b6b6b',
  inkGhost:   '#b0b0b0',
  surface:    '#ffffff',
  surfaceAlt: '#f5f5f3',
  border:     '#e8e8e6',
  accent:     '#1a1a1a',
  accentFg:   '#ffffff',
  tagBg:      '#f0f0ee',
  tagFg:      '#3a3a3a',
  barBg:      '#ececea',
  barFill:    '#1a1a1a',
};

const radius = {
  sm:   8,
  md:   14,
  lg:   20,
  pill: 999,
};

const spacing = {
  xs:  4,
  sm:  8,
  md:  16,
  lg:  24,
  xl:  36,
  xxl: 56,
};

// ── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({

  // ── Shared ─────────────────────────────────────────────────────────────────

  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.surface,
  },

  // ── Permission screen ───────────────────────────────────────────────────────

  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    backgroundColor: colors.surface,
    gap: spacing.md,
  },

  permissionIcon: {
    fontSize: 52,
    marginBottom: spacing.sm,
  },

  permissionTitle: {
    fontFamily: 'Georgia',
    fontSize: 26,
    fontWeight: '600',
    color: colors.ink,
    textAlign: 'center',
    letterSpacing: -0.4,
  },

  permissionBody: {
    fontSize: 15,
    lineHeight: 22,
    color: colors.inkSoft,
    textAlign: 'center',
    maxWidth: 280,
  },

  // ── Idle screen ─────────────────────────────────────────────────────────────

  idleContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    backgroundColor: colors.surface,
    gap: spacing.md,
  },

  idleIconWrap: {
    width: 88,
    height: 88,
    borderRadius: radius.lg,
    backgroundColor: colors.surfaceAlt,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },

  idleIcon: {
    fontSize: 38,
  },

  idleTitle: {
    fontFamily: 'Georgia',
    fontSize: 28,
    fontWeight: '600',
    color: colors.ink,
    letterSpacing: -0.5,
    textAlign: 'center',
  },

  idleSubtitle: {
    fontSize: 15,
    lineHeight: 22,
    color: colors.inkSoft,
    textAlign: 'center',
    maxWidth: 260,
    marginBottom: spacing.sm,
  },

  // ── Camera viewfinder ───────────────────────────────────────────────────────

  cameraContainer: {
    flex: 1,
    backgroundColor: '#000',
  },

  camera: {
    flex: 1,
    justifyContent: 'space-between',
  },

  cameraTopBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingTop: 56,
    paddingBottom: spacing.md,
  },

  cameraIconButton: {
    width: 44,
    height: 44,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  cameraIconText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '500',
  },

  cameraBottomBar: {
    alignItems: 'center',
    paddingBottom: 52,
    paddingTop: spacing.lg,
  },

  shutterOuter: {
    width: 78,
    height: 78,
    borderRadius: radius.pill,
    borderWidth: 3,
    borderColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
  },

  shutterInner: {
    width: 62,
    height: 62,
    borderRadius: radius.pill,
    backgroundColor: '#ffffff',
  },

  // ── Preview screen ──────────────────────────────────────────────────────────

  previewScroll: {
    flex: 1,
    backgroundColor: colors.surface,
  },

  previewContent: {
    paddingBottom: spacing.xxl,
    gap: spacing.md,
  },

  previewImageWrap: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor: colors.surfaceAlt,
    overflow: 'hidden',
  },

  previewImage: {
    width: '100%',
    height: '100%',
  },

  // ── Status row ──────────────────────────────────────────────────────────────

  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },

  statusText: {
    fontSize: 14,
    color: colors.inkSoft,
    letterSpacing: 0.1,
  },

  // ── Upload result card ──────────────────────────────────────────────────────

  resultCard: {
    marginHorizontal: spacing.md,
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.xs,
  },

  resultCardLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.inkGhost,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },

  resultCardValue: {
    fontSize: 13,
    color: colors.inkSoft,
  },

  // ── AI analysis card ────────────────────────────────────────────────────────

  analysisCard: {
    marginHorizontal: spacing.md,
    padding: spacing.lg,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },

  analysisTitle: {
    fontFamily: 'Georgia',
    fontSize: 18,
    fontWeight: '600',
    color: colors.ink,
    letterSpacing: -0.2,
  },

  analysisDescription: {
    fontSize: 15,
    lineHeight: 23,
    color: colors.inkSoft,
  },

  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },

  tag: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: radius.pill,
    backgroundColor: colors.tagBg,
  },

  tagText: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.tagFg,
    letterSpacing: 0.1,
  },

  confidenceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },

  confidenceLabel: {
    fontSize: 12,
    color: colors.inkGhost,
    width: 72,
  },

  confidenceBarBg: {
    flex: 1,
    height: 4,
    borderRadius: radius.pill,
    backgroundColor: colors.barBg,
    overflow: 'hidden',
  },

  confidenceBarFill: {
    height: '100%',
    borderRadius: radius.pill,
    backgroundColor: colors.barFill,
  },

  confidenceValue: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.ink,
    width: 36,
    textAlign: 'right',
  },

  // ── Buttons ─────────────────────────────────────────────────────────────────

  actionRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    marginTop: spacing.sm,
  },

  primaryButton: {
    flex: 1,
    height: 52,
    borderRadius: radius.md,
    backgroundColor: colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
  },

  primaryButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.accentFg,
    letterSpacing: 0.1,
  },

  secondaryButton: {
    flex: 1,
    height: 52,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },

  secondaryButtonText: {
    fontSize: 15,
    fontWeight: '500',
    color: colors.ink,
    letterSpacing: 0.1,
  },
});

export default styles;