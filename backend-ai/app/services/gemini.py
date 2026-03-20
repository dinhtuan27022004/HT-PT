import google.generativeai as genai
import json
from app.config import settings
from app.database import get_db_connection

# Configure Gemini
genai.configure(api_key=settings.GEMINI_API_KEY)

# 1. Define Tools (Pure Functions for API Reference)
async def search_products(query: str = None, category: str = None, min_price: float = None, max_price: float = None):
    """
    Tìm kiếm sản phẩm theo tên, danh mục và khoảng giá.
    Args:
        query: Từ khóa tìm kiếm (tên sản phẩm, mô tả)
        category: Tên danh mục (ví dụ: 'laptop', 'điện thoại')
        min_price: Giá tối thiểu
        max_price: Giá tối đa
    """
    print(f"Executing search_products Tool: query={query}, cat={category}, price={min_price}-{max_price}")
    conn = await get_db_connection()
    sql = """
        SELECT p.id, p.name, p.price, p.description, c.name as category_name 
        FROM products p
        JOIN categories c ON p.category_id = c.id
        WHERE 1=1
    """
    params = []
    
    if query:
        params.append(f"%{query}%")
        sql += f" AND (p.name ILIKE ${len(params)} OR p.description ILIKE ${len(params)})"
    
    if category:
        params.append(f"%{category}%")
        sql += f" AND c.name ILIKE ${len(params)}"

    if min_price is not None:
        params.append(float(min_price))
        sql += f" AND p.price >= ${len(params)}"

    if max_price is not None:
        params.append(float(max_price))
        sql += f" AND p.price <= ${len(params)}"

    sql += " LIMIT 5"
    
    try:
        rows = await conn.fetch(sql, *params)
        await conn.close()
        return [dict(r) for r in rows]
    except Exception as e:
        print(f"Error in search_products: {e}")
        await conn.close()
        return []

async def get_product_detail(product_id: int):
    """
    Lấy thông tin chi tiết cấu hình và các biến thể của 1 sản phẩm theo ID.
    Args:
        product_id: Mã ID của sản phẩm (ví dụ: 1)
    """
    print(f"Executing get_product_detail Tool: id={product_id}")
    conn = await get_db_connection()
    try:
        sql = "SELECT p.*, c.name as category_name FROM products p JOIN categories c ON p.category_id = c.id WHERE p.id = $1"
        row = await conn.fetchrow(sql, int(product_id))
        if not row:
            await conn.close()
            return None

        variants_sql = "SELECT * FROM product_variants WHERE product_id = $1"
        variants = await conn.fetch(variants_sql, int(product_id))
        await conn.close()

        result = dict(row)
        result['variants'] = [dict(v) for v in variants]
        return result
    except Exception as e:
        print(f"Error in get_product_detail: {e}")
        await conn.close()
        return None

async def compare_products(product_ids: list):
    """
    So sánh thông số của nhiều sản phẩm cùng lúc.
    Args:
        product_ids: Danh sách các ID sản phẩm cần so sánh (ví dụ: [1, 2, 3])
    """
    print(f"Executing compare_products Tool: {product_ids}")
    if not product_ids:
        return []
    conn = await get_db_connection()
    try:
        sql = "SELECT p.*, c.name as category_name FROM products p JOIN categories c ON p.category_id = c.id WHERE p.id = ANY($1)"
        rows = await conn.fetch(sql, [int(id) for id in product_ids])
        await conn.close()
        return [dict(r) for r in rows]
    except Exception as e:
        print(f"Error in compare_products: {e}")
        await conn.close()
        return []

# 2. Setup System Instructions
system_instruction = """
Bạn là một trợ lý bán hàng (Chatbot) thông minh cho website bán đồ điện tử.
Mục tiêu của bạn:
- Tìm kiếm sản phẩm (laptop, điện thoại, phụ kiện,...)
- Tư vấn mã hàng dựa trên nhu cầu
- So sánh các sản phẩm và trả lời câu hỏi kỹ thuật

Quy tắc làm việc:
1. LUÔN LUÔN dùng Tool khi người dùng hỏi về thông tin hàng hóa. KHÔNG ĐƯỢC tự bịa số liệu hay cấu hình.
2. Nếu hỏi mơ hồ -> Hỏi làm rõ nhu cầu.
3. Trả lời bằng tiếng Việt, thân thiện, ngắn gọn dễ hiểu.
4. Khi tư vấn: Show 2-3 mẫu nổi bật kèm tên, giá, ưu điểm.
5. Khi so sánh: Sử dụng dạng bảng.
"""

# 3. generate_response Loop
async def generate_response(user_message: str):
    # Setup model with tools
    # Note: Using manual tool mapping because async execution isn't directly chained in all model libraries smoothly.
    model = genai.GenerativeModel(
        model_name="gemini-1.5-pro-latest",
        system_instruction=system_instruction,
        tools=[search_products, get_product_detail, compare_products]
    )
    
    chat = model.start_chat(enable_automatic_function_calling=False)
    
    response = chat.send_message(user_message)
    
    # Tool call dispatch loop
    part = response.candidates[0].content.parts[0]
    
    while hasattr(part, "function_call") and part.function_call:
        function_call = part.function_call
        name = function_call.name
        args = function_call.args
        
        print(f"AI requested Call: {name} with args: {args}")
        
        # Execute tool
        result = {}
        if name == "search_products":
            result = await search_products(
                query=args.get("query"),
                category=args.get("category"),
                min_price=args.get("min_price"),
                max_price=args.get("max_price")
            )
        elif name == "get_product_detail":
            result = await get_product_detail(product_id=args.get("product_id"))
        elif name == "compare_products":
             ids = args.get("product_ids", [])
             if isinstance(ids, str):
                   try: ids = json.loads(ids)
                   except: ids = []
             result = await compare_products(product_ids=ids)
             
        print(f"Tool executed, send results back to AI: {result}")
        response = chat.send_message(
            genai.protos.Content(
                parts=[genai.protos.Part.from_function_response(
                    name=name,
                    response={"result": result}
                )]
            )
        )
        part = response.candidates[0].content.parts[0]

    return response.text
