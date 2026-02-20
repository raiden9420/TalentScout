import re

def validate_email(email: str) -> bool:
    pattern = r"^[\w\.-]+@[\w\.-]+\.\w+$"
    return re.match(pattern, email) is not None

def validate_phone(phone: str) -> bool:
    pattern = r"^\+?[\d\s-]{10,}$"
    return re.match(pattern, phone) is not None
