from flask import Flask, jsonify, request
import os
from pymongo import MongoClient
from pymongo.errors import ConnectionFailure, OperationFailure
from bson import ObjectId
from flask_cors import CORS
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)

CORS(app, resources={r"/api/*": {"origin":"http://localhost:3000"}})

MONGO_URI = os.getenv("MONGO_URI")
DB_NAME = "notes_db"
COLLECTION_NAME = "notes"

try:
    client = MongoClient(MONGO_URI)
    
    client.admin.command('ping')
    print("Successfullly connected to MongoDB!")
    db = client[DB_NAME]
    notes_collection = db[COLLECTION_NAME]
    
except ConnectionFailure:
    print("Failed to connect to MongoDB. Chack Mongo_URI and network access.")
    
    client = None
    db = None 
    notes_collection = None
except Exception as e:
    print(f"An error occured during MongoDB initialization: {e}")
    client = None
    db = None
    notes_collection = None
    
def serialize_doc(doc):
    """Converts a MongoDB document to JSON serializable dict."""
    if doc and '_id' in doc:
        doc['_id'] = str(doc['id'])
    return doc

#define routes

@app.route('/')
def home():
    return "Flask Backend for Notes App is running!"

@app.route('/api/notes', methods=['POST'])
def create_note():
    if not notes_collection:
        return jsonify({"error": "Database not connected"}), 500
    