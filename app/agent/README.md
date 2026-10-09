# POI Translation Agent

Agent FastAPI nhận hai mô tả tiếng Việt và trả về bản dịch ngắn/chi tiết bằng tiếng Anh và tiếng Trung.

## Chạy thử

1. Cài các package Python: `python -m pip install -r agent/requirements.txt` (chạy tại thư mục `app`).
2. Điền `OPENAI_API_KEY` trong `agent/.env`. `OPENAI_BASE_URL` và `OPENAI_MODEL` cũng được cấu hình tại đây.
3. Chạy `npm run dev` tại thư mục `app`; script khởi động agent cùng backend và frontend.

Agent cung cấp `GET /health` và `POST /translate-poi`. Frontend gửi tên POI, phân khu cùng mô tả VI; khi thêm POI, hai bản dịch được đưa vào file `.txt` tải về, không ghi POI mới vào database.
