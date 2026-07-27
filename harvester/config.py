import os
from typing import List, Dict, Any

# ==============================================================================
# GEOGRAPHICALLY DISTRIBUTED INDIAN METRO PINCODE MATRIX
# ==============================================================================
METRO_PINCODES: List[Dict[str, Any]] = [
    {"city": "Delhi NCR (Connaught Place)", "pincode": "110001", "lat": 28.6315, "lng": 77.2167},
    {"city": "Delhi NCR (Gurugram Sec 56)", "pincode": "122011", "lat": 28.4322, "lng": 77.1025},
    {"city": "Delhi NCR (Noida Sec 62)", "pincode": "201309", "lat": 28.6280, "lng": 77.3649},
    {"city": "Mumbai (Bandra West)", "pincode": "400050", "lat": 19.0600, "lng": 72.8339},
    {"city": "Mumbai (Andheri East)", "pincode": "400069", "lat": 19.1197, "lng": 72.8464},
    {"city": "Bengaluru (Indiranagar)", "pincode": "560038", "lat": 12.9784, "lng": 77.6408},
    {"city": "Bengaluru (HSR Layout)", "pincode": "560102", "lat": 12.9121, "lng": 77.6446},
    {"city": "Hyderabad (Jubilee Hills)", "pincode": "500033", "lat": 17.4319, "lng": 78.4073},
    {"city": "Chennai (T. Nagar)", "pincode": "600017", "lat": 13.0418, "lng": 80.2341},
    {"city": "Kolkata (Park Street)", "pincode": "700016", "lat": 22.5532, "lng": 88.3524},
    {"city": "Pune (Koregaon Park)", "pincode": "411001", "lat": 18.5362, "lng": 73.8940},
    {"city": "Ahmedabad (Navrangpura)", "pincode": "380009", "lat": 23.0368, "lng": 72.5615},
]

# ==============================================================================
# EXHAUSTIVE CATEGORY SEED DICTIONARY FOR HIGH SKU EXTRACTION
# ==============================================================================
SEARCH_DICTIONARY: List[str] = [
    # Dairy & Breakfast
    "milk", "toned milk", "full cream milk", "cow milk", "buffalo milk", "curd", "dahi", 
    "paneer", "butter", "cheese", "amul butter", "mother dairy", "cream", "ghee", "cow ghee",
    "bread", "white bread", "brown bread", "multigrain bread", "eggs", "brown eggs", "oats",
    "cornflakes", "muesli", "peanut butter", "jam", "honey", "poha", "upma",

    # Fresh Produce (Fruits & Vegetables)
    "potato", "onion", "tomato", "ginger", "garlic", "green chilli", "coriander", "mint",
    "lemon", "apple", "banana", "orange", "pomegranate", "papaya", "kiwi", "dragon fruit",
    "spinach", "palak", "cauliflower", "cabbage", "capsicum", "cucumber", "carrot", "beetroot",

    # Staples & Atta, Rice, Dal
    "atta", "fortune atta", "aashirvaad atta", "rice", "basmati rice", "toor dal", "moong dal",
    "chana dal", "urad dal", "rajma", "chole", "kabuli chana", "sugar", "jaggery", "salt",
    "tata salt", "mustard oil", "sunflower oil", "refined oil", "groundnut oil", "olive oil",

    # Snacks & Munchies
    "chips", "lays", "kurkure", "bingo", "doritos", "nachos", "namkeen", "haldiram", "bikano",
    "popcorn", "biscuits", "good day", "hide and seek", "bourbon", "parle g", "marie gold",
    "rusk", "munch", "kitkat", "cadbury", "dairy milk", "5 star", "snickers", "ferrero rocher",

    # Beverages & Drinks
    "tea", "red label tea", "tata tea", "tazo", "coffee", "nescafe", "bru coffee", "coke",
    "thums up", "sprite", "pepsi", "7up", "fanta", "limca", "maaza", "frooti", "real juice",
    "tropicana", "red bull", "monster energy", "soda", "kinley", "bisleri", "coconut water",

    # Personal Care & Hygiene
    "soap", "dettol", "lifebuoy", "dove", "pears", "lux", "shampoo", "clinic plus", "sunsilk",
    "head and shoulders", "pantene", "conditioner", "face wash", "himalaya", "garnier",
    "toothpaste", "colgate", "sensodyne", "pepsodent", "toothbrush", "handwash", "sanitizer",

    # Household & Cleaning
    "surf excel", "ariel", "tide", "rin", "fabric softener", "comfort", "vim bar", "vim gel",
    "pril", "harpic", "lizol", "colin", "good knight", "all out", "garbage bags", "tissue paper",

    # Instant Food & Noodles
    "maggi", "yippee", "top ramen", "knorr soup", "pasta", "hakka noodles", "oats noodles",
    "ready to eat", "mtr", "haldiram ready to eat", "ketchup", "kissan ketchup", "mayonnaise",

    # Pharmacy & Baby Care
    "diapers", "pampers", "huggies", "baby wipes", "johnson baby", "cerelac", "sanitary pads",
    "stayfree", "whisper", "shaving cream", "gillette", "razor", "band aid", "ors", "crocin"
]

# ==============================================================================
# ENGINE CONFIGURATION
# ==============================================================================
REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379/0")
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:postgres@localhost:5432/pricepulse")
MAX_CONCURRENT_REQUESTS = 25
HTTP_TIMEOUT_SECONDS = 15.0
USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36"
