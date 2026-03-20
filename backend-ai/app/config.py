import os
from dotenv import load_dotenv
from pydantic_settings import BaseSettings

# Load .env from backend folder to share credentials
current_dir = os.path.dirname(os.path.abspath(__file__))
dotenv_path = os.path.join(os.path.dirname(current_dir), '..', 'backend', '.env')
load_dotenv(dotenv_path)

# Load local .env from backend-ai for OpenRouter configs
local_env = os.path.join(os.path.dirname(current_dir), '.env')
load_dotenv(local_env, override=True)

class Settings(BaseSettings):
    DB_HOST: str = os.getenv("DB_HOST", "localhost")
    DB_USER: str = os.getenv("DB_USER", "postgres")
    DB_PASSWORD: str = os.getenv("DB_PASSWORD", "")
    DB_NAME: str = os.getenv("DB_NAME", "E-Web")
    DB_PORT: str = os.getenv("DB_PORT", "5432")
    OPENROUTER_API_KEY: str = os.getenv("OPENROUTER_API_KEY", "")
    OPENROUTER_MODEL: str = os.getenv("OPENROUTER_MODEL", "google/gemini-2.0-pro:free")
    FRONTEND_BASE_URL: str = os.getenv("FRONTEND_BASE_URL", "http://localhost:5173")

settings = Settings()
print(f"Loaded config for Database: {settings.DB_NAME} on {settings.DB_HOST}")
print(f"Using OpenRouter Model: {settings.OPENROUTER_MODEL}")
