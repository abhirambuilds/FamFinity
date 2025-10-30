from passlib.context import CryptContext
from jose import JWTError, jwt
from datetime import datetime, timedelta
import os
from typing import Optional

# Password hashing context
# Configure bcrypt with proper truncation settings
pwd_context = CryptContext(
    schemes=["bcrypt"],
    deprecated="auto",
    bcrypt__default_rounds=12,
    bcrypt__min_rounds=10,
    bcrypt__max_rounds=15
)

# JWT settings
SECRET_KEY = os.getenv("JWT_SECRET_KEY", "your-secret-key-change-in-production")
ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("JWT_EXPIRE_MINUTES", "30"))

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password against its hash"""
    # Apply same truncation as during hashing
    # Bcrypt has a 72-byte limit, so truncate by bytes, not characters
    password_bytes = plain_password.encode('utf-8')
    if len(password_bytes) > 72:
        plain_password = password_bytes[:72].decode('utf-8', errors='ignore')
    
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    """Hash a password for storage"""
    # Bcrypt has a strict 72-byte limit
    # Ensure password is a string
    if not isinstance(password, str):
        password = str(password)
    
    # Convert to bytes to check length
    password_bytes = password.encode('utf-8')
    
    # Truncate if necessary (bcrypt limit is 72 bytes)
    if len(password_bytes) > 72:
        # Truncate to 72 bytes
        password_bytes = password_bytes[:72]
        # Remove any incomplete UTF-8 continuation bytes (0x80-0xBF)
        while password_bytes and 0x80 <= password_bytes[-1] <= 0xBF:
            password_bytes = password_bytes[:-1]
        # Decode back to string
        password = password_bytes.decode('utf-8', errors='ignore')
    
    # Final verification: ensure it's <= 72 bytes
    final_check = password.encode('utf-8')
    if len(final_check) > 72:
        # Last resort: truncate character by character
        while password and len(password.encode('utf-8')) > 72:
            password = password[:-1]
    
    # Hash the password - guaranteed to be <= 72 bytes
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    """Create a JWT access token"""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def verify_token(token: str) -> Optional[dict]:
    """Verify and decode a JWT token"""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError:
        return None
