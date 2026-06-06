# Mini-K8S

Mini-K8S is a small Node.js job runner that stores job state in Postgres, schedules work with BullMQ, and launches containers with Docker.

## What it does

- Accepts jobs through the HTTP API
- Moves jobs through `submitted`, `runnable`, `running`, `succeed`, and `failed`
- Pulls Docker images and starts containers for jobs
- Stores container IDs and error messages in the database
- Can be extended to run on AWS with ECR and ECS

## Scripts

- `pnpm dev` - starts the HTTP server with Nodemon
- `pnpm worker` - starts the scheduler and worker loop with watch mode
- `pnpm db-generate` - generates Drizzle artifacts
- `pnpm db-migrate` - runs database migrations
- `pnpm db-studio` - opens Drizzle Studio

## Main flow

1. `server.js` accepts a job request.
2. The job is inserted into the `jobs` table with `submitted` state.
3. `scheduler.js` runs BullMQ schedulers.
4. `queue/worker.js` moves jobs into runnable/running state.
5. The worker pulls the Docker image, starts the container, and waits for it to finish.
6. The worker updates the database with the final status and any error message.

## AWS plan

This project can be deployed to AWS using:

- ECR for storing the container image
- ECS for running the container
- CloudWatch Logs for runtime logs
- S3 for optional log archives or job artifacts

See [aws integration.md](aws%20integration.md) for the full deployment plan.

## Project files

- [server.js](server.js) - HTTP API for creating jobs
- [scheduler.js](scheduler.js) - BullMQ scheduler bootstrap
- [queue/queue.js](queue/queue.js) - queue definitions
- [queue/worker.js](queue/worker.js) - job dispatcher, Docker worker, and container watcher
- [DB/index.js](DB/index.js) - Postgres/Drizzle connection
- [DB/Schema.js](DB/Schema.js) - job table schema and state enum

## Environment variables

- `DATABASE_URL` - Postgres connection string
- `PORT` - HTTP server port
- Redis/Valkey host and port if you want to change the queue connection settings

## Notes

- Docker Desktop must be running for local container execution.
- Short-lived images such as `busybox` may exit very quickly unless you pass a long-running command like `sleep 100`.
- If you want containers to stay visible in Docker Desktop for debugging, keep `AutoRemove` disabled until your cleanup step runs.
