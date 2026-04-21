import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import Home from './components/Home';
import MyGarden from './components/MyGarden';
import Prompt from './components/Prompt';
import Camera from './components/Camera';
import BiodiversityHeatmap from './components/BiodiversityHeatmap';
import BiodiversityAnalytics from './components/BiodiversityAnalytics';

type ScreenKey =
  | 'home'
  | 'camera'
  | 'heatmap'
  | 'heatmapAnalytics'
  | 'myGarden'
  | 'prompt'
  | 'login'
  | 'postUpload';

const SCREENS: { key: ScreenKey; label: string }[] = [
  { key: 'home', label: 'Home' },
  { key: 'camera', label: 'Camera' },
  { key: 'heatmap', label: 'Heat Map' },
  { key: 'heatmapAnalytics', label: 'Heat Map Analytics' },
  { key: 'myGarden', label: 'My Garden' },
  { key: 'prompt', label: 'Prompt' },
  { key: 'login', label: 'Login' },
  { key: 'postUpload', label: 'Post Upload' },
];

function PlaceholderScreen({ title, message }: { title: string; message: string }) {
  return (
    <View style={styles.placeholder}>
      <Text style={styles.placeholderTitle}>{title}</Text>
      <Text style={styles.placeholderSubtitle}>{message}</Text>
    </View>
  );
}

function AppShell() {
  const { width } = useWindowDimensions();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeScreen, setActiveScreen] = useState<ScreenKey>('home');
  const isCompactLayout = width < 900;

  const openScreen = (screen: ScreenKey) => {
    setActiveScreen(screen);
    setIsMenuOpen(false);
  };

  const activeLabel = SCREENS.find((screen) => screen.key === activeScreen)?.label ?? 'Home';
  const overlayWidth = Math.min(320, width * 0.84);

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.menuButton} onPress={() => setIsMenuOpen((prev) => !prev)}>
          <Text style={styles.menuButtonText}>{isMenuOpen ? 'Close' : 'Menu'}</Text>
        </TouchableOpacity>
        <Text style={styles.topBarTitle} numberOfLines={1}>
          {activeLabel}
        </Text>
      </View>

      <View style={styles.body}>
        {!isCompactLayout && isMenuOpen && (
          <View style={styles.sidebar}>
            <Text style={styles.sidebarTitle}>Menu</Text>
            {SCREENS.map((screen) => (
              <TouchableOpacity
                key={screen.key}
                style={[
                  styles.sidebarItem,
                  activeScreen === screen.key && styles.sidebarItemActive,
                ]}
                onPress={() => openScreen(screen.key)}
              >
                <Text
                  style={[
                    styles.sidebarItemText,
                    activeScreen === screen.key && styles.sidebarItemTextActive,
                  ]}
                >
                  {screen.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        <View style={styles.content}>
          {activeScreen === 'home' && <Home />}
          {activeScreen === 'camera' && <Camera />}
          {activeScreen === 'heatmap' && <BiodiversityHeatmap />}
          {activeScreen === 'heatmapAnalytics' && <BiodiversityAnalytics />}
          {activeScreen === 'myGarden' && <MyGarden />}
          {activeScreen === 'prompt' && <Prompt />}
          {activeScreen === 'login' && (
            <PlaceholderScreen
              title="Login"
              message="Login screen not available: components/Login.tsx is empty."
            />
          )}
          {activeScreen === 'postUpload' && (
            <PlaceholderScreen
              title="Post Upload"
              message="PostUpload screen not available: components/PostUpload.tsx is empty."
            />
          )}
        </View>

        {isCompactLayout && isMenuOpen && (
          <View style={styles.mobileMenuLayer}>
            <Pressable style={styles.mobileMenuScrim} onPress={() => setIsMenuOpen(false)} />
            <View style={[styles.mobileSidebar, { width: overlayWidth }]}>
              <Text style={styles.sidebarTitle}>Menu</Text>
              {SCREENS.map((screen) => (
                <TouchableOpacity
                  key={screen.key}
                  style={[
                    styles.sidebarItem,
                    activeScreen === screen.key && styles.sidebarItemActive,
                  ]}
                  onPress={() => openScreen(screen.key)}
                >
                  <Text
                    style={[
                      styles.sidebarItemText,
                      activeScreen === screen.key && styles.sidebarItemTextActive,
                    ]}
                  >
                    {screen.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}
      </View>

      <StatusBar style="auto" />
    </SafeAreaView>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AppShell />
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f2ec',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e2dccf',
    backgroundColor: '#fff',
  },
  menuButton: {
    height: 36,
    paddingHorizontal: 14,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1a1f1a',
  },
  menuButtonText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  topBarTitle: {
    marginLeft: 12,
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1f1a',
    flex: 1,
  },
  body: {
    flex: 1,
    flexDirection: 'row',
    position: 'relative',
  },
  sidebar: {
    width: 220,
    backgroundColor: '#fff',
    borderRightWidth: 1,
    borderRightColor: '#e2dccf',
    padding: 12,
  },
  sidebarTitle: {
    fontSize: 12,
    letterSpacing: 2,
    textTransform: 'uppercase',
    color: '#4a5a4a',
    marginBottom: 12,
  },
  sidebarItem: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    marginBottom: 8,
  },
  sidebarItemActive: {
    backgroundColor: '#eef4ef',
  },
  sidebarItemText: {
    fontSize: 14,
    color: '#2f3a2f',
  },
  sidebarItemTextActive: {
    fontWeight: '600',
    color: '#1a1f1a',
  },
  content: {
    flex: 1,
  },
  mobileMenuLayer: {
    ...StyleSheet.absoluteFillObject,
    flexDirection: 'row',
    zIndex: 20,
  },
  mobileMenuScrim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(12, 18, 14, 0.34)',
  },
  mobileSidebar: {
    height: '100%',
    backgroundColor: '#fff',
    borderRightWidth: 1,
    borderRightColor: '#e2dccf',
    padding: 12,
    zIndex: 21,
  },
  placeholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  placeholderTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1a1f1a',
    marginBottom: 8,
  },
  placeholderSubtitle: {
    fontSize: 14,
    color: '#4a5a4a',
    textAlign: 'center',
  },
});
