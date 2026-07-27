import { Worker } from 'bullmq';
import IORedis from 'ioredis';
import * as dotenv from 'dotenv';
import { runScraperJob } from './scrapers/runner';

dotenv.config();

// Redis connection (default localhost:6379)
const connection = new IORedis(process.env.REDIS_URL || 'redis://localhost:6379', {
  maxRetriesPerRequest: null,
});

console.log('🚀 Starting PricePulse Worker Node...');

const worker = new Worker(
  'scraping-queue',
  async (job) => {
    console.log(`[Job ${job.id}] Started scraping task for platform: ${job.data.platform}`);
    try {
      const result = await runScraperJob(job.data);
      console.log(`[Job ${job.id}] Completed successfully.`);
      return result;
    } catch (error) {
      console.error(`[Job ${job.id}] Failed:`, error);
      throw error;
    }
  },
  { connection }
);

worker.on('failed', (job, err) => {
  console.error(`❌ Job ${job?.id} failed with reason: ${err.message}`);
});

process.on('SIGINT', async () => {
  console.log('Shutting down worker...');
  await worker.close();
  process.exit(0);
});
