import os
from dotenv import load_dotenv

load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY", os.getenv("SUPABASE_Service_Key"))
JWT_SECRET = os.getenv("JWT_SECRET", "supersecretkey")
ADMIN_PASSWORD = os.getenv("ADMIN_PASSWORD", "admin")
