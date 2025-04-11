import { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { insertUserSchema, insertIncidentSchema, IncidentStatusType } from "@shared/schema";
import fs from "fs";
import path from "path";

export async function registerRoutes(app: Express): Promise<Server> {
  // Authentication endpoints
  app.post("/api/auth/login", async (req: Request, res: Response) => {
    const validationSchema = z.object({
      username: z.string().min(1),
      password: z.string().min(1),
    });
    
    try {
      const { username, password } = validationSchema.parse(req.body);
      const user = await storage.getUserByUsername(username);
      
      if (!user || user.password !== password) {
        return res.status(401).json({ message: "Invalid username or password" });
      }
      
      return res.status(200).json({
        id: user.id,
        username: user.username,
        isAdmin: user.isAdmin,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  
  // Emergency contacts endpoints
  app.get("/api/emergency-contacts", async (_req: Request, res: Response) => {
    try {
      const contacts = await storage.getEmergencyContacts();
      return res.status(200).json(contacts);
    } catch (error) {
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // Incident endpoints
  app.get("/api/incidents", async (_req: Request, res: Response) => {
    try {
      const incidents = await storage.getIncidents();
      return res.status(200).json(incidents);
    } catch (error) {
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  
  app.get("/api/incidents/active", async (_req: Request, res: Response) => {
    try {
      const incidents = await storage.getActiveIncidents();
      return res.status(200).json(incidents);
    } catch (error) {
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/incidents/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid incident ID" });
      }
      
      const incident = await storage.getIncident(id);
      if (!incident) {
        return res.status(404).json({ message: "Incident not found" });
      }
      
      return res.status(200).json(incident);
    } catch (error) {
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  
  app.post("/api/incidents", async (req: Request, res: Response) => {
    try {
      const incidentData = insertIncidentSchema.parse(req.body);
      const incident = await storage.createIncident(incidentData);
      return res.status(201).json(incident);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  app.patch("/api/incidents/:id/status", async (req: Request, res: Response) => {
    try {
      const validationSchema = z.object({
        status: z.enum([IncidentStatusType.ACTIVE, IncidentStatusType.DISPATCHED, IncidentStatusType.RESOLVED, IncidentStatusType.CANCELED]),
      });
      
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid incident ID" });
      }
      
      const { status } = validationSchema.parse(req.body);
      const updatedIncident = await storage.updateIncidentStatus(id, status);
      
      if (!updatedIncident) {
        return res.status(404).json({ message: "Incident not found" });
      }
      
      return res.status(200).json(updatedIncident);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // Generate Report Endpoint
  app.post("/api/incidents/:id/generate-report", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid incident ID" });
      }
      
      const incident = await storage.getIncident(id);
      if (!incident) {
        return res.status(404).json({ message: "Incident not found" });
      }
      
      // Simulate report generation (you can replace this with your actual report generation logic)
      const reportContent = `Report for Incident #${incident.incidentId}\n\nDetails:\n${incident.description}\n\nLocation: ${incident.location}`;
      const reportPath = path.join(__dirname, "reports", `incident_${incident.incidentId}_report.txt`);
      
      // Write the report to a file
      fs.writeFileSync(reportPath, reportContent);
      
      // Return the URL of the generated report
      return res.status(200).json({ reportUrl: `/api/incidents/reports/${incident.incidentId}_report.txt` });
    } catch (error) {
      return res.status(500).json({ message: "Failed to generate report" });
    }
  });

  // Delete Report Endpoint
  app.delete("/api/incidents/:id/delete-report", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid incident ID" });
      }
      
      const incident = await storage.getIncident(id);
      if (!incident) {
        return res.status(404).json({ message: "Incident not found" });
      }

      const reportPath = path.join(__dirname, "reports", `incident_${incident.incidentId}_report.txt`);
      
      // Check if the report file exists
      if (fs.existsSync(reportPath)) {
        fs.unlinkSync(reportPath);  // Delete the report file
        return res.status(200).json({ message: "Report deleted successfully" });
      } else {
        return res.status(404).json({ message: "Report not found" });
      }
    } catch (error) {
      return res.status(500).json({ message: "Failed to delete report" });
    }
  });

  // System status endpoints
  app.get("/api/system-status", async (_req: Request, res: Response) => {
    try {
      const statuses = await storage.getSystemStatuses();
      return res.status(200).json(statuses);
    } catch (error) {
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
