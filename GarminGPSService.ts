/**
 * Garmin Glo 2 GPS Service
 *
 * Handles Bluetooth connection to Garmin Glo 2 and parses NMEA 0183 sentences.
 * The Garmin Glo 2 provides:
 * - GPS + GLONASS dual constellation
 * - 10 Hz update rate (10 position updates per second)
 * - ~3 meter accuracy
 * - NMEA 0183 sentences over Bluetooth SPP (Serial Port Profile)
 */

import { Device, BleManager } from 'react-native-ble-plx';

export interface GPSPosition {
  latitude: number;
  longitude: number;
  altitude?: number;
  speed: number; // knots
  heading: number; // degrees (COG - Course Over Ground)
  timestamp: Date;
  quality: number; // 0=invalid, 1=GPS, 2=DGPS
  satellites: number;
  hdop?: number; // Horizontal Dilution of Precision
}

export class GarminGPSService {
  private device: Device | null = null;
  private nmeaBuffer: string = '';
  private onPositionCallback: ((position: GPSPosition) => void) | null = null;
  private bleManager: BleManager;

  // Garmin Glo 2 typically appears as "Garmin GLO" or similar
  static DEVICE_IDENTIFIERS = ['glo', 'garmin glo'];

  // Store latest data from different NMEA sentences
  private currentPosition: Partial<GPSPosition> = {};

  constructor(bleManager: BleManager) {
    this.bleManager = bleManager;
  }

  /**
   * Check if a device is likely a Garmin Glo 2
   */
  static isGarminGlo(device: Device): boolean {
    if (!device.name) return false;
    const name = device.name.toLowerCase();
    return GarminGPSService.DEVICE_IDENTIFIERS.some(id => name.includes(id));
  }

  /**
   * Connect to Garmin Glo 2 and start receiving GPS data
   */
  async connect(device: Device, onPosition: (position: GPSPosition) => void): Promise<void> {
    try {
      console.log('[GarminGPS] Connecting to:', device.name, device.id);

      // Connect and discover services
      this.device = await device.connect();
      await this.device.discoverAllServicesAndCharacteristics();

      this.onPositionCallback = onPosition;

      // Find services and characteristics
      const services = await this.device.services();
      console.log('[GarminGPS] Services found:', services.length);

      // The Garmin Glo 2 typically uses Serial Port Profile (SPP)
      // We need to find the characteristic that provides NMEA data
      let foundCharacteristic = false;

      for (const service of services) {
        const characteristics = await service.characteristics();

        for (const characteristic of characteristics) {
          // Look for notify/indicate characteristics (NMEA stream)
          if (characteristic.isNotifiable) {
            console.log('[GarminGPS] Found notifiable characteristic:', characteristic.uuid);

            // Start monitoring this characteristic
            characteristic.monitor((error, char) => {
              if (error) {
                console.error('[GarminGPS] Monitor error:', error);
                return;
              }
              if (char?.value) {
                this.handleBluetoothData(char.value);
              }
            });

            foundCharacteristic = true;
          }
        }
      }

      if (!foundCharacteristic) {
        throw new Error('No NMEA data characteristic found on Garmin Glo 2');
      }

      console.log('[GarminGPS] Connected and monitoring NMEA data');
    } catch (error) {
      console.error('[GarminGPS] Connection error:', error);
      throw error;
    }
  }

  /**
   * Disconnect from Garmin Glo 2
   */
  async disconnect(): Promise<void> {
    if (this.device) {
      try {
        await this.device.cancelConnection();
      } catch (error) {
        console.warn('[GarminGPS] Disconnect error:', error);
      }
      this.device = null;
      this.onPositionCallback = null;
      this.nmeaBuffer = '';
      this.currentPosition = {};
      console.log('[GarminGPS] Disconnected');
    }
  }

  /**
   * Handle incoming Bluetooth data
   */
  private handleBluetoothData(base64Data: string): void {
    try {
      // Decode base64 to string (NMEA is ASCII text)
      const decoded = atob(base64Data);
      this.nmeaBuffer += decoded;

      // NMEA sentences end with \r\n
      const lines = this.nmeaBuffer.split('\n');

      // Keep last incomplete line in buffer
      this.nmeaBuffer = lines.pop() || '';

      // Process complete sentences
      for (const line of lines) {
        const sentence = line.trim().replace('\r', '');
        if (sentence.startsWith('$')) {
          this.parseNMEASentence(sentence);
        }
      }
    } catch (error) {
      console.error('[GarminGPS] Data handling error:', error);
    }
  }

  /**
   * Parse NMEA sentence
   */
  private parseNMEASentence(sentence: string): void {
    try {
      // Verify checksum if present
      if (sentence.includes('*')) {
        if (!this.verifyChecksum(sentence)) {
          console.warn('[GarminGPS] Bad checksum:', sentence.substring(0, 20));
          return;
        }
      }

      // Remove checksum and split by comma
      const checksumIndex = sentence.indexOf('*');
      const data = checksumIndex > 0 ? sentence.substring(0, checksumIndex) : sentence;
      const parts = data.split(',');
      const type = parts[0];

      // Parse different NMEA sentence types
      switch (type) {
        case '$GPGGA': // GPS Fix Data
        case '$GNGGA': // GNSS Fix Data (GPS+GLONASS)
          this.parseGGA(parts);
          break;
        case '$GPRMC': // Recommended Minimum
        case '$GNRMC':
          this.parseRMC(parts);
          break;
        case '$GPVTG': // Velocity and Track
        case '$GNVTG':
          this.parseVTG(parts);
          break;
      }
    } catch (error) {
      console.error('[GarminGPS] Parse error:', error);
    }
  }

