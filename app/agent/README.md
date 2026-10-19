# POI Translation and Audio Agent

Agent FastAPI dịch thông tin POI và kịch bản tiếng Việt sang tiếng Anh/Trung giản thể, đồng thời tạo MP3 cho cả ba ngôn ngữ qua 9Router.

## Chạy thử

1. Cài các package Python: `py -m pip install -r agent/requirements.txt` trên Windows hoặc `python -m pip install -r agent/requirements.txt` trên macOS/Linux (chạy tại thư mục `app`).
2. Sao chép `agent/.env.example` thành `agent/.env`, rồi điền thông tin model dịch cùng `NINEROUTER_API_KEY` và `NINEROUTER_BASE_URL`. URL tunnel trong file mẫu có thể thay đổi; khi chạy local, đặt base URL thành `http://localhost:20128/v1`.
3. Chạy `npm run dev` tại thư mục `app` để khởi động backend và frontend; frontend hiện gọi agent trên Render.
4. Nếu muốn chạy agent trên máy local, cài dependencies Python trước rồi chạy `npm run dev:local` tại thư mục `app`. Lệnh `npm run dev:agent` khởi động riêng agent.

Agent cung cấp `GET /health`, `POST /translate-poi`, `POST /translate-script` và `POST /text-to-speech`. Thêm các biến API key tương ứng vào `agent/.env` khi chạy local và vào Environment của Render khi deploy. Không đặt API key trong frontend hoặc commit vào Git.

Tab Audio có thể dịch kịch bản VI sang EN/ZH rồi bấm một lần để tạo audio cho cả ba ngôn ngữ. Endpoint 9Router là OpenAI-compatible `/audio/speech`; các model lần lượt là `edge-tts/vi-VN-HoaiMyNeural`, `edge-tts/en-US-EmmaNeural` và `edge-tts/zh-CN-shaanxi-XiaoniNeural`. Agent trả MP3 để frontend có thể xem trước hoặc tải lên lưu trong Supabase Storage.

## Dịch thông tin POI

Agent nhận tên POI, phân khu, mô tả tiếng Việt và metadata; endpoint `POST /translate-poi` trả về bản dịch tiếng Anh và tiếng Trung. Khi thêm POI trên giao diện quản trị, nội dung đã dịch được đưa vào file `.txt` tải về thay vì ghi POI mới vào database.

Điền `OPENAI_API_KEY`, `OPENAI_BASE_URL` và `OPENAI_MODEL` trong `agent/.env` khi chạy local; cấu hình các biến tương ứng trong Environment của Render khi deploy.
