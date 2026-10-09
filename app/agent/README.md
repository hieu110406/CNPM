# POI Translation and Audio Agent

Agent FastAPI dịch thông tin POI và kịch bản tiếng Việt sang tiếng Anh/Trung giản thể, đồng thời tạo MP3 từ kịch bản bằng ElevenLabs.

## Chạy thử

1. Cài các package Python: `py -m pip install -r agent/requirements.txt` trên Windows hoặc `python -m pip install -r agent/requirements.txt` trên macOS/Linux (chạy tại thư mục `app`).
2. Sao chép `agent/.env.example` thành `agent/.env`, rồi điền thông tin model và API key. Cấu hình ElevenLabs gồm `ELEVENLABS_API_KEY` và ba voice ID theo ngôn ngữ.
3. Chạy `npm run dev` tại thư mục `app` để khởi động backend và frontend; frontend hiện gọi agent trên Render.
4. Nếu muốn chạy agent trên máy local, cài dependencies Python trước rồi chạy `npm run dev:local` tại thư mục `app`. Lệnh `npm run dev:agent` khởi động riêng agent.

Agent cung cấp `GET /health`, `POST /translate-poi`, `POST /translate-script` và `POST /text-to-speech`. Để bật TTS, cấu hình `ELEVENLABS_API_KEY` cùng ba voice ID trong `agent/.env` và thêm các biến tương ứng vào Environment của Render. Không đặt API key trong frontend hoặc commit vào Git.

Tab Audio có thể dịch kịch bản VI sang EN/ZH, chọn bản dịch/ngôn ngữ, rồi tạo và tải MP3 bằng ElevenLabs. MP3 được trả trực tiếp về trình duyệt để nghe/tải thử; backend hiện chưa lưu file audio vào kho bền vững.
