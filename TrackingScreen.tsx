import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Button,
  Alert,
  ScrollView,
  PermissionsAndroid,
  Platform,
  TouchableOpacity,
  Linking,
} from 'react-native';
import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';
import { BleManager, Device } from 'react-native-ble-plx';
import { TrackPoint, TelemetryIngest, SessionCreate, WindSensorData } from './types';
import { GarminGPSService, GPSPosition } from './GarminGPSService';
import { useAuth } from './AuthContext';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://127.0.0.1:8000';
const LOCATION_TASK_NAME = 'background-location-task';
const BATCH_SIZE = 10; // Send telemetry every 10 points
const BATCH_INTERVAL = 5000; // Or every 5 seconds

export default function TrackingScreen() {
  const { token, user } = useAuth();
  const [sessionId, setSessionId] = useState<number | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  const [telemetryBuffer, setTelemetryBuffer] = useState<TrackPoint[]>([]);
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [windData, setWindData] = useState<WindSensorData | null>(null);
  const [bleManager] = useState(() => new BleManager());

  // Garmin GPS state
  const [garminGPS] = useState(() => new GarminGPSService(bleManager));
  const [garminDevice, setGarminDevice] = useState<Device | null>(null);
  const [garminPosition, setGarminPosition] = useState<GPSPosition | null>(null);
  const [useExternalGPS, setUseExternalGPS] = useState(false);

  // Wind sensor state
  const [windDevice, setWindDevice] = useState<Device | null>(null);

  // Bluetooth scanning
  const [isScanning, setIsScanning] = useState(false);
  const [gpsDevices, setGpsDevices] = useState<Device[]>([]);
  const [windDevices, setWindDevices] = useState<Device[]>([]);

  const [stats, setStats] = useState({ pointsSent: 0, batchesSent: 0 });

  // GPS diagnostics
  const [permissionStatus, setPermissionStatus] = useState<string>('unknown');
  const [gpsStatus, setGpsStatus] = useState<'idle' | 'acquiring' | 'locked' | 'error'>('idle');
  const [gpsError, setGpsError] = useState<string>('');
  const [testingGPS, setTestingGPS] = useState(false);

  const sessionIdRef = useRef<number | null>(null);
  const telemetryBufferRef = useRef<TrackPoint[]>([]);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Request permissions on mount
  useEffect(() => {
    requestPermissions();
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      try {
        garminGPS?.disconnect();
        bleManager?.destroy();
      } catch (error) {
        console.warn('Cleanup failed:', error);
      }
    };
  }, []);

  // Update refs when state changes
  useEffect(() => {
    telemetryBufferRef.current = telemetryBuffer;
  }, [telemetryBuffer]);

  useEffect(() => {
    sessionIdRef.current = sessionId;
  }, [sessionId]);

  const requestPermissions = async () => {
    try {
      console.log('[GPS] Requesting location permissions...');

      // Location permissions
      const { status: locationStatus } = await Location.requestForegroundPermissionsAsync();
      console.log('[GPS] Foreground permission status:', locationStatus);

      if (locationStatus !== 'granted') {
        setPermissionStatus('denied');
        Alert.alert(
          'Location Permission Required',
          'RacePilot needs location access to track your sailing sessions. Please enable location permissions in your device settings.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Open Settings', onPress: () => Linking.openSettings() }
          ]
        );
        return;
      }

      const { status: backgroundStatus } = await Location.requestBackgroundPermissionsAsync();
      console.log('[GPS] Background permission status:', backgroundStatus);

      if (backgroundStatus !== 'granted') {
        setPermissionStatus('foreground-only');
        Alert.alert(
          'Background Location Recommended',
          'For best results, allow location access "All the time" in settings. This lets RacePilot track your session even when the app is in the background.'
        );
      } else {
        setPermissionStatus('granted');
      }

      // Bluetooth permissions for Android 12+
      if (Platform.OS === 'android' && Platform.Version >= 31) {
        const granted = await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        ]);

        if (Object.values(granted).some(v => v !== 'granted')) {
          console.log('[GPS] Some Bluetooth permissions denied');
        }
      }
    } catch (error) {
      console.error('[GPS] Permission error:', error);
      setPermissionStatus('error');
      setGpsError(`Permission error: ${error}`);
    }
  };

  // Test GPS without starting a session
  const testGPS = async () => {
    setTestingGPS(true);
    setGpsStatus('acquiring');
    setGpsError('');
    console.log('[GPS] Testing GPS signal...');

    try {
      // Check if we have permission
      const { status } = await Location.getForegroundPermissionsAsync();
      if (status !== 'granted') {
        setGpsStatus('error');
        setGpsError('Location permission not granted');
        Alert.alert(
          'Permission Required',
          'Please grant location permission first',
          [
            { text: 'Grant Permission', onPress: requestPermissions }
          ]
        );
        setTestingGPS(false);
        return;
      }

      console.log('[GPS] Getting current position...');

      // Try to get current location with timeout
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.BestForNavigation,
        timeInterval: 10000, // 10 second timeout
      });

      console.log('[GPS] Got location:', {
        lat: location.coords.latitude,
        lon: location.coords.longitude,
        accuracy: location.coords.accuracy
      });

      setLocation(location);
      setGpsStatus('locked');

      Alert.alert(
        'GPS Test Successful! ✓',
        `Location acquired:\n\n` +
        `Latitude: ${location.coords.latitude.toFixed(6)}°\n` +
        `Longitude: ${location.coords.longitude.toFixed(6)}°\n` +
        `Accuracy: ${location.coords.accuracy?.toFixed(1)}m\n\n` +
        `GPS is working correctly!`,
        [{ text: 'OK' }]
      );
    } catch (error: any) {
      console.error('[GPS] Test failed:', error);
      setGpsStatus('error');

      let errorMessage = 'Failed to acquire GPS signal.\n\n';
      if (error.message?.includes('timeout')) {
        errorMessage += '⏱️ GPS timeout - Try these steps:\n\n' +
          '1. Go outside or near a window\n' +
          '2. Make sure GPS is enabled in device settings\n' +
          '3. Wait 30-60 seconds for GPS to lock\n' +
          '4. Restart your device if problem persists';
      } else if (error.message?.includes('permission')) {
        errorMessage += '🔒 Permission issue - Please enable location permissions in settings';
      } else {
        errorMessage += `Error: ${error.message}`;
      }

      setGpsError(errorMessage);
      Alert.alert('GPS Test Failed', errorMessage);
    } finally {
      setTestingGPS(false);
    }
  };

  // Start a new session
  const startSession = async () => {
    try {
      if (!token || !user) {
        Alert.alert('Error', 'You must be logged in to start a session');
        return;
      }

      const sessionData: SessionCreate = {
        user_id: user.id,
        boat_id: 1, // Default boat for MVP
        title: `Session ${new Date().toLocaleString()}`,
        start_ts: new Date().toISOString(),
      };

      console.log('=== CREATING SESSION ===');
      console.log('Session data:', sessionData);
      console.log('API URL:', `${API_URL}/sessions`);

      const response = await fetch(`${API_URL}/sessions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(sessionData),
      });

      console.log('Create session response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: 'Unknown error' }));
        console.error('Session creation failed:', errorData);
        Alert.alert('Error', errorData.detail || `Failed to start session (${response.status})`);
        return;
      }

      const data = await response.json();
      console.log('Created session:', data);
      console.log('Session ID:', data.id);

      // Set both state and ref immediately
      setSessionId(data.id);
      sessionIdRef.current = data.id;
      setIsTracking(true);
      setTelemetryBuffer([]);
      telemetryBufferRef.current = [];
      setStats({ pointsSent: 0, batchesSent: 0 });

      // Start location tracking
      setGpsStatus('acquiring');
      await startLocationTracking();

      // Start periodic flush
      intervalRef.current = setInterval(() => {
        flushTelemetry();
      }, BATCH_INTERVAL);

      Alert.alert('Success', `Session ${data.id} started!\n\nCheck dashboard for this session ID.`);
      console.log('=== SESSION STARTED ===');
    } catch (error: any) {
      console.error('Start session error:', error);
      const errorMessage = error?.message || 'Failed to start session. Check your connection.';
      Alert.alert('Error', errorMessage);
    }
  };

  // Stop the current session
  const stopSession = async () => {
    try {
      // Flush remaining telemetry
      await flushTelemetry();

      // Stop location tracking
      await Location.stopLocationUpdatesAsync(LOCATION_TASK_NAME).catch(() => {});

      // Clear interval
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }

      setIsTracking(false);
      Alert.alert('Success', `Session ${sessionId} stopped!`);
      setSessionId(null);
      sessionIdRef.current = null;
    } catch (error) {
      console.error('Stop session error:', error);
      Alert.alert('Error', 'Failed to stop session');
    }
  };

  // Start location tracking
  const startLocationTracking = async () => {
    try {
      console.log('[GPS] Starting location tracking...');

      await Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, {
        accuracy: Location.Accuracy.BestForNavigation,
        distanceInterval: 1, // Update every 1 meter
        timeInterval: 1000, // Or every 1 second
        foregroundService: {
          notificationTitle: 'RacePilot',
          notificationBody: 'Tracking your sailing session',
        },
      });

      console.log('[GPS] Location tracking started successfully');
    } catch (error: any) {
      console.error('[GPS] Location tracking error:', error);
      setGpsStatus('error');
      setGpsError(error.message || 'Failed to start GPS tracking');

      Alert.alert(
        'GPS Tracking Error',
        'Failed to start GPS tracking. Please ensure:\n\n' +
        '1. Location services are enabled\n' +
        '2. Location permission is granted\n' +
        '3. You are outdoors or near a window\n\n' +
        `Error: ${error.message}`
      );
    }
  };

  // Task Manager for background location
  TaskManager.defineTask(LOCATION_TASK_NAME, async ({ data, error }: any) => {
    if (error) {
      console.error('Location task error:', error);
      return;
    }
    if (data) {
      const { locations } = data;
      const location = locations[0];

      // This runs in background, so we need to use global state or AsyncStorage
      // For MVP, we'll handle it in foreground primarily
      console.log('Background location:', location);
    }
  });

  // Handle Garmin GPS updates
  useEffect(() => {
    if (!isTracking || !useExternalGPS || !garminPosition) return;

    // Create track point from Garmin GPS
    const trackPoint: TrackPoint = {
      ts: garminPosition.timestamp.toISOString(),
      lat: garminPosition.latitude,
      lon: garminPosition.longitude,
      sog: garminPosition.speed, // already in knots from Garmin
      cog: garminPosition.heading,
      hdg: garminPosition.heading,
      awa: windData?.awa || 0,
      aws: windData?.aws || 0,
      tws: windData?.tws,
      twa: windData?.twa,
    };

    // Add to buffer
    const newBuffer = [...telemetryBufferRef.current, trackPoint];
    setTelemetryBuffer(newBuffer);
    telemetryBufferRef.current = newBuffer;

    // Auto-flush if buffer is full
    if (newBuffer.length >= BATCH_SIZE) {
      flushTelemetry();
    }
  }, [garminPosition, isTracking, useExternalGPS, windData]);

  // Handle phone GPS updates (only when NOT using external GPS)
  useEffect(() => {
    if (!isTracking || useExternalGPS) return;

    const subscription = Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.BestForNavigation,
        distanceInterval: 1,
        timeInterval: 1000,
      },
      (newLocation) => {
        console.log('[GPS] Location update received:', {
          lat: newLocation.coords.latitude,
          lon: newLocation.coords.longitude,
          accuracy: newLocation.coords.accuracy
        });

        setLocation(newLocation);
        setGpsStatus('locked'); // Mark GPS as locked when we get first position

        // Create track point
        const trackPoint: TrackPoint = {
          ts: new Date(newLocation.timestamp).toISOString(),
          lat: newLocation.coords.latitude,
          lon: newLocation.coords.longitude,
          sog: newLocation.coords.speed ? newLocation.coords.speed * 1.94384 : 0, // m/s to knots
          cog: newLocation.coords.heading || 0,
          hdg: newLocation.coords.heading || 0,
          awa: windData?.awa || 0,
          aws: windData?.aws || 0,
          tws: windData?.tws,
          twa: windData?.twa,
        };

        // Add to buffer
        const newBuffer = [...telemetryBufferRef.current, trackPoint];
        setTelemetryBuffer(newBuffer);
        telemetryBufferRef.current = newBuffer;

        // Auto-flush if buffer is full
        if (newBuffer.length >= BATCH_SIZE) {
          flushTelemetry();
        }
      }
    );

    return () => {
      subscription.then(sub => sub.remove());
    };
  }, [isTracking, useExternalGPS, windData]);

  // Flush telemetry to server
  const flushTelemetry = async () => {
    const buffer = telemetryBufferRef.current;
    const currentSessionId = sessionIdRef.current;

    if (buffer.length === 0 || !currentSessionId || !token) {
      console.log('Skip flush - buffer empty or no session:', { bufferSize: buffer.length, sessionId: currentSessionId, hasToken: !!token });
      return;
    }

    try {
      const payload: TelemetryIngest = {
        session_id: currentSessionId,
        points: buffer,
      };

      console.log('=== TELEMETRY FLUSH ===');
      console.log('Session ID:', currentSessionId);
      console.log('Points count:', buffer.length);
      console.log('First point:', buffer[0]);
      console.log('API URL:', `${API_URL}/telemetry/ingest`);

      const response = await fetch(`${API_URL}/telemetry/ingest`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);

      const data = await response.json();
      console.log('Response data:', JSON.stringify(data));

      // Update stats
      setStats(prev => ({
        pointsSent: prev.pointsSent + buffer.length,
        batchesSent: prev.batchesSent + 1,
      }));

      // Clear buffer
      setTelemetryBuffer([]);
      telemetryBufferRef.current = [];

      console.log('=== FLUSH COMPLETE ===');
    } catch (error) {
      console.error('Telemetry flush error:', error);
      console.error('Error details:', JSON.stringify(error, null, 2));
      // Keep buffer for retry
    }
  };

  // Check if Bluetooth is enabled on the device
  const checkBluetoothState = async (): Promise<boolean> => {
    if (!bleManager) {
      Alert.alert('Bluetooth Not Available', 'Bluetooth features are not available on this device');
      return false;
    }

    try {
      const state = await bleManager.state();
      console.log('Bluetooth state:', state);

      if (state !== 'PoweredOn') {
        Alert.alert(
          'Bluetooth Disabled',
          'Please enable Bluetooth in your device settings to connect to wind sensors.',
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Open Settings',
              onPress: () => {
                if (Platform.OS === 'android') {
                  Linking.sendIntent('android.settings.BLUETOOTH_SETTINGS');
                }
              },
            },
          ]
        );
        return false;
      }
      return true;
    } catch (error) {
      console.error('Bluetooth state check error:', error);
      Alert.alert('Bluetooth Error', 'Unable to check Bluetooth status');
      return false;
    }
  };

  // Bluetooth: Scan for devices
  const scanForDevices = async () => {
    if (!bleManager) {
      Alert.alert('Bluetooth Not Available', 'Bluetooth features are not available on this device');
      return;
    }

    // Check if Bluetooth is enabled
    const isAvailable = await checkBluetoothState();
    if (!isAvailable) return;

    // Request permissions again to ensure they're granted
    if (Platform.OS === 'android' && Platform.Version >= 31) {
      const granted = await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
      ]);

      if (Object.values(granted).some(v => v !== 'granted')) {
        Alert.alert('Permission Required', 'Bluetooth permissions are required to scan for devices');
        return;
      }
    }

    setIsScanning(true);
    setGpsDevices([]);
    setWindDevices([]);

    bleManager.startDeviceScan(null, null, (error, device) => {
      if (error) {
        console.error('BLE scan error:', error);
        setIsScanning(false);
        return;
      }

      if (!device || !device.name) return;

      const name = device.name.toLowerCase();

      // Check if it's a Garmin Glo GPS device
      if (GarminGPSService.isGarminGlo(device)) {
        setGpsDevices(prev => {
          const exists = prev.find(d => d.id === device.id);
          if (exists) return prev;
          return [...prev, device];
        });
      }
      // Check if it's a wind sensor
      else if (name.includes('wind')) {
        setWindDevices(prev => {
          const exists = prev.find(d => d.id === device.id);
          if (exists) return prev;
          return [...prev, device];
        });
      }
    });

    // Stop scanning after 10 seconds
    setTimeout(() => {
      bleManager?.stopDeviceScan();
      setIsScanning(false);
    }, 10000);
  };

  // Connect to Garmin Glo 2 GPS
  const connectToGarminGPS = async (device: Device) => {
    if (!bleManager) {
      Alert.alert('Bluetooth Not Available', 'Bluetooth features are not available on this device');
      return;
    }

    const isAvailable = await checkBluetoothState();
    if (!isAvailable) return;

    try {
      bleManager.stopDeviceScan();
      setIsScanning(false);

      console.log('[TrackingScreen] Connecting to Garmin GPS:', device.name);

      await garminGPS.connect(device, (position: GPSPosition) => {
        setGarminPosition(position);
      });

      setGarminDevice(device);
      setUseExternalGPS(true);
      Alert.alert(
        'Garmin GPS Connected',
        `Connected to ${device.name}\n\nUsing external GPS with:\n- 10 Hz update rate\n- GPS + GLONASS\n- ~3m accuracy`
      );

      console.log('[TrackingScreen] Garmin GPS connected successfully');
    } catch (error) {
      console.error('[TrackingScreen] Garmin GPS connection error:', error);
      Alert.alert('Error', `Failed to connect to Garmin GPS: ${error}`);
    }
  };

  // Disconnect from Garmin GPS
  const disconnectGarminGPS = async () => {
    try {
      await garminGPS.disconnect();
      setGarminDevice(null);
      setGarminPosition(null);
      setUseExternalGPS(false);
      Alert.alert('Disconnected', 'Garmin GPS disconnected. Using phone GPS.');
    } catch (error) {
      console.error('[TrackingScreen] Garmin GPS disconnect error:', error);
    }
  };

  // Connect to wind sensor
  const connectToWindSensor = async (device: Device) => {
    if (!bleManager) {
      Alert.alert('Bluetooth Not Available', 'Bluetooth features are not available on this device');
      return;
    }

    const isAvailable = await checkBluetoothState();
    if (!isAvailable) return;

    try {
      bleManager.stopDeviceScan();
      setIsScanning(false);

      const connected = await device.connect();
      await connected.discoverAllServicesAndCharacteristics();

      setWindDevice(connected);
      Alert.alert('Connected', `Connected to wind sensor: ${device.name}`);

      monitorWindSensor(connected);
    } catch (error) {
      console.error('Wind sensor connect error:', error);
      Alert.alert('Error', 'Failed to connect to wind sensor');
    }
  };

  // Monitor wind sensor data
  const monitorWindSensor = async (device: Device) => {
    // This is a placeholder - you need to customize based on your wind sensor
    // Most marine wind sensors use NMEA 0183 or NMEA 2000 protocols

    // Example: monitoring a characteristic (replace with actual UUIDs)
    try {
      const services = await device.services();
      console.log('Available services:', services.map(s => s.uuid));

      // For demo purposes, simulate wind data
      // In production, you'd read from the actual BLE characteristic
      setInterval(() => {
        const simulatedWind: WindSensorData = {
          aws: 10 + Math.random() * 5, // 10-15 knots
          awa: 45 + Math.random() * 10, // 45-55 degrees
          tws: 12 + Math.random() * 3,
          twa: 50 + Math.random() * 10,
        };
        setWindData(simulatedWind);
      }, 1000);
    } catch (error) {
      console.error('Wind monitor error:', error);
    }
  };

  // Disconnect from wind sensor
  const disconnectWindSensor = async () => {
    if (windDevice) {
      await windDevice.cancelConnection();
      setWindDevice(null);
      setWindData(null);
      Alert.alert('Disconnected', 'Wind sensor disconnected');
    }
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>⛵ RacePilot</Text>
        {user && <Text style={styles.subtitle}>Welcome back, {user.name}</Text>}
      </View>

      {/* Session Control */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Active Session</Text>
          {isTracking && (
            <View style={styles.statusBadge}>
              <View style={styles.recordingDot} />
              <Text style={styles.statusText}>Recording</Text>
            </View>
          )}
        </View>

        {!isTracking ? (
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={startSession}
            activeOpacity={0.8}
          >
            <Text style={styles.primaryButtonText}>▶ Start New Session</Text>
          </TouchableOpacity>
        ) : (
          <View>
            <View style={styles.sessionInfoCard}>
              <Text style={styles.sessionLabel}>Session ID</Text>
              <Text style={styles.sessionValue}>#{sessionId}</Text>
            </View>
            <TouchableOpacity
              style={styles.dangerButton}
              onPress={stopSession}
              activeOpacity={0.8}
            >
              <Text style={styles.dangerButtonText}>⬛ Stop Session</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Telemetry Stats */}
      {isTracking && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Live Telemetry</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{stats.pointsSent}</Text>
              <Text style={styles.statLabel}>Points Sent</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{stats.batchesSent}</Text>
              <Text style={styles.statLabel}>Batches</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{telemetryBuffer.length}</Text>
              <Text style={styles.statLabel}>Buffered</Text>
            </View>
          </View>
        </View>
      )}

      {/* GPS Status */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📍 GPS</Text>

        {/* Permission Status */}
        {permissionStatus !== 'unknown' && (
          <View style={[
            styles.permissionBadge,
            permissionStatus === 'granted' ? styles.permissionGranted :
            permissionStatus === 'foreground-only' ? styles.permissionWarning :
            styles.permissionDenied
          ]}>
            <Text style={styles.permissionText}>
              {permissionStatus === 'granted' ? '✓ Location Permission: Full Access' :
               permissionStatus === 'foreground-only' ? '⚠️ Location Permission: Foreground Only' :
               permissionStatus === 'denied' ? '✗ Location Permission: Denied' :
               '? Location Permission: Error'}
            </Text>
          </View>
        )}

        {/* GPS Status Indicator */}
        {gpsStatus !== 'idle' && (
          <View style={[
            styles.gpsStatusBadge,
            gpsStatus === 'locked' ? styles.gpsLocked :
            gpsStatus === 'acquiring' ? styles.gpsAcquiring :
            styles.gpsError
          ]}>
            <Text style={styles.gpsStatusText}>
              {gpsStatus === 'locked' ? '✓ GPS Signal: Locked' :
               gpsStatus === 'acquiring' ? '🔄 GPS Signal: Acquiring...' :
               '✗ GPS Signal: Error'}
            </Text>
          </View>
        )}

        {/* GPS Test Button */}
        <TouchableOpacity
          style={[styles.secondaryButton, testingGPS && styles.disabledButton]}
          onPress={testGPS}
          disabled={testingGPS}
          activeOpacity={0.8}
        >
          <Text style={styles.secondaryButtonText}>
            {testingGPS ? '🔄 Testing GPS...' : '🧪 Test GPS Signal'}
          </Text>
        </TouchableOpacity>

        {/* GPS Source Indicator */}
        <View style={[styles.sourceIndicator, useExternalGPS ? styles.externalGPS : styles.phoneGPS]}>
          <Text style={[styles.sourceText, useExternalGPS ? styles.externalGPSText : styles.phoneGPSText]}>
            {useExternalGPS ? '📡 Garmin Glo 2' : '📱 Phone GPS'}
          </Text>
        </View>

        {/* Garmin GPS Connection */}
        {!bleManager ? (
          <Text style={styles.warningText}>⚠️ Build APK to enable external GPS</Text>
        ) : !garminDevice ? (
          <View>
            <TouchableOpacity
              style={[styles.secondaryButton, isScanning && styles.disabledButton]}
              onPress={scanForDevices}
              disabled={isScanning}
              activeOpacity={0.8}
            >
              <Text style={styles.secondaryButtonText}>
                {isScanning ? '🔄 Scanning...' : '🔍 Scan for Garmin Glo 2'}
              </Text>
            </TouchableOpacity>
            {gpsDevices.map(device => (
              <TouchableOpacity
                key={device.id}
                style={styles.deviceCard}
                onPress={() => connectToGarminGPS(device)}
                activeOpacity={0.7}
              >
                <Text style={styles.deviceName}>📡 {device.name || 'Unknown Device'}</Text>
                <Text style={styles.deviceId}>{device.id.substring(0, 20)}...</Text>
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          <View>
            <View style={styles.connectedCard}>
              <Text style={styles.connectedText}>✓ {garminDevice.name}</Text>
              {garminPosition && (
                <Text style={styles.satelliteText}>
                  {garminPosition.satellites} satellites
                  {garminPosition.hdop && ` • HDOP ${garminPosition.hdop.toFixed(1)}`}
                </Text>
              )}
            </View>
            <TouchableOpacity
              style={styles.warningButton}
              onPress={disconnectGarminGPS}
              activeOpacity={0.8}
            >
              <Text style={styles.warningButtonText}>Disconnect</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* GPS Data */}
        <View style={styles.gpsDataCard}>
          {useExternalGPS && garminPosition ? (
            <View style={styles.dataGrid}>
              <View style={styles.dataRow}>
                <Text style={styles.dataLabel}>Latitude</Text>
                <Text style={styles.dataValue}>{garminPosition.latitude.toFixed(6)}°</Text>
              </View>
              <View style={styles.dataRow}>
                <Text style={styles.dataLabel}>Longitude</Text>
                <Text style={styles.dataValue}>{garminPosition.longitude.toFixed(6)}°</Text>
              </View>
              <View style={styles.dataRow}>
                <Text style={styles.dataLabel}>Speed</Text>
                <Text style={styles.dataValue}>{garminPosition.speed.toFixed(1)} kts</Text>
              </View>
              <View style={styles.dataRow}>
                <Text style={styles.dataLabel}>Heading</Text>
                <Text style={styles.dataValue}>{garminPosition.heading.toFixed(1)}°</Text>
              </View>
            </View>
          ) : location ? (
            <View style={styles.dataGrid}>
              <View style={styles.dataRow}>
                <Text style={styles.dataLabel}>Latitude</Text>
                <Text style={styles.dataValue}>{location.coords.latitude.toFixed(6)}°</Text>
              </View>
              <View style={styles.dataRow}>
                <Text style={styles.dataLabel}>Longitude</Text>
                <Text style={styles.dataValue}>{location.coords.longitude.toFixed(6)}°</Text>
              </View>
              <View style={styles.dataRow}>
                <Text style={styles.dataLabel}>Speed</Text>
                <Text style={styles.dataValue}>{((location.coords.speed || 0) * 1.94384).toFixed(1)} kts</Text>
              </View>
              <View style={styles.dataRow}>
                <Text style={styles.dataLabel}>Heading</Text>
                <Text style={styles.dataValue}>{location.coords.heading?.toFixed(1) || 'N/A'}°</Text>
              </View>
            </View>
          ) : (
            <Text style={styles.waitingText}>Acquiring GPS signal...</Text>
          )}
        </View>
      </View>

      {/* Bluetooth Wind Sensor */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>💨 Wind Sensor</Text>
        {!bleManager ? (
          <View style={styles.warningCard}>
            <Text style={styles.warningText}>⚠️ Bluetooth requires APK build</Text>
            <Text style={styles.hintText}>Build APK to enable wind sensors</Text>
          </View>
        ) : !windDevice ? (
          <View>
            <TouchableOpacity
              style={[styles.secondaryButton, isScanning && styles.disabledButton]}
              onPress={scanForDevices}
              disabled={isScanning}
              activeOpacity={0.8}
            >
              <Text style={styles.secondaryButtonText}>
                {isScanning ? '🔄 Scanning...' : '🔍 Scan for Wind Sensors'}
              </Text>
            </TouchableOpacity>
            {windDevices.map(device => (
              <TouchableOpacity
                key={device.id}
                style={styles.deviceCard}
                onPress={() => connectToWindSensor(device)}
                activeOpacity={0.7}
              >
                <Text style={styles.deviceName}>💨 {device.name || 'Unknown Device'}</Text>
                <Text style={styles.deviceId}>{device.id.substring(0, 20)}...</Text>
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          <View>
            <View style={styles.connectedCard}>
              <Text style={styles.connectedText}>✓ {windDevice.name}</Text>
            </View>
            {windData && (
              <View style={styles.windDataCard}>
                <View style={styles.windDataRow}>
                  <View style={styles.windDataBox}>
                    <Text style={styles.windLabel}>AWS</Text>
                    <Text style={styles.windValue}>{windData.aws.toFixed(1)}</Text>
                    <Text style={styles.windUnit}>knots</Text>
                  </View>
                  <View style={styles.windDataBox}>
                    <Text style={styles.windLabel}>AWA</Text>
                    <Text style={styles.windValue}>{windData.awa.toFixed(1)}</Text>
                    <Text style={styles.windUnit}>degrees</Text>
                  </View>
                </View>
                {windData.tws && windData.twa && (
                  <View style={styles.windDataRow}>
                    <View style={styles.windDataBox}>
                      <Text style={styles.windLabel}>TWS</Text>
                      <Text style={styles.windValue}>{windData.tws.toFixed(1)}</Text>
                      <Text style={styles.windUnit}>knots</Text>
                    </View>
                    <View style={styles.windDataBox}>
                      <Text style={styles.windLabel}>TWA</Text>
                      <Text style={styles.windValue}>{windData.twa.toFixed(1)}</Text>
                      <Text style={styles.windUnit}>degrees</Text>
                    </View>
                  </View>
                )}
              </View>
            )}
            <TouchableOpacity
              style={styles.warningButton}
              onPress={disconnectWindSensor}
              activeOpacity={0.8}
            >
              <Text style={styles.warningButtonText}>Disconnect</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* API Status */}
      <View style={[styles.section, { marginBottom: 40 }]}>
        <Text style={styles.sectionTitle}>🔗 Backend</Text>
        <View style={styles.backendCard}>
          <Text style={styles.backendLabel}>API Endpoint</Text>
          <Text style={styles.backendUrl}>{API_URL}</Text>
          <View style={styles.statusIndicator}>
            <View style={styles.statusDot} />
            <Text style={styles.statusLabel}>Connected</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a', // Dark ocean blue
  },
  header: {
    paddingTop: 60,
    paddingBottom: 30,
    paddingHorizontal: 20,
    backgroundColor: '#1e40af',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 12,
  },
  title: {
    fontSize: 36,
    fontWeight: '900',
    color: '#fff',
    letterSpacing: -1,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#e0e7ff',
    fontWeight: '500',
  },
  section: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: 20,
    padding: 20,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 10,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1e293b',
    letterSpacing: -0.5,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fee2e2',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  recordingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ef4444',
    marginRight: 6,
  },
  statusText: {
    color: '#dc2626',
    fontSize: 12,
    fontWeight: '700',
  },
  primaryButton: {
    backgroundColor: '#10b981',
    borderRadius: 14,
    paddingVertical: 18,
    alignItems: 'center',
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  dangerButton: {
    backgroundColor: '#ef4444',
    borderRadius: 14,
    paddingVertical: 18,
    alignItems: 'center',
    marginTop: 12,
    shadowColor: '#ef4444',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  dangerButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  secondaryButton: {
    backgroundColor: '#3b82f6',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 12,
  },
  secondaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  warningButton: {
    backgroundColor: '#f59e0b',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 12,
  },
  warningButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
  disabledButton: {
    opacity: 0.6,
  },
  sessionInfoCard: {
    backgroundColor: '#f1f5f9',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  sessionLabel: {
    fontSize: 13,
    color: '#64748b',
    fontWeight: '600',
    marginBottom: 4,
  },
  sessionValue: {
    fontSize: 24,
    color: '#1e293b',
    fontWeight: '900',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  statBox: {
    flex: 1,
    backgroundColor: '#f8fafc',
    padding: 16,
    borderRadius: 14,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#e2e8f0',
  },
  statValue: {
    fontSize: 28,
    fontWeight: '900',
    color: '#3b82f6',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '600',
  },
  sourceIndicator: {
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
    alignItems: 'center',
  },
  phoneGPS: {
    backgroundColor: '#dbeafe',
  },
  externalGPS: {
    backgroundColor: '#d1fae5',
  },
  sourceText: {
    fontSize: 15,
    fontWeight: '700',
  },
  phoneGPSText: {
    color: '#1e40af',
  },
  externalGPSText: {
    color: '#059669',
  },
  deviceCard: {
    backgroundColor: '#f1f5f9',
    padding: 16,
    borderRadius: 12,
    marginTop: 10,
    borderWidth: 2,
    borderColor: '#e2e8f0',
  },
  deviceName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 4,
  },
  deviceId: {
    fontSize: 12,
    color: '#94a3b8',
  },
  connectedCard: {
    backgroundColor: '#d1fae5',
    padding: 14,
    borderRadius: 12,
    marginBottom: 12,
  },
  connectedText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#059669',
    marginBottom: 4,
  },
  satelliteText: {
    fontSize: 13,
    color: '#047857',
  },
  gpsDataCard: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 2,
    borderTopColor: '#e2e8f0',
  },
  dataGrid: {
    gap: 10,
  },
  dataRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  dataLabel: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '600',
  },
  dataValue: {
    fontSize: 16,
    color: '#1e293b',
    fontWeight: '800',
  },
  waitingText: {
    fontSize: 14,
    color: '#94a3b8',
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: 20,
  },
  warningText: {
    fontSize: 14,
    color: '#f59e0b',
    fontWeight: '600',
    textAlign: 'center',
  },
  hintText: {
    fontSize: 12,
    color: '#94a3b8',
    textAlign: 'center',
    marginTop: 4,
  },
  warningCard: {
    backgroundColor: '#fef3c7',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#fde047',
  },
  windDataCard: {
    marginTop: 16,
    gap: 12,
  },
  windDataRow: {
    flexDirection: 'row',
    gap: 12,
  },
  windDataBox: {
    flex: 1,
    backgroundColor: '#f0f9ff',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#bae6fd',
  },
  windLabel: {
    fontSize: 12,
    color: '#0369a1',
    fontWeight: '700',
    marginBottom: 6,
  },
  windValue: {
    fontSize: 26,
    color: '#0c4a6e',
    fontWeight: '900',
    marginBottom: 2,
  },
  windUnit: {
    fontSize: 11,
    color: '#075985',
    fontWeight: '500',
  },
  backendCard: {
    backgroundColor: '#f8fafc',
    padding: 14,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e2e8f0',
  },
  backendLabel: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '600',
    marginBottom: 6,
  },
  backendUrl: {
    fontSize: 13,
    color: '#475569',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    marginBottom: 12,
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10b981',
    marginRight: 8,
  },
  statusLabel: {
    fontSize: 13,
    color: '#059669',
    fontWeight: '700',
  },
  permissionBadge: {
    padding: 12,
    borderRadius: 10,
    marginBottom: 12,
    borderWidth: 2,
  },
  permissionGranted: {
    backgroundColor: '#d1fae5',
    borderColor: '#10b981',
  },
  permissionWarning: {
    backgroundColor: '#fef3c7',
    borderColor: '#f59e0b',
  },
  permissionDenied: {
    backgroundColor: '#fee2e2',
    borderColor: '#ef4444',
  },
  permissionText: {
    fontSize: 13,
    fontWeight: '700',
    textAlign: 'center',
  },
  gpsStatusBadge: {
    padding: 10,
    borderRadius: 10,
    marginBottom: 12,
    borderWidth: 2,
  },
  gpsLocked: {
    backgroundColor: '#d1fae5',
    borderColor: '#10b981',
  },
  gpsAcquiring: {
    backgroundColor: '#dbeafe',
    borderColor: '#3b82f6',
  },
  gpsError: {
    backgroundColor: '#fee2e2',
    borderColor: '#ef4444',
  },
  gpsStatusText: {
    fontSize: 13,
    fontWeight: '700',
    textAlign: 'center',
  },
});
