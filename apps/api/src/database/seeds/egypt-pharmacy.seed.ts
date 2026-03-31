import 'reflect-metadata';
import { DataSource } from 'typeorm';
import dataSource from '../data-source';
import { Category } from '../entities/category.entity';
import { Product } from '../entities/product.entity';
import { Inventory } from '../entities/inventory.entity';
import { Supplier } from '../entities/supplier.entity';
import {
  CATEGORIES,
  SUPPLIERS,
  PRODUCTS,
} from './data/egypt-pharmacy.data';

/**
 * Seeds the Egyptian pharmacy catalog (categories, suppliers, products).
 * Accepts an already-initialized DataSource so it can be called from run-seed.ts
 * or standalone.
 */
export async function seedEgyptPharmacy(ds: DataSource) {
  console.log('────────────────────────────────────────────────────────');
  console.log('  Egypt Pharmacy Catalog');
  console.log('────────────────────────────────────────────────────────\n');

  const queryRunner = ds.createQueryRunner();
  await queryRunner.connect();
  await queryRunner.startTransaction();

  try {
    const categoryRepo = queryRunner.manager.getRepository(Category);
    const productRepo = queryRunner.manager.getRepository(Product);
    const inventoryRepo = queryRunner.manager.getRepository(Inventory);
    const supplierRepo = queryRunner.manager.getRepository(Supplier);

    // ── 1. Ensure all categories exist ──────────────────────────────
    console.log('[1/3] Syncing categories …');
    let catCreated = 0;
    let catExisted = 0;
    for (const cat of CATEGORIES) {
      const exists = await categoryRepo.findOne({ where: { nameEn: cat.nameEn } });
      if (!exists) {
        await categoryRepo.save(categoryRepo.create({ ...cat, isActive: true }));
        catCreated++;
      } else {
        catExisted++;
      }
    }
    console.log(`      ${catCreated} created, ${catExisted} already existed\n`);

    // Build nameEn → id lookup
    const allCategories = await categoryRepo.find();
    const categoryMap = new Map(allCategories.map((c) => [c.nameEn, c.id]));

    // ── 2. Seed suppliers ───────────────────────────────────────────
    console.log('[2/3] Syncing suppliers …');
    let supCreated = 0;
    let supExisted = 0;
    for (const sup of SUPPLIERS) {
      const exists = await supplierRepo.findOne({ where: { nameEn: sup.nameEn } });
      if (!exists) {
        await supplierRepo.save(supplierRepo.create({ ...sup, isActive: true }));
        supCreated++;
      } else {
        supExisted++;
      }
    }
    console.log(`      ${supCreated} created, ${supExisted} already existed\n`);

    // ── 3. Seed products + inventory ────────────────────────────────
    console.log('[3/3] Syncing products …');
    let prodCreated = 0;
    let prodSkipped = 0;
    const missingCategories = new Set<string>();

    for (const p of PRODUCTS) {
      const exists = await productRepo.findOne({ where: { nameEn: p.nameEn }, relations: ['inventory'] });
      if (exists) {
        // Restock existing products that have zero inventory
        if (exists.inventory && parseFloat(exists.inventory.quantity) <= 0) {
          const cost = (parseFloat(p.defaultSellingPrice) / (1 + parseFloat(p.margin) / 100)).toFixed(4);
          const qty = String(Math.floor(Math.random() * 451) + 50); // 50–500
          exists.inventory.quantity = qty;
          exists.inventory.avgCost = cost;
          exists.inventory.totalValue = (parseFloat(cost) * parseFloat(qty)).toFixed(4);
          await inventoryRepo.save(exists.inventory);
        }
        prodSkipped++;
        continue;
      }

      const categoryId = categoryMap.get(p.category);
      if (!categoryId) {
        missingCategories.add(p.category);
        prodSkipped++;
        continue;
      }

      const product = await productRepo.save(
        productRepo.create({
          barcode: null,
          nameEn: p.nameEn,
          nameAr: p.nameAr,
          genericNameEn: p.genericNameEn,
          genericNameAr: p.genericNameAr,
          categoryId,
          defaultSellingPrice: p.defaultSellingPrice,
          margin: p.margin,
          taxable: p.taxable,
          trackExpiry: p.trackExpiry,
          requirePrescription: p.requirePrescription,
          unit: p.unit,
          unitsPerPack: p.unitsPerPack,
          isActive: true,
          isService: false,
        }),
      );

      // Seed inventory with initial stock based on selling price
      const cost = (parseFloat(p.defaultSellingPrice) / (1 + parseFloat(p.margin) / 100)).toFixed(4);
      const initialQty = String(Math.floor(Math.random() * 451) + 50); // 50–500
      const totalValue = (parseFloat(cost) * parseFloat(initialQty)).toFixed(4);
      await inventoryRepo.save(
        inventoryRepo.create({
          productId: product.id,
          quantity: initialQty,
          reservedQty: '0',
          avgCost: cost,
          totalValue,
          reorderLevel: '10',
        }),
      );

      prodCreated++;
    }

    if (missingCategories.size > 0) {
      console.log(`      WARNING: missing categories: ${[...missingCategories].join(', ')}`);
    }
    console.log(`      ${prodCreated} created, ${prodSkipped} already existed\n`);

    await queryRunner.commitTransaction();

    console.log(`  Categories : ${catCreated} new / ${catExisted} existing`);
    console.log(`  Suppliers  : ${supCreated} new / ${supExisted} existing`);
    console.log(`  Products   : ${prodCreated} new / ${prodSkipped} existing`);
    console.log('');
  } catch (error) {
    await queryRunner.rollbackTransaction();
    throw error;
  } finally {
    await queryRunner.release();
  }
}

// ── Standalone entry point ──────────────────────────────────────────
// Runs when called directly via: pnpm seed:egypt-pharmacy
if (require.main === module) {
  (async () => {
    await dataSource.initialize();
    try {
      await seedEgyptPharmacy(dataSource);
    } catch (error) {
      console.error('\nSeed FAILED — transaction rolled back.\n');
      console.error(error);
      process.exit(1);
    } finally {
      await dataSource.destroy();
    }
  })();
}
