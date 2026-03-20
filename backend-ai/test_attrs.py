import asyncio
import sys
import os

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.database import get_db_connection

async def main():
    try:
        conn = await get_db_connection()
        rows = await conn.fetch("SELECT attributes FROM product_variants WHERE attributes IS NOT NULL LIMIT 3")
        print("\n=== Attributes Format in DB ===")
        for r in rows:
             print(type(r["attributes"]), r["attributes"])
        await conn.close()
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    asyncio.run(main())
