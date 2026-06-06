import { pgTable, uuid, text, timestamp,pgEnum } from 'drizzle-orm/pg-core';

export const jobStateEnum = pgEnum('job_state', ['submitted', 'runnable', 'running', 'succeed', 'failed']);
export const jobstatusenumvalue=jobStateEnum.enumValues
export const jobStateTable = pgTable('jobs', {
  id: uuid().primaryKey().defaultRandom(),

  image: text().notNull(),

  cmd: text(),
  state: jobStateEnum().default('submitted').notNull(),

  createdAt: timestamp().defaultNow().notNull(),
  containerId: text().notNull(),

  updatedAt: timestamp().defaultNow().notNull()
  ,
  containerId: text()
  ,
  errorMessage: text()
});