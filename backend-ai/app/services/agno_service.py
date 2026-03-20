"""
Agno-based chat service that manages session history via PostgreSQL.
Uses NL2SQL layout (Schema advice + Raw SQL executor) with Python aggregation instead of rigid builders.
"""
import json
import asyncio
from agno.agent import Agent
from agno.models.openai.like import OpenAILike
from agno.db.postgres import PostgresDb
from agno.tools import tool

from app.config import settings
from app.database import get_db_connection

DB_URL = (
    f"postgresql+psycopg2://{settings.DB_USER}:{settings.DB_PASSWORD}"
    f"@{settings.DB_HOST}:{settings.DB_PORT}/{settings.DB_NAME}"
)

_db = PostgresDb(db_url=DB_URL, session_table="agno_sessions")


# --- 1. Helper for DB serialization ---
def serialize_db_result(result):
    if isinstance(result, list):
        return [{k: float(v) if type(v).__name__ == "Decimal" else (str(v) if type(v).__name__ in ["UUID", "uuid"] else v) for k, v in r.items()} for r in result]
    if isinstance(result, dict):
         return {k: float(v) if type(v).__name__ == "Decimal" else (str(v) if type(v).__name__ in ["UUID", "uuid"] else v) for k, v in result.items()}
    return result


def aggregate_variants(rows) -> list:
    """
    Python Aggregator: Groups list of flat rows by product_id
    To return standard structure for Slider: [{ id, name, price, variants: [...] }]
    """
    products = {}
    for r in rows:
        p_id = str(r.get("id") or r.get("product_id") or r.get("Product ID") or "")
        if not p_id:
            continue
            
        curr_variants = r.get("variants")
        if isinstance(curr_variants, str):
            try: curr_variants = json.loads(curr_variants)
            except Exception: curr_variants = []
            
        if p_id not in products:
            products[p_id] = {
                "id": p_id,
                "name": r.get("name") or r.get("product_name") or r.get("Product Name"),
                "description": r.get("description"),
                "category_name": r.get("category_name"),
                "variants": curr_variants if isinstance(curr_variants, list) else []
            }
            
        # Unroll flat rows
        v_id = r.get("variant_id") or r.get("pv_id") or r.get("Variant ID")
        if v_id:
            raw_attrs = r.get("attributes") or r.get("Variant Attributes")
            variant = {
                "id": str(v_id),
                "price": float(r.get("variant_price") or r.get("price") or r.get("Variant Price") or 0),
                "attributes": raw_attrs
            }
            if isinstance(variant["attributes"], str):
                try: variant["attributes"] = json.loads(variant["attributes"])
                except Exception: pass
            
            # Reshape [{"name": "Màu", "value": "Xanh"}] to {"Màu": "Xanh"}
            if isinstance(variant["attributes"], list):
                try:
                    variant["attributes"] = {item["name"]: item["value"] for item in variant["attributes"] if isinstance(item, dict) and "name" in item and "value" in item}
                except Exception: pass
                
            products[p_id]["variants"].append(variant)
            
    # Group variants by Price to consolidate attributes
    for p_id in list(products.keys()):
         grouped_variants = {}
         for v in products[p_id]["variants"]:
              price_val = v.get("price")
              price_key = str(price_val) if price_val is not None else "0.0"
              if price_key not in grouped_variants:
                   # Shallow copy to prevent mutating raw items
                   grouped_variants[price_key] = {**v, "attributes": dict(v.get("attributes") or {})}
              else:
                   existing_attrs = grouped_variants[price_key]["attributes"]
                   new_attrs = v.get("attributes") or {}
                   for k, val in new_attrs.items():
                        if k not in existing_attrs:
                             existing_attrs[k] = val
                        elif existing_attrs[k] != val:
                             existing_vals = str(existing_attrs[k]).split("/")
                             if str(val) not in existing_vals:
                                  existing_attrs[k] = f"{existing_attrs[k]}/{val}"
         products[p_id]["variants"] = list(grouped_variants.values())

    return list(products.values())


# --- 2. Tool Queries ---

