// API Types matching backend schemas

export interface TrackPoint {
  ts: string; // ISO datetime
  lat: number;
  lon: number;
  sog: number; // speed over ground
  cog: number; // course over ground
  awa: number; // apparent wind angle
  aws: number; // apparent wind speed
  hdg: number; // heading
  tws?: number; // true wind speed
  twa?: number; // true wind angle
}

export interface TelemetryIngest {
  session_id: number;
  points: TrackPoint[];
}

export interface SessionCreate {
  user_id: number;
  boat_id: number;
  title: string;
  start_ts: string; // ISO datetime
}

export interface SessionResponse {
  id: number;
}

// Bluetooth Wind Sensor Data
export interface WindSensorData {
  aws: number; // apparent wind speed (knots)
  awa: number; // apparent wind angle (degrees)
  tws?: number; // true wind speed (knots)
  twa?: number; // true wind angle (degrees)
}
