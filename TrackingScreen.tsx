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

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://127.0.0.1:8000';
const LOCATION_TASK_NAME = 'background-location-task';
const BATCH_SIZE = 10; // Send telemetry every 10 points
const BATCH_INTERVAL = 5000; // Or every 5 seconds

export default function TrackingScreen() {
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
      // Location permissions
      const { status: locationStatus } = await Location.requestForegroundPermissionsAsync();
      if (locationStatus !== 'granted') {
        Alert.alert('Permission Denied', 'Location permission is required');
        return;
      }

      const { status: backgroundStatus } = await Location.requestBackgroundPermissionsAsync();
      if (backgroundStatus !== 'granted') {
        Alert.alert('Permission Denied', 'Background location permission is required');
      }

      // Bluetooth permissions for Android 12+
      if (Platform.OS === 'android' && Platform.Version >= 31) {
        const granted = await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        ]);

        if (Object.values(granted).some(v => v !== 'granted')) {
          Alert.alert('Permission Denied', 'Bluetooth permissions are required');
        }
      }
    } catch (error) {
      console.error('Permission error:', error);
    }
  };

  // Start a new session
  const startSession = async () => {
    try {
      const sessionData: SessionCreate = {
        user_id: 1, // Default user for MVP
        boat_id: 1, // Default boat for MVP
        title: `Session ${new Date().toLocaleString()}`,
        start_ts: new Date().toISOString(),
      };

      console.log('=== CREATING SESSION ===');
      console.log('Session data:', sessionData);
      console.log('API URL:', `${API_URL}/sessions`);

      const response = await fetch(`${API_URL}/sessions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sessionData),
      });

      console.log('Create session response status:', response.status);

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
      await startLocationTracking();

      // Start periodic flush
      intervalRef.current = setInterval(() => {
        flushTelemetry();
      }, BATCH_INTERVAL);

      Alert.alert('Success', `Session ${data.id} started!\n\nCheck dashboard for this session ID.`);
      console.log('=== SESSION STARTED ===');
    } catch (error) {
      console.error('Start session error:', error);
      Alert.alert('Error', 'Failed to start session');
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
      await Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, {
        accuracy: Location.Accuracy.BestForNavigation,
        distanceInterval: 1, // Update every 1 meter
        timeInterval: 1000, // Or every 1 second
        foregroundService: {
          notificationTitle: 'RacePilot',
          notificationBody: 'Tracking your sailing session',
        },
      });
    } catch (error) {
      console.error('Location tracking error:', error);
      Alert.alert('Error', 'Failed to start location tracking');
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
        setLocation(newLocation);

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

    if (buffer.length === 0 || !currentSessionId) {
      console.log('Skip flush - buffer empty or no session:', { bufferSize: buffer.length, sessionId: currentSessionId });
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
        headers: { 'Content-Type': 'application/json' },
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
      <View style={styles.header}>
        <Text style={styles.title}>RacePilot Mobile</Text>
      </View>

      {/* Session Control */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Session</Text>
        {!isTracking ? (
          <Button title="Start Session" onPress={startSession} color="#4CAF50" />
        ) : (
          <View>
            <Text style={styles.info}>Session ID: {sessionId}</Text>
            <Button title="Stop Session" onPress={stopSession} color="#F44336" />
          </View>
        )}
      </View>

      {/* Telemetry Stats */}
      {isTracking && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Telemetry Stats</Text>
          <Text style={styles.info}>Points Sent: {stats.pointsSent}</Text>
          <Text style={styles.info}>Batches Sent: {stats.batchesSent}</Text>
          <Text style={styles.info}>Buffer: {telemetryBuffer.length} points</Text>
        </View>
      )}

      {/* GPS Status */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>GPS</Text>

        {/* GPS Source Indicator */}
        <View style={{flexDirection: 'row', marginBottom: 10, backgroundColor: useExternalGPS ? '#E8F5E9' : '#E3F2FD', padding: 8, borderRadius: 5}}>
          <Text style={{fontWeight: 'bold', color: useExternalGPS ? '#2E7D32' : '#1976D2'}}>
            Source: {useExternalGPS ? '📡 Garmin Glo 2' : '📱 Phone GPS'}
          </Text>
        </View>

        {/* Garmin GPS Connection */}
        {!bleManager ? (
          <Text style={styles.info}>Bluetooth requires native build for external GPS</Text>
        ) : !garminDevice ? (
          <View>
            <Button
              title={isScanning ? 'Scanning...' : 'Scan for Garmin Glo 2'}
              onPress={scanForDevices}
              disabled={isScanning}
              color="#4CAF50"
            />
            {gpsDevices.map(device => (
              <TouchableOpacity
                key={device.id}
                style={styles.deviceItem}
                onPress={() => connectToGarminGPS(device)}
              >
                <Text style={styles.deviceName}>📡 {device.name || 'Unknown'}</Text>
                <Text style={styles.deviceId}>{device.id}</Text>
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          <View>
            <Text style={styles.info}>✓ Connected: {garminDevice.name}</Text>
            {garminPosition && (
              <View>
                <Text style={styles.info}>Quality: GPS Fix ({garminPosition.satellites} satellites)</Text>
                {garminPosition.hdop && <Text style={styles.info}>HDOP: {garminPosition.hdop.toFixed(1)}</Text>}
              </View>
            )}
            <Button title="Disconnect Garmin" onPress={disconnectGarminGPS} color="#FF9800" />
          </View>
        )}

        {/* GPS Data */}
        <View style={{marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: '#ddd'}}>
          {useExternalGPS && garminPosition ? (
            <View>
              <Text style={styles.info}>Lat: {garminPosition.latitude.toFixed(6)}</Text>
              <Text style={styles.info}>Lon: {garminPosition.longitude.toFixed(6)}</Text>
              <Text style={styles.info}>Speed: {garminPosition.speed.toFixed(1)} knots</Text>
              <Text style={styles.info}>Heading: {garminPosition.heading.toFixed(1)}°</Text>
              {garminPosition.altitude && <Text style={styles.info}>Altitude: {garminPosition.altitude.toFixed(1)}m</Text>}
            </View>
          ) : location ? (
            <View>
              <Text style={styles.info}>Lat: {location.coords.latitude.toFixed(6)}</Text>
              <Text style={styles.info}>Lon: {location.coords.longitude.toFixed(6)}</Text>
              <Text style={styles.info}>Speed: {((location.coords.speed || 0) * 1.94384).toFixed(1)} knots</Text>
              <Text style={styles.info}>Heading: {location.coords.heading?.toFixed(1) || 'N/A'}°</Text>
            </View>
          ) : (
            <Text style={styles.info}>Waiting for GPS...</Text>
          )}
        </View>
      </View>

      {/* Bluetooth Wind Sensor */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Wind Sensor</Text>
        {!bleManager ? (
          <View>
            <Text style={styles.info}>Bluetooth requires native build</Text>
            <Text style={{...styles.info, fontSize: 12, marginTop: 5}}>
              Run: eas build --profile development
            </Text>
          </View>
        ) : !windDevice ? (
          <View>
            <Button
              title={isScanning ? 'Scanning...' : 'Scan for Wind Sensors'}
              onPress={scanForDevices}
              disabled={isScanning}
              color="#2196F3"
            />
            {windDevices.map(device => (
              <TouchableOpacity
                key={device.id}
                style={styles.deviceItem}
                onPress={() => connectToWindSensor(device)}
              >
                <Text style={styles.deviceName}>💨 {device.name || 'Unknown'}</Text>
                <Text style={styles.deviceId}>{device.id}</Text>
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          <View>
            <Text style={styles.info}>✓ Connected: {windDevice.name}</Text>
            {windData && (
              <View>
                <Text style={styles.info}>AWS: {windData.aws.toFixed(1)} knots</Text>
                <Text style={styles.info}>AWA: {windData.awa.toFixed(1)}°</Text>
                {windData.tws && <Text style={styles.info}>TWS: {windData.tws.toFixed(1)} knots</Text>}
                {windData.twa && <Text style={styles.info}>TWA: {windData.twa.toFixed(1)}°</Text>}
              </View>
            )}
            <Button title="Disconnect" onPress={disconnectWindSensor} color="#FF9800" />
          </View>
        )}
      </View>

      {/* API Status */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Backend</Text>
        <Text style={styles.info}>{API_URL}</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  header: {
    marginTop: 40,
    marginBottom: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2196F3',
  },
  section: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  info: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  deviceItem: {
    padding: 10,
    backgroundColor: '#e3f2fd',
    borderRadius: 5,
    marginTop: 10,
  },
  deviceName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1976D2',
  },
  deviceId: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
});
