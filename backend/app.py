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
    try:
        data = request.get_json()
        if not data or 'content' not in data:
            return jsonify({'error':"Missing 'content' in request body"}), 400
        
        note_content = data.get('content')
        
        new_note = {'content': note_content}
        
        result = notes_collection.insert_one(new_note)
        created_note = notes_collection.find_one({"_id": result.inserted_id})
        
        return jsonify(serialize_doc(created_note)), 201
    except OperationFailure as e:
        return jsonify({"error": "Database operation failed", "details": str(e)}), 500
    except Exception as e:
        return jsonify({"error": "An unexpected error occurred", "details": str(e)}), 500
    
@app.route('/api/notes', methods=['GET'])
def get_notes():
    if not notes_collection:
        return jsonify({"error": "Database not connected"}), 500
    
    try:
        all_notes = list(notes_collection.find({}))
        serialized_notes = [serialize_doc(note) for note in all_notes]
        return jsonify(serialize_notes), 200
    except OperationFailure as e:
        return jsonify({"error": "Database operation failed", "details": str(e)}), 500
    except Exception as e:
        return jsonify({"error":"An error occurred", "details": str(e)}), 500
    
if __name__ == '__main__':
    if not client:
        print("CRITICAL: MongoDB client not initialized. Flask app might not work correctly.")
        
    app.run(debug=os.getenv("FLASK_DEBUG", "False").lower() == "true", host="0.0.0.0", port=5000)
        
        