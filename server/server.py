from fastapi import FastAPI, UploadFile, File, WebSocket, WebSocketDisconnect, APIRouter, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import tensorflow as tf
import numpy as np
import cv2
import io
from PIL import Image
from pydantic import BaseModel
from twilio.rest import Client
from dotenv import load_dotenv
import os

load_dotenv()

# Initialize FastAPI app
app = FastAPI()

# Add CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5000",  # Frontend on localhost
        "http://192.168.216.69"   # ESP32 IP address or local network frontend
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load Model Structure & Weights
with open("model/model.json", "r") as json_file:
    model_json = json_file.read()
model = tf.keras.models.model_from_json(model_json)
model.load_weights("model/model_weights.h5")

# ==================== Twilio Setup ====================
TWILIO_ACCOUNT_SID = os.getenv("TWILIO_ACCOUNT_SID")
TWILIO_AUTH_TOKEN = os.getenv("TWILIO_AUTH_TOKEN")
TWILIO_PHONE_NUMBER = os.getenv("TWILIO_PHONE_NUMBER")
EMERGENCY_NUMBER = os.getenv("EMERGENCY_NUMBER") 
client = Client(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)

# ==================== Models ====================
class DispatchRequest(BaseModel):
    incidentId: str
    location: str
    severity: str
    detectedAt: str

class IncidentRequest(BaseModel):
    incident_type: str
    acceleration: float
    latitude: str
    longitude: str
    address: str  # New field to hold the address information

# ==================== Utilities ====================
def preprocess_image(image: Image.Image):
    image = np.array(image)
    image = cv2.cvtColor(image, cv2.COLOR_RGB2BGR)
    image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
    image = cv2.resize(image, (250, 250))
    image = np.expand_dims(image, axis=0)
    return image

# ==================== WebSocket logic ====================
active_connections = []

@app.websocket("/ws/incident")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    active_connections.append(websocket)
    print("WebSocket client connected!")
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        active_connections.remove(websocket)
        print("WebSocket client disconnected!")

async def broadcast_incident(data):
    for conn in active_connections:
        await conn.send_json(data)

# ==================== API Endpoints ====================
@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    try:
        image = Image.open(io.BytesIO(await file.read()))
        processed_image = preprocess_image(image)
        prediction = model.predict(processed_image)
        accident_probability = float(prediction[0][0])
        label = "Accident" if accident_probability > 0.5 else "No Accident"
        return {
            "prediction": label,
            "accident_probability": round(accident_probability * 100, 2)
        }
    except Exception as e:
        return {"error": str(e)}

@app.post("/create-incident")
async def create_incident(incident: IncidentRequest):
    print(f"Received Incident - Type: {incident.incident_type}, "
          f"Accel: {incident.acceleration}, "
          f"Lat: {incident.latitude}, "
          f"Lon: {incident.longitude}, "
          f"Address: {incident.address}")  # Log the address received
    
    # Broadcast the received incident details (including the address) to all active WebSocket clients
    await broadcast_incident({
        "incident_type": incident.incident_type,
        "acceleration": incident.acceleration,
        "latitude": incident.latitude,
        "longitude": incident.longitude,
        "address": incident.address  # Include the address in the broadcasted data
    })
    
    return {"message": "Incident with location and address broadcasted to frontend!"}

@app.post("/dispatch-emergency")
async def dispatch_emergency(request: DispatchRequest):
    try:
        message = (
            f"🚨 Emergency Alert 🚨\n"
            f"Incident ID: {request.incidentId}\n"
            f"Location: {request.location}\n"
            f"Severity: {request.severity}\n"
            f"Time: {request.detectedAt}\n"
            f"Immediate action required!"
        )
        client.messages.create(
            body=message,
            from_=TWILIO_PHONE_NUMBER,
            to="+917020179216"  # Replace with the actual emergency number
        )
        return {"status": "SMS sent successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to send SMS: {str(e)}")

@app.get("/")
async def root():
    return {"message": "AI Road Accident Detection API Running 🚀"}
