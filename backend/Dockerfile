# Runtime-only image. The jar must be built on the developer's machine BEFORE
# running ansible — see ansible/roles/app/tasks/main.yml (it runs `./gradlew bootJar`
# locally and rsyncs build/libs/*.jar to the VPS). This keeps the production VPS
# off the memory-hungry Gradle build path — saves 10+ minutes of deploy time on
# a 1 GB VPS.
FROM eclipse-temurin:21-jre-jammy

WORKDIR /app

COPY build/libs/*.jar /app/app.jar

EXPOSE 8080

# JVM флаги:
#   -XX:MaxRAMPercentage=70 — heap до 70% доступной RAM контейнера (на 2 GB VPS ≈ 1.4 GB).
#       Без этого JVM использует дефолт 25% и недогружает машину.
#   -XX:+UseG1GC — современный low-latency GC, дефолт для Java 21, но фиксируем явно.
#   -Xss512k — стек потока 512 KB вместо дефолтного 1 MB. Tomcat 200 потоков → экономия ~100 MB.
#   -XX:+ExitOnOutOfMemoryError — при OOM контейнер падает и docker compose перезапускает,
#       а не зависает в swap-аду.
#   -Djava.security.egd=file:/dev/./urandom — быстрый source энтропии для SSL/secure random,
#       иначе на старте Spring может ждать /dev/random (1–10 секунд на cold VPS).
ENTRYPOINT ["java", "-XX:MaxRAMPercentage=70", "-XX:+UseG1GC", "-Xss512k", "-XX:+ExitOnOutOfMemoryError", "-Djava.security.egd=file:/dev/./urandom", "-jar", "/app/app.jar"]
