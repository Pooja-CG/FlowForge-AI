import os
import json
from datetime import datetime
from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from google import genai
from google.genai import types
from pymongo import MongoClient

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Allows all local requests to connect seamlessly
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Connect to local MongoDB
try:
    mongo_client = MongoClient("mongodb://127.0.0.1:27017/", serverSelectionTimeoutMS=2000)
    mongo_client.server_info() # Force connection test
    print("✅ MongoDB Connected Successfully!")
except Exception as e:
    print(f"❌ MongoDB Connection Failed: {e}")

db = mongo_client["FlowForge"]
projects_col = db["projects"]
tasks_col = db["tasks"]
agent_logs_col = db["agent_logs"]

API_KEY = "AIzaSyBgz1lYQ5nTUoK3Jgt2QN7nq_n7Q_LrsqU"
client = genai.Client(api_key=API_KEY)

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