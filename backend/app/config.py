from pydantic_settings import BaseSettings
from typing import Optional
from functools import lru_cache


class Settings(BaseSettings):
    """Application settings loaded from environment variables"""
    
    # Server
    host: str = "0.0.0.0"
    port: int = 8000
    debug: bool = True
    environment: str = "development"
    
    # MongoDB
    mongodb_uri: str = "mongodb://localhost:27017/civic_connect"
    database_name: str = "civic_connect"
    
    # JWT
    jwt_secret_key: str = "your-super-secret-key-change-this-in-production"
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 30
    refresh_token_expire_days: int = 7
    
    # Admin Passkeys
    super_admin_passkey: str = "ykls_764"
    department_passkey_public_works: str = "ljn_9871"
    department_passkey_health: str = "ljn_9872"
    department_passkey_education: str = "ljn_9873"
    department_passkey_environment: str = "ljn_9874"
    department_passkey_transport: str = "ljn_9875"
    department_passkey_water_supply: str = "ljn_9876"
    department_passkey_electricity: str = "ljn_9877"
    department_passkey_housing: str = "ljn_9878"
    
    # Gemini AI
    gemini_api_key: Optional[str] = None
    
    # File Upload
    max_file_size_mb: int = 5
    upload_dir: str = "uploads"
    
    # Frontend URL for CORS
    frontend_url: str = "http://localhost:3000"
    
    # CORS Origins
    @property
    def cors_origins(self) -> list:
        """Returns list of allowed CORS origins"""
        origins = [self.frontend_url, "http://localhost:5173", "http://127.0.0.1:3000", "http://127.0.0.1:5173"]
        return origins
    
    # Email (optional)
    sendgrid_api_key: Optional[str] = None
    from_email: Optional[str] = None
    
    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = False

    def get_department_passkeys(self) -> dict:
        """Returns a dictionary of department names to their passkeys"""
        return {
            "Public Works": self.department_passkey_public_works,
            "Health": self.department_passkey_health,
            "Education": self.department_passkey_education,
            "Environment": self.department_passkey_environment,
            "Transport": self.department_passkey_transport,
            "Water Supply": self.department_passkey_water_supply,
            "Electricity": self.department_passkey_electricity,
            "Housing": self.department_passkey_housing,
        }


@lru_cache()
def get_settings() -> Settings:
    """Cached settings instance"""
    return Settings()
