from supabase import create_client, Client
from app.config import SUPABASE_URL, SUPABASE_KEY

_supabase: Client = None

def get_supabase() -> Client:
    global _supabase
    if not _supabase:
        if not SUPABASE_URL or not SUPABASE_KEY:
            raise RuntimeError("Missing SUPABASE credentials in .env")
        _supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
    return _supabase
