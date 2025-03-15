from flask import Flask, render_template, jsonify
from flask_cors import CORS
import json
import os

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Sample apartment data - in a real app, this would come from a database
SAMPLE_APARTMENTS = [
    {
        "id": 1,
        "title": "Modern Downtown Loft",
        "price": 1800,
        "bedrooms": 1,
        "bathrooms": 1,
        "sqft": 750,
        "address": "123 Main St, Apt 4B",
        "description": "Beautiful modern loft in the heart of downtown with high ceilings and lots of natural light.",
        "images": ["apartment1_1.svg", "apartment1_2.svg", "apartment1_3.svg"],
        "amenities": ["Gym", "Pool", "Parking", "Dishwasher", "In-unit Laundry"]
    },
    {
        "id": 2,
        "title": "Spacious 2BR with Balcony",
        "price": 2200,
        "bedrooms": 2,
        "bathrooms": 2,
        "sqft": 1100,
        "address": "456 Park Ave, Apt 7C",
        "description": "Spacious 2-bedroom apartment with a large balcony overlooking the city park.",
        "images": ["apartment2_1.svg", "apartment2_2.svg", "apartment2_3.svg"],
        "amenities": ["Balcony", "Doorman", "Elevator", "Dishwasher", "In-unit Laundry"]
    },
    {
        "id": 3,
        "title": "Cozy Studio near Transit",
        "price": 1200,
        "bedrooms": 0,
        "bathrooms": 1,
        "sqft": 500,
        "address": "789 Transit St, Apt 2A",
        "description": "Cozy studio apartment just steps away from public transportation and local shops.",
        "images": ["apartment3_1.svg", "apartment3_2.svg"],
        "amenities": ["Pets Allowed", "Dishwasher", "Laundry in Building"]
    },
    {
        "id": 4,
        "title": "Luxury 3BR Penthouse",
        "price": 3500,
        "bedrooms": 3,
        "bathrooms": 2.5,
        "sqft": 1800,
        "address": "101 Luxury Lane, PH",
        "description": "Stunning penthouse with panoramic city views, gourmet kitchen, and private roof access.",
        "images": ["apartment4_1.svg", "apartment4_2.svg", "apartment4_3.svg", "apartment4_4.svg"],
        "amenities": ["Doorman", "Gym", "Pool", "Parking", "In-unit Laundry", "Concierge"]
    },
    {
        "id": 5,
        "title": "Charming 1BR in Historic Building",
        "price": 1650,
        "bedrooms": 1,
        "bathrooms": 1,
        "sqft": 650,
        "address": "222 Heritage Ave, Apt 3D",
        "description": "Charming one-bedroom in a beautifully maintained historic building with original details.",
        "images": ["apartment5_1.svg", "apartment5_2.svg"],
        "amenities": ["Elevator", "Laundry in Building", "Hardwood Floors"]
    }
]

# Save user preferences (liked and disliked apartments)
user_preferences = {
    "liked": [],
    "disliked": []
}

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/apartments', methods=['GET'])
def get_apartments():
    return jsonify(SAMPLE_APARTMENTS)

@app.route('/like/<int:apartment_id>', methods=['POST'])
def like_apartment(apartment_id):
    if apartment_id not in user_preferences["liked"]:
        user_preferences["liked"].append(apartment_id)
    return jsonify({"status": "success", "liked": user_preferences["liked"]})

@app.route('/dislike/<int:apartment_id>', methods=['POST'])
def dislike_apartment(apartment_id):
    if apartment_id not in user_preferences["disliked"]:
        user_preferences["disliked"].append(apartment_id)
    return jsonify({"status": "success", "disliked": user_preferences["disliked"]})

@app.route('/preferences', methods=['GET'])
def get_preferences():
    liked_apartments = [apt for apt in SAMPLE_APARTMENTS if apt["id"] in user_preferences["liked"]]
    return jsonify({"liked": liked_apartments, "disliked": user_preferences["disliked"]})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=54346, debug=True)