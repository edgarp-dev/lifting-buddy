FROM denoland/deno:2.6.3

WORKDIR /app

COPY deno.json .

COPY . .

RUN deno install --entrypoint src/main.ts

EXPOSE 8000

CMD ["deno", "run", "--allow-env", "--allow-net", "./src/main.ts"]
