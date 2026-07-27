import { Queue, Worker } from 'bullmq';
import IORedis from 'ioredis';

const connection = new IORedis(process.env.REDIS_URL || 'redis://localhost:6379', {
  maxRetriesPerRequest: null,
});

export const hourlyPriceUpdateQueue = new Queue('hourly-price-updates', { connection });

/**
 * Schedule hourly cron job to fetch and update prices across major pincodes
 */
export async function setupHourlyCron() {
  console.log('⏰ Scheduling Hourly Price Sync Job for Quick-Commerce platforms...');
  
  await hourlyPriceUpdateQueue.add(
    'hourly-sync-all-pincodes',
    {
      platforms: ['zepto', 'blinkit', 'instamart', 'flipkart_minutes', 'amazon_now'],
      pincodes: ['110001', '400001', '560001', '600001', '700001'], // Delhi, Mumbai, BLR, Chennai, Kolkata
      batch_size: 5000,
    },
    {
      repeat: {
        pattern: '0 * * * *', // Runs every hour on the hour
      },
    }
  );

  console.log('✅ Hourly Cron Job scheduled successfully!');
}

export const hourlyWorker = new Worker(
  'hourly-price-updates',
  async (job) => {
    console.log(`[Hourly Cron Job ${job.id}] Syncing 500k+ SKUs for pincodes: ${job.data.pincodes.join(', ')}`);
    // Simulated high-throughput ingestion pipeline
    await new Promise(resolve => setTimeout(resolve, 3000));
    return { status: 'completed', updated_skus: 524000, timestamp: new Date().toISOString() };
  },
  { connection }
);
