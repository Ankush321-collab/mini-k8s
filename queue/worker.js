import { Worker } from "bullmq";
import { db } from "../DB/index.js";

import {
  jobStateTable,
  jobstatusenumvalue,
} from "../DB/Schema.js";

import Docker from "dockerode";

import {
  sql,
  inArray,
  eq,
} from "drizzle-orm";

const docker = new Docker();

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function pullImage(imageName) {
  return new Promise((resolve, reject) => {
    docker.pull(imageName, (err, stream) => {
      if (err) return reject(err);

      docker.modem.followProgress(
        stream,
        (err) => {
          if (err) reject(err);
          else resolve();
        }
      );
    });
  });
}

/* ---------------- DISPATCHER ---------------- */

export const jobdispatchworker = new Worker(
  "job-dispatcher",

  async () => {
    await db.transaction(
      async (tx) => {
        const result = await tx.execute(sql`
          SELECT *
          FROM ${jobStateTable}
          WHERE ${jobStateTable.state} = ${jobstatusenumvalue[0]}
          ORDER BY ${jobStateTable.createdAt} ASC
          FOR UPDATE SKIP LOCKED
          LIMIT 5
        `);

        const jobs = result.rows;
        const jobIds = jobs.map((job) => job.id);

        console.log(
          `[Dispatcher]: Found ${jobIds.length} jobs`
        );

        if (jobIds.length > 0) {
          await tx
            .update(jobStateTable)
            .set({
              state: jobstatusenumvalue[1],
              updatedAt: new Date(),
            })
            .where(
              inArray(jobStateTable.id, jobIds)
            );

          console.log(
            `[Dispatcher]: Jobs moved to runnable`
          );
        }
      },

      {
        accessMode: "read write",
        isolationLevel: "read committed",
      }
    );
  },

  {
    connection: {
      host: "localhost",
      port: 6379,
    },
  }
);

/* ---------------- CRI WORKER ---------------- */

export const jobcriworker = new Worker(
  "job-cri-scheduler",

  async () => {

    /* reserve jobs quickly */
    const jobs = await db.transaction(
      async (tx) => {

        const result = await tx.execute(sql`
          SELECT *
          FROM ${jobStateTable}
          WHERE ${jobStateTable.state} = ${jobstatusenumvalue[1]}
          ORDER BY ${jobStateTable.createdAt} ASC
          FOR UPDATE SKIP LOCKED
          LIMIT 5
        `);

        const jobs = result.rows;
        const jobIds = jobs.map((j) => j.id);

        if (jobIds.length > 0) {
          await tx
            .update(jobStateTable)
            .set({
              state: jobstatusenumvalue[2],
              updatedAt: new Date(),
            })
            .where(
              inArray(jobStateTable.id, jobIds)
            );
        }

        return jobs;
      },

      {
        accessMode: "read write",
        isolationLevel: "read committed",
      }
    );

    console.log(
      `[CRI]: Found ${jobs.length} jobs`
    );

    /* process outside transaction */
    for (const job of jobs) {

      try {

        console.log(
          `[CRI]: Processing ${job.id}`
        );

        let imageName = String(job.image || "")
          .trim()
          .toLowerCase();

        if (!imageName) {
          throw new Error("Image missing");
        }

        if (!imageName.includes(":")) {
          imageName += ":latest";
        }

        const images =
          await docker.listImages({
            filters: {
              reference: [imageName],
            },
          });

        if (images.length === 0) {

          console.log(
            `[Docker]: Pulling ${imageName}`
          );

          await pullImage(imageName);

          console.log(
            `[Docker]: Pulled ${imageName}`
          );
        }

        const container =
          await docker.createContainer({

            Image: imageName,

            Tty: false,

            HostConfig: {
              AutoRemove: false,
            },

            Cmd: job.cmd
              ? job.cmd.split(" ")
              : undefined,
          });

        await container.start();

        console.log(
          `[Docker]: Started ${container.id}`
        );

        await db
          .update(jobStateTable)
          .set({
            containerId: container.id,
            updatedAt: new Date(),
          })
          .where(
            inArray(jobStateTable.id, [job.id])
          );

        const waitResult =
          await container.wait();

        await sleep(5000);

        try {
          const refreshed = await container.inspect();
          if (refreshed.State?.Status === "exited") {
            await container.remove({ force: true });
            console.log(
              `[Docker]: Removed exited container ${container.id}`
            );
          }
        } catch (cleanupError) {
          console.log(
            `[Docker]: Cleanup skipped for ${container.id}`
          );
        }

        const exitCode =
          waitResult.StatusCode ?? 1;

        if (exitCode === 0) {

          await db
            .update(jobStateTable)
            .set({
              state: jobstatusenumvalue[3],
              updatedAt: new Date(),
            })
            .where(
              inArray(jobStateTable.id, [job.id])
            );

          console.log(
            `[CRI]: Job ${job.id} succeeded`
          );

        } else {

          await db
            .update(jobStateTable)
            .set({
              state: jobstatusenumvalue[4],
              errorMessage:
                `Exit code ${exitCode}`,
              updatedAt: new Date(),
            })
            .where(
              inArray(jobStateTable.id, [job.id])
            );

          console.log(
            `[CRI]: Job ${job.id} failed`
          );
        }

      } catch (err) {

        console.error(
          `[CRI ERROR]:`,
          err
        );

        await db
          .update(jobStateTable)
          .set({
            state: jobstatusenumvalue[4],
            errorMessage:
              String(err.message || err),
            updatedAt: new Date(),
          })
          .where(
            inArray(jobStateTable.id, [job.id])
          );
      }
    }
  },

  {
    connection: {
      host: "localhost",
      port: 6379,
    },
  }
);

