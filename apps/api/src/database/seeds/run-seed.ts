import 'reflect-metadata';
import dataSource from '../data-source';
import { seedEgyptPharmacy } from './egypt-pharmacy.seed';

/**
 * Main seed runner — orchestrates all seeders in order.
 * Called by `pnpm seed` and by `db:fresh` (drop → migrate → seed).
 *
 * Add new seeders here as the project grows.
 */
async function runSeeds() {
  console.log('════════════════════════════════════════════════════════');
  console.log('  RxFlow — Seed Runner');
  console.log('════════════════════════════════════════════════════════\n');

  await dataSource.initialize();

  try {
    await seedEgyptPharmacy(dataSource);

    // Add future seeders here:
    // await seedSomeOtherData(dataSource);

    console.log('════════════════════════════════════════════════════════');
    console.log('  All seeds completed successfully');
    console.log('════════════════════════════════════════════════════════\n');
  } catch (error) {
    console.error('\nSeed FAILED.\n');
    console.error(error);
    process.exit(1);
  } finally {
    await dataSource.destroy();
  }
}

runSeeds();
