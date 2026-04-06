import { CameraType, CameraView, useCameraPermissions } from 'expo-camera';
import React, { useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import styles from './Camera.styles';

// ─── Types ───────────────────────────────────────────────────────────────────

interface UploadResponse {
  url: string;
  id: string;
}

interface AnalysisResult {
  description: string;
  tags: string[];
  confidence: number;
}

type AppState = 'idle' | 'camera' | 'preview' | 'uploading' | 'analyzing' | 'done';

// ─── Constants ────────────────────────────────────────────────────────────────

const UPLOAD_ENDPOINT = 'https://your-api.com/upload'; // 🔧 Replace with your endpoint
const ANALYSIS_ENDPOINT = 'https://your-api.com/analyze'; // 🔧 Replace with your endpoint

// ─── Component ────────────────────────────────────────────────────────────────

export default function Camera() {
  const [permission, requestPermission] = useCameraPermissions();
  const [appState, setAppState] = useState<AppState>('idle');
  const [facing, setFacing] = useState<CameraType>('back');
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [uploadResult, setUploadResult] = useState<UploadResponse | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [statusMessage, setStatusMessage] = useState('');

  const cameraRef = useRef<CameraView>(null);

  // ── Permission gate ──────────────────────────────────────────────────────

  if (!permission) {
    return <View style={styles.centered}><ActivityIndicator /></View>;
  }

  if (!permission.granted) {
    return (
      <View style={styles.permissionContainer}>
        <Text style={styles.permissionIcon}>📷</Text>
        <Text style={styles.permissionTitle}>Camera Access</Text>
        <Text style={styles.permissionBody}>
          We need access to your camera to take and upload photos.
        </Text>
        <TouchableOpacity style={styles.primaryButton} onPress={requestPermission}>
          <Text style={styles.primaryButtonText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // ── Actions ──────────────────────────────────────────────────────────────

  const openCamera = () => setAppState('camera');

  const flipCamera = () =>
    setFacing(f => (f === 'back' ? 'front' : 'back'));

  const takePicture = async () => {
    if (!cameraRef.current) return;
    try {
      const photo = await cameraRef.current.takePictureAsync({ quality: 0.85 });
      if (!photo?.uri) {
        Alert.alert('Error', 'Failed to capture photo. Please try again.');
        return;
      }
      setPhotoUri(photo.uri);
      setAppState('preview');
    } catch {
      Alert.alert('Error', 'Failed to take picture. Please try again.');
    }
  };

  // FIX: added setStatusMessage('') so any in-progress status is cleared,
  // and moved setAppState('camera') to last so all state is wiped before
  // the camera screen mounts (avoids a stale-render flash of old results).
  const retake = () => {
    setUploadResult(null);
    setAnalysisResult(null);
    setStatusMessage('');
    setPhotoUri(null);
    setAppState('camera');
  };

  const reset = () => {
    setPhotoUri(null);
    setUploadResult(null);
    setAnalysisResult(null);
    setStatusMessage('');
    setAppState('idle');
  };

  const uploadAndAnalyze = async () => {
    if (!photoUri) return;

    try {
      // ── Step 1: Upload ──────────────────────────────────────────────────
      setAppState('uploading');
      setStatusMessage('Uploading photo…');

      const formData = new FormData();
      formData.append('photo', {
        uri: photoUri,
        name: `photo_${Date.now()}.jpg`,
        type: 'image/jpeg',
      } as unknown as Blob);

      const uploadRes = await fetch(UPLOAD_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'multipart/form-data' },
        body: formData,
      });

      if (!uploadRes.ok) throw new Error('Upload failed');
      const uploaded: UploadResponse = await uploadRes.json();
      setUploadResult(uploaded);

      // ── Step 2: Analyze ─────────────────────────────────────────────────
      setAppState('analyzing');
      setStatusMessage('Analyzing with AI…');

      const analysisRes = await fetch(ANALYSIS_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageId: uploaded.id, imageUrl: uploaded.url }),
      });

      if (!analysisRes.ok) throw new Error('Analysis failed');
      const analysis: AnalysisResult = await analysisRes.json();
      setAnalysisResult(analysis);

      setAppState('done');
      setStatusMessage('');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Something went wrong.';
      Alert.alert('Error', message);
      setAppState('preview');
      setStatusMessage('');
    }
  };

  // ── Render ───────────────────────────────────────────────────────────────

  // Idle screen
  if (appState === 'idle') {
    return (
      <View style={styles.idleContainer}>
        <View style={styles.idleIconWrap}>
          <Text style={styles.idleIcon}>🖼</Text>
        </View>
        <Text style={styles.idleTitle}>Photo Upload</Text>
        <Text style={styles.idleSubtitle}>Take a photo to upload and analyze it with AI.</Text>
        <TouchableOpacity style={styles.primaryButton} onPress={openCamera}>
          <Text style={styles.primaryButtonText}>Open Camera</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Camera viewfinder
  if (appState === 'camera') {
    return (
      <View style={styles.cameraContainer}>
        <CameraView ref={cameraRef} style={styles.camera} facing={facing}>
          {/* Top bar */}
          <View style={styles.cameraTopBar}>
            <TouchableOpacity style={styles.cameraIconButton} onPress={reset}>
              <Text style={styles.cameraIconText}>✕</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cameraIconButton} onPress={flipCamera}>
              <Text style={styles.cameraIconText}>⟳</Text>
            </TouchableOpacity>
          </View>

          {/* Shutter */}
          <View style={styles.cameraBottomBar}>
            <TouchableOpacity style={styles.shutterOuter} onPress={takePicture}>
              <View style={styles.shutterInner} />
            </TouchableOpacity>
          </View>
        </CameraView>
      </View>
    );
  }

  // Preview + result screen
  return (
    <ScrollView
      style={styles.previewScroll}
      contentContainerStyle={styles.previewContent}
      showsVerticalScrollIndicator={false}
    >
      {/* Photo preview */}
      {photoUri && (
        <View style={styles.previewImageWrap}>
          <Image source={{ uri: photoUri }} style={styles.previewImage} resizeMode="cover" />
        </View>
      )}

      {/* Status / loader */}
      {(appState === 'uploading' || appState === 'analyzing') && (
        <View style={styles.statusRow}>
          <ActivityIndicator size="small" color="#1a1a1a" />
          <Text style={styles.statusText}>{statusMessage}</Text>
        </View>
      )}

      {/* Upload result */}
      {uploadResult && (
        <View style={styles.resultCard}>
          <Text style={styles.resultCardLabel}>Uploaded</Text>
          <Text style={styles.resultCardValue} numberOfLines={1}>
            {uploadResult.url}
          </Text>
        </View>
      )}

      {/* AI analysis result */}
      {analysisResult && (
        <View style={styles.analysisCard}>
          <Text style={styles.analysisTitle}>AI Analysis</Text>
          <Text style={styles.analysisDescription}>{analysisResult.description}</Text>

          <View style={styles.tagRow}>
            {analysisResult.tags.map(tag => (
              <View key={tag} style={styles.tag}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
          </View>

          <View style={styles.confidenceRow}>
            <Text style={styles.confidenceLabel}>Confidence</Text>
            <View style={styles.confidenceBarBg}>
              <View
                style={[
                  styles.confidenceBarFill,
                  { width: `${Math.round(analysisResult.confidence * 100)}%` as unknown as number },
                ]}
              />
            </View>
            <Text style={styles.confidenceValue}>
              {Math.round(analysisResult.confidence * 100)}%
            </Text>
          </View>
        </View>
      )}

      {/* Action buttons */}
      <View style={styles.actionRow}>
        {appState === 'preview' && (
          <>
            <TouchableOpacity style={styles.secondaryButton} onPress={retake}>
              <Text style={styles.secondaryButtonText}>Retake</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.primaryButton} onPress={uploadAndAnalyze}>
              <Text style={styles.primaryButtonText}>Upload & Analyze</Text>
            </TouchableOpacity>
          </>
        )}

        {appState === 'done' && (
          <>
            <TouchableOpacity style={styles.secondaryButton} onPress={retake}>
              <Text style={styles.secondaryButtonText}>New Photo</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.primaryButton} onPress={reset}>
              <Text style={styles.primaryButtonText}>Done</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </ScrollView>
  );
}
