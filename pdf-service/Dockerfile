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

# Download and install Sindhi fonts from Abdul Majid Bhurgri's website
RUN mkdir -p /usr/share/fonts/truetype/sindhi && \
    cd /usr/share/fonts/truetype/sindhi && \
    wget https://bhurgri.com/bhurgri/amar/wp-content/uploads/et-fonts/MBNargisNew3.2-4.ttf -O MBNargisNew.ttf && \
    wget https://bhurgri.com/bhurgri/amar/wp-content/uploads/et-fonts/MB-Khursheed-SK-2.0.ttf -O MBKhursheed.ttf && \
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
