from flask import Flask
import os
from pymongo import MongoClient
from pymongo.errors import ConnectionFailure, OperationFailure
from bson import ObjectId
from flask_cors import CORS
from dotenv import load_dotenv

load_dotenv()