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

type AppState = 'idle' | 'camera' | 'review' | 'uploading' | 'analyzing' | 'done';

// ─── Constants ────────────────────────────────────────────────────────────────

const MAX_PHOTOS = 5;
const UPLOAD_ENDPOINT = 'https://your-api.com/upload';
const ANALYSIS_ENDPOINT = 'https://your-api.com/analyze';

// ─── Component ────────────────────────────────────────────────────────────────

export default function Camera() {
  const [permission, requestPermission] = useCameraPermissions();
  const [appState, setAppState] = useState<AppState>('idle');
  const [facing, setFacing] = useState<CameraType>('back');

  // Multi-shot state
  const [photos, setPhotos] = useState<string[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number>(0);

  // Result state
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
        <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
          <Text style={styles.permissionButton}>Grant Permission</Text>
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

      const updatedPhotos = [...photos, photo.uri];
      setPhotos(updatedPhotos);

      // Auto-select the newly taken photo
      setSelectedIndex(updatedPhotos.length - 1);

      // If we've hit the max, move to review
      if (updatedPhotos.length >= MAX_PHOTOS) {
        setAppState('review');
      }
    } catch {
      Alert.alert('Error', 'Failed to take picture. Please try again.');
    }
  };

  // Remove a specific photo from the strip
  const removePhoto = (index: number) => {
    const updated = photos.filter((_, i) => i !== index);
    setPhotos(updated);

    if (updated.length === 0) {
      // No photos left — go back to camera
      setAppState('camera');
      setSelectedIndex(0);
    } else {
      // Keep selection in bounds
      setSelectedIndex(Math.min(selectedIndex, updated.length - 1));
    }
  };

  // Go to review screen to pick the best shot
  const goToReview = () => {
    if (photos.length === 0) return;
    setAppState('review');
  };

  // Go back to camera to take more shots
  const backToCamera = () => {
    setAppState('camera');
  };

  const reset = () => {
    setPhotos([]);
    setSelectedIndex(0);
    setUploadResult(null);
    setAnalysisResult(null);
    setStatusMessage('');
    setAppState('idle');
  };

  const uploadAndAnalyze = async () => {
    const photoUri = photos[selectedIndex];
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
      setAppState('review');
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
        <Text style={styles.idleSubtitle}>Take up to {MAX_PHOTOS} photos, pick the best one, and analyze it with AI.</Text>
        <TouchableOpacity style={styles.permissionButton} onPress={openCamera}>
          <Text style={styles.primaryButtonText}>OPEN CAMERA</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Camera viewfinder
  if (appState === 'camera') {
    const shotsRemaining = MAX_PHOTOS - photos.length;

    return (
      <View style={styles.cameraContainer}>
        <CameraView ref={cameraRef} style={styles.camera} facing={facing}>
          {/* Top bar */}
          <View style={styles.cameraTopBar}>
            <TouchableOpacity style={styles.cameraIconButton} onPress={reset}>
              <Text style={styles.cameraIconText}>✕</Text>
            </TouchableOpacity>

            {/* Shot counter badge */}
            <View style={styles.shotCounterBadge}>
              <Text style={styles.shotCounterText}>
                {photos.length}/{MAX_PHOTOS}
              </Text>
            </View>

            <TouchableOpacity style={styles.cameraIconButton} onPress={flipCamera}>
              <Text style={styles.cameraIconText}>⟳</Text>
            </TouchableOpacity>
          </View>

          {/* Thumbnail strip — shown when at least one photo exists */}
          {photos.length > 0 && (
            <ScrollView
              horizontal
              style={styles.thumbnailStrip}
              contentContainerStyle={styles.thumbnailStripContent}
              showsHorizontalScrollIndicator={false}
            >
              {photos.map((uri, index) => (
                <TouchableOpacity
                  key={uri}
                  style={[
                    styles.thumbnail,
                    index === selectedIndex && styles.thumbnailSelected,
                  ]}
                  onPress={() => setSelectedIndex(index)}
                >
                  <Image source={{ uri }} style={styles.thumbnailImage} />
                  {/* Remove button */}
                  <TouchableOpacity
                    style={styles.thumbnailRemoveBtn}
                    onPress={() => removePhoto(index)}
                    hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                  >
                    <Text style={styles.thumbnailRemoveText}>✕</Text>
                  </TouchableOpacity>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}

          {/* Bottom controls */}
          <View style={styles.cameraBottomBar}>
            {/* Review button — only visible when photos exist */}
            {photos.length > 0 && (
              <TouchableOpacity style={styles.reviewButton} onPress={goToReview}>
                <Text style={styles.reviewButtonText}>Review</Text>
              </TouchableOpacity>
            )}

            {/* Shutter — disabled when at max */}
            <TouchableOpacity
              style={[
                styles.shutterOuter,
                shotsRemaining === 0 && styles.shutterDisabled,
              ]}
              onPress={takePicture}
              disabled={shotsRemaining === 0}
            >
              <View style={styles.shutterInner} />
            </TouchableOpacity>

            {/* Spacer to balance layout when review button is hidden */}
            {photos.length === 0 && <View style={styles.reviewButtonPlaceholder} />}
          </View>
        </CameraView>
      </View>
    );
  }

  // Review / select + result screen
  return (
    <ScrollView
      style={styles.previewScroll}
      contentContainerStyle={styles.previewContent}
      showsVerticalScrollIndicator={false}
    >
      {/* Large preview of the selected photo */}
      {photos.length > 0 && (
        <View style={styles.previewImageWrap}>
          <Image
            source={{ uri: photos[selectedIndex] }}
            style={styles.previewImage}
            resizeMode="cover"
          />
          {/* Selection label */}
          <View style={styles.previewBadge}>
            <Text style={styles.previewBadgeText}>
              Photo {selectedIndex + 1} of {photos.length}
            </Text>
          </View>
        </View>
      )}

      {/* Thumbnail selector strip */}
      {photos.length > 1 && appState === 'review' && (
        <ScrollView
          horizontal
          style={styles.reviewThumbnailStrip}
          contentContainerStyle={styles.thumbnailStripContent}
          showsHorizontalScrollIndicator={false}
        >
          {photos.map((uri, index) => (
            <TouchableOpacity
              key={uri}
              style={[
                styles.thumbnail,
                index === selectedIndex && styles.thumbnailSelected,
              ]}
              onPress={() => setSelectedIndex(index)}
            >
              <Image source={{ uri }} style={styles.thumbnailImage} />
              {/* Remove button */}
              <TouchableOpacity
                style={styles.thumbnailRemoveBtn}
                onPress={() => removePhoto(index)}
                hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
              >
                <Text style={styles.thumbnailRemoveText}>✕</Text>
              </TouchableOpacity>
            </TouchableOpacity>
          ))}
        </ScrollView>
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
        {appState === 'review' && (
          <>
            {/* Go back to camera if under the limit */}
            {photos.length < MAX_PHOTOS && (
              <TouchableOpacity style={styles.secondaryButton} onPress={backToCamera}>
                <Text style={styles.secondaryButtonText}>+ More</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity style={styles.primaryButton} onPress={uploadAndAnalyze}>
              <Text style={styles.primaryButtonText}>Upload & Analyze</Text>
            </TouchableOpacity>
          </>
        )}

        {appState === 'done' && (
          <>
            <TouchableOpacity style={styles.secondaryButton} onPress={reset}>
              <Text style={styles.secondaryButtonText}>New Session</Text>
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
