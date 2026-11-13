import httpx


def translation_error_detail(error: Exception) -> str:
    """Describe upstream failures without exposing response bodies or credentials."""
    status = getattr(error, "status_code", None)
    if status == 401:
        reason = "Ollama từ chối xác thực; kiểm tra proxy và OLLAMA_BASE_URL của agent."
    elif status == 403:
        reason = "Nhà cung cấp từ chối quyền truy cập; kiểm tra quyền API key và model dịch."
    elif status == 404:
        reason = "Không tìm thấy endpoint hoặc model dịch; kiểm tra OLLAMA_BASE_URL và OLLAMA_MODEL."
    elif status == 429:
        reason = "Ollama đang quá tải; giảm số yêu cầu đồng thời."
    elif status in (400, 422):
        reason = "Nhà cung cấp không chấp nhận yêu cầu dịch; kiểm tra OLLAMA_MODEL và khả năng tương thích API."
    elif status in (408, 504) or isinstance(error, httpx.TimeoutException):
        reason = "Dịch vụ dịch phản hồi quá lâu; vui lòng thử lại."
    elif isinstance(status, int) and status >= 500:
        reason = "Máy chủ cung cấp model dịch gặp lỗi; kiểm tra dịch vụ hoặc tunnel của nhà cung cấp."
    elif isinstance(error, httpx.RequestError):
        reason = "Agent không kết nối được dịch vụ dịch; kiểm tra OLLAMA_BASE_URL và tunnel nếu có."
    else:
        reason = "Không gọi được model dịch; kiểm tra log agent để biết nguyên nhân."
    prefix = f"Model dịch trả HTTP {status}. " if isinstance(status, int) else ""
    return prefix + reason
