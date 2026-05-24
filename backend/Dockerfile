# Runtime-only image. The jar must be built on the developer's machine BEFORE
# running ansible — see ansible/roles/app/tasks/main.yml (it runs `./gradlew bootJar`
# locally and rsyncs build/libs/*.jar to the VPS). This keeps the production VPS
# off the memory-hungry Gradle build path — saves 10+ minutes of deploy time on
# a 1 GB VPS.
FROM eclipse-temurin:21-jre-jammy

WORKDIR /app

COPY build/libs/*.jar /app/app.jar

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "/app/app.jar"]
