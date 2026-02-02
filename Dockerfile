# ================= BUILD STAGE =================
FROM maven:3.9.6-eclipse-temurin-17 AS build

WORKDIR /app

# Copy pom.xml (double folder)
COPY sclms-backend/sclms-backend/pom.xml .

# Download dependencies
RUN mvn dependency:go-offline

# Copy source code
COPY sclms-backend/sclms-backend/src ./src

# Build jar
RUN mvn clean package -DskipTests


# ================= RUNTIME STAGE =================
FROM eclipse-temurin:17-jre

WORKDIR /app

COPY --from=build /app/target/*.jar app.jar

EXPOSE 8080

ENTRYPOINT ["java","-jar","app.jar"]
