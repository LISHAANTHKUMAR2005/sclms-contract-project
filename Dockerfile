# Multi-stage build for Spring Boot + React app on Railway

# Stage 1: Build the frontend
FROM node:18-alpine AS frontend-build
WORKDIR /app/sclms-frontend
COPY sclms-frontend/package*.json ./
RUN npm install
COPY sclms-frontend/ ./
RUN npm run build

# Stage 2: Build the backend and include frontend static files
FROM maven:3.9.4-openjdk-17-slim AS backend-build
WORKDIR /app
COPY sclms-backend/sclms-backend/pom.xml ./
COPY sclms-backend/sclms-backend/src ./src
# Copy the built frontend to static resources
COPY --from=frontend-build /app/sclms-frontend/dist ./src/main/resources/static/
RUN mvn clean package -DskipTests

# Stage 3: Run the application
FROM openjdk:17-jre-slim
WORKDIR /app
COPY --from=backend-build /app/target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java","-jar","app.jar"]