async def execute_raw_sql(sql_query: str):
    print(f"Executing SQL: {sql_query}")
    conn = await get_db_connection()
    try:
        rows = await conn.fetch(sql_query)
        results = [dict(r) for r in rows]
        aggregated = aggregate_variants(results)
        
        # Batch Fetch Images cho các sản phẩm đã gom nhóm
        if aggregated:
            import uuid
            try:
                p_ids = [uuid.UUID(str(a["id"])) for a in aggregated if a.get("id")]
            except Exception:
                p_ids = []
                
            if p_ids:
                try:
                    # Truy vấn mảng ảnh từ product_attribute_images
                    img_sql = "SELECT product_id, image_urls FROM product_attribute_images WHERE product_id = ANY($1)"
                    img_rows = await conn.fetch(img_sql, p_ids)
                    img_map = {str(r["product_id"]): r["image_urls"] for r in img_rows}
                    
                    for p in aggregated:
                        img_arr = img_map.get(str(p["id"]))
                        if img_arr and isinstance(img_arr, list) and len(img_arr) > 0:
                            p["image_url"] = img_arr[0]  # Thường dạng '/uploads/filename.jpeg'
                except Exception as img_err:
                    print(f"Error fetching images: {img_err}")
        
        # Lưu kết quả ra file JSON để debug
        try:
            with open("aggregated_products.json", "w", encoding="utf-8") as f:
                json.dump(serialize_db_result(aggregated), f, ensure_ascii=False, indent=4)
        except Exception as json_err:
            print(f"Error saving to JSON: {json_err}")
            
        await conn.close()
        return serialize_db_result(aggregated if aggregated else results)
    except Exception as e:
        print(f"Error in execute_raw_sql: {e}")
        await conn.close()
        return []


# --- 3. Wrapper functions as sync Agno tools ---

async def fetch_db_schema_async():
    conn = await get_db_connection()
    try:
        query = """
        SELECT 
            table_name, 
            column_name, 
            data_type
        FROM 
            information_schema.columns 
        WHERE 
            table_schema = 'public'
        ORDER BY 
            table_name, ordinal_position;
        """
        rows = await conn.fetch(query)
        await conn.close()
        return [dict(r) for r in rows]
    except Exception as e:
        print(f"Error in fetch_db_schema_async: {e}")
        await conn.close()
        return []


@tool
def get_database_schema_tool() -> str:
    """Trả về cấu trúc Database schema của hệ thống (các bảng trong schema 'public')."""
    try:
        rows = asyncio.run(fetch_db_schema_async())
        if not rows:
             return "Không thể lấy schema do lỗi kết nối."
             
        schema = {}
        for r in rows:
             t_name = r["table_name"]
             c_name = r["column_name"]
             d_type = r["data_type"]
             if t_name not in schema:
                  schema[t_name] = []
             schema[t_name].append(f"- {c_name} ({d_type})")
             
        output = ""
        for table, cols in schema.items():
             output += f"Bảng: {table}\n"
             for c in cols:
                  output += f"  {c}\n"
             output += "\n"
             
        output += """
Để hiển thị Slider đẹp nhất trên Chatbot Client, vui lòng đặt tên ALIAS các cột:
`id` (Product ID), `name` (Product Name), `variant_id` (Variant ID), `variant_price` (Variant Price), `attributes` (Variant Attributes).
Cách 2: Sử dụng `jsonb_agg(pv.*) as variants` để gộp mảng biến thể trong lệnh SELECT.
"""
        return output
    except Exception as e:
         return f"Lỗi truy vấn schema tool: {e}"


@tool
def execute_sql_tool(sql_query: str) -> str:
    """Thực thi câu lệnh SQL SELECT hoặc WITH để truy xuất dữ liệu sản phẩm. Nghiêm cấm INSERT, UPDATE, DELETE."""
    cleaned = sql_query.strip().lower()
    if not cleaned.startswith("select") and not cleaned.startswith("with"):
        return json.dumps({"status": "error", "message": "Chỉ được phép thực thi cấu lệnh truy xuất SELECT/WITH."})
    
    result = asyncio.run(execute_raw_sql(sql_query))
    return json.dumps(result, ensure_ascii=False)


# --- 4. System Instruction ---