  /**
   * Parse GGA sentence (Fix data)
   * Example: $GPGGA,123519,4807.038,N,01131.000,E,1,08,0.9,545.4,M,46.9,M,,*47
   */
  private parseGGA(parts: string[]): void {
    if (parts.length < 10) return;

    const lat = this.parseLatitude(parts[2], parts[3]);
    const lon = this.parseLongitude(parts[4], parts[5]);
    const quality = parseInt(parts[6]) || 0;
    const satellites = parseInt(parts[7]) || 0;
    const hdop = parseFloat(parts[8]);
    const altitude = parseFloat(parts[9]);

    if (lat !== null && lon !== null) {
      this.currentPosition = {
        ...this.currentPosition,
        latitude: lat,
        longitude: lon,
        altitude: isNaN(altitude) ? undefined : altitude,
        quality,
        satellites,
        hdop: isNaN(hdop) ? undefined : hdop,
        timestamp: new Date(),
      };

      this.emitPositionIfComplete();
    }
  }

  /**
   * Parse RMC sentence (Position, speed, course)
   * Example: $GPRMC,123519,A,4807.038,N,01131.000,E,022.4,084.4,230394,003.1,W*6A
   */
  private parseRMC(parts: string[]): void {
    if (parts.length < 10) return;

    const status = parts[2]; // A=valid, V=invalid
    if (status !== 'A') return;

    const lat = this.parseLatitude(parts[3], parts[4]);
    const lon = this.parseLongitude(parts[5], parts[6]);
    const speed = parseFloat(parts[7]) || 0; // knots
    const heading = parseFloat(parts[8]) || 0; // degrees

    if (lat !== null && lon !== null) {
      this.currentPosition = {
        ...this.currentPosition,
        latitude: lat,
        longitude: lon,
        speed,
        heading,
        timestamp: new Date(),
      };

      this.emitPositionIfComplete();
    }
  }

  /**
   * Parse VTG sentence (Velocity/Track)
   * Example: $GPVTG,054.7,T,034.4,M,005.5,N,010.2,K*48
   */
  private parseVTG(parts: string[]): void {
    if (parts.length < 6) return;

    const heading = parseFloat(parts[1]) || 0;
    const speedKnots = parseFloat(parts[5]) || 0;

    this.currentPosition = {
      ...this.currentPosition,
      heading,
      speed: speedKnots,
    };

    this.emitPositionIfComplete();
  }

  /**
   * Emit position if we have minimum required data
   */
  private emitPositionIfComplete(): void {
    const pos = this.currentPosition;

    // Need at least lat, lon, speed, heading
    if (pos.latitude !== undefined &&
        pos.longitude !== undefined &&
        pos.speed !== undefined &&
        pos.heading !== undefined) {

      const position: GPSPosition = {
        latitude: pos.latitude,
        longitude: pos.longitude,
        altitude: pos.altitude,
        speed: pos.speed,
        heading: pos.heading,
        timestamp: pos.timestamp || new Date(),
        quality: pos.quality || 0,
        satellites: pos.satellites || 0,
        hdop: pos.hdop,
      };

      if (this.onPositionCallback) {
        this.onPositionCallback(position);
      }
    }
  }

  /**
   * Parse latitude from NMEA format (DDMM.MMMM)
   */
  private parseLatitude(value: string, direction: string): number | null {
    if (!value || !direction) return null;

    const degrees = parseInt(value.substring(0, 2));
    const minutes = parseFloat(value.substring(2));
    let lat = degrees + minutes / 60;

    if (direction === 'S') lat = -lat;

    return lat;
  }

  /**
   * Parse longitude from NMEA format (DDDMM.MMMM)
   */
  private parseLongitude(value: string, direction: string): number | null {
    if (!value || !direction) return null;

    const degrees = parseInt(value.substring(0, 3));
    const minutes = parseFloat(value.substring(3));
    let lon = degrees + minutes / 60;

    if (direction === 'W') lon = -lon;

    return lon;
  }

  /**
   * Verify NMEA checksum
   */
  private verifyChecksum(sentence: string): boolean {
    const checksumIndex = sentence.indexOf('*');
    if (checksumIndex === -1) return true; // No checksum

    const data = sentence.substring(1, checksumIndex); // Skip $
    const checksum = sentence.substring(checksumIndex + 1);

    let calculated = 0;
    for (let i = 0; i < data.length; i++) {
      calculated ^= data.charCodeAt(i);
    }

    const expected = calculated.toString(16).toUpperCase().padStart(2, '0');
    return expected === checksum.toUpperCase();
  }

  /**
   * Check if connected
   */
  isConnected(): boolean {
    return this.device !== null;
  }

  /**
   * Get device name
   */
  getDeviceName(): string | null {
    return this.device?.name || null;
  }
}
