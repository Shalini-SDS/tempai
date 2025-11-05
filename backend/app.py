import os
import hashlib
from datetime import datetime
from typing import List, Optional
from bson import ObjectId
from bson.errors import InvalidId
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, EmailStr, Field

mongodb_uri = os.getenv("MONGODB_URI")
if not mongodb_uri:
    raise RuntimeError("MONGODB_URI environment variable is not set")
mongo_client = AsyncIOMotorClient(mongodb_uri)
database = mongo_client["tempai"]
users_collection = database["users"]
records_collection = database["records"]

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class UserProfile(BaseModel):
    name: Optional[str] = None
    age: Optional[int] = Field(default=None, ge=0, le=120)
    gender: Optional[str] = None
    metadata: Optional[dict] = None


class LoginRequest(BaseModel):
    email: EmailStr
    password: str
    profile: Optional[UserProfile] = None


class LoginResponse(BaseModel):
    userId: str
    email: EmailStr
    profile: Optional[UserProfile] = None


class RecordPayload(BaseModel):
    symptoms: List[str] = Field(default_factory=list)
    temperature: Optional[float] = None
    notes: Optional[str] = None


class RecordResponse(RecordPayload):
    id: str
    userId: str
    createdAt: datetime
    updatedAt: datetime


class AIRequest(BaseModel):
    symptoms: List[str] = Field(default_factory=list)
    temperature: Optional[float] = None
    notes: Optional[str] = None


class AIResponse(BaseModel):
    summary: str
    recommendations: List[str]


def hash_password(value: str) -> str:
    return hashlib.sha256(value.encode("utf-8")).hexdigest()


def serialize_user(document: dict) -> dict:
    profile = document.get("profile") or None
    return {
        "userId": str(document["_id"]),
        "email": document["email"],
        "profile": profile,
    }


def serialize_record(document: dict) -> dict:
    return {
        "id": str(document["_id"]),
        "userId": str(document["userId"]),
        "symptoms": document.get("symptoms", []),
        "temperature": document.get("temperature"),
        "notes": document.get("notes"),
        "createdAt": document.get("createdAt"),
        "updatedAt": document.get("updatedAt"),
    }


@app.on_event("shutdown")
async def shutdown_client() -> None:
    mongo_client.close()


@app.post("/auth/login", response_model=LoginResponse)
async def login(request: LoginRequest) -> LoginResponse:
    password_hash = hash_password(request.password)
    existing = await users_collection.find_one({"email": request.email})
    if existing:
        if existing.get("passwordHash") != password_hash:
            raise HTTPException(status_code=401, detail="Invalid credentials")
        update_data = {}
        if request.profile is not None:
            update_data["profile"] = request.profile.dict(exclude_none=True)
        if update_data:
            update_data["updatedAt"] = datetime.utcnow()
            await users_collection.update_one({"_id": existing["_id"]}, {"$set": update_data})
            existing.update(update_data)
        return LoginResponse(**serialize_user(existing))
    payload = {
        "email": request.email,
        "passwordHash": password_hash,
        "profile": request.profile.dict(exclude_none=True) if request.profile else {},
        "createdAt": datetime.utcnow(),
        "updatedAt": datetime.utcnow(),
    }
    result = await users_collection.insert_one(payload)
    payload["_id"] = result.inserted_id
    return LoginResponse(**serialize_user(payload))


@app.get("/users/{user_id}", response_model=LoginResponse)
async def get_user(user_id: str) -> LoginResponse:
    try:
        object_id = ObjectId(user_id)
    except InvalidId as error:
        raise HTTPException(status_code=400, detail="Invalid user id") from error
    document = await users_collection.find_one({"_id": object_id})
    if not document:
        raise HTTPException(status_code=404, detail="User not found")
    return LoginResponse(**serialize_user(document))


@app.post("/users/{user_id}/records", response_model=RecordResponse)
async def create_record(user_id: str, payload: RecordPayload) -> RecordResponse:
    try:
        object_id = ObjectId(user_id)
    except InvalidId as error:
        raise HTTPException(status_code=400, detail="Invalid user id") from error
    user = await users_collection.find_one({"_id": object_id})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    now = datetime.utcnow()
    record = {
        "userId": object_id,
        "symptoms": payload.symptoms,
        "temperature": payload.temperature,
        "notes": payload.notes,
        "createdAt": now,
        "updatedAt": now,
    }
    result = await records_collection.insert_one(record)
    record["_id"] = result.inserted_id
    return RecordResponse(**serialize_record(record))


@app.get("/users/{user_id}/records", response_model=List[RecordResponse])
async def list_records(user_id: str) -> List[RecordResponse]:
    try:
        object_id = ObjectId(user_id)
    except InvalidId as error:
        raise HTTPException(status_code=400, detail="Invalid user id") from error
    cursor = records_collection.find({"userId": object_id}).sort("createdAt", -1)
    records = []
    async for document in cursor:
        records.append(RecordResponse(**serialize_record(document)))
    return records


@app.post("/ai/insights", response_model=AIResponse)
async def ai_insights(request: AIRequest) -> AIResponse:
    temperature = request.temperature
    if temperature is None:
        status = "No temperature data provided"
    elif temperature >= 39:
        status = "High fever detected"
    elif temperature >= 37.5:
        status = "Moderate fever detected"
    else:
        status = "Temperature within normal range"
    symptom_text = ", ".join(request.symptoms) if request.symptoms else "no reported symptoms"
    summary = f"Analysis indicates {status.lower()} with {symptom_text}."
    recommendations: List[str] = []
    if temperature is not None and temperature >= 38:
        recommendations.append("Increase hydration and rest.")
    else:
        recommendations.append("Maintain balanced nutrition and monitor vitals.")
    if request.symptoms:
        recommendations.append("Track symptom progression every 6 hours.")
    else:
        recommendations.append("Log new symptoms if they appear.")
    recommendations.append("Consult a medical professional if conditions worsen.")
    if request.notes:
        recommendations.append("Review clinician notes for context.")
    return AIResponse(summary=summary, recommendations=recommendations)
