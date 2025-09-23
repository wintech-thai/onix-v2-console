# ใช้ Node.js image
FROM node:20-alpine

# สร้าง working directory
WORKDIR /app

# คัดลอกไฟล์ package.json และ package-lock.json
COPY package*.json ./

# ติดตั้ง dependencies
RUN npm install

# คัดลอก source code
COPY . .

# เปิด port 3000
EXPOSE 3000

# สั่งรันแอป
CMD ["node", "index.js"]
