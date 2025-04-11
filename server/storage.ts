import { 
  users, type User, type InsertUser,
  emergencyContacts, type EmergencyContact, type InsertEmergencyContact,
  incidents, type Incident, type InsertIncident,
  systemStatus, type SystemStatus, type InsertSystemStatus,
  SeverityType, IncidentStatusType
} from "@shared/schema";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Emergency contacts operations
  getEmergencyContacts(): Promise<EmergencyContact[]>;
  getEmergencyContact(id: number): Promise<EmergencyContact | undefined>;
  createEmergencyContact(contact: InsertEmergencyContact): Promise<EmergencyContact>;
  
  // Incident operations
  getIncidents(): Promise<Incident[]>;
  getActiveIncidents(): Promise<Incident[]>;
  getIncident(id: number): Promise<Incident | undefined>;
  getIncidentByIncidentId(incidentId: string): Promise<Incident | undefined>;
  createIncident(incident: InsertIncident): Promise<Incident>;
  updateIncidentStatus(id: number, status: string): Promise<Incident | undefined>;
  
  // System status operations
  getSystemStatuses(): Promise<SystemStatus[]>;
  updateSystemStatus(id: number, status: Partial<InsertSystemStatus>): Promise<SystemStatus | undefined>;
  createSystemStatus(status: InsertSystemStatus): Promise<SystemStatus>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private emergencyContacts: Map<number, EmergencyContact>;
  private incidents: Map<number, Incident>;
  private systemStatuses: Map<number, SystemStatus>;
  
  private userCurrentId: number;
  private contactCurrentId: number;
  private incidentCurrentId: number;
  private statusCurrentId: number;

  constructor() {
    this.users = new Map();
    this.emergencyContacts = new Map();
    this.incidents = new Map();
    this.systemStatuses = new Map();
    
    this.userCurrentId = 1;
    this.contactCurrentId = 1;
    this.incidentCurrentId = 1;
    this.statusCurrentId = 1;
    
    this.initDefaultData();
  }
  
  private initDefaultData() {
    // Create default admin user
    this.createUser({
      username: 'admin',
      password: 'admin123',
      isAdmin: true,
    });
    
    // Create default emergency contacts
    const contacts = [
      {
        name: 'City Hospital',
        department: 'Emergency Ward',
        phoneNumber: '+1800555000',
        buttonColor: 'bg-green-500',
      },
      {
        name: 'Police Department',
        department: 'Central Station',
        phoneNumber: '+1800555111',
        buttonColor: 'bg-blue-500',
      },
      {
        name: 'Fire Department',
        department: 'Main Station',
        phoneNumber: '+1800555222',
        buttonColor: 'bg-red-500',
      },
      {
        name: 'Ambulance Service',
        department: 'Emergency Medical',
        phoneNumber: '+1800555333',
        buttonColor: 'bg-green-500',
      },
    ];
    
    contacts.forEach(contact => this.createEmergencyContact(contact));
    
    // Create default system statuses
    const systemStatuses = [
      {
        name: 'Cameras Online',
        status: 'Operational',
        value: 8,
        percentage: 100,
      },
      {
        name: 'Sensors Online',
        status: 'Operational',
        value: 24,
        percentage: 96,
      },
      {
        name: 'Server Load',
        status: 'Normal',
        value: 42,
        percentage: 42,
      },
      {
        name: 'Network Latency',
        status: 'Low',
        value: 28,
        percentage: 15,
      },
    ];
    
    systemStatuses.forEach(status => this.createSystemStatus(status));
    
    // Create sample incidents
    const incidents = [
      {
        incidentId: 'INC-2023-0024',
        title: 'Vehicle Collision',
        description: 'Two-vehicle collision at intersection. Airbag deployment detected.',
        severity: SeverityType.HIGH,
        source: 'Camera Feed #3',
        location: 'Main St & 5th Avenue',
        coordinates: '34.0522° N, 118.2437° W',
        estimatedTime: '7 minutes',
        nearestHospital: 'City Hospital (2.3 miles)',
        optimizedRoute: 'Take Main St northbound. Turn right on 3rd Ave. Continue for 1.2 miles to the accident site on the right side.',
        status: IncidentStatusType.ACTIVE,
        hasSnapshot: true,
        snapshotUrl: '',
        detectedAt: new Date(Date.now() - 4 * 60 * 1000), // 4 minutes ago
      },
      {
        incidentId: 'INC-' + Date.now(),
        title: 'Motorcycle Accident',
        description: 'Single motorcycle accident, possible injuries.',
        severity: 'medium', // Assuming you want to keep it string-based for frontend
        source: 'Sensor Array #12',
        location: 'Park Road, near Central Park',
        coordinates: '34.0550° N, 118.2500° W',
        estimatedTime: '4 minutes',
        nearestHospital: 'Memorial Hospital (1.5 miles)',
        optimizedRoute: 'Head east on Oak St. Turn left onto Park Road. Continue for 0.8 miles. Accident site will be visible on the left near the park entrance.',
        status: 'active',
        hasSnapshot: false,
        snapshotUrl: '',
        detectedAt: new Date(Date.now() - 2 * 60 * 1000), // 2 minutes ago
        createdAt: new Date(),
      },
    ];
    
    incidents.forEach(incident => this.createIncident(incident));
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userCurrentId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
  
  // Emergency contacts operations
  async getEmergencyContacts(): Promise<EmergencyContact[]> {
    return Array.from(this.emergencyContacts.values());
  }
  
  async getEmergencyContact(id: number): Promise<EmergencyContact | undefined> {
    return this.emergencyContacts.get(id);
  }
  
  async createEmergencyContact(contact: InsertEmergencyContact): Promise<EmergencyContact> {
    const id = this.contactCurrentId++;
    const newContact: EmergencyContact = { ...contact, id };
    this.emergencyContacts.set(id, newContact);
    return newContact;
  }
  
  // Incident operations
  async getIncidents(): Promise<Incident[]> {
    return Array.from(this.incidents.values());
  }
  
  async getActiveIncidents(): Promise<Incident[]> {
    return Array.from(this.incidents.values()).filter(
      incident => incident.status === IncidentStatusType.ACTIVE
    );
  }
  
  async getIncident(id: number): Promise<Incident | undefined> {
    return this.incidents.get(id);
  }
  
  async getIncidentByIncidentId(incidentId: string): Promise<Incident | undefined> {
    return Array.from(this.incidents.values()).find(
      incident => incident.incidentId === incidentId
    );
  }
  
  async createIncident(incident: InsertIncident): Promise<Incident> {
    const id = this.incidentCurrentId++;
    const newIncident: Incident = { 
      ...incident, 
      id,
      createdAt: new Date()
    };
    this.incidents.set(id, newIncident);
    return newIncident;
  }
  
  async updateIncidentStatus(id: number, status: string): Promise<Incident | undefined> {
    const incident = this.incidents.get(id);
    if (!incident) return undefined;
    
    const updatedIncident: Incident = {
      ...incident,
      status
    };
    
    this.incidents.set(id, updatedIncident);
    return updatedIncident;
  }
  
  // System status operations
  async getSystemStatuses(): Promise<SystemStatus[]> {
    return Array.from(this.systemStatuses.values());
  }
  
  async updateSystemStatus(id: number, status: Partial<InsertSystemStatus>): Promise<SystemStatus | undefined> {
    const currentStatus = this.systemStatuses.get(id);
    if (!currentStatus) return undefined;
    
    const updatedStatus: SystemStatus = {
      ...currentStatus,
      ...status,
      lastUpdated: new Date()
    };
    
    this.systemStatuses.set(id, updatedStatus);
    return updatedStatus;
  }
  
  async createSystemStatus(status: InsertSystemStatus): Promise<SystemStatus> {
    const id = this.statusCurrentId++;
    const newStatus: SystemStatus = {
      ...status,
      id,
      lastUpdated: new Date()
    };
    this.systemStatuses.set(id, newStatus);
    return newStatus;
  }
}

export const storage = new MemStorage();
