# POI Translation and Audio Agent

Agent FastAPI dịch thông tin POI và kịch bản tiếng Việt sang tiếng Anh/Trung giản thể, đồng thời tạo MP3 bằng Zalo TTS cho tiếng Việt và ElevenLabs cho tiếng Anh/Trung.

## Chạy thử

1. Cài các package Python: `py -m pip install -r agent/requirements.txt` trên Windows hoặc `python -m pip install -r agent/requirements.txt` trên macOS/Linux (chạy tại thư mục `app`).
2. Sao chép `agent/.env.example` thành `agent/.env`, rồi điền thông tin model và API key. Để tạo audio tiếng Việt, điền `ZALO_API_KEY` lấy từ Zalo AI và chọn giọng qua `ZALO_TTS_SPEAKER` (`1`: nữ miền Nam, `2`: nữ miền Bắc, `3`: nam miền Nam, `4`: nam miền Bắc). Để tạo audio tiếng Anh/Trung, điền `ELEVENLABS_API_KEY` cùng các voice ID tương ứng.
3. Chạy `npm run dev` tại thư mục `app` để khởi động backend và frontend; frontend hiện gọi agent trên Render.
4. Nếu muốn chạy agent trên máy local, cài dependencies Python trước rồi chạy `npm run dev:local` tại thư mục `app`. Lệnh `npm run dev:agent` khởi động riêng agent.

Agent cung cấp `GET /health`, `POST /translate-poi`, `POST /translate-script` và `POST /text-to-speech`. Thêm các biến API key tương ứng vào `agent/.env` khi chạy local và vào Environment của Render khi deploy. Không đặt API key trong frontend hoặc commit vào Git.

Tab Audio có thể dịch kịch bản VI sang EN/ZH, chọn bản dịch/ngôn ngữ, rồi tạo và tải MP3. Audio tiếng Việt dùng Zalo TTS; tiếng Anh/Trung dùng ElevenLabs. File MP3 được trả trực tiếp về trình duyệt để nghe/tải thử; backend hiện chưa lưu file audio vào kho bền vững.
