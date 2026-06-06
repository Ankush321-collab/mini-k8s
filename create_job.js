import { db } from './DB/index.js';
import { jobStateTable } from './DB/Schema.js';

async function create() {
  const [res] = await db.insert(jobStateTable).values({
    image: 'nginx',
    cmd: null,
  }).returning({ id: jobStateTable.id });

  console.log('Inserted job id:', res.id);
  process.exit(0);
}

create();
