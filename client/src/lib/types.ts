export interface MapLocation {
  lat: number;
  lng: number;
}

export interface EmergencyService {
  name: string;
  type: 'hospital' | 'police' | 'fire' | 'ambulance';
  phoneNumber: string;
  distance: string;
}

export interface IncidentTimeline {
  timestamp: Date;
  event: string;
  details: string;
}
