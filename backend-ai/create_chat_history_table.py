import asyncio
from app.database import get_db_connection

async def main():
    print("🚀 Connecting to database to create chat_history table...")
    conn = await get_db_connection()
    try:
        sql = """
        CREATE TABLE IF NOT EXISTS chat_history (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            session_id VARCHAR(100) NOT NULL,
            role VARCHAR(20) NOT NULL,
            content TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        CREATE INDEX IF NOT EXISTS idx_chat_history_session ON chat_history(session_id);
        """
        await conn.execute(sql)
        print("✅ Success: Table 'chat_history' and index created successfully.")
    except Exception as e:
        print(f"❌ Error creating table: {e}")
    finally:
        await conn.close()

if __name__ == "__main__":
    asyncio.run(main())
