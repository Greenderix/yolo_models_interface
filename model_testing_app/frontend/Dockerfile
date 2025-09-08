FROM node:20-alpine AS build
WORKDIR /app
COPY package.json vite.config.js ./
# If npm ci fails (no lock), fallback to install
RUN npm ci || npm install
COPY index.html main.js ./

# You can bake API base at build-time by setting VITE_API_BASE build-arg or .env.production
# e.g. docker build --build-arg VITE_API_BASE=http://localhost:8003 -t yolo-frontend .
ARG VITE_API_BASE=http://localhost:8003
ENV VITE_API_BASE=$VITE_API_BASE

RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
