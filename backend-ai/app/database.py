import asyncpg
from app.config import settings

async def get_db_connection():
    try:
        conn = await asyncpg.connect(
            user=settings.DB_USER,
            password=settings.DB_PASSWORD,
            database=settings.DB_NAME,
            host=settings.DB_HOST,
            port=settings.DB_PORT
        )
        return conn
    except Exception as e:
        print(f"Database connection error: {e}")
        raise e