system_instruction = f"""
Bạn là một trợ lý bán hàng (Chatbot) thông minh cho website bán đồ điện tử.

=====================
I. MỤC TIÊU
=====================
- Hiểu nhu cầu người dùng
- Truy vấn dữ liệu sản phẩm từ database thông qua tool
- Trả lời rõ ràng, chính xác, dễ đọc, có tính tư vấn

=====================
II. QUY TRÌNH SUY LUẬN
=====================

1. Xác định intent của người dùng:
   - Tìm sản phẩm (search)
   - So sánh sản phẩm (compare)
   - Hỏi thông tin sản phẩm (detail)
   - Hỏi chung (general)
2. Nếu liên quan đến sản phẩm:
   → LUÔN gọi tool để lấy dữ liệu, KHÔNG tự bịa
3. Khi cần dữ liệu:
   - LUÔN LUÔN gọi `get_database_schema_tool` TRƯỚC KHI gọi `execute_sql_tool`
   - Sau đó mới gọi `execute_sql_tool` để truy vấn
4. Sau khi có dữ liệu:
   - Chuẩn hoá
   - Nhóm theo sản phẩm / biến thể
   - Lọc dữ liệu lỗi (ví dụ: giá = 0)
=====================
III. QUY TẮC TRUY VẤN
=====================
- Chỉ viết câu lệnh SQL SELECT
- Luôn LIMIT số lượng kết quả (tối đa 10–20 sản phẩm)
- Ưu tiên query theo:
  - tên sản phẩm
  - danh mục
  - giá
- JOIN bảng khi cần thiết (ví dụ: product + variant)
=====================
IV. QUY TẮC HIỂN THỊ
=====================
1. Format rõ ràng, dễ đọc:
Tên sản phẩm
Phiên bản:
- Màu sắc:
- RAM:
- Bộ nhớ:
- Giá: <span style="color:red"><b>xxx VND</b></span>
2. Nếu có nhiều biến thể:
→ nhóm theo sản phẩm, không lặp lung tung
3. Nếu giá = 0 hoặc null:
→ hiển thị: "Liên hệ"
4. Mỗi sản phẩm PHẢI có link:
[Tên sản phẩm]({settings.FRONTEND_BASE_URL}/product/<product_id>)
5. KHÔNG ĐƯỢC chèn hình ảnh dạng `![...]` hoặc thẻ `<img />` vào trong câu trả lời bằng text. Hình ảnh đã có hệ thống Slider tự động hiển thị ở dưới.
=====================
V. QUY TẮC TƯ VẤN
=====================

- Không chỉ liệt kê → phải có nhận xét ngắn:
  - phù hợp với ai
  - điểm mạnh chính

- Nếu user query mơ hồ:
  → hỏi lại hoặc gợi ý lựa chọn

=====================
VI. NGUYÊN TẮC QUAN TRỌNG
=====================

- KHÔNG được tự bịa thông tin sản phẩm
- LUÔN dùng `execute_sql_tool` nếu liên quan đến sản phẩm
- LUÔN LUÔN gọi `get_database_schema_tool` TRƯỚC KHI gọi `execute_sql_tool`
- KHÔNG trả về SQL cho user
- Ưu tiên câu trả lời ngắn gọn nhưng đầy đủ

=====================
VII. KẾT THÚC
=====================

Luôn kết thúc bằng một câu gợi ý:
- "Bạn muốn mình tư vấn kỹ hơn không?"
- hoặc "Bạn muốn so sánh sản phẩm nào không?"
"""


# --- 5. Agent factory per session ---

def _build_agent(session_id: str) -> Agent:
    model = OpenAILike(
        id=settings.OPENROUTER_MODEL,
        api_key=settings.OPENROUTER_API_KEY,
        base_url="https://openrouter.ai/api/v1",
    )
    return Agent(
        model=model,
        session_id=session_id,
        db=_db,
        tools=[get_database_schema_tool, execute_sql_tool],
        instructions=system_instruction,
        add_history_to_context=True,   # Loads history from DB
        num_history_messages=5,
        markdown=True,
        debug_mode=True
    )


async def generate_response_agno(session_id: str, message: str) -> dict:
    agent = _build_agent(session_id)
    loop = asyncio.get_event_loop()

    def _run_sync():
        return agent.run(message)

    run_result = await loop.run_in_executor(None, _run_sync)

    content = ""
    if hasattr(run_result, "content"):
        content = run_result.content or ""
    elif isinstance(run_result, str):
        content = run_result

    reasoning_content = ""
    if hasattr(run_result, "reasoning_content"):
        reasoning_content = run_result.reasoning_content or ""

    products = []
    tool_calls_log = []
    try:
        if hasattr(run_result, "messages"):
            # Duyệt ngược từ cuối lên
            curr_turn_messages = []
            for msg in reversed(run_result.messages):
                role = getattr(msg, "role", "")
                if role == "user":
                    break  # Dừng lại khi chạm tin nhắn do người dùng gửi ở đầu lượt này
                curr_turn_messages.append(msg)
                
            # Duyệt xuôi lại để giữ đúng thứ tự sinh ra
            for msg in reversed(curr_turn_messages):
                role = getattr(msg, "role", "")
                if role == "assistant" and getattr(msg, "tool_calls", None):
                    for tc in msg.tool_calls:
                        func = tc.get("function", {})
                        tool_calls_log.append({
                            "name": func.get("name"),
                            "arguments": func.get("arguments")
                        })
                if role in ["tool", "function"]:
                    raw = msg.content
                    if isinstance(raw, str):
                        try:
                            data = json.loads(raw)
                            if isinstance(data, list):
                                products.extend(data)
                        except Exception:
                            pass
    except Exception:
        pass

    return {
        "content": content, 
        "products": products, 
        "tool_calls": tool_calls_log,
        "reasoning": reasoning_content
    }
