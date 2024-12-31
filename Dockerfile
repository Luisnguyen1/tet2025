FROM python:3.9

# Tạo user không phải root để tăng tính bảo mật
RUN useradd -m -u 1000 user
USER user
ENV PATH="/home/user/.local/bin:$PATH"

WORKDIR /app

COPY --chown=user ./requirements.txt requirements.txt
RUN pip install --no-cache-dir --upgrade -r requirements.txt

COPY --chown=user . /app

# Hugging Face Spaces yêu cầu port 7860
EXPOSE 7860

# Chạy ứng dụng trên port 7860
CMD ["python", "app.py"] 