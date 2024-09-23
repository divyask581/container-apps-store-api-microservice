# Use the openjdk:11-jre-slim base image
FROM openjdk:11-jre-slim

# Copy the application JAR file to the container
COPY target/inventory-service.jar /app/inventory-service.jar

# Set the entry point to run the JAR file
ENTRYPOINT ["java", "-jar", "/app/inventory-service.jar"]
