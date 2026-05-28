import os
import json
from pathlib import Path
from datetime import datetime
import bcrypt  # Make sure to run: pip install bcrypt
from fastapi import FastAPI, Query, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr
from google import genai
from google.genai import types
from pymongo import MongoClient
from dotenv import load_dotenv

# --- DYNAMIC ENVIRONMENT LOADER ---
# This looks up your directory hierarchy to locate .env.local automatically
current_dir = Path(__file__).resolve().parent
env_path = None

# Search upward through parent directories to find your .env.local file
for parent in [current_dir, current_dir.parent, current_dir.parent.parent, current_dir.parent.parent.parent]:
    potential_path = parent / ".env.local"
    if potential_path.exists():
        env_path = potential_path
        break

if env_path:
    load_dotenv(dotenv_path=env_path)
    print(f"✅ Securely loaded environment from: {env_path}")
else:
    load_dotenv()  # Fallback to standard environment search
    print("⚠️ Could not find .env.local in parent paths, attempting system environment fallback.")

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Allows all local requests to connect seamlessly
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- LOCAL DATABASE ORCHESTRATION ---
try:
    mongo_client = MongoClient("mongodb://127.0.0.1:27017/", serverSelectionTimeoutMS=2000)
    mongo_client.server_info() # Force connection test
    print("✅ MongoDB Connected Successfully!")
except Exception as e:
    print(f"❌ MongoDB Connection Failed: {e}")

# Database Collections Routing
db = mongo_client["FlowForge"]
projects_col = db["projects"]
tasks_col = db["tasks"]
agent_logs_col = db["agent_logs"]
users_col = db["users"]  # Collection for user profiles

# Securely extract the key from your environment configuration
API_KEY = os.environ.get("NEXT_PUBLIC_GEMINI_API_KEY")

if not API_KEY:
    raise ValueError(
        "❌ CRITICAL ERROR: 'NEXT_PUBLIC_GEMINI_API_KEY' environment variable is missing. "
        "Please check your .env.local file placement and key definitions."
    )

# Initialize the Gemini client securely
client = genai.Client(api_key=API_KEY)

# --- Pydantic Schemes for API Request Validations ---
class RegisterSchema(BaseModel):
    name: str
    email: EmailStr
    password: str

sprint_schema = {
    "type": "OBJECT",
    "properties": {
        "modules": {
            "type": "ARRAY",
            "items": {
                "type": "OBJECT",
                "properties": {
                    "module": {"type": "STRING"},
                    "tasks": {
                        "type": "ARRAY",
                        "items": {
                            "type": "OBJECT",
                            "properties": {
                                "title": {"type": "STRING"},
                                "priority": {"type": "STRING"},
                                "estimatedDays": {"type": "INTEGER"}
                            },
                            "required": ["title", "priority", "estimatedDays"]
                        }
                    }
                },
                "required": ["module", "tasks"]
            }
        }
    },
    "required": ["modules"]
}

# --- USER AUTHENTICATION REGISTRATION PATH ---
@app.post("/api/auth/register")
async def register_user(user: RegisterSchema):
    try:
        # Check if user already exists inside Compass
        if users_col.find_one({"email": user.email}):
            raise HTTPException(status_code=400, detail="Email is already registered")
        
        # Hash the plain text password securely using bcrypt
        hashed_password = bcrypt.hashpw(user.password.encode('utf-8'), bcrypt.gensalt())
        
        # Build user data document block
        user_document = {
            "name": user.name,
            "email": user.email,
            "password": hashed_password.decode('utf-8'), 
            "created_at": datetime.utcnow()
        }
        
        # Write to MongoDB FlowForge users collection
        users_col.insert_one(user_document)
        print(f" Saved user record to MongoDB for: {user.email}")
        
        return {"status": "success", "message": "User profile successfully registered to MongoDB"}
        
    except HTTPException as he:
        raise he
    except Exception as e:
        print(f"❌ Registration Error: {e}")
        return {"status": "error", "message": str(e)}

# --- CORE AI AGENT GENERATION & SPRINT LOGIC ---
@app.get("/api/generate-sprint")
def generate_sprint(prompt: str = "Build a app"):
    try:
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=f"Break down this requirement into development modules and tasks: {prompt}",
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                response_schema=sprint_schema,
                temperature=0.2
            )
        )
        
        structured_json = json.loads(response.text)
        timestamp = datetime.utcnow()
        
        # SAVE TO 'projects'
        project_doc = {"prompt": prompt, "status": "planned", "created_at": timestamp}
        project_id = projects_col.insert_one(project_doc).inserted_id
        print(f" Saved project to MongoDB with ID: {project_id}")
        
        # SAVE TO 'tasks'
        if "modules" in structured_json:
            for module in structured_json["modules"]:
                module_name = module.get("module", "General")
                for task in module.get("tasks", []):
                    task_doc = {
                        "project_id": project_id,
                        "module_name": module_name,
                        "title": task.get("title"),
                        "priority": task.get("priority", "Medium"),
                        "estimated_days": task.get("estimatedDays", 1),
                        "status": "pending",
                        "created_at": timestamp
                    }
                    tasks_col.insert_one(task_doc)
            print(" Saved all generated tasks to MongoDB!")
        
        return {"status": "success", "data": structured_json}
        
    except Exception as e:
        print(f"❌ Error Generating Sprint: {e}")
        return {"status": "error", "message": str(e)}

# --- TASK EXECUTION PATH ---
@app.post("/api/execute-task")
def execute_task(task_title: str = Query(...), module_name: str = Query(...)):
    try:
        exec_response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=f"Write a comprehensive technical checklist and boilerplate skeleton code to execute this task: '{task_title}' inside the module '{module_name}'."
        )
        
        output_text = exec_response.text
        
        # SAVE TO 'agent_logs'
        log_doc = {
            "module_name": module_name,
            "task_title": task_title,
            "generated_output": output_text,
            "executed_at": datetime.utcnow(),
            "status": "success"
        }
        agent_logs_col.insert_one(log_doc)
        print(f" Saved execution log to MongoDB for task: {task_title}")
        
        return {"status": "success", "execution_plan": output_text}
    except Exception as e:
        print(f"❌ Error Executing Task: {e}")
        return {"status": "error", "message": str(e)}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)