export const jobwatcher=new Worker(
  "job-watcher-scheduler",
   async () => {

    /* reserve jobs quickly */
    const jobs = await db.transaction(
      async (tx) => {

        const result = await tx.execute(sql`
          SELECT *
          FROM ${jobStateTable}
          WHERE ${jobStateTable.state} = ${jobstatusenumvalue[2]}
          ORDER BY ${jobStateTable.createdAt} ASC
          FOR UPDATE SKIP LOCKED
          LIMIT 5
        `);

        const jobs = result.rows;
        const jobIds = jobs.map((j) => j.id);

        if (jobIds.length > 0) {
          await tx
            .update(jobStateTable)
            .set({
              state: jobstatusenumvalue[2],
              updatedAt: new Date(),
            })
            .where(
              inArray(jobStateTable.id, jobIds)
            );
        }

        for (const jobId of jobIds) {
          const [jobRow] = await db
            .select()
            .from(jobStateTable)
            .where(eq(jobStateTable.id, jobId));

          if (!jobRow?.containerId) {
            continue;
          }

          const container = docker.getContainer(jobRow.containerId);
          const containerStatus = await container.inspect();
          const status = containerStatus.State?.Status;

          console.log(`Status=>${status}`);

          if (status === "exited") {
            await container.remove({ force: true });
          }
        }

        return jobs;
      },

      {
        accessMode: "read write",
        isolationLevel: "read committed",
      }
    );

    console.log(
      `[CRI]: Found ${jobs.length} jobs`
    );

    /* process outside transaction */
    for (const job of jobs) {

      try {

        console.log(
          `[CRI]: Processing ${job.id}`
        );

        let imageName = String(job.image || "")
          .trim()
          .toLowerCase();

        if (!imageName) {
          throw new Error("Image missing");
        }

        if (!imageName.includes(":")) {
          imageName += ":latest";
        }

        const images =
          await docker.listImages({
            filters: {
              reference: [imageName],
            },
          });

        if (images.length === 0) {

          console.log(
            `[Docker]: Pulling ${imageName}`
          );

          await pullImage(imageName);

          console.log(
            `[Docker]: Pulled ${imageName}`
          );
        }

        const container =
          await docker.createContainer({

            Image: imageName,

            Tty: false,

            HostConfig: {
              AutoRemove: true,
            },

            Cmd: job.cmd
              ? job.cmd.split(" ")
              : undefined,
          });

        await container.start();

        console.log(
          `[Docker]: Started ${container.id}`
        );

        await db
          .update(jobStateTable)
          .set({
            containerId: container.id,
            updatedAt: new Date(),
          })
          .where(
            inArray(jobStateTable.id, [job.id])
          );

        const waitResult =
          await container.wait();

        const exitCode =
          waitResult.StatusCode ?? 1;

        if (exitCode === 0) {

          await db
            .update(jobStateTable)
            .set({
              state: jobstatusenumvalue[3],
              updatedAt: new Date(),
            })
            .where(
              inArray(jobStateTable.id, [job.id])
            );

          console.log(
            `[CRI]: Job ${job.id} succeeded`
          );

        } else {

          await db
            .update(jobStateTable)
            .set({
              state: jobstatusenumvalue[4],
              errorMessage:
                `Exit code ${exitCode}`,
              updatedAt: new Date(),
            })
            .where(
              inArray(jobStateTable.id, [job.id])
            );

          console.log(
            `[CRI]: Job ${job.id} failed`
          );
        }

      } catch (err) {

        console.error(
          `[CRI ERROR]:`,
          err
        );

        await db
          .update(jobStateTable)
          .set({
            state: jobstatusenumvalue[4],
            errorMessage:
              String(err.message || err),
            updatedAt: new Date(),
          })
          .where(
            inArray(jobStateTable.id, [job.id])
          );
      }
    }
  },

  {
    connection: {
      host: "localhost",
      port: 6379,
    },
  }
);