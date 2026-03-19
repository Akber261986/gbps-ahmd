FROM node:18-slim

# Install Chromium dependencies and tools for downloading fonts
RUN apt-get update && apt-get install -y \
    chromium \
    fonts-liberation \
    wget \
    fontconfig \
    libasound2 \
    libatk-bridge2.0-0 \
    libatk1.0-0 \
    libatspi2.0-0 \
    libcups2 \
    libdbus-1-3 \
    libdrm2 \
    libgbm1 \
    libgtk-3-0 \
    libnspr4 \
    libnss3 \
    libwayland-client0 \
    libxcomposite1 \
    libxdamage1 \
    libxfixes3 \
    libxkbcommon0 \
    libxrandr2 \
    xdg-utils \
    && rm -rf /var/lib/apt/lists/*

# Download and install Sindhi and Urdu fonts from Google Fonts
RUN mkdir -p /usr/share/fonts/truetype/sindhi && \
    cd /usr/share/fonts/truetype/sindhi && \
    wget https://github.com/google/fonts/raw/main/ofl/notosanssindhi/NotoSansSindhi-Regular.ttf || echo "Failed to download NotoSansSindhi-Regular" && \
    wget https://github.com/google/fonts/raw/main/ofl/notosanssindhi/NotoSansSindhi-Bold.ttf || echo "Failed to download NotoSansSindhi-Bold" && \
    wget https://github.com/google/fonts/raw/main/ofl/notonastaliqurdu/NotoNastaliqUrdu-Regular.ttf || echo "Failed to download NotoNastaliqUrdu-Regular" && \
    wget https://github.com/google/fonts/raw/main/ofl/notonastaliqurdu/NotoNastaliqUrdu-Bold.ttf || echo "Failed to download NotoNastaliqUrdu-Bold" && \
    fc-cache -f

# Set Puppeteer to use installed Chromium
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

# Create app directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy app source
COPY . .

# Expose port
EXPOSE 7860

# Start the service
CMD ["npm", "start"]
