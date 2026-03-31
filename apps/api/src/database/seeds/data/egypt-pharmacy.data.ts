import { ProductUnit } from '@pharmapos/shared';

/**
 * ═══════════════════════════════════════════════════════════════════════
 *  RxFlow — Egyptian Pharmacy Production Seed Catalog
 * ═══════════════════════════════════════════════════════════════════════
 *  Comprehensive catalog of medicines, medical supplies, and products
 *  commonly stocked by pharmacies across Egypt.
 *
 *  • Prices are approximate 2025 EGP retail prices
 *  • Arabic / English bilingual names
 *  • Barcodes left null — each pharmacy scans real product barcodes
 *    during first purchase / stock receiving
 *  • Safe to re-run (skips existing products matched by nameEn)
 *
 *  Last reviewed: 2025-Q2
 * ═══════════════════════════════════════════════════════════════════════
 */

// ─── Category seed type ──────────────────────────────────────────────
export interface SeedCategory {
  nameEn: string;
  nameAr: string;
  color: string;
  sortOrder: number;
}

/**
 *  ALL categories the catalog needs. The seeder creates any that
 *  don't already exist (i.e. works whether the setup wizard was
 *  run first or not).
 */
export const CATEGORIES: SeedCategory[] = [
  // ── From setup wizard (included so the seed is self-contained) ──
  { nameEn: 'Pain Relief', nameAr: 'مسكنات', color: '#EF4444', sortOrder: 1 },
  { nameEn: 'Antibiotics', nameAr: 'مضادات حيوية', color: '#3B82F6', sortOrder: 2 },
  { nameEn: 'Vitamins & Supplements', nameAr: 'فيتامينات ومكملات', color: '#22C55E', sortOrder: 3 },
  { nameEn: 'Skin Care', nameAr: 'العناية بالبشرة', color: '#A855F7', sortOrder: 4 },
  { nameEn: 'Baby Care', nameAr: 'رعاية الأطفال', color: '#F59E0B', sortOrder: 5 },
  { nameEn: 'Medical Devices', nameAr: 'أجهزة ومستلزمات طبية', color: '#6366F1', sortOrder: 6 },
  { nameEn: 'Other', nameAr: 'أخرى', color: '#6B7280', sortOrder: 99 },
  // ── Additional therapeutic categories ──────────────────────────
  { nameEn: 'Cold & Flu', nameAr: 'البرد والانفلونزا', color: '#0EA5E9', sortOrder: 7 },
  { nameEn: 'Cough & Sore Throat', nameAr: 'الكحة والتهاب الحلق', color: '#06B6D4', sortOrder: 8 },
  { nameEn: 'Digestive Health', nameAr: 'الجهاز الهضمي', color: '#F97316', sortOrder: 9 },
  { nameEn: 'Allergy', nameAr: 'الحساسية', color: '#EC4899', sortOrder: 10 },
  { nameEn: 'Diabetes', nameAr: 'السكري', color: '#14B8A6', sortOrder: 11 },
  { nameEn: 'Heart & Blood Pressure', nameAr: 'القلب والضغط', color: '#DC2626', sortOrder: 12 },
  { nameEn: 'Eye Care', nameAr: 'العناية بالعيون', color: '#2563EB', sortOrder: 13 },
  { nameEn: 'Respiratory & Asthma', nameAr: 'الجهاز التنفسي والربو', color: '#7C3AED', sortOrder: 14 },
  { nameEn: 'Muscles & Joints', nameAr: 'العضلات والمفاصل', color: '#EA580C', sortOrder: 15 },
  { nameEn: 'Nerve & Mental Health', nameAr: 'الأعصاب والصحة النفسية', color: '#4338CA', sortOrder: 16 },
  { nameEn: 'ENT (Ear, Nose, Throat)', nameAr: 'أنف وأذن وحنجرة', color: '#0891B2', sortOrder: 17 },
  { nameEn: 'Dental Care', nameAr: 'العناية بالأسنان', color: '#0D9488', sortOrder: 18 },
  { nameEn: 'Urinary Tract', nameAr: 'المسالك البولية', color: '#0369A1', sortOrder: 19 },
  { nameEn: 'Hormones & Thyroid', nameAr: 'الهرمونات والغدة الدرقية', color: '#9333EA', sortOrder: 20 },
  { nameEn: 'Personal Hygiene', nameAr: 'النظافة الشخصية', color: '#D946EF', sortOrder: 21 },
  { nameEn: 'First Aid & Antiseptics', nameAr: 'الإسعافات الأولية والمطهرات', color: '#B91C1C', sortOrder: 22 },
  { nameEn: 'Nutritional Supplements', nameAr: 'مكملات غذائية وألبان', color: '#65A30D', sortOrder: 23 },
  { nameEn: 'Mother & Pregnancy', nameAr: 'الأمومة والحمل', color: '#DB2777', sortOrder: 24 },
];

// ─── Supplier seed type ──────────────────────────────────────────────
export interface SeedSupplier {
  nameEn: string;
  nameAr: string;
  phone: string | null;
  address: string | null;
}

export const SUPPLIERS: SeedSupplier[] = [
  // ── Major Egyptian pharma manufacturers ─────────────────────────
  { nameEn: 'Egyptian Int. Pharmaceutical Industries (EIPICO)', nameAr: 'الشركة المصرية الدولية للصناعات الدوائية - ايبيكو', phone: '0552364191', address: 'مدينة العاشر من رمضان، الشرقية' },
  { nameEn: 'Eva Pharma', nameAr: 'إيفا فارما', phone: '0233615352', address: 'الجيزة' },
  { nameEn: 'Pharco Pharmaceuticals', nameAr: 'فاركو للأدوية', phone: '034841111', address: 'الإسكندرية' },
  { nameEn: 'Amoun Pharmaceutical', nameAr: 'آمون للأدوية', phone: '0222616263', address: 'مدينة العبور، القليوبية' },
  { nameEn: 'Medical Union Pharmaceuticals (MUP)', nameAr: 'الاتحاد الطبي للأدوية', phone: '0882364100', address: 'أبو قرقاص، المنيا' },
  { nameEn: 'Kahira Pharmaceuticals', nameAr: 'شركة القاهرة للأدوية', phone: '0225086000', address: 'القاهرة' },
  { nameEn: 'Memphis Pharmaceuticals', nameAr: 'ممفيس للأدوية', phone: '0222622626', address: 'القاهرة' },
  { nameEn: 'Sedico Pharmaceuticals', nameAr: 'سيديكو للأدوية', phone: '0227959595', address: 'مدينة السادس من أكتوبر، الجيزة' },
  { nameEn: 'Multi-Pharma', nameAr: 'مالتي فارما', phone: '0244777444', address: 'مدينة العاشر من رمضان، الشرقية' },
  { nameEn: 'Marcyrl Pharmaceutical', nameAr: 'مارسيرل للأدوية', phone: '0226701010', address: 'مدينة العبور، القليوبية' },
  { nameEn: 'Global Napi Pharmaceuticals', nameAr: 'جلوبال نابي للأدوية', phone: '0226103000', address: 'القاهرة' },
  { nameEn: 'Sigma Pharmaceutical Industries', nameAr: 'سيجما للصناعات الدوائية', phone: '0552400114', address: 'قويسنا، المنوفية' },
  { nameEn: 'El Nasr Pharmaceutical Chemicals (ADWIC)', nameAr: 'النصر للكيماويات الدوائية - أدويك', phone: '0222616244', address: 'أبو زعبل، القليوبية' },
  { nameEn: 'Arab Drug Company (ADCO)', nameAr: 'الشركة العربية للأدوية', phone: '0222027930', address: 'القاهرة' },
  { nameEn: 'Rameda Pharmaceuticals', nameAr: 'راميدا للأدوية', phone: '0552363009', address: 'مدينة العاشر من رمضان، الشرقية' },
  // ── Major multinational distributors active in Egypt ────────────
  { nameEn: 'GlaxoSmithKline (GSK) Egypt', nameAr: 'جلاكسو سميثكلاين مصر', phone: '0235321000', address: 'القاهرة' },
  { nameEn: 'Novartis Egypt', nameAr: 'نوفارتس مصر', phone: '0227399000', address: 'القاهرة' },
  { nameEn: 'Sanofi Egypt', nameAr: 'سانوفي مصر', phone: '0233618700', address: 'الجيزة' },
  { nameEn: 'Pfizer Egypt', nameAr: 'فايزر مصر', phone: '0227979000', address: 'القاهرة' },
  { nameEn: 'AstraZeneca Egypt', nameAr: 'أسترازينيكا مصر', phone: '0222929400', address: 'القاهرة' },
  { nameEn: 'Hikma Pharmaceuticals', nameAr: 'الحكمة للأدوية', phone: '0227927927', address: 'القاهرة' },
  { nameEn: 'Abbott Egypt', nameAr: 'أبوت مصر', phone: '0225169600', address: 'القاهرة' },
  { nameEn: 'Bayer Egypt', nameAr: 'باير مصر', phone: '0227589000', address: 'القاهرة' },
  { nameEn: 'Boehringer Ingelheim Egypt', nameAr: 'بورنغر إنغلهايم مصر', phone: '0225181700', address: 'القاهرة' },
  { nameEn: 'Merck Sharp & Dohme (MSD) Egypt', nameAr: 'ميرك شارب آند دوم مصر', phone: '0233346000', address: 'القاهرة' },
];

// ─── Product seed type ───────────────────────────────────────────────
export interface SeedProduct {
  nameEn: string;
  nameAr: string;
  genericNameEn: string | null;
  genericNameAr: string | null;
  category: string; // matched by nameEn
  defaultSellingPrice: string;
  margin: string;
  taxable: boolean;
  trackExpiry: boolean;
  requirePrescription: boolean;
  unit: ProductUnit;
  unitsPerPack: number;
}

// shorthand helpers to cut repetition
const S = ProductUnit.STRIP;
const B = ProductUnit.BOX;
const BT = ProductUnit.BOTTLE;
const T = ProductUnit.TUBE;
const P = ProductUnit.PIECE;
const SC = ProductUnit.SACHET;

/** Whether a medicine tracks expiry (almost all do) */
const RX = true;   // requires prescription
const OTC = false;  // over-the-counter

export const PRODUCTS: SeedProduct[] = [
  // ═══════════════════════════════════════════════════════════════════
  //  1. PAIN RELIEF  (مسكنات)
  // ═══════════════════════════════════════════════════════════════════
  { nameEn: 'Panadol 500mg Tablets', nameAr: 'بانادول 500 مجم أقراص', genericNameEn: 'Paracetamol', genericNameAr: 'باراسيتامول', category: 'Pain Relief', defaultSellingPrice: '21.00', margin: '25', taxable: false, trackExpiry: true, requirePrescription: OTC, unit: S, unitsPerPack: 2 },
  { nameEn: 'Panadol Extra Tablets', nameAr: 'بانادول إكسترا أقراص', genericNameEn: 'Paracetamol + Caffeine', genericNameAr: 'باراسيتامول + كافيين', category: 'Pain Relief', defaultSellingPrice: '27.00', margin: '25', taxable: false, trackExpiry: true, requirePrescription: OTC, unit: S, unitsPerPack: 2 },
  { nameEn: 'Panadol Night Tablets', nameAr: 'بانادول نايت أقراص', genericNameEn: 'Paracetamol + Diphenhydramine', genericNameAr: 'باراسيتامول + ديفينهيدرامين', category: 'Pain Relief', defaultSellingPrice: '30.00', margin: '25', taxable: false, trackExpiry: true, requirePrescription: OTC, unit: S, unitsPerPack: 2 },
  { nameEn: 'Adol 500mg Tablets', nameAr: 'أدول 500 مجم أقراص', genericNameEn: 'Paracetamol', genericNameAr: 'باراسيتامول', category: 'Pain Relief', defaultSellingPrice: '15.00', margin: '28', taxable: false, trackExpiry: true, requirePrescription: OTC, unit: S, unitsPerPack: 2 },
  { nameEn: 'Brufen 400mg Tablets', nameAr: 'بروفين 400 مجم أقراص', genericNameEn: 'Ibuprofen', genericNameAr: 'إيبوبروفين', category: 'Pain Relief', defaultSellingPrice: '30.00', margin: '25', taxable: false, trackExpiry: true, requirePrescription: OTC, unit: S, unitsPerPack: 2 },
  { nameEn: 'Brufen 600mg Tablets', nameAr: 'بروفين 600 مجم أقراص', genericNameEn: 'Ibuprofen', genericNameAr: 'إيبوبروفين', category: 'Pain Relief', defaultSellingPrice: '42.00', margin: '25', taxable: false, trackExpiry: true, requirePrescription: OTC, unit: S, unitsPerPack: 2 },
  { nameEn: 'Advil 400mg Capsules', nameAr: 'أدفيل 400 مجم كبسول', genericNameEn: 'Ibuprofen', genericNameAr: 'إيبوبروفين', category: 'Pain Relief', defaultSellingPrice: '36.00', margin: '25', taxable: false, trackExpiry: true, requirePrescription: OTC, unit: S, unitsPerPack: 2 },
  { nameEn: 'Cataflam 50mg Tablets', nameAr: 'كتافلام 50 مجم أقراص', genericNameEn: 'Diclofenac Potassium', genericNameAr: 'ديكلوفيناك بوتاسيوم', category: 'Pain Relief', defaultSellingPrice: '36.00', margin: '25', taxable: false, trackExpiry: true, requirePrescription: OTC, unit: S, unitsPerPack: 2 },
  { nameEn: 'Cataflam D 50mg Dispersible', nameAr: 'كتافلام د 50 مجم فوار', genericNameEn: 'Diclofenac Potassium', genericNameAr: 'ديكلوفيناك بوتاسيوم', category: 'Pain Relief', defaultSellingPrice: '42.00', margin: '25', taxable: false, trackExpiry: true, requirePrescription: OTC, unit: SC, unitsPerPack: 12 },
  { nameEn: 'Voltaren 50mg Tablets', nameAr: 'فولتارين 50 مجم أقراص', genericNameEn: 'Diclofenac Sodium', genericNameAr: 'ديكلوفيناك صوديوم', category: 'Pain Relief', defaultSellingPrice: '42.00', margin: '22', taxable: false, trackExpiry: true, requirePrescription: OTC, unit: S, unitsPerPack: 2 },
  { nameEn: 'Olfen 100mg SR Capsules', nameAr: 'أولفين 100 مجم كبسول ممتد المفعول', genericNameEn: 'Diclofenac Sodium', genericNameAr: 'ديكلوفيناك صوديوم', category: 'Pain Relief', defaultSellingPrice: '42.00', margin: '22', taxable: false, trackExpiry: true, requirePrescription: OTC, unit: S, unitsPerPack: 1 },
  { nameEn: 'Ketofan 25mg Capsules', nameAr: 'كيتوفان 25 مجم كبسول', genericNameEn: 'Ketoprofen', genericNameAr: 'كيتوبروفين', category: 'Pain Relief', defaultSellingPrice: '24.00', margin: '25', taxable: false, trackExpiry: true, requirePrescription: OTC, unit: S, unitsPerPack: 2 },
  { nameEn: 'Novalgin 500mg Tablets', nameAr: 'نوفالجين 500 مجم أقراص', genericNameEn: 'Metamizole (Dipyrone)', genericNameAr: 'ميتاميزول (ديبيرون)', category: 'Pain Relief', defaultSellingPrice: '18.00', margin: '25', taxable: false, trackExpiry: true, requirePrescription: OTC, unit: S, unitsPerPack: 2 },
  { nameEn: 'Aspirin 300mg Tablets', nameAr: 'أسبرين 300 مجم أقراص', genericNameEn: 'Acetylsalicylic Acid', genericNameAr: 'حمض الأسيتيل ساليسيليك', category: 'Pain Relief', defaultSellingPrice: '12.00', margin: '28', taxable: false, trackExpiry: true, requirePrescription: OTC, unit: S, unitsPerPack: 2 },
  { nameEn: 'Paramol Tablets', nameAr: 'بارامول أقراص', genericNameEn: 'Paracetamol', genericNameAr: 'باراسيتامول', category: 'Pain Relief', defaultSellingPrice: '9.00', margin: '30', taxable: false, trackExpiry: true, requirePrescription: OTC, unit: S, unitsPerPack: 2 },
  { nameEn: 'Paracetamol 500mg (Generic)', nameAr: 'باراسيتامول 500 مجم (جنيس)', genericNameEn: 'Paracetamol', genericNameAr: 'باراسيتامول', category: 'Pain Relief', defaultSellingPrice: '6.00', margin: '35', taxable: false, trackExpiry: true, requirePrescription: OTC, unit: S, unitsPerPack: 2 },
  { nameEn: 'Ketorol 10mg Tablets', nameAr: 'كيتورول 10 مجم أقراص', genericNameEn: 'Ketorolac', genericNameAr: 'كيتورولاك', category: 'Pain Relief', defaultSellingPrice: '30.00', margin: '22', taxable: false, trackExpiry: true, requirePrescription: RX, unit: S, unitsPerPack: 2 },
  { nameEn: 'Celebrex 200mg Capsules', nameAr: 'سيليبريكس 200 مجم كبسول', genericNameEn: 'Celecoxib', genericNameAr: 'سيليكوكسيب', category: 'Pain Relief', defaultSellingPrice: '72.00', margin: '20', taxable: false, trackExpiry: true, requirePrescription: RX, unit: B, unitsPerPack: 10 },
  { nameEn: 'Catafast 50mg Sachets', nameAr: 'كتافاست 50 مجم أكياس', genericNameEn: 'Diclofenac Potassium', genericNameAr: 'ديكلوفيناك بوتاسيوم', category: 'Pain Relief', defaultSellingPrice: '48.00', margin: '22', taxable: false, trackExpiry: true, requirePrescription: OTC, unit: SC, unitsPerPack: 9 },

  // ═══════════════════════════════════════════════════════════════════
  //  2. ANTIBIOTICS  (مضادات حيوية)
  // ═══════════════════════════════════════════════════════════════════
  { nameEn: 'Augmentin 1g Tablets', nameAr: 'أوجمنتين 1 جم أقراص', genericNameEn: 'Amoxicillin + Clavulanic Acid', genericNameAr: 'أموكسيسيللين + حمض الكلافيولانيك', category: 'Antibiotics', defaultSellingPrice: '126.00', margin: '20', taxable: false, trackExpiry: true, requirePrescription: RX, unit: B, unitsPerPack: 14 },
  { nameEn: 'Augmentin 625mg Tablets', nameAr: 'أوجمنتين 625 مجم أقراص', genericNameEn: 'Amoxicillin + Clavulanic Acid', genericNameAr: 'أموكسيسيللين + حمض الكلافيولانيك', category: 'Antibiotics', defaultSellingPrice: '90.00', margin: '20', taxable: false, trackExpiry: true, requirePrescription: RX, unit: B, unitsPerPack: 14 },
  { nameEn: 'Hibiotic 1g Tablets', nameAr: 'هايبيوتك 1 جم أقراص', genericNameEn: 'Amoxicillin + Clavulanic Acid', genericNameAr: 'أموكسيسيللين + حمض الكلافيولانيك', category: 'Antibiotics', defaultSellingPrice: '84.00', margin: '22', taxable: false, trackExpiry: true, requirePrescription: RX, unit: B, unitsPerPack: 14 },
  { nameEn: 'Curam 1g Tablets', nameAr: 'كيورام 1 جم أقراص', genericNameEn: 'Amoxicillin + Clavulanic Acid', genericNameAr: 'أموكسيسيللين + حمض الكلافيولانيك', category: 'Antibiotics', defaultSellingPrice: '78.00', margin: '22', taxable: false, trackExpiry: true, requirePrescription: RX, unit: B, unitsPerPack: 14 },
  { nameEn: 'Megamox 1g Tablets', nameAr: 'ميجاموكس 1 جم أقراص', genericNameEn: 'Amoxicillin + Clavulanic Acid', genericNameAr: 'أموكسيسيللين + حمض الكلافيولانيك', category: 'Antibiotics', defaultSellingPrice: '72.00', margin: '22', taxable: false, trackExpiry: true, requirePrescription: RX, unit: B, unitsPerPack: 14 },
  { nameEn: 'Amoxil 500mg Capsules', nameAr: 'أموكسيل 500 مجم كبسول', genericNameEn: 'Amoxicillin', genericNameAr: 'أموكسيسيللين', category: 'Antibiotics', defaultSellingPrice: '36.00', margin: '25', taxable: false, trackExpiry: true, requirePrescription: RX, unit: B, unitsPerPack: 12 },
  { nameEn: 'E-Mox 500mg Capsules', nameAr: 'إي-موكس 500 مجم كبسول', genericNameEn: 'Amoxicillin', genericNameAr: 'أموكسيسيللين', category: 'Antibiotics', defaultSellingPrice: '21.00', margin: '28', taxable: false, trackExpiry: true, requirePrescription: RX, unit: B, unitsPerPack: 12 },
  { nameEn: 'Flumox 500mg Capsules', nameAr: 'فلوموكس 500 مجم كبسول', genericNameEn: 'Amoxicillin + Flucloxacillin', genericNameAr: 'أموكسيسيللين + فلوكلوكساسيللين', category: 'Antibiotics', defaultSellingPrice: '42.00', margin: '25', taxable: false, trackExpiry: true, requirePrescription: RX, unit: B, unitsPerPack: 12 },
  { nameEn: 'Flumox 1g Tablets', nameAr: 'فلوموكس 1 جم أقراص', genericNameEn: 'Amoxicillin + Flucloxacillin', genericNameAr: 'أموكسيسيللين + فلوكلوكساسيللين', category: 'Antibiotics', defaultSellingPrice: '60.00', margin: '22', taxable: false, trackExpiry: true, requirePrescription: RX, unit: B, unitsPerPack: 12 },
  { nameEn: 'Flagyl 500mg Tablets', nameAr: 'فلاجيل 500 مجم أقراص', genericNameEn: 'Metronidazole', genericNameAr: 'ميترونيدازول', category: 'Antibiotics', defaultSellingPrice: '18.00', margin: '25', taxable: false, trackExpiry: true, requirePrescription: RX, unit: S, unitsPerPack: 2 },
  { nameEn: 'Amrizole 500mg Tablets', nameAr: 'أمريزول 500 مجم أقراص', genericNameEn: 'Metronidazole', genericNameAr: 'ميترونيدازول', category: 'Antibiotics', defaultSellingPrice: '12.00', margin: '28', taxable: false, trackExpiry: true, requirePrescription: RX, unit: S, unitsPerPack: 2 },
  { nameEn: 'Cipro 500mg Tablets', nameAr: 'سيبرو 500 مجم أقراص', genericNameEn: 'Ciprofloxacin', genericNameAr: 'سيبروفلوكساسين', category: 'Antibiotics', defaultSellingPrice: '48.00', margin: '22', taxable: false, trackExpiry: true, requirePrescription: RX, unit: B, unitsPerPack: 10 },
  { nameEn: 'Ciprocin 500mg Tablets', nameAr: 'سيبروسين 500 مجم أقراص', genericNameEn: 'Ciprofloxacin', genericNameAr: 'سيبروفلوكساسين', category: 'Antibiotics', defaultSellingPrice: '30.00', margin: '25', taxable: false, trackExpiry: true, requirePrescription: RX, unit: B, unitsPerPack: 10 },
  { nameEn: 'Klacid 500mg Tablets', nameAr: 'كلاسيد 500 مجم أقراص', genericNameEn: 'Clarithromycin', genericNameAr: 'كلاريثروميسين', category: 'Antibiotics', defaultSellingPrice: '102.00', margin: '20', taxable: false, trackExpiry: true, requirePrescription: RX, unit: B, unitsPerPack: 14 },
  { nameEn: 'Zithromax 500mg Tablets', nameAr: 'زيثروماكس 500 مجم أقراص', genericNameEn: 'Azithromycin', genericNameAr: 'أزيثروميسين', category: 'Antibiotics', defaultSellingPrice: '78.00', margin: '22', taxable: false, trackExpiry: true, requirePrescription: RX, unit: B, unitsPerPack: 3 },
  { nameEn: 'Azrolid 500mg Tablets', nameAr: 'أزروليد 500 مجم أقراص', genericNameEn: 'Azithromycin', genericNameAr: 'أزيثروميسين', category: 'Antibiotics', defaultSellingPrice: '48.00', margin: '25', taxable: false, trackExpiry: true, requirePrescription: RX, unit: B, unitsPerPack: 3 },
  { nameEn: 'Suprax 400mg Capsules', nameAr: 'سوبراكس 400 مجم كبسول', genericNameEn: 'Cefixime', genericNameAr: 'سيفيكسيم', category: 'Antibiotics', defaultSellingPrice: '96.00', margin: '20', taxable: false, trackExpiry: true, requirePrescription: RX, unit: B, unitsPerPack: 5 },
  { nameEn: 'Tavanic 500mg Tablets', nameAr: 'تافانيك 500 مجم أقراص', genericNameEn: 'Levofloxacin', genericNameAr: 'ليفوفلوكساسين', category: 'Antibiotics', defaultSellingPrice: '90.00', margin: '20', taxable: false, trackExpiry: true, requirePrescription: RX, unit: B, unitsPerPack: 5 },
  { nameEn: 'Keflex 500mg Capsules', nameAr: 'كيفلكس 500 مجم كبسول', genericNameEn: 'Cefalexin', genericNameAr: 'سيفاليكسين', category: 'Antibiotics', defaultSellingPrice: '54.00', margin: '22', taxable: false, trackExpiry: true, requirePrescription: RX, unit: B, unitsPerPack: 8 },
  { nameEn: 'Zinnat 500mg Tablets', nameAr: 'زينات 500 مجم أقراص', genericNameEn: 'Cefuroxime Axetil', genericNameAr: 'سيفيوروكسيم أكسيتيل', category: 'Antibiotics', defaultSellingPrice: '84.00', margin: '22', taxable: false, trackExpiry: true, requirePrescription: RX, unit: B, unitsPerPack: 10 },
  { nameEn: 'Unasyn 375mg Tablets', nameAr: 'يوناسين 375 مجم أقراص', genericNameEn: 'Ampicillin + Sulbactam', genericNameAr: 'أمبيسيللين + سولباكتام', category: 'Antibiotics', defaultSellingPrice: '54.00', margin: '22', taxable: false, trackExpiry: true, requirePrescription: RX, unit: B, unitsPerPack: 12 },
  { nameEn: 'Vibramycin 100mg Capsules', nameAr: 'فيبراميسين 100 مجم كبسول', genericNameEn: 'Doxycycline', genericNameAr: 'دوكسيسيكلين', category: 'Antibiotics', defaultSellingPrice: '36.00', margin: '25', taxable: false, trackExpiry: true, requirePrescription: RX, unit: B, unitsPerPack: 10 },
  { nameEn: 'Dalacin C 300mg Capsules', nameAr: 'دالاسين سي 300 مجم كبسول', genericNameEn: 'Clindamycin', genericNameAr: 'كليندامايسين', category: 'Antibiotics', defaultSellingPrice: '60.00', margin: '22', taxable: false, trackExpiry: true, requirePrescription: RX, unit: B, unitsPerPack: 16 },
  { nameEn: 'Antinal 200mg Capsules', nameAr: 'أنتينال 200 مجم كبسول', genericNameEn: 'Nifuroxazide', genericNameAr: 'نيفيوروكسازيد', category: 'Antibiotics', defaultSellingPrice: '27.00', margin: '28', taxable: false, trackExpiry: true, requirePrescription: OTC, unit: B, unitsPerPack: 24 },

  // ═══════════════════════════════════════════════════════════════════
  //  3. COLD & FLU  (البرد والانفلونزا)
  // ═══════════════════════════════════════════════════════════════════
  { nameEn: 'Comtrex Cold & Flu Tablets', nameAr: 'كومتركس أقراص', genericNameEn: 'Paracetamol + Pseudoephedrine + Dextromethorphan + Chlorpheniramine', genericNameAr: 'باراسيتامول + سودوإفيدرين + ديكستروميثورفان + كلورفينيرامين', category: 'Cold & Flu', defaultSellingPrice: '42.00', margin: '25', taxable: false, trackExpiry: true, requirePrescription: OTC, unit: B, unitsPerPack: 20 },
  { nameEn: 'Congestal Tablets', nameAr: 'كونجستال أقراص', genericNameEn: 'Paracetamol + Pseudoephedrine + Chlorpheniramine', genericNameAr: 'باراسيتامول + سودوإفيدرين + كلورفينيرامين', category: 'Cold & Flu', defaultSellingPrice: '24.00', margin: '30', taxable: false, trackExpiry: true, requirePrescription: OTC, unit: S, unitsPerPack: 2 },
  { nameEn: 'Flurest Tablets', nameAr: 'فلورست أقراص', genericNameEn: 'Paracetamol + Pseudoephedrine + Chlorpheniramine', genericNameAr: 'باراسيتامول + سودوإفيدرين + كلورفينيرامين', category: 'Cold & Flu', defaultSellingPrice: '21.00', margin: '30', taxable: false, trackExpiry: true, requirePrescription: OTC, unit: S, unitsPerPack: 2 },
  { nameEn: '123 Cold & Flu Tablets', nameAr: 'وان تو ثري أقراص', genericNameEn: 'Paracetamol + Chlorpheniramine + Pseudoephedrine', genericNameAr: 'باراسيتامول + كلورفينيرامين + سودوإفيدرين', category: 'Cold & Flu', defaultSellingPrice: '15.00', margin: '30', taxable: false, trackExpiry: true, requirePrescription: OTC, unit: S, unitsPerPack: 2 },
  { nameEn: 'Power Caps Capsules', nameAr: 'باور كابس كبسول', genericNameEn: 'Paracetamol + Pseudoephedrine + Chlorpheniramine', genericNameAr: 'باراسيتامول + سودوإفيدرين + كلورفينيرامين', category: 'Cold & Flu', defaultSellingPrice: '18.00', margin: '30', taxable: false, trackExpiry: true, requirePrescription: OTC, unit: S, unitsPerPack: 2 },
  { nameEn: 'Panadol Cold & Flu Tablets', nameAr: 'بانادول كولد أند فلو أقراص', genericNameEn: 'Paracetamol + Pseudoephedrine + Chlorpheniramine', genericNameAr: 'باراسيتامول + سودوإفيدرين + كلورفينيرامين', category: 'Cold & Flu', defaultSellingPrice: '36.00', margin: '25', taxable: false, trackExpiry: true, requirePrescription: OTC, unit: S, unitsPerPack: 2 },
  { nameEn: 'Grippostad C Capsules', nameAr: 'جريبوستاد سي كبسول', genericNameEn: 'Paracetamol + Ascorbic Acid + Caffeine + Chlorpheniramine', genericNameAr: 'باراسيتامول + فيتامين سي + كافيين + كلورفينيرامين', category: 'Cold & Flu', defaultSellingPrice: '36.00', margin: '25', taxable: false, trackExpiry: true, requirePrescription: OTC, unit: S, unitsPerPack: 2 },
  { nameEn: 'C-Retard Capsules', nameAr: 'سي ريتارد كبسول', genericNameEn: 'Vitamin C 500mg Sustained Release', genericNameAr: 'فيتامين سي 500 مجم ممتد المفعول', category: 'Cold & Flu', defaultSellingPrice: '18.00', margin: '30', taxable: false, trackExpiry: true, requirePrescription: OTC, unit: S, unitsPerPack: 1 },
  { nameEn: 'Night & Day Tablets', nameAr: 'نايت آند داي أقراص', genericNameEn: 'Paracetamol + Pseudoephedrine + Dextromethorphan', genericNameAr: 'باراسيتامول + سودوإفيدرين + ديكستروميثورفان', category: 'Cold & Flu', defaultSellingPrice: '24.00', margin: '28', taxable: false, trackExpiry: true, requirePrescription: OTC, unit: S, unitsPerPack: 2 },
  { nameEn: 'Sinupret Tablets', nameAr: 'سينوبريت أقراص', genericNameEn: 'Herbal Sinusitis Combination', genericNameAr: 'مستخلص أعشاب للجيوب الأنفية', category: 'Cold & Flu', defaultSellingPrice: '90.00', margin: '22', taxable: false, trackExpiry: true, requirePrescription: OTC, unit: B, unitsPerPack: 50 },
  { nameEn: 'Coldal Tablets', nameAr: 'كولدال أقراص', genericNameEn: 'Paracetamol + Pseudoephedrine + Chlorpheniramine', genericNameAr: 'باراسيتامول + سودوإفيدرين + كلورفينيرامين', category: 'Cold & Flu', defaultSellingPrice: '12.00', margin: '30', taxable: false, trackExpiry: true, requirePrescription: OTC, unit: S, unitsPerPack: 2 },

  // ═══════════════════════════════════════════════════════════════════
  //  4. COUGH & SORE THROAT  (الكحة والتهاب الحلق)
  // ═══════════════════════════════════════════════════════════════════
  { nameEn: 'Selgon Tablets', nameAr: 'سلجون أقراص', genericNameEn: 'Pipazethate', genericNameAr: 'بيبازيثات', category: 'Cough & Sore Throat', defaultSellingPrice: '18.00', margin: '28', taxable: false, trackExpiry: true, requirePrescription: OTC, unit: S, unitsPerPack: 2 },
  { nameEn: 'Sinecod Syrup', nameAr: 'سينيكود شراب', genericNameEn: 'Butamirate Citrate', genericNameAr: 'بيوتاميرات سيترات', category: 'Cough & Sore Throat', defaultSellingPrice: '36.00', margin: '25', taxable: false, trackExpiry: true, requirePrescription: OTC, unit: BT, unitsPerPack: 1 },
  { nameEn: 'Prospan Syrup', nameAr: 'بروسبان شراب', genericNameEn: 'Ivy Leaf Extract', genericNameAr: 'مستخلص أوراق اللبلاب', category: 'Cough & Sore Throat', defaultSellingPrice: '48.00', margin: '25', taxable: false, trackExpiry: true, requirePrescription: OTC, unit: BT, unitsPerPack: 1 },
  { nameEn: 'Toplexil Syrup', nameAr: 'توبلكسيل شراب', genericNameEn: 'Oxomemazine', genericNameAr: 'أوكسوميمازين', category: 'Cough & Sore Throat', defaultSellingPrice: '30.00', margin: '25', taxable: false, trackExpiry: true, requirePrescription: OTC, unit: BT, unitsPerPack: 1 },
  { nameEn: 'Bronchicum Syrup', nameAr: 'برونشيكم شراب', genericNameEn: 'Thyme Fluid Extract', genericNameAr: 'مستخلص الزعتر', category: 'Cough & Sore Throat', defaultSellingPrice: '42.00', margin: '25', taxable: false, trackExpiry: true, requirePrescription: OTC, unit: BT, unitsPerPack: 1 },
  { nameEn: 'Mucosol Syrup', nameAr: 'ميوكوسول شراب', genericNameEn: 'Carbocisteine', genericNameAr: 'كاربوسيستايين', category: 'Cough & Sore Throat', defaultSellingPrice: '18.00', margin: '28', taxable: false, trackExpiry: true, requirePrescription: OTC, unit: BT, unitsPerPack: 1 },
  { nameEn: 'Rhinathiol Syrup Adults', nameAr: 'رينثيول شراب كبار', genericNameEn: 'Carbocisteine', genericNameAr: 'كاربوسيستايين', category: 'Cough & Sore Throat', defaultSellingPrice: '36.00', margin: '25', taxable: false, trackExpiry: true, requirePrescription: OTC, unit: BT, unitsPerPack: 1 },
  { nameEn: 'Ultrasolv 375mg Sachets', nameAr: 'ألتراسولف 375 مجم أكياس فوارة', genericNameEn: 'Erdosteine', genericNameAr: 'إردوستين', category: 'Cough & Sore Throat', defaultSellingPrice: '48.00', margin: '22', taxable: false, trackExpiry: true, requirePrescription: OTC, unit: SC, unitsPerPack: 10 },
  { nameEn: 'ACC 200mg Sachets', nameAr: 'إيه سي سي 200 مجم فوار', genericNameEn: 'Acetylcysteine', genericNameAr: 'أسيتيل سيستايين', category: 'Cough & Sore Throat', defaultSellingPrice: '30.00', margin: '25', taxable: false, trackExpiry: true, requirePrescription: OTC, unit: SC, unitsPerPack: 10 },
  { nameEn: 'Strepsils Lozenges', nameAr: 'ستريبسلز أقراص استحلاب', genericNameEn: 'Amylmetacresol + Dichlorobenzyl Alcohol', genericNameAr: 'أميل ميتاكريسول + ثنائي كلوروبنزيل', category: 'Cough & Sore Throat', defaultSellingPrice: '30.00', margin: '28', taxable: false, trackExpiry: true, requirePrescription: OTC, unit: B, unitsPerPack: 24 },

  // ═══════════════════════════════════════════════════════════════════
  //  5. DIGESTIVE HEALTH  (الجهاز الهضمي)
  // ═══════════════════════════════════════════════════════════════════
  { nameEn: 'Nexium 40mg Capsules', nameAr: 'نكسيوم 40 مجم كبسول', genericNameEn: 'Esomeprazole', genericNameAr: 'إيزوميبرازول', category: 'Digestive Health', defaultSellingPrice: '126.00', margin: '20', taxable: false, trackExpiry: true, requirePrescription: RX, unit: B, unitsPerPack: 14 },
  { nameEn: 'Nexium 20mg Capsules', nameAr: 'نكسيوم 20 مجم كبسول', genericNameEn: 'Esomeprazole', genericNameAr: 'إيزوميبرازول', category: 'Digestive Health', defaultSellingPrice: '90.00', margin: '20', taxable: false, trackExpiry: true, requirePrescription: RX, unit: B, unitsPerPack: 14 },
  { nameEn: 'Controloc 40mg Tablets', nameAr: 'كونترولوك 40 مجم أقراص', genericNameEn: 'Pantoprazole', genericNameAr: 'بانتوبرازول', category: 'Digestive Health', defaultSellingPrice: '96.00', margin: '20', taxable: false, trackExpiry: true, requirePrescription: RX, unit: B, unitsPerPack: 14 },
  { nameEn: 'Controloc 20mg Tablets', nameAr: 'كونترولوك 20 مجم أقراص', genericNameEn: 'Pantoprazole', genericNameAr: 'بانتوبرازول', category: 'Digestive Health', defaultSellingPrice: '66.00', margin: '22', taxable: false, trackExpiry: true, requirePrescription: RX, unit: B, unitsPerPack: 14 },
  { nameEn: 'Losec 20mg Capsules', nameAr: 'لوسيك 20 مجم كبسول', genericNameEn: 'Omeprazole', genericNameAr: 'أوميبرازول', category: 'Digestive Health', defaultSellingPrice: '66.00', margin: '22', taxable: false, trackExpiry: true, requirePrescription: RX, unit: B, unitsPerPack: 14 },
  { nameEn: 'Omepak 20mg Capsules', nameAr: 'أوميباك 20 مجم كبسول', genericNameEn: 'Omeprazole', genericNameAr: 'أوميبرازول', category: 'Digestive Health', defaultSellingPrice: '30.00', margin: '28', taxable: false, trackExpiry: true, requirePrescription: RX, unit: B, unitsPerPack: 14 },
  { nameEn: 'Pariet 20mg Tablets', nameAr: 'باريت 20 مجم أقراص', genericNameEn: 'Rabeprazole', genericNameAr: 'رابيبرازول', category: 'Digestive Health', defaultSellingPrice: '78.00', margin: '20', taxable: false, trackExpiry: true, requirePrescription: RX, unit: B, unitsPerPack: 14 },
  { nameEn: 'Gaviscon Advance Suspension', nameAr: 'جافيسكون أدفانس معلق', genericNameEn: 'Sodium Alginate + Potassium Bicarbonate', genericNameAr: 'ألجينات صوديوم + بيكربونات بوتاسيوم', category: 'Digestive Health', defaultSellingPrice: '78.00', margin: '22', taxable: false, trackExpiry: true, requirePrescription: OTC, unit: BT, unitsPerPack: 1 },
  { nameEn: 'Gaviscon Advance Sachets', nameAr: 'جافيسكون أدفانس أكياس', genericNameEn: 'Sodium Alginate + Potassium Bicarbonate', genericNameAr: 'ألجينات صوديوم + بيكربونات بوتاسيوم', category: 'Digestive Health', defaultSellingPrice: '60.00', margin: '22', taxable: false, trackExpiry: true, requirePrescription: OTC, unit: SC, unitsPerPack: 12 },
  { nameEn: 'Motilium 10mg Tablets', nameAr: 'موتيليوم 10 مجم أقراص', genericNameEn: 'Domperidone', genericNameAr: 'دومبيريدون', category: 'Digestive Health', defaultSellingPrice: '36.00', margin: '25', taxable: false, trackExpiry: true, requirePrescription: OTC, unit: B, unitsPerPack: 30 },
  { nameEn: 'Buscopan 10mg Tablets', nameAr: 'بوسكوبان 10 مجم أقراص', genericNameEn: 'Hyoscine Butylbromide', genericNameAr: 'هيوسين بيوتيل بروميد', category: 'Digestive Health', defaultSellingPrice: '30.00', margin: '25', taxable: false, trackExpiry: true, requirePrescription: OTC, unit: S, unitsPerPack: 2 },
  { nameEn: 'Spasmofree 10mg Tablets', nameAr: 'سبازموفري 10 مجم أقراص', genericNameEn: 'Alverine Citrate', genericNameAr: 'ألفيرين سيترات', category: 'Digestive Health', defaultSellingPrice: '21.00', margin: '30', taxable: false, trackExpiry: true, requirePrescription: OTC, unit: S, unitsPerPack: 2 },
  { nameEn: 'Duspatalin 200mg Capsules', nameAr: 'دوسباتالين 200 مجم كبسول', genericNameEn: 'Mebeverine', genericNameAr: 'ميبيفيرين', category: 'Digestive Health', defaultSellingPrice: '60.00', margin: '22', taxable: false, trackExpiry: true, requirePrescription: OTC, unit: B, unitsPerPack: 30 },
  { nameEn: 'Coloverin D Tablets', nameAr: 'كولوفيرين د أقراص', genericNameEn: 'Mebeverine + Dimethicone', genericNameAr: 'ميبيفيرين + دايميثيكون', category: 'Digestive Health', defaultSellingPrice: '36.00', margin: '25', taxable: false, trackExpiry: true, requirePrescription: OTC, unit: B, unitsPerPack: 30 },
  { nameEn: 'Duphalac Syrup', nameAr: 'دوفالاك شراب', genericNameEn: 'Lactulose', genericNameAr: 'لاكتيلوز', category: 'Digestive Health', defaultSellingPrice: '48.00', margin: '22', taxable: false, trackExpiry: true, requirePrescription: OTC, unit: BT, unitsPerPack: 1 },
  { nameEn: 'Smecta Sachets', nameAr: 'سميكتا أكياس', genericNameEn: 'Diosmectite', genericNameAr: 'ديوسميكتايت', category: 'Digestive Health', defaultSellingPrice: '36.00', margin: '25', taxable: false, trackExpiry: true, requirePrescription: OTC, unit: SC, unitsPerPack: 10 },
  { nameEn: 'Imodium 2mg Capsules', nameAr: 'إيموديوم 2 مجم كبسول', genericNameEn: 'Loperamide', genericNameAr: 'لوبيراميد', category: 'Digestive Health', defaultSellingPrice: '18.00', margin: '25', taxable: false, trackExpiry: true, requirePrescription: OTC, unit: S, unitsPerPack: 1 },
  { nameEn: 'Librax Tablets', nameAr: 'ليبراكس أقراص', genericNameEn: 'Chlordiazepoxide + Clidinium', genericNameAr: 'كلورديازيبوكسيد + كليدينيوم', category: 'Digestive Health', defaultSellingPrice: '18.00', margin: '25', taxable: false, trackExpiry: true, requirePrescription: RX, unit: S, unitsPerPack: 2 },
  { nameEn: 'Lacteol Fort Sachets', nameAr: 'لاكتيول فورت أكياس', genericNameEn: 'Lactobacillus LB', genericNameAr: 'لاكتوباسيلس أل بي', category: 'Digestive Health', defaultSellingPrice: '42.00', margin: '25', taxable: false, trackExpiry: true, requirePrescription: OTC, unit: SC, unitsPerPack: 12 },

  // ═══════════════════════════════════════════════════════════════════
  //  6. ALLERGY  (الحساسية)
  // ═══════════════════════════════════════════════════════════════════
  { nameEn: 'Zyrtec 10mg Tablets', nameAr: 'زيرتك 10 مجم أقراص', genericNameEn: 'Cetirizine', genericNameAr: 'سيتيريزين', category: 'Allergy', defaultSellingPrice: '48.00', margin: '25', taxable: false, trackExpiry: true, requirePrescription: OTC, unit: B, unitsPerPack: 20 },
  { nameEn: 'Telfast 120mg Tablets', nameAr: 'تلفاست 120 مجم أقراص', genericNameEn: 'Fexofenadine', genericNameAr: 'فيكسوفينادين', category: 'Allergy', defaultSellingPrice: '66.00', margin: '22', taxable: false, trackExpiry: true, requirePrescription: OTC, unit: B, unitsPerPack: 20 },
  { nameEn: 'Telfast 180mg Tablets', nameAr: 'تلفاست 180 مجم أقراص', genericNameEn: 'Fexofenadine', genericNameAr: 'فيكسوفينادين', category: 'Allergy', defaultSellingPrice: '78.00', margin: '22', taxable: false, trackExpiry: true, requirePrescription: OTC, unit: B, unitsPerPack: 20 },
  { nameEn: 'Claritine 10mg Tablets', nameAr: 'كلاريتين 10 مجم أقراص', genericNameEn: 'Loratadine', genericNameAr: 'لوراتادين', category: 'Allergy', defaultSellingPrice: '54.00', margin: '25', taxable: false, trackExpiry: true, requirePrescription: OTC, unit: B, unitsPerPack: 20 },
  { nameEn: 'Aerius 5mg Tablets', nameAr: 'إيريوس 5 مجم أقراص', genericNameEn: 'Desloratadine', genericNameAr: 'ديسلوراتادين', category: 'Allergy', defaultSellingPrice: '72.00', margin: '22', taxable: false, trackExpiry: true, requirePrescription: OTC, unit: B, unitsPerPack: 20 },
  { nameEn: 'Fenistil Drops', nameAr: 'فنستيل نقط', genericNameEn: 'Dimethindene Maleate', genericNameAr: 'دايميثيندين ماليات', category: 'Allergy', defaultSellingPrice: '36.00', margin: '25', taxable: false, trackExpiry: true, requirePrescription: OTC, unit: BT, unitsPerPack: 1 },
  { nameEn: 'Tavegyl 1mg Tablets', nameAr: 'تافيجيل 1 مجم أقراص', genericNameEn: 'Clemastine', genericNameAr: 'كليماستين', category: 'Allergy', defaultSellingPrice: '18.00', margin: '28', taxable: false, trackExpiry: true, requirePrescription: OTC, unit: S, unitsPerPack: 2 },
  { nameEn: 'Xyzal 5mg Tablets', nameAr: 'زيزال 5 مجم أقراص', genericNameEn: 'Levocetirizine', genericNameAr: 'ليفوسيتيريزين', category: 'Allergy', defaultSellingPrice: '60.00', margin: '22', taxable: false, trackExpiry: true, requirePrescription: OTC, unit: B, unitsPerPack: 20 },

  // ═══════════════════════════════════════════════════════════════════
  //  7. VITAMINS & SUPPLEMENTS  (فيتامينات ومكملات)
  // ═══════════════════════════════════════════════════════════════════
  { nameEn: 'Vitamin C 1000mg Effervescent', nameAr: 'فيتامين سي 1000 مجم فوار', genericNameEn: 'Ascorbic Acid', genericNameAr: 'حمض الأسكوربيك', category: 'Vitamins & Supplements', defaultSellingPrice: '42.00', margin: '30', taxable: false, trackExpiry: true, requirePrescription: OTC, unit: T, unitsPerPack: 20 },
  { nameEn: 'Cevitil 1000mg Effervescent', nameAr: 'سيفيتيل 1000 مجم فوار', genericNameEn: 'Ascorbic Acid', genericNameAr: 'حمض الأسكوربيك', category: 'Vitamins & Supplements', defaultSellingPrice: '30.00', margin: '30', taxable: false, trackExpiry: true, requirePrescription: OTC, unit: T, unitsPerPack: 10 },
  { nameEn: 'Zinc 50mg Capsules', nameAr: 'زنك 50 مجم كبسول', genericNameEn: 'Zinc', genericNameAr: 'زنك', category: 'Vitamins & Supplements', defaultSellingPrice: '48.00', margin: '30', taxable: false, trackExpiry: true, requirePrescription: OTC, unit: B, unitsPerPack: 30 },
  { nameEn: 'Zinctron Capsules', nameAr: 'زنكترون كبسول', genericNameEn: 'Zinc + Vitamin C + B6', genericNameAr: 'زنك + فيتامين سي + ب6', category: 'Vitamins & Supplements', defaultSellingPrice: '42.00', margin: '28', taxable: false, trackExpiry: true, requirePrescription: OTC, unit: B, unitsPerPack: 20 },
  { nameEn: 'Omega-3 Fish Oil 1000mg', nameAr: 'أوميجا 3 زيت السمك 1000 مجم', genericNameEn: 'Omega-3 Fatty Acids (EPA + DHA)', genericNameAr: 'أحماض أوميجا 3 الدهنية', category: 'Vitamins & Supplements', defaultSellingPrice: '90.00', margin: '28', taxable: false, trackExpiry: true, requirePrescription: OTC, unit: B, unitsPerPack: 30 },
  { nameEn: 'Calcium + Vitamin D3 Tablets', nameAr: 'كالسيوم + فيتامين د3 أقراص', genericNameEn: 'Calcium Carbonate + Cholecalciferol', genericNameAr: 'كربونات الكالسيوم + كوليكالسيفيرول', category: 'Vitamins & Supplements', defaultSellingPrice: '42.00', margin: '28', taxable: false, trackExpiry: true, requirePrescription: OTC, unit: B, unitsPerPack: 30 },
  { nameEn: 'Feroglobin Capsules', nameAr: 'فيروجلوبين كبسولات', genericNameEn: 'Iron + Folic Acid + B12 + Zinc', genericNameAr: 'حديد + حمض الفوليك + ب12 + زنك', category: 'Vitamins & Supplements', defaultSellingPrice: '126.00', margin: '25', taxable: false, trackExpiry: true, requirePrescription: OTC, unit: B, unitsPerPack: 30 },
  { nameEn: 'Vitamount Capsules', nameAr: 'فيتاماونت كبسولات', genericNameEn: 'Multivitamin + Minerals', genericNameAr: 'فيتامينات ومعادن متعددة', category: 'Vitamins & Supplements', defaultSellingPrice: '72.00', margin: '28', taxable: false, trackExpiry: true, requirePrescription: OTC, unit: B, unitsPerPack: 30 },
  { nameEn: 'Vitamin D3 10000 IU Capsules', nameAr: 'فيتامين د3 10000 وحدة كبسول', genericNameEn: 'Cholecalciferol', genericNameAr: 'كوليكالسيفيرول', category: 'Vitamins & Supplements', defaultSellingPrice: '120.00', margin: '25', taxable: false, trackExpiry: true, requirePrescription: OTC, unit: B, unitsPerPack: 30 },
  { nameEn: 'Vitamin D3 5000 IU Tablets', nameAr: 'فيتامين د3 5000 وحدة أقراص', genericNameEn: 'Cholecalciferol', genericNameAr: 'كوليكالسيفيرول', category: 'Vitamins & Supplements', defaultSellingPrice: '84.00', margin: '25', taxable: false, trackExpiry: true, requirePrescription: OTC, unit: B, unitsPerPack: 30 },
  { nameEn: 'Magnesium Glycinate 400mg', nameAr: 'ماغنسيوم جلايسينات 400 مجم', genericNameEn: 'Magnesium', genericNameAr: 'ماغنسيوم', category: 'Vitamins & Supplements', defaultSellingPrice: '96.00', margin: '28', taxable: false, trackExpiry: true, requirePrescription: OTC, unit: B, unitsPerPack: 30 },
  { nameEn: 'Folic Acid 5mg Tablets', nameAr: 'حمض الفوليك 5 مجم أقراص', genericNameEn: 'Folic Acid', genericNameAr: 'حمض الفوليك', category: 'Vitamins & Supplements', defaultSellingPrice: '12.00', margin: '30', taxable: false, trackExpiry: true, requirePrescription: OTC, unit: S, unitsPerPack: 3 },
  { nameEn: 'Centrum Adults Tablets', nameAr: 'سنتروم أقراص للكبار', genericNameEn: 'Multivitamin + Minerals', genericNameAr: 'فيتامينات ومعادن متعددة', category: 'Vitamins & Supplements', defaultSellingPrice: '360.00', margin: '20', taxable: false, trackExpiry: true, requirePrescription: OTC, unit: B, unitsPerPack: 100 },
  { nameEn: 'Centrum Silver 50+ Tablets', nameAr: 'سنتروم سيلفر فوق 50 أقراص', genericNameEn: 'Multivitamin + Minerals (Senior)', genericNameAr: 'فيتامينات ومعادن للكبار', category: 'Vitamins & Supplements', defaultSellingPrice: '396.00', margin: '20', taxable: false, trackExpiry: true, requirePrescription: OTC, unit: B, unitsPerPack: 100 },
  { nameEn: 'Vitamin B Complex Tablets', nameAr: 'فيتامين ب مركب أقراص', genericNameEn: 'Vitamin B1 + B2 + B6 + B12', genericNameAr: 'فيتامين ب1 + ب2 + ب6 + ب12', category: 'Vitamins & Supplements', defaultSellingPrice: '18.00', margin: '30', taxable: false, trackExpiry: true, requirePrescription: OTC, unit: S, unitsPerPack: 2 },
  { nameEn: 'Vitamin E 400 IU Capsules', nameAr: 'فيتامين إي 400 وحدة كبسول', genericNameEn: 'Tocopherol', genericNameAr: 'توكوفيرول', category: 'Vitamins & Supplements', defaultSellingPrice: '60.00', margin: '28', taxable: false, trackExpiry: true, requirePrescription: OTC, unit: B, unitsPerPack: 24 },
  { nameEn: 'Coenzyme Q10 100mg Capsules', nameAr: 'كوإنزيم كيو 10 - 100 مجم كبسول', genericNameEn: 'Ubiquinone (CoQ10)', genericNameAr: 'يوبيكوينون', category: 'Vitamins & Supplements', defaultSellingPrice: '150.00', margin: '25', taxable: false, trackExpiry: true, requirePrescription: OTC, unit: B, unitsPerPack: 30 },
  { nameEn: 'Selenium 200mcg Tablets', nameAr: 'سيلينيوم 200 ميكروجرام أقراص', genericNameEn: 'Selenium', genericNameAr: 'سيلينيوم', category: 'Vitamins & Supplements', defaultSellingPrice: '72.00', margin: '28', taxable: false, trackExpiry: true, requirePrescription: OTC, unit: B, unitsPerPack: 30 },
  { nameEn: 'Biotin 10000mcg Tablets', nameAr: 'بيوتين 10000 ميكروجرام أقراص', genericNameEn: 'Biotin (Vitamin B7)', genericNameAr: 'بيوتين (فيتامين ب7)', category: 'Vitamins & Supplements', defaultSellingPrice: '120.00', margin: '25', taxable: false, trackExpiry: true, requirePrescription: OTC, unit: B, unitsPerPack: 30 },

  // ═══════════════════════════════════════════════════════════════════
  //  8. SKIN CARE  (العناية بالبشرة)
  // ═══════════════════════════════════════════════════════════════════
  { nameEn: 'Fucidin Cream 2%', nameAr: 'فيوسيدين كريم 2%', genericNameEn: 'Fusidic Acid', genericNameAr: 'حمض الفيوسيديك', category: 'Skin Care', defaultSellingPrice: '54.00', margin: '22', taxable: false, trackExpiry: true, requirePrescription: OTC, unit: T, unitsPerPack: 1 },
  { nameEn: 'Fucicort Cream', nameAr: 'فيوسيكورت كريم', genericNameEn: 'Fusidic Acid + Betamethasone', genericNameAr: 'حمض الفيوسيديك + بيتاميثازون', category: 'Skin Care', defaultSellingPrice: '60.00', margin: '22', taxable: false, trackExpiry: true, requirePrescription: OTC, unit: T, unitsPerPack: 1 },
  { nameEn: 'Betaderm Cream', nameAr: 'بيتاديرم كريم', genericNameEn: 'Betamethasone Valerate', genericNameAr: 'بيتاميثازون فاليرات', category: 'Skin Care', defaultSellingPrice: '18.00', margin: '30', taxable: false, trackExpiry: true, requirePrescription: OTC, unit: T, unitsPerPack: 1 },
  { nameEn: 'Panthenol Cream 2%', nameAr: 'بانثينول كريم 2%', genericNameEn: 'Dexpanthenol', genericNameAr: 'ديكسبانثينول', category: 'Skin Care', defaultSellingPrice: '24.00', margin: '30', taxable: false, trackExpiry: true, requirePrescription: OTC, unit: T, unitsPerPack: 1 },
  { nameEn: 'Bepanthen Cream', nameAr: 'بيبانثين كريم', genericNameEn: 'Dexpanthenol', genericNameAr: 'ديكسبانثينول', category: 'Skin Care', defaultSellingPrice: '60.00', margin: '25', taxable: false, trackExpiry: true, requirePrescription: OTC, unit: T, unitsPerPack: 1 },
  { nameEn: 'Kenacomb Cream', nameAr: 'كيناكومب كريم', genericNameEn: 'Triamcinolone + Neomycin + Nystatin + Gramicidin', genericNameAr: 'تريامسينولون + نيوميسين + نيستاتين + جراميسيدين', category: 'Skin Care', defaultSellingPrice: '24.00', margin: '25', taxable: false, trackExpiry: true, requirePrescription: OTC, unit: T, unitsPerPack: 1 },
  { nameEn: 'Daktarin Cream 2%', nameAr: 'داكتارين كريم 2%', genericNameEn: 'Miconazole Nitrate', genericNameAr: 'ميكونازول نيترات', category: 'Skin Care', defaultSellingPrice: '30.00', margin: '25', taxable: false, trackExpiry: true, requirePrescription: OTC, unit: T, unitsPerPack: 1 },
  { nameEn: 'Lamisil Cream 1%', nameAr: 'لاميزيل كريم 1%', genericNameEn: 'Terbinafine', genericNameAr: 'تيربينافين', category: 'Skin Care', defaultSellingPrice: '48.00', margin: '22', taxable: false, trackExpiry: true, requirePrescription: OTC, unit: T, unitsPerPack: 1 },
  { nameEn: 'Locoid Cream', nameAr: 'لوكويد كريم', genericNameEn: 'Hydrocortisone Butyrate', genericNameAr: 'هيدروكورتيزون بيوتيرات', category: 'Skin Care', defaultSellingPrice: '36.00', margin: '22', taxable: false, trackExpiry: true, requirePrescription: OTC, unit: T, unitsPerPack: 1 },
  { nameEn: 'Garamycin Cream', nameAr: 'جاراميسين كريم', genericNameEn: 'Gentamicin', genericNameAr: 'جنتاميسين', category: 'Skin Care', defaultSellingPrice: '18.00', margin: '28', taxable: false, trackExpiry: true, requirePrescription: OTC, unit: T, unitsPerPack: 1 },
  { nameEn: 'Diprogenta Cream', nameAr: 'ديبروجنتا كريم', genericNameEn: 'Betamethasone + Gentamicin', genericNameAr: 'بيتاميثازون + جنتاميسين', category: 'Skin Care', defaultSellingPrice: '30.00', margin: '25', taxable: false, trackExpiry: true, requirePrescription: OTC, unit: T, unitsPerPack: 1 },
  { nameEn: 'Dermovate Cream 0.05%', nameAr: 'ديرموفيت كريم 0.05%', genericNameEn: 'Clobetasol Propionate', genericNameAr: 'كلوبيتاسول بروبيونات', category: 'Skin Care', defaultSellingPrice: '36.00', margin: '22', taxable: false, trackExpiry: true, requirePrescription: RX, unit: T, unitsPerPack: 1 },
  { nameEn: 'Skinoren Cream 20%', nameAr: 'سكينورين كريم 20%', genericNameEn: 'Azelaic Acid', genericNameAr: 'حمض الأزيلايك', category: 'Skin Care', defaultSellingPrice: '60.00', margin: '22', taxable: false, trackExpiry: true, requirePrescription: OTC, unit: T, unitsPerPack: 1 },
  { nameEn: 'Differin Gel 0.1%', nameAr: 'ديفرين جل 0.1%', genericNameEn: 'Adapalene', genericNameAr: 'أدابالين', category: 'Skin Care', defaultSellingPrice: '48.00', margin: '22', taxable: false, trackExpiry: true, requirePrescription: OTC, unit: T, unitsPerPack: 1 },
  { nameEn: 'Acyclovir Cream 5%', nameAr: 'أسيكلوفير كريم 5%', genericNameEn: 'Acyclovir', genericNameAr: 'أسيكلوفير', category: 'Skin Care', defaultSellingPrice: '18.00', margin: '28', taxable: false, trackExpiry: true, requirePrescription: OTC, unit: T, unitsPerPack: 1 },
  { nameEn: 'Zovirax Cream 5%', nameAr: 'زوفيراكس كريم 5%', genericNameEn: 'Acyclovir', genericNameAr: 'أسيكلوفير', category: 'Skin Care', defaultSellingPrice: '42.00', margin: '22', taxable: false, trackExpiry: true, requirePrescription: OTC, unit: T, unitsPerPack: 1 },
  { nameEn: 'Dalacin T Lotion 1%', nameAr: 'دالاسين تي لوشن 1%', genericNameEn: 'Clindamycin Topical', genericNameAr: 'كليندامايسين موضعي', category: 'Skin Care', defaultSellingPrice: '36.00', margin: '25', taxable: false, trackExpiry: true, requirePrescription: OTC, unit: BT, unitsPerPack: 1 },
  { nameEn: 'Hydrocortisone Cream 1%', nameAr: 'هيدروكورتيزون كريم 1%', genericNameEn: 'Hydrocortisone', genericNameAr: 'هيدروكورتيزون', category: 'Skin Care', defaultSellingPrice: '9.00', margin: '30', taxable: false, trackExpiry: true, requirePrescription: OTC, unit: T, unitsPerPack: 1 },

  // ═══════════════════════════════════════════════════════════════════
  //  9. BABY CARE  (رعاية الأطفال)
  // ═══════════════════════════════════════════════════════════════════
  { nameEn: 'Calpol 120mg/5ml Syrup', nameAr: 'كالبول شراب 120 مجم/5 مل', genericNameEn: 'Paracetamol', genericNameAr: 'باراسيتامول', category: 'Baby Care', defaultSellingPrice: '27.00', margin: '25', taxable: false, trackExpiry: true, requirePrescription: OTC, unit: BT, unitsPerPack: 1 },
  { nameEn: 'Abimol 120mg/5ml Syrup', nameAr: 'أبيمول شراب 120 مجم/5 مل', genericNameEn: 'Paracetamol', genericNameAr: 'باراسيتامول', category: 'Baby Care', defaultSellingPrice: '12.00', margin: '30', taxable: false, trackExpiry: true, requirePrescription: OTC, unit: BT, unitsPerPack: 1 },
  { nameEn: 'Brufen Syrup for Children', nameAr: 'بروفين شراب للأطفال', genericNameEn: 'Ibuprofen', genericNameAr: 'إيبوبروفين', category: 'Baby Care', defaultSellingPrice: '24.00', margin: '25', taxable: false, trackExpiry: true, requirePrescription: OTC, unit: BT, unitsPerPack: 1 },
  { nameEn: 'Nurofen for Children Syrup', nameAr: 'نوروفين شراب للأطفال', genericNameEn: 'Ibuprofen', genericNameAr: 'إيبوبروفين', category: 'Baby Care', defaultSellingPrice: '36.00', margin: '25', taxable: false, trackExpiry: true, requirePrescription: OTC, unit: BT, unitsPerPack: 1 },
  { nameEn: 'Augmentin Syrup 457mg/5ml', nameAr: 'أوجمنتين شراب 457 مجم/5 مل', genericNameEn: 'Amoxicillin + Clavulanic Acid', genericNameAr: 'أموكسيسيللين + حمض الكلافيولانيك', category: 'Baby Care', defaultSellingPrice: '72.00', margin: '22', taxable: false, trackExpiry: true, requirePrescription: RX, unit: BT, unitsPerPack: 1 },
  { nameEn: 'Augmentin Syrup 228mg/5ml', nameAr: 'أوجمنتين شراب 228 مجم/5 مل', genericNameEn: 'Amoxicillin + Clavulanic Acid', genericNameAr: 'أموكسيسيللين + حمض الكلافيولانيك', category: 'Baby Care', defaultSellingPrice: '48.00', margin: '22', taxable: false, trackExpiry: true, requirePrescription: RX, unit: BT, unitsPerPack: 1 },
  { nameEn: 'Amoxil Syrup 250mg/5ml', nameAr: 'أموكسيل شراب 250 مجم/5 مل', genericNameEn: 'Amoxicillin', genericNameAr: 'أموكسيسيللين', category: 'Baby Care', defaultSellingPrice: '27.00', margin: '25', taxable: false, trackExpiry: true, requirePrescription: RX, unit: BT, unitsPerPack: 1 },
  { nameEn: 'Flagyl Syrup 125mg/5ml', nameAr: 'فلاجيل شراب 125 مجم/5 مل', genericNameEn: 'Metronidazole', genericNameAr: 'ميترونيدازول', category: 'Baby Care', defaultSellingPrice: '18.00', margin: '25', taxable: false, trackExpiry: true, requirePrescription: RX, unit: BT, unitsPerPack: 1 },
  { nameEn: 'Dentinox Teething Gel', nameAr: 'دينتينوكس جل التسنين', genericNameEn: 'Lidocaine + Cetylpyridinium', genericNameAr: 'ليدوكايين + سيتيل بيريدينيوم', category: 'Baby Care', defaultSellingPrice: '36.00', margin: '25', taxable: false, trackExpiry: true, requirePrescription: OTC, unit: T, unitsPerPack: 1 },
  { nameEn: 'Sudocrem 125g', nameAr: 'سودوكريم 125 جم', genericNameEn: 'Zinc Oxide + Lanolin', genericNameAr: 'أكسيد الزنك + لانولين', category: 'Baby Care', defaultSellingPrice: '84.00', margin: '25', taxable: false, trackExpiry: true, requirePrescription: OTC, unit: P, unitsPerPack: 1 },
  { nameEn: 'Pedialyte ORS Solution', nameAr: 'بديالايت محلول معالجة جفاف', genericNameEn: 'Oral Rehydration Salts', genericNameAr: 'أملاح الإماهة الفموية', category: 'Baby Care', defaultSellingPrice: '36.00', margin: '25', taxable: false, trackExpiry: true, requirePrescription: OTC, unit: BT, unitsPerPack: 1 },
  { nameEn: 'Vitamin D3 Drops for Infants', nameAr: 'فيتامين د3 نقط للرضع', genericNameEn: 'Cholecalciferol 400 IU/drop', genericNameAr: 'كوليكالسيفيرول 400 وحدة/نقطة', category: 'Baby Care', defaultSellingPrice: '48.00', margin: '28', taxable: false, trackExpiry: true, requirePrescription: OTC, unit: BT, unitsPerPack: 1 },
  { nameEn: 'Baby Saline Nasal Drops', nameAr: 'نقط أنف محلول ملح للأطفال', genericNameEn: 'Sodium Chloride 0.9%', genericNameAr: 'كلوريد الصوديوم 0.9%', category: 'Baby Care', defaultSellingPrice: '12.00', margin: '30', taxable: false, trackExpiry: true, requirePrescription: OTC, unit: BT, unitsPerPack: 1 },
  { nameEn: 'Telfast Syrup for Children', nameAr: 'تلفاست شراب للأطفال', genericNameEn: 'Fexofenadine', genericNameAr: 'فيكسوفينادين', category: 'Baby Care', defaultSellingPrice: '42.00', margin: '22', taxable: false, trackExpiry: true, requirePrescription: OTC, unit: BT, unitsPerPack: 1 },
  { nameEn: 'Fenistil Syrup for Children', nameAr: 'فنستيل شراب للأطفال', genericNameEn: 'Dimethindene Maleate', genericNameAr: 'دايميثيندين ماليات', category: 'Baby Care', defaultSellingPrice: '30.00', margin: '25', taxable: false, trackExpiry: true, requirePrescription: OTC, unit: BT, unitsPerPack: 1 },
  { nameEn: 'Prospan Syrup for Children', nameAr: 'بروسبان شراب للأطفال', genericNameEn: 'Ivy Leaf Extract', genericNameAr: 'مستخلص أوراق اللبلاب', category: 'Baby Care', defaultSellingPrice: '42.00', margin: '25', taxable: false, trackExpiry: true, requirePrescription: OTC, unit: BT, unitsPerPack: 1 },

  // ═══════════════════════════════════════════════════════════════════
  //  10. DIABETES  (السكري)
  // ═══════════════════════════════════════════════════════════════════
  { nameEn: 'Glucophage 500mg Tablets', nameAr: 'جلوكوفاج 500 مجم أقراص', genericNameEn: 'Metformin', genericNameAr: 'ميتفورمين', category: 'Diabetes', defaultSellingPrice: '18.00', margin: '22', taxable: false, trackExpiry: true, requirePrescription: RX, unit: B, unitsPerPack: 30 },
  { nameEn: 'Glucophage 850mg Tablets', nameAr: 'جلوكوفاج 850 مجم أقراص', genericNameEn: 'Metformin', genericNameAr: 'ميتفورمين', category: 'Diabetes', defaultSellingPrice: '24.00', margin: '22', taxable: false, trackExpiry: true, requirePrescription: RX, unit: B, unitsPerPack: 30 },
  { nameEn: 'Glucophage 1000mg Tablets', nameAr: 'جلوكوفاج 1000 مجم أقراص', genericNameEn: 'Metformin', genericNameAr: 'ميتفورمين', category: 'Diabetes', defaultSellingPrice: '36.00', margin: '22', taxable: false, trackExpiry: true, requirePrescription: RX, unit: B, unitsPerPack: 30 },
  { nameEn: 'Glucophage XR 1000mg', nameAr: 'جلوكوفاج إكس آر 1000 مجم', genericNameEn: 'Metformin Extended Release', genericNameAr: 'ميتفورمين ممتد المفعول', category: 'Diabetes', defaultSellingPrice: '42.00', margin: '22', taxable: false, trackExpiry: true, requirePrescription: RX, unit: B, unitsPerPack: 30 },
  { nameEn: 'Januvia 100mg Tablets', nameAr: 'جانوفيا 100 مجم أقراص', genericNameEn: 'Sitagliptin', genericNameAr: 'سيتاجلبتين', category: 'Diabetes', defaultSellingPrice: '252.00', margin: '18', taxable: false, trackExpiry: true, requirePrescription: RX, unit: B, unitsPerPack: 28 },
  { nameEn: 'Janumet 50/1000mg Tablets', nameAr: 'جانوميت 50/1000 مجم أقراص', genericNameEn: 'Sitagliptin + Metformin', genericNameAr: 'سيتاجلبتين + ميتفورمين', category: 'Diabetes', defaultSellingPrice: '300.00', margin: '18', taxable: false, trackExpiry: true, requirePrescription: RX, unit: B, unitsPerPack: 28 },
  { nameEn: 'Amaryl 2mg Tablets', nameAr: 'أماريل 2 مجم أقراص', genericNameEn: 'Glimepiride', genericNameAr: 'جليميبيرايد', category: 'Diabetes', defaultSellingPrice: '48.00', margin: '22', taxable: false, trackExpiry: true, requirePrescription: RX, unit: B, unitsPerPack: 30 },
  { nameEn: 'Amaryl 4mg Tablets', nameAr: 'أماريل 4 مجم أقراص', genericNameEn: 'Glimepiride', genericNameAr: 'جليميبيرايد', category: 'Diabetes', defaultSellingPrice: '78.00', margin: '22', taxable: false, trackExpiry: true, requirePrescription: RX, unit: B, unitsPerPack: 30 },
  { nameEn: 'Galvus Met 50/1000mg Tablets', nameAr: 'جالفس مت 50/1000 مجم أقراص', genericNameEn: 'Vildagliptin + Metformin', genericNameAr: 'فيلداجلبتين + ميتفورمين', category: 'Diabetes', defaultSellingPrice: '192.00', margin: '18', taxable: false, trackExpiry: true, requirePrescription: RX, unit: B, unitsPerPack: 30 },
  { nameEn: 'Jardiance 25mg Tablets', nameAr: 'جارديانس 25 مجم أقراص', genericNameEn: 'Empagliflozin', genericNameAr: 'إمباجليفلوزين', category: 'Diabetes', defaultSellingPrice: '312.00', margin: '18', taxable: false, trackExpiry: true, requirePrescription: RX, unit: B, unitsPerPack: 30 },
  { nameEn: 'Jardiance 10mg Tablets', nameAr: 'جارديانس 10 مجم أقراص', genericNameEn: 'Empagliflozin', genericNameAr: 'إمباجليفلوزين', category: 'Diabetes', defaultSellingPrice: '276.00', margin: '18', taxable: false, trackExpiry: true, requirePrescription: RX, unit: B, unitsPerPack: 30 },
  { nameEn: 'Forxiga 10mg Tablets', nameAr: 'فوركسيجا 10 مجم أقراص', genericNameEn: 'Dapagliflozin', genericNameAr: 'داباجليفلوزين', category: 'Diabetes', defaultSellingPrice: '288.00', margin: '18', taxable: false, trackExpiry: true, requirePrescription: RX, unit: B, unitsPerPack: 28 },
  { nameEn: 'Diamicron MR 60mg Tablets', nameAr: 'دياميكرون إم آر 60 مجم أقراص', genericNameEn: 'Gliclazide', genericNameAr: 'جليكلازيد', category: 'Diabetes', defaultSellingPrice: '90.00', margin: '20', taxable: false, trackExpiry: true, requirePrescription: RX, unit: B, unitsPerPack: 30 },
  { nameEn: 'Trajenta 5mg Tablets', nameAr: 'تراجنتا 5 مجم أقراص', genericNameEn: 'Linagliptin', genericNameAr: 'ليناجلبتين', category: 'Diabetes', defaultSellingPrice: '216.00', margin: '18', taxable: false, trackExpiry: true, requirePrescription: RX, unit: B, unitsPerPack: 30 },
  { nameEn: 'Lantus Solostar Insulin Pen', nameAr: 'لانتوس سولوستار قلم أنسولين', genericNameEn: 'Insulin Glargine', genericNameAr: 'أنسولين جلارجين', category: 'Diabetes', defaultSellingPrice: '180.00', margin: '15', taxable: false, trackExpiry: true, requirePrescription: RX, unit: P, unitsPerPack: 1 },
  { nameEn: 'NovoRapid FlexPen Insulin', nameAr: 'نوفورابيد فلكسبن أنسولين', genericNameEn: 'Insulin Aspart', genericNameAr: 'أنسولين أسبارت', category: 'Diabetes', defaultSellingPrice: '156.00', margin: '15', taxable: false, trackExpiry: true, requirePrescription: RX, unit: P, unitsPerPack: 1 },
  { nameEn: 'Ozempic 1mg Pen', nameAr: 'أوزيمبك 1 مجم قلم', genericNameEn: 'Semaglutide', genericNameAr: 'سيماجلوتايد', category: 'Diabetes', defaultSellingPrice: '1800.00', margin: '15', taxable: false, trackExpiry: true, requirePrescription: RX, unit: P, unitsPerPack: 1 },

  // ═══════════════════════════════════════════════════════════════════
  //  11. HEART & BLOOD PRESSURE  (القلب والضغط)
  // ═══════════════════════════════════════════════════════════════════
  { nameEn: 'Concor 5mg Tablets', nameAr: 'كونكور 5 مجم أقراص', genericNameEn: 'Bisoprolol', genericNameAr: 'بيسوبرولول', category: 'Heart & Blood Pressure', defaultSellingPrice: '60.00', margin: '20', taxable: false, trackExpiry: true, requirePrescription: RX, unit: B, unitsPerPack: 30 },
  { nameEn: 'Concor 2.5mg Tablets', nameAr: 'كونكور 2.5 مجم أقراص', genericNameEn: 'Bisoprolol', genericNameAr: 'بيسوبرولول', category: 'Heart & Blood Pressure', defaultSellingPrice: '48.00', margin: '20', taxable: false, trackExpiry: true, requirePrescription: RX, unit: B, unitsPerPack: 30 },
  { nameEn: 'Concor 10mg Tablets', nameAr: 'كونكور 10 مجم أقراص', genericNameEn: 'Bisoprolol', genericNameAr: 'بيسوبرولول', category: 'Heart & Blood Pressure', defaultSellingPrice: '78.00', margin: '20', taxable: false, trackExpiry: true, requirePrescription: RX, unit: B, unitsPerPack: 30 },
  { nameEn: 'Aspirin Protect 100mg', nameAr: 'أسبرين بروتكت 100 مجم', genericNameEn: 'Acetylsalicylic Acid (Enteric Coated)', genericNameAr: 'حمض الأسيتيل ساليسيليك مغلف معويًا', category: 'Heart & Blood Pressure', defaultSellingPrice: '30.00', margin: '25', taxable: false, trackExpiry: true, requirePrescription: OTC, unit: B, unitsPerPack: 30 },
  { nameEn: 'Crestor 10mg Tablets', nameAr: 'كريستور 10 مجم أقراص', genericNameEn: 'Rosuvastatin', genericNameAr: 'روزوفاستاتين', category: 'Heart & Blood Pressure', defaultSellingPrice: '126.00', margin: '18', taxable: false, trackExpiry: true, requirePrescription: RX, unit: B, unitsPerPack: 28 },
  { nameEn: 'Crestor 20mg Tablets', nameAr: 'كريستور 20 مجم أقراص', genericNameEn: 'Rosuvastatin', genericNameAr: 'روزوفاستاتين', category: 'Heart & Blood Pressure', defaultSellingPrice: '180.00', margin: '18', taxable: false, trackExpiry: true, requirePrescription: RX, unit: B, unitsPerPack: 28 },
  { nameEn: 'Lipitor 20mg Tablets', nameAr: 'ليبيتور 20 مجم أقراص', genericNameEn: 'Atorvastatin', genericNameAr: 'أتورفاستاتين', category: 'Heart & Blood Pressure', defaultSellingPrice: '96.00', margin: '18', taxable: false, trackExpiry: true, requirePrescription: RX, unit: B, unitsPerPack: 28 },
  { nameEn: 'Lipitor 40mg Tablets', nameAr: 'ليبيتور 40 مجم أقراص', genericNameEn: 'Atorvastatin', genericNameAr: 'أتورفاستاتين', category: 'Heart & Blood Pressure', defaultSellingPrice: '150.00', margin: '18', taxable: false, trackExpiry: true, requirePrescription: RX, unit: B, unitsPerPack: 28 },
  { nameEn: 'Tritace 5mg Tablets', nameAr: 'تريتاس 5 مجم أقراص', genericNameEn: 'Ramipril', genericNameAr: 'راميبريل', category: 'Heart & Blood Pressure', defaultSellingPrice: '54.00', margin: '22', taxable: false, trackExpiry: true, requirePrescription: RX, unit: B, unitsPerPack: 30 },
  { nameEn: 'Tritace 10mg Tablets', nameAr: 'تريتاس 10 مجم أقراص', genericNameEn: 'Ramipril', genericNameAr: 'راميبريل', category: 'Heart & Blood Pressure', defaultSellingPrice: '78.00', margin: '22', taxable: false, trackExpiry: true, requirePrescription: RX, unit: B, unitsPerPack: 30 },
  { nameEn: 'Norvasc 5mg Tablets', nameAr: 'نورفاسك 5 مجم أقراص', genericNameEn: 'Amlodipine', genericNameAr: 'أملوديبين', category: 'Heart & Blood Pressure', defaultSellingPrice: '54.00', margin: '22', taxable: false, trackExpiry: true, requirePrescription: RX, unit: B, unitsPerPack: 30 },
  { nameEn: 'Norvasc 10mg Tablets', nameAr: 'نورفاسك 10 مجم أقراص', genericNameEn: 'Amlodipine', genericNameAr: 'أملوديبين', category: 'Heart & Blood Pressure', defaultSellingPrice: '84.00', margin: '22', taxable: false, trackExpiry: true, requirePrescription: RX, unit: B, unitsPerPack: 30 },
  { nameEn: 'Plavix 75mg Tablets', nameAr: 'بلافيكس 75 مجم أقراص', genericNameEn: 'Clopidogrel', genericNameAr: 'كلوبيدوجريل', category: 'Heart & Blood Pressure', defaultSellingPrice: '132.00', margin: '18', taxable: false, trackExpiry: true, requirePrescription: RX, unit: B, unitsPerPack: 28 },
  { nameEn: 'Co-Diovan 160/12.5mg Tablets', nameAr: 'كو-ديوفان 160/12.5 مجم أقراص', genericNameEn: 'Valsartan + HCTZ', genericNameAr: 'فالسارتان + هيدروكلوروثيازيد', category: 'Heart & Blood Pressure', defaultSellingPrice: '90.00', margin: '20', taxable: false, trackExpiry: true, requirePrescription: RX, unit: B, unitsPerPack: 28 },
  { nameEn: 'Tenormin 50mg Tablets', nameAr: 'تنورمين 50 مجم أقراص', genericNameEn: 'Atenolol', genericNameAr: 'أتينولول', category: 'Heart & Blood Pressure', defaultSellingPrice: '18.00', margin: '25', taxable: false, trackExpiry: true, requirePrescription: RX, unit: S, unitsPerPack: 2 },
  { nameEn: 'Aldactone 25mg Tablets', nameAr: 'ألداكتون 25 مجم أقراص', genericNameEn: 'Spironolactone', genericNameAr: 'سبيرونولاكتون', category: 'Heart & Blood Pressure', defaultSellingPrice: '18.00', margin: '25', taxable: false, trackExpiry: true, requirePrescription: RX, unit: S, unitsPerPack: 2 },
  { nameEn: 'Inderal 10mg Tablets', nameAr: 'إندرال 10 مجم أقراص', genericNameEn: 'Propranolol', genericNameAr: 'بروبرانولول', category: 'Heart & Blood Pressure', defaultSellingPrice: '12.00', margin: '28', taxable: false, trackExpiry: true, requirePrescription: RX, unit: S, unitsPerPack: 3 },
  { nameEn: 'Isordil 5mg Sublingual', nameAr: 'إيزورديل 5 مجم تحت اللسان', genericNameEn: 'Isosorbide Dinitrate', genericNameAr: 'إيزوسوربيد ثنائي النترات', category: 'Heart & Blood Pressure', defaultSellingPrice: '12.00', margin: '28', taxable: false, trackExpiry: true, requirePrescription: RX, unit: S, unitsPerPack: 2 },
  { nameEn: 'Entresto 97/103mg Tablets', nameAr: 'إنتريستو 97/103 مجم أقراص', genericNameEn: 'Sacubitril + Valsartan', genericNameAr: 'ساكوبيتريل + فالسارتان', category: 'Heart & Blood Pressure', defaultSellingPrice: '900.00', margin: '15', taxable: false, trackExpiry: true, requirePrescription: RX, unit: B, unitsPerPack: 28 },
  { nameEn: 'Xarelto 20mg Tablets', nameAr: 'زاريلتو 20 مجم أقراص', genericNameEn: 'Rivaroxaban', genericNameAr: 'ريفاروكسابان', category: 'Heart & Blood Pressure', defaultSellingPrice: '540.00', margin: '15', taxable: false, trackExpiry: true, requirePrescription: RX, unit: B, unitsPerPack: 28 },
  { nameEn: 'Warfarin 5mg Tablets', nameAr: 'وارفارين 5 مجم أقراص', genericNameEn: 'Warfarin', genericNameAr: 'وارفارين', category: 'Heart & Blood Pressure', defaultSellingPrice: '18.00', margin: '28', taxable: false, trackExpiry: true, requirePrescription: RX, unit: S, unitsPerPack: 2 },

  // ═══════════════════════════════════════════════════════════════════
  //  12. EYE CARE  (العناية بالعيون)
  // ═══════════════════════════════════════════════════════════════════
  { nameEn: 'Tobradex Eye Drops', nameAr: 'توبرادكس قطرة عين', genericNameEn: 'Tobramycin + Dexamethasone', genericNameAr: 'توبراميسين + ديكساميثازون', category: 'Eye Care', defaultSellingPrice: '60.00', margin: '22', taxable: false, trackExpiry: true, requirePrescription: RX, unit: BT, unitsPerPack: 1 },
  { nameEn: 'Tobrex Eye Drops', nameAr: 'توبريكس قطرة عين', genericNameEn: 'Tobramycin', genericNameAr: 'توبراميسين', category: 'Eye Care', defaultSellingPrice: '42.00', margin: '22', taxable: false, trackExpiry: true, requirePrescription: RX, unit: BT, unitsPerPack: 1 },
  { nameEn: 'Vigamox Eye Drops', nameAr: 'فيجاموكس قطرة عين', genericNameEn: 'Moxifloxacin', genericNameAr: 'موكسيفلوكساسين', category: 'Eye Care', defaultSellingPrice: '78.00', margin: '20', taxable: false, trackExpiry: true, requirePrescription: RX, unit: BT, unitsPerPack: 1 },
  { nameEn: 'Tears Naturale Eye Drops', nameAr: 'تيرز ناتشورال قطرة عين', genericNameEn: 'Hydroxypropyl Methylcellulose + Dextran', genericNameAr: 'هيدروكسي بروبيل ميثيل سيليلوز + ديكستران', category: 'Eye Care', defaultSellingPrice: '48.00', margin: '25', taxable: false, trackExpiry: true, requirePrescription: OTC, unit: BT, unitsPerPack: 1 },
  { nameEn: 'Systane Ultra Eye Drops', nameAr: 'سيستان ألترا قطرة عين', genericNameEn: 'Polyethylene Glycol + Propylene Glycol', genericNameAr: 'بولي إيثيلين جلايكول + بروبيلين جلايكول', category: 'Eye Care', defaultSellingPrice: '102.00', margin: '22', taxable: false, trackExpiry: true, requirePrescription: OTC, unit: BT, unitsPerPack: 1 },
  { nameEn: 'Refresh Tears Eye Drops', nameAr: 'ريفريش تيرز قطرة عين', genericNameEn: 'Carboxymethylcellulose', genericNameAr: 'كاربوكسي ميثيل سيليلوز', category: 'Eye Care', defaultSellingPrice: '60.00', margin: '25', taxable: false, trackExpiry: true, requirePrescription: OTC, unit: BT, unitsPerPack: 1 },
  { nameEn: 'Oflox Eye Drops', nameAr: 'أوفلوكس قطرة عين', genericNameEn: 'Ofloxacin', genericNameAr: 'أوفلوكساسين', category: 'Eye Care', defaultSellingPrice: '24.00', margin: '25', taxable: false, trackExpiry: true, requirePrescription: RX, unit: BT, unitsPerPack: 1 },
  { nameEn: 'Predforte Eye Drops', nameAr: 'بريدفورت قطرة عين', genericNameEn: 'Prednisolone Acetate', genericNameAr: 'بريدنيزولون أسيتات', category: 'Eye Care', defaultSellingPrice: '48.00', margin: '22', taxable: false, trackExpiry: true, requirePrescription: RX, unit: BT, unitsPerPack: 1 },
  { nameEn: 'Allergodil Eye Drops', nameAr: 'أليرجوديل قطرة عين', genericNameEn: 'Azelastine', genericNameAr: 'أزيلاستين', category: 'Eye Care', defaultSellingPrice: '54.00', margin: '22', taxable: false, trackExpiry: true, requirePrescription: OTC, unit: BT, unitsPerPack: 1 },

  // ═══════════════════════════════════════════════════════════════════
  //  13. RESPIRATORY & ASTHMA  (الجهاز التنفسي والربو)
  // ═══════════════════════════════════════════════════════════════════
  { nameEn: 'Ventolin Inhaler 100mcg', nameAr: 'فنتولين بخاخ 100 ميكروجرام', genericNameEn: 'Salbutamol', genericNameAr: 'سالبيوتامول', category: 'Respiratory & Asthma', defaultSellingPrice: '42.00', margin: '22', taxable: false, trackExpiry: true, requirePrescription: RX, unit: P, unitsPerPack: 1 },
  { nameEn: 'Ventolin Nebules 2.5mg', nameAr: 'فنتولين نيبولز 2.5 مجم', genericNameEn: 'Salbutamol', genericNameAr: 'سالبيوتامول', category: 'Respiratory & Asthma', defaultSellingPrice: '30.00', margin: '22', taxable: false, trackExpiry: true, requirePrescription: RX, unit: B, unitsPerPack: 20 },
  { nameEn: 'Seretide Diskus 250/50', nameAr: 'سيريتايد ديسكس 250/50', genericNameEn: 'Fluticasone + Salmeterol', genericNameAr: 'فلوتيكازون + سالميتيرول', category: 'Respiratory & Asthma', defaultSellingPrice: '252.00', margin: '18', taxable: false, trackExpiry: true, requirePrescription: RX, unit: P, unitsPerPack: 1 },
  { nameEn: 'Symbicort Turbuhaler 160/4.5', nameAr: 'سيمبيكورت تربوهيلر 160/4.5', genericNameEn: 'Budesonide + Formoterol', genericNameAr: 'بيوديسونيد + فورموتيرول', category: 'Respiratory & Asthma', defaultSellingPrice: '312.00', margin: '18', taxable: false, trackExpiry: true, requirePrescription: RX, unit: P, unitsPerPack: 1 },
  { nameEn: 'Singulair 10mg Tablets', nameAr: 'سينجولير 10 مجم أقراص', genericNameEn: 'Montelukast', genericNameAr: 'مونتيلوكاست', category: 'Respiratory & Asthma', defaultSellingPrice: '84.00', margin: '22', taxable: false, trackExpiry: true, requirePrescription: RX, unit: B, unitsPerPack: 28 },
  { nameEn: 'Singulair 5mg Chewable', nameAr: 'سينجولير 5 مجم أقراص مضغ', genericNameEn: 'Montelukast', genericNameAr: 'مونتيلوكاست', category: 'Respiratory & Asthma', defaultSellingPrice: '72.00', margin: '22', taxable: false, trackExpiry: true, requirePrescription: RX, unit: B, unitsPerPack: 28 },
  { nameEn: 'Pulmicort Respules 0.5mg', nameAr: 'بالميكورت ريسبيلز 0.5 مجم', genericNameEn: 'Budesonide', genericNameAr: 'بيوديسونيد', category: 'Respiratory & Asthma', defaultSellingPrice: '60.00', margin: '20', taxable: false, trackExpiry: true, requirePrescription: RX, unit: B, unitsPerPack: 20 },
  { nameEn: 'Atrovent Nebules 250mcg', nameAr: 'أتروفنت نيبولز 250 ميكروجرام', genericNameEn: 'Ipratropium Bromide', genericNameAr: 'إبراتروبيوم بروميد', category: 'Respiratory & Asthma', defaultSellingPrice: '36.00', margin: '22', taxable: false, trackExpiry: true, requirePrescription: RX, unit: B, unitsPerPack: 20 },

  // ═══════════════════════════════════════════════════════════════════
  //  14. MUSCLES & JOINTS  (العضلات والمفاصل)
  // ═══════════════════════════════════════════════════════════════════
  { nameEn: 'Voltaren Emulgel 1%', nameAr: 'فولتارين إيمولجيل 1%', genericNameEn: 'Diclofenac Sodium Topical', genericNameAr: 'ديكلوفيناك صوديوم موضعي', category: 'Muscles & Joints', defaultSellingPrice: '54.00', margin: '25', taxable: false, trackExpiry: true, requirePrescription: OTC, unit: T, unitsPerPack: 1 },
  { nameEn: 'Myolgin Tablets', nameAr: 'ميولجين أقراص', genericNameEn: 'Chlorzoxazone + Paracetamol', genericNameAr: 'كلورزوكسازون + باراسيتامول', category: 'Muscles & Joints', defaultSellingPrice: '24.00', margin: '25', taxable: false, trackExpiry: true, requirePrescription: OTC, unit: S, unitsPerPack: 2 },
  { nameEn: 'Relaxon Tablets', nameAr: 'ريلاكسون أقراص', genericNameEn: 'Chlorzoxazone', genericNameAr: 'كلورزوكسازون', category: 'Muscles & Joints', defaultSellingPrice: '21.00', margin: '25', taxable: false, trackExpiry: true, requirePrescription: OTC, unit: S, unitsPerPack: 2 },
  { nameEn: 'Deep Heat Cream', nameAr: 'ديب هيت كريم', genericNameEn: 'Methyl Salicylate + Menthol + Eucalyptus', genericNameAr: 'ميثيل ساليسيلات + منثول + يوكاليبتوس', category: 'Muscles & Joints', defaultSellingPrice: '42.00', margin: '28', taxable: false, trackExpiry: true, requirePrescription: OTC, unit: T, unitsPerPack: 1 },
  { nameEn: 'Deep Relief Gel', nameAr: 'ديب ريليف جيل', genericNameEn: 'Ibuprofen + Menthol Topical', genericNameAr: 'إيبوبروفين + منثول موضعي', category: 'Muscles & Joints', defaultSellingPrice: '48.00', margin: '25', taxable: false, trackExpiry: true, requirePrescription: OTC, unit: T, unitsPerPack: 1 },
  { nameEn: 'Feldene 20mg Capsules', nameAr: 'فيلدين 20 مجم كبسول', genericNameEn: 'Piroxicam', genericNameAr: 'بيروكسيكام', category: 'Muscles & Joints', defaultSellingPrice: '30.00', margin: '22', taxable: false, trackExpiry: true, requirePrescription: OTC, unit: B, unitsPerPack: 20 },
  { nameEn: 'Arcoxia 90mg Tablets', nameAr: 'أركوكسيا 90 مجم أقراص', genericNameEn: 'Etoricoxib', genericNameAr: 'إيتوريكوكسيب', category: 'Muscles & Joints', defaultSellingPrice: '84.00', margin: '20', taxable: false, trackExpiry: true, requirePrescription: RX, unit: B, unitsPerPack: 14 },
  { nameEn: 'Arcoxia 120mg Tablets', nameAr: 'أركوكسيا 120 مجم أقراص', genericNameEn: 'Etoricoxib', genericNameAr: 'إيتوريكوكسيب', category: 'Muscles & Joints', defaultSellingPrice: '96.00', margin: '20', taxable: false, trackExpiry: true, requirePrescription: RX, unit: B, unitsPerPack: 7 },
  { nameEn: 'Dantrelen 25mg Capsules', nameAr: 'دانتريلين 25 مجم كبسول', genericNameEn: 'Dantrolene', genericNameAr: 'دانترولين', category: 'Muscles & Joints', defaultSellingPrice: '30.00', margin: '22', taxable: false, trackExpiry: true, requirePrescription: RX, unit: B, unitsPerPack: 20 },
  { nameEn: 'Mobiket 15mg Tablets', nameAr: 'موبيكت 15 مجم أقراص', genericNameEn: 'Meloxicam', genericNameAr: 'ميلوكسيكام', category: 'Muscles & Joints', defaultSellingPrice: '24.00', margin: '25', taxable: false, trackExpiry: true, requirePrescription: OTC, unit: S, unitsPerPack: 2 },

  // ═══════════════════════════════════════════════════════════════════
  //  15. NERVE & MENTAL HEALTH  (الأعصاب والصحة النفسية)
  // ═══════════════════════════════════════════════════════════════════
  { nameEn: 'Neurobion Ampoules', nameAr: 'نيوروبيون أمبولات', genericNameEn: 'Vitamin B1 + B6 + B12', genericNameAr: 'فيتامين ب1 + ب6 + ب12', category: 'Nerve & Mental Health', defaultSellingPrice: '78.00', margin: '22', taxable: false, trackExpiry: true, requirePrescription: OTC, unit: B, unitsPerPack: 3 },
  { nameEn: 'Neurobion Forte Tablets', nameAr: 'نيوروبيون فورت أقراص', genericNameEn: 'Vitamin B1 + B6 + B12', genericNameAr: 'فيتامين ب1 + ب6 + ب12', category: 'Nerve & Mental Health', defaultSellingPrice: '42.00', margin: '25', taxable: false, trackExpiry: true, requirePrescription: OTC, unit: S, unitsPerPack: 2 },
  { nameEn: 'Thiotacid 600mg Tablets', nameAr: 'ثيوتاسيد 600 مجم أقراص', genericNameEn: 'Thioctic Acid (Alpha Lipoic Acid)', genericNameAr: 'حمض الثيوكتيك (ألفا ليبويك أسيد)', category: 'Nerve & Mental Health', defaultSellingPrice: '90.00', margin: '22', taxable: false, trackExpiry: true, requirePrescription: OTC, unit: B, unitsPerPack: 20 },
  { nameEn: 'Thiotacid Compound Tablets', nameAr: 'ثيوتاسيد مركب أقراص', genericNameEn: 'Thioctic Acid + Benfotiamine', genericNameAr: 'حمض الثيوكتيك + بنفوتيامين', category: 'Nerve & Mental Health', defaultSellingPrice: '108.00', margin: '22', taxable: false, trackExpiry: true, requirePrescription: OTC, unit: B, unitsPerPack: 20 },
  { nameEn: 'Lyrica 75mg Capsules', nameAr: 'ليريكا 75 مجم كبسول', genericNameEn: 'Pregabalin', genericNameAr: 'بريجابالين', category: 'Nerve & Mental Health', defaultSellingPrice: '120.00', margin: '18', taxable: false, trackExpiry: true, requirePrescription: RX, unit: B, unitsPerPack: 30 },
  { nameEn: 'Lyrica 150mg Capsules', nameAr: 'ليريكا 150 مجم كبسول', genericNameEn: 'Pregabalin', genericNameAr: 'بريجابالين', category: 'Nerve & Mental Health', defaultSellingPrice: '180.00', margin: '18', taxable: false, trackExpiry: true, requirePrescription: RX, unit: B, unitsPerPack: 30 },
  { nameEn: 'Cipralex 10mg Tablets', nameAr: 'سيبرالكس 10 مجم أقراص', genericNameEn: 'Escitalopram', genericNameAr: 'إسيتالوبرام', category: 'Nerve & Mental Health', defaultSellingPrice: '126.00', margin: '18', taxable: false, trackExpiry: true, requirePrescription: RX, unit: B, unitsPerPack: 28 },
  { nameEn: 'Cipralex 20mg Tablets', nameAr: 'سيبرالكس 20 مجم أقراص', genericNameEn: 'Escitalopram', genericNameAr: 'إسيتالوبرام', category: 'Nerve & Mental Health', defaultSellingPrice: '168.00', margin: '18', taxable: false, trackExpiry: true, requirePrescription: RX, unit: B, unitsPerPack: 28 },
  { nameEn: 'Tegretol 200mg Tablets', nameAr: 'تجريتول 200 مجم أقراص', genericNameEn: 'Carbamazepine', genericNameAr: 'كاربامازيبين', category: 'Nerve & Mental Health', defaultSellingPrice: '36.00', margin: '22', taxable: false, trackExpiry: true, requirePrescription: RX, unit: B, unitsPerPack: 30 },
  { nameEn: 'Depakine 500mg Tablets', nameAr: 'ديباكين 500 مجم أقراص', genericNameEn: 'Sodium Valproate', genericNameAr: 'فالبروات الصوديوم', category: 'Nerve & Mental Health', defaultSellingPrice: '48.00', margin: '22', taxable: false, trackExpiry: true, requirePrescription: RX, unit: B, unitsPerPack: 30 },
  { nameEn: 'Seroxat 20mg Tablets', nameAr: 'سيروكسات 20 مجم أقراص', genericNameEn: 'Paroxetine', genericNameAr: 'باروكسيتين', category: 'Nerve & Mental Health', defaultSellingPrice: '84.00', margin: '20', taxable: false, trackExpiry: true, requirePrescription: RX, unit: B, unitsPerPack: 30 },
  { nameEn: 'Dogmatil 50mg Capsules', nameAr: 'دوجماتيل 50 مجم كبسول', genericNameEn: 'Sulpiride', genericNameAr: 'سولبيريد', category: 'Nerve & Mental Health', defaultSellingPrice: '30.00', margin: '25', taxable: false, trackExpiry: true, requirePrescription: RX, unit: B, unitsPerPack: 30 },

  // ═══════════════════════════════════════════════════════════════════
  //  16. ENT (EAR, NOSE, THROAT)  (أنف وأذن وحنجرة)
  // ═══════════════════════════════════════════════════════════════════
  { nameEn: 'Otrivin Nasal Spray 0.1%', nameAr: 'أوتريفين بخاخ أنف 0.1%', genericNameEn: 'Xylometazoline', genericNameAr: 'زايلوميتازولين', category: 'ENT (Ear, Nose, Throat)', defaultSellingPrice: '24.00', margin: '28', taxable: false, trackExpiry: true, requirePrescription: OTC, unit: BT, unitsPerPack: 1 },
  { nameEn: 'Otrivin Baby Nasal Drops 0.05%', nameAr: 'أوتريفين بيبي نقط أنف 0.05%', genericNameEn: 'Xylometazoline', genericNameAr: 'زايلوميتازولين', category: 'ENT (Ear, Nose, Throat)', defaultSellingPrice: '18.00', margin: '28', taxable: false, trackExpiry: true, requirePrescription: OTC, unit: BT, unitsPerPack: 1 },
  { nameEn: 'Nasonex Nasal Spray', nameAr: 'نازونكس بخاخ أنف', genericNameEn: 'Mometasone Furoate', genericNameAr: 'موميتازون فيوروات', category: 'ENT (Ear, Nose, Throat)', defaultSellingPrice: '84.00', margin: '20', taxable: false, trackExpiry: true, requirePrescription: RX, unit: P, unitsPerPack: 1 },
  { nameEn: 'Avamys Nasal Spray', nameAr: 'أفاميس بخاخ أنف', genericNameEn: 'Fluticasone Furoate', genericNameAr: 'فلوتيكازون فيوروات', category: 'ENT (Ear, Nose, Throat)', defaultSellingPrice: '102.00', margin: '20', taxable: false, trackExpiry: true, requirePrescription: RX, unit: P, unitsPerPack: 1 },
  { nameEn: 'Nasacort Nasal Spray', nameAr: 'نازاكورت بخاخ أنف', genericNameEn: 'Triamcinolone Acetonide', genericNameAr: 'تريامسينولون أسيتونايد', category: 'ENT (Ear, Nose, Throat)', defaultSellingPrice: '60.00', margin: '22', taxable: false, trackExpiry: true, requirePrescription: OTC, unit: P, unitsPerPack: 1 },
  { nameEn: 'Ciprocin Ear Drops', nameAr: 'سيبروسين نقط أذن', genericNameEn: 'Ciprofloxacin', genericNameAr: 'سيبروفلوكساسين', category: 'ENT (Ear, Nose, Throat)', defaultSellingPrice: '18.00', margin: '25', taxable: false, trackExpiry: true, requirePrescription: RX, unit: BT, unitsPerPack: 1 },
  { nameEn: 'Otorin Ear Drops', nameAr: 'أوتورين نقط أذن', genericNameEn: 'Chloramphenicol + Clotrimazole + Lidocaine', genericNameAr: 'كلورامفنيكول + كلوتريمازول + ليدوكايين', category: 'ENT (Ear, Nose, Throat)', defaultSellingPrice: '18.00', margin: '25', taxable: false, trackExpiry: true, requirePrescription: RX, unit: BT, unitsPerPack: 1 },
  { nameEn: 'Physiomer Nasal Spray', nameAr: 'فيزيومير بخاخ أنف', genericNameEn: 'Sea Water Isotonic', genericNameAr: 'ماء بحر متساوي التركيز', category: 'ENT (Ear, Nose, Throat)', defaultSellingPrice: '78.00', margin: '25', taxable: false, trackExpiry: true, requirePrescription: OTC, unit: P, unitsPerPack: 1 },

  // ═══════════════════════════════════════════════════════════════════
  //  17. DENTAL CARE  (العناية بالأسنان)
  // ═══════════════════════════════════════════════════════════════════
  { nameEn: 'Miconaz Oral Gel', nameAr: 'ميكوناز جل فموي', genericNameEn: 'Miconazole', genericNameAr: 'ميكونازول', category: 'Dental Care', defaultSellingPrice: '24.00', margin: '28', taxable: false, trackExpiry: true, requirePrescription: OTC, unit: T, unitsPerPack: 1 },
  { nameEn: 'Oracure Dental Gel', nameAr: 'أوراكيور جل أسنان', genericNameEn: 'Choline Salicylate + Cetalkonium', genericNameAr: 'كولين ساليسيلات + سيتالكونيوم', category: 'Dental Care', defaultSellingPrice: '24.00', margin: '25', taxable: false, trackExpiry: true, requirePrescription: OTC, unit: T, unitsPerPack: 1 },
  { nameEn: 'Hexitol Mouthwash', nameAr: 'هكسيتول غسول فم', genericNameEn: 'Chlorhexidine 0.125%', genericNameAr: 'كلورهكسيدين 0.125%', category: 'Dental Care', defaultSellingPrice: '24.00', margin: '28', taxable: false, trackExpiry: true, requirePrescription: OTC, unit: BT, unitsPerPack: 1 },
  { nameEn: 'Gengigel Mouthwash', nameAr: 'جينجيجل غسول فم', genericNameEn: 'Hyaluronic Acid', genericNameAr: 'حمض الهيالورونيك', category: 'Dental Care', defaultSellingPrice: '120.00', margin: '22', taxable: false, trackExpiry: true, requirePrescription: OTC, unit: BT, unitsPerPack: 1 },
  { nameEn: 'Tantum Verde Mouthwash', nameAr: 'تانتم فيردي غسول فم', genericNameEn: 'Benzydamine', genericNameAr: 'بنزيدامين', category: 'Dental Care', defaultSellingPrice: '48.00', margin: '25', taxable: false, trackExpiry: true, requirePrescription: OTC, unit: BT, unitsPerPack: 1 },

  // ═══════════════════════════════════════════════════════════════════
  //  18. URINARY TRACT  (المسالك البولية)
  // ═══════════════════════════════════════════════════════════════════
  { nameEn: 'Rowatinex Capsules', nameAr: 'رواتينكس كبسول', genericNameEn: 'Herbal Terpene Combination', genericNameAr: 'مزيج تربينات عشبي', category: 'Urinary Tract', defaultSellingPrice: '78.00', margin: '22', taxable: false, trackExpiry: true, requirePrescription: OTC, unit: B, unitsPerPack: 30 },
  { nameEn: 'Uro-Vaxom Capsules', nameAr: 'يورو-فاكسوم كبسول', genericNameEn: 'E. Coli Lyophilized Extract', genericNameAr: 'مستخلص بكتيريا القولون مجفف', category: 'Urinary Tract', defaultSellingPrice: '252.00', margin: '18', taxable: false, trackExpiry: true, requirePrescription: RX, unit: B, unitsPerPack: 30 },
  { nameEn: 'Urisef 400mg Capsules', nameAr: 'يوريسيف 400 مجم كبسول', genericNameEn: 'Cefixime', genericNameAr: 'سيفيكسيم', category: 'Urinary Tract', defaultSellingPrice: '78.00', margin: '22', taxable: false, trackExpiry: true, requirePrescription: RX, unit: B, unitsPerPack: 5 },
  { nameEn: 'Cystone Tablets', nameAr: 'سيستون أقراص', genericNameEn: 'Herbal Kidney Stone Combination', genericNameAr: 'مستخلص أعشاب لحصوات الكلى', category: 'Urinary Tract', defaultSellingPrice: '48.00', margin: '25', taxable: false, trackExpiry: true, requirePrescription: OTC, unit: B, unitsPerPack: 60 },
  { nameEn: 'Urispas 200mg Tablets', nameAr: 'يوريسباس 200 مجم أقراص', genericNameEn: 'Flavoxate', genericNameAr: 'فلافوكسيت', category: 'Urinary Tract', defaultSellingPrice: '36.00', margin: '25', taxable: false, trackExpiry: true, requirePrescription: RX, unit: B, unitsPerPack: 30 },
  { nameEn: 'Detrusitol 2mg Capsules', nameAr: 'ديتروسيتول 2 مجم كبسول', genericNameEn: 'Tolterodine', genericNameAr: 'تولتيرودين', category: 'Urinary Tract', defaultSellingPrice: '84.00', margin: '20', taxable: false, trackExpiry: true, requirePrescription: RX, unit: B, unitsPerPack: 28 },

  // ═══════════════════════════════════════════════════════════════════
  //  19. HORMONES & THYROID  (الهرمونات والغدة الدرقية)
  // ═══════════════════════════════════════════════════════════════════
  { nameEn: 'Eltroxin 50mcg Tablets', nameAr: 'إلتروكسين 50 ميكروجرام أقراص', genericNameEn: 'Levothyroxine', genericNameAr: 'ليفوثيروكسين', category: 'Hormones & Thyroid', defaultSellingPrice: '30.00', margin: '25', taxable: false, trackExpiry: true, requirePrescription: RX, unit: B, unitsPerPack: 50 },
  { nameEn: 'Eltroxin 100mcg Tablets', nameAr: 'إلتروكسين 100 ميكروجرام أقراص', genericNameEn: 'Levothyroxine', genericNameAr: 'ليفوثيروكسين', category: 'Hormones & Thyroid', defaultSellingPrice: '36.00', margin: '25', taxable: false, trackExpiry: true, requirePrescription: RX, unit: B, unitsPerPack: 50 },
  { nameEn: 'Euthyrox 50mcg Tablets', nameAr: 'يوثيروكس 50 ميكروجرام أقراص', genericNameEn: 'Levothyroxine', genericNameAr: 'ليفوثيروكسين', category: 'Hormones & Thyroid', defaultSellingPrice: '36.00', margin: '25', taxable: false, trackExpiry: true, requirePrescription: RX, unit: B, unitsPerPack: 50 },
  { nameEn: 'Prednisolone 5mg Tablets', nameAr: 'بريدنيزولون 5 مجم أقراص', genericNameEn: 'Prednisolone', genericNameAr: 'بريدنيزولون', category: 'Hormones & Thyroid', defaultSellingPrice: '12.00', margin: '28', taxable: false, trackExpiry: true, requirePrescription: RX, unit: S, unitsPerPack: 2 },
  { nameEn: 'Dexamethasone 0.5mg Tablets', nameAr: 'ديكساميثازون 0.5 مجم أقراص', genericNameEn: 'Dexamethasone', genericNameAr: 'ديكساميثازون', category: 'Hormones & Thyroid', defaultSellingPrice: '9.00', margin: '30', taxable: false, trackExpiry: true, requirePrescription: RX, unit: S, unitsPerPack: 2 },
  { nameEn: 'Neo-Mercazole 5mg Tablets', nameAr: 'نيوميركازول 5 مجم أقراص', genericNameEn: 'Carbimazole', genericNameAr: 'كاربيمازول', category: 'Hormones & Thyroid', defaultSellingPrice: '30.00', margin: '22', taxable: false, trackExpiry: true, requirePrescription: RX, unit: B, unitsPerPack: 50 },

  // ═══════════════════════════════════════════════════════════════════
  //  20. PERSONAL HYGIENE  (النظافة الشخصية)
  // ═══════════════════════════════════════════════════════════════════
  { nameEn: 'Betadine Solution 10%', nameAr: 'بيتادين محلول 10%', genericNameEn: 'Povidone-Iodine', genericNameAr: 'بوفيدون أيودين', category: 'Personal Hygiene', defaultSellingPrice: '36.00', margin: '28', taxable: false, trackExpiry: true, requirePrescription: OTC, unit: BT, unitsPerPack: 1 },
  { nameEn: 'Betadine Vaginal Wash', nameAr: 'بيتادين غسول مهبلي', genericNameEn: 'Povidone-Iodine', genericNameAr: 'بوفيدون أيودين', category: 'Personal Hygiene', defaultSellingPrice: '42.00', margin: '25', taxable: false, trackExpiry: true, requirePrescription: OTC, unit: BT, unitsPerPack: 1 },
  { nameEn: 'Gyno-Daktarin Vaginal Cream', nameAr: 'جينو-داكتارين كريم مهبلي', genericNameEn: 'Miconazole', genericNameAr: 'ميكونازول', category: 'Personal Hygiene', defaultSellingPrice: '48.00', margin: '22', taxable: false, trackExpiry: true, requirePrescription: RX, unit: T, unitsPerPack: 1 },
  { nameEn: 'Canesten Cream 1%', nameAr: 'كانستين كريم 1%', genericNameEn: 'Clotrimazole', genericNameAr: 'كلوتريمازول', category: 'Personal Hygiene', defaultSellingPrice: '30.00', margin: '25', taxable: false, trackExpiry: true, requirePrescription: OTC, unit: T, unitsPerPack: 1 },
  { nameEn: 'Canesten V Vaginal Tablets', nameAr: 'كانستين في أقماع مهبلية', genericNameEn: 'Clotrimazole 500mg', genericNameAr: 'كلوتريمازول 500 مجم', category: 'Personal Hygiene', defaultSellingPrice: '36.00', margin: '25', taxable: false, trackExpiry: true, requirePrescription: OTC, unit: P, unitsPerPack: 1 },
  { nameEn: 'Diflucan 150mg Capsule', nameAr: 'ديفلوكان 150 مجم كبسولة', genericNameEn: 'Fluconazole', genericNameAr: 'فلوكونازول', category: 'Personal Hygiene', defaultSellingPrice: '42.00', margin: '22', taxable: false, trackExpiry: true, requirePrescription: RX, unit: P, unitsPerPack: 1 },

  // ═══════════════════════════════════════════════════════════════════
  //  21. FIRST AID & ANTISEPTICS  (الإسعافات والمطهرات)
  // ═══════════════════════════════════════════════════════════════════
  { nameEn: 'Betadine Ointment', nameAr: 'بيتادين مرهم', genericNameEn: 'Povidone-Iodine', genericNameAr: 'بوفيدون أيودين', category: 'First Aid & Antiseptics', defaultSellingPrice: '24.00', margin: '25', taxable: false, trackExpiry: true, requirePrescription: OTC, unit: T, unitsPerPack: 1 },
  { nameEn: 'Flamazine Cream 1%', nameAr: 'فلامازين كريم 1%', genericNameEn: 'Silver Sulfadiazine', genericNameAr: 'سلفاديازين الفضة', category: 'First Aid & Antiseptics', defaultSellingPrice: '48.00', margin: '22', taxable: false, trackExpiry: true, requirePrescription: OTC, unit: T, unitsPerPack: 1 },
  { nameEn: 'Mebo Ointment (Burns)', nameAr: 'ميبو مرهم للحروق', genericNameEn: 'Beta-Sitosterol', genericNameAr: 'بيتا-سيتوستيرول', category: 'First Aid & Antiseptics', defaultSellingPrice: '66.00', margin: '22', taxable: false, trackExpiry: true, requirePrescription: OTC, unit: T, unitsPerPack: 1 },
  { nameEn: 'Hydrogen Peroxide 3%', nameAr: 'ماء الأكسجين 3%', genericNameEn: 'Hydrogen Peroxide', genericNameAr: 'بيروكسيد الهيدروجين', category: 'First Aid & Antiseptics', defaultSellingPrice: '6.00', margin: '35', taxable: false, trackExpiry: true, requirePrescription: OTC, unit: BT, unitsPerPack: 1 },
  { nameEn: 'Alcohol 70% Solution', nameAr: 'كحول 70% محلول', genericNameEn: 'Isopropyl Alcohol', genericNameAr: 'كحول أيزوبروبيلي', category: 'First Aid & Antiseptics', defaultSellingPrice: '12.00', margin: '30', taxable: false, trackExpiry: true, requirePrescription: OTC, unit: BT, unitsPerPack: 1 },
  { nameEn: 'Normal Saline 0.9% 500ml', nameAr: 'محلول ملحي 0.9% 500 مل', genericNameEn: 'Sodium Chloride 0.9%', genericNameAr: 'كلوريد الصوديوم 0.9%', category: 'First Aid & Antiseptics', defaultSellingPrice: '18.00', margin: '25', taxable: false, trackExpiry: true, requirePrescription: OTC, unit: BT, unitsPerPack: 1 },
  { nameEn: 'Sterile Gauze 10x10cm (10pcs)', nameAr: 'شاش معقم 10×10 سم (10 قطع)', genericNameEn: null, genericNameAr: null, category: 'First Aid & Antiseptics', defaultSellingPrice: '12.00', margin: '30', taxable: true, trackExpiry: false, requirePrescription: OTC, unit: B, unitsPerPack: 10 },
  { nameEn: 'Steri-Strip Wound Closures', nameAr: 'ستيري ستريب شرائط إغلاق الجروح', genericNameEn: null, genericNameAr: null, category: 'First Aid & Antiseptics', defaultSellingPrice: '36.00', margin: '25', taxable: true, trackExpiry: false, requirePrescription: OTC, unit: B, unitsPerPack: 5 },

  // ═══════════════════════════════════════════════════════════════════
  //  22. MEDICAL DEVICES  (أجهزة ومستلزمات طبية)
  // ═══════════════════════════════════════════════════════════════════
  { nameEn: 'Digital Thermometer', nameAr: 'ترمومتر رقمي', genericNameEn: null, genericNameAr: null, category: 'Medical Devices', defaultSellingPrice: '60.00', margin: '30', taxable: true, trackExpiry: false, requirePrescription: OTC, unit: P, unitsPerPack: 1 },
  { nameEn: 'Digital Blood Pressure Monitor', nameAr: 'جهاز قياس ضغط الدم الرقمي', genericNameEn: null, genericNameAr: null, category: 'Medical Devices', defaultSellingPrice: '480.00', margin: '25', taxable: true, trackExpiry: false, requirePrescription: OTC, unit: P, unitsPerPack: 1 },
  { nameEn: 'Blood Glucose Monitor Kit', nameAr: 'جهاز قياس السكر', genericNameEn: null, genericNameAr: null, category: 'Medical Devices', defaultSellingPrice: '360.00', margin: '25', taxable: true, trackExpiry: false, requirePrescription: OTC, unit: P, unitsPerPack: 1 },
  { nameEn: 'Glucose Test Strips 50pcs', nameAr: 'شرائط قياس السكر 50 قطعة', genericNameEn: null, genericNameAr: null, category: 'Medical Devices', defaultSellingPrice: '192.00', margin: '20', taxable: true, trackExpiry: true, requirePrescription: OTC, unit: B, unitsPerPack: 50 },
  { nameEn: 'Lancets 100pcs', nameAr: 'إبر وخز 100 قطعة', genericNameEn: null, genericNameAr: null, category: 'Medical Devices', defaultSellingPrice: '36.00', margin: '28', taxable: true, trackExpiry: false, requirePrescription: OTC, unit: B, unitsPerPack: 100 },
  { nameEn: 'Nebulizer Machine', nameAr: 'جهاز استنشاق (نيبولايزر)', genericNameEn: null, genericNameAr: null, category: 'Medical Devices', defaultSellingPrice: '600.00', margin: '22', taxable: true, trackExpiry: false, requirePrescription: OTC, unit: P, unitsPerPack: 1 },
  { nameEn: 'Nebulizer Mask Set (Adult)', nameAr: 'ماسك نيبولايزر كبار', genericNameEn: null, genericNameAr: null, category: 'Medical Devices', defaultSellingPrice: '36.00', margin: '28', taxable: true, trackExpiry: false, requirePrescription: OTC, unit: P, unitsPerPack: 1 },
  { nameEn: 'Nebulizer Mask Set (Pediatric)', nameAr: 'ماسك نيبولايزر أطفال', genericNameEn: null, genericNameAr: null, category: 'Medical Devices', defaultSellingPrice: '36.00', margin: '28', taxable: true, trackExpiry: false, requirePrescription: OTC, unit: P, unitsPerPack: 1 },
  { nameEn: 'Pulse Oximeter', nameAr: 'جهاز قياس نسبة الأكسجين', genericNameEn: null, genericNameAr: null, category: 'Medical Devices', defaultSellingPrice: '300.00', margin: '25', taxable: true, trackExpiry: false, requirePrescription: OTC, unit: P, unitsPerPack: 1 },
  { nameEn: 'Surgical Face Mask 50pcs', nameAr: 'كمامات طبية 50 قطعة', genericNameEn: null, genericNameAr: null, category: 'Medical Devices', defaultSellingPrice: '42.00', margin: '30', taxable: true, trackExpiry: false, requirePrescription: OTC, unit: B, unitsPerPack: 50 },
  { nameEn: 'Latex Examination Gloves 100pcs', nameAr: 'قفازات لاتكس كشف 100 قطعة', genericNameEn: null, genericNameAr: null, category: 'Medical Devices', defaultSellingPrice: '54.00', margin: '28', taxable: true, trackExpiry: false, requirePrescription: OTC, unit: B, unitsPerPack: 100 },
  { nameEn: 'Adhesive Bandage Strips 100pcs', nameAr: 'لصقات جروح 100 قطعة', genericNameEn: null, genericNameAr: null, category: 'Medical Devices', defaultSellingPrice: '24.00', margin: '30', taxable: true, trackExpiry: false, requirePrescription: OTC, unit: B, unitsPerPack: 100 },
  { nameEn: 'Cotton Roll 500g', nameAr: 'قطن طبي 500 جم', genericNameEn: null, genericNameAr: null, category: 'Medical Devices', defaultSellingPrice: '36.00', margin: '28', taxable: true, trackExpiry: false, requirePrescription: OTC, unit: P, unitsPerPack: 1 },
  { nameEn: 'Elastic Bandage 10cm', nameAr: 'رباط ضاغط 10 سم', genericNameEn: null, genericNameAr: null, category: 'Medical Devices', defaultSellingPrice: '12.00', margin: '30', taxable: true, trackExpiry: false, requirePrescription: OTC, unit: P, unitsPerPack: 1 },
  { nameEn: 'Disposable Syringes 3ml (100pcs)', nameAr: 'سرنجات 3 مل (100 قطعة)', genericNameEn: null, genericNameAr: null, category: 'Medical Devices', defaultSellingPrice: '60.00', margin: '25', taxable: true, trackExpiry: false, requirePrescription: OTC, unit: B, unitsPerPack: 100 },
  { nameEn: 'Insulin Syringes 100pcs', nameAr: 'سرنجات أنسولين 100 قطعة', genericNameEn: null, genericNameAr: null, category: 'Medical Devices', defaultSellingPrice: '84.00', margin: '22', taxable: true, trackExpiry: false, requirePrescription: OTC, unit: B, unitsPerPack: 100 },
  { nameEn: 'Pregnancy Test Strip', nameAr: 'شريط اختبار حمل', genericNameEn: null, genericNameAr: null, category: 'Medical Devices', defaultSellingPrice: '12.00', margin: '35', taxable: true, trackExpiry: true, requirePrescription: OTC, unit: P, unitsPerPack: 1 },

  // ═══════════════════════════════════════════════════════════════════
  //  23. NUTRITIONAL SUPPLEMENTS  (مكملات غذائية وألبان)
  // ═══════════════════════════════════════════════════════════════════
  { nameEn: 'Ensure Vanilla Powder 400g', nameAr: 'إنشور فانيلا بودرة 400 جم', genericNameEn: null, genericNameAr: null, category: 'Nutritional Supplements', defaultSellingPrice: '192.00', margin: '22', taxable: false, trackExpiry: true, requirePrescription: OTC, unit: P, unitsPerPack: 1 },
  { nameEn: 'Glucerna Powder 400g', nameAr: 'جلوسيرنا بودرة 400 جم', genericNameEn: null, genericNameAr: null, category: 'Nutritional Supplements', defaultSellingPrice: '228.00', margin: '22', taxable: false, trackExpiry: true, requirePrescription: OTC, unit: P, unitsPerPack: 1 },
  { nameEn: 'Pediasure Complete 400g', nameAr: 'بدياشور كومبليت 400 جم', genericNameEn: null, genericNameAr: null, category: 'Nutritional Supplements', defaultSellingPrice: '210.00', margin: '20', taxable: false, trackExpiry: true, requirePrescription: OTC, unit: P, unitsPerPack: 1 },
  { nameEn: 'Bebelac 1 Infant Formula 400g', nameAr: 'بيبيلاك 1 حليب أطفال 400 جم', genericNameEn: null, genericNameAr: null, category: 'Nutritional Supplements', defaultSellingPrice: '132.00', margin: '18', taxable: false, trackExpiry: true, requirePrescription: OTC, unit: P, unitsPerPack: 1 },
  { nameEn: 'Bebelac 2 Follow-On Formula 400g', nameAr: 'بيبيلاك 2 حليب متابعة 400 جم', genericNameEn: null, genericNameAr: null, category: 'Nutritional Supplements', defaultSellingPrice: '120.00', margin: '18', taxable: false, trackExpiry: true, requirePrescription: OTC, unit: P, unitsPerPack: 1 },
  { nameEn: 'S-26 Gold 1 Infant Formula 400g', nameAr: 'إس 26 جولد 1 حليب أطفال 400 جم', genericNameEn: null, genericNameAr: null, category: 'Nutritional Supplements', defaultSellingPrice: '168.00', margin: '18', taxable: false, trackExpiry: true, requirePrescription: OTC, unit: P, unitsPerPack: 1 },
  { nameEn: 'NAN Optipro 1 Infant Formula 400g', nameAr: 'نان أوبتيبرو 1 حليب أطفال 400 جم', genericNameEn: null, genericNameAr: null, category: 'Nutritional Supplements', defaultSellingPrice: '180.00', margin: '18', taxable: false, trackExpiry: true, requirePrescription: OTC, unit: P, unitsPerPack: 1 },
  { nameEn: 'Similac 1 Infant Formula 400g', nameAr: 'سيميلاك 1 حليب أطفال 400 جم', genericNameEn: null, genericNameAr: null, category: 'Nutritional Supplements', defaultSellingPrice: '156.00', margin: '18', taxable: false, trackExpiry: true, requirePrescription: OTC, unit: P, unitsPerPack: 1 },
  { nameEn: 'Hero Baby Cereal 150g', nameAr: 'هيرو بيبي سيريلاك 150 جم', genericNameEn: null, genericNameAr: null, category: 'Nutritional Supplements', defaultSellingPrice: '54.00', margin: '22', taxable: false, trackExpiry: true, requirePrescription: OTC, unit: P, unitsPerPack: 1 },

  // ═══════════════════════════════════════════════════════════════════
  //  24. MOTHER & PREGNANCY  (الأمومة والحمل)
  // ═══════════════════════════════════════════════════════════════════
  { nameEn: 'Pregnacare Original Tablets', nameAr: 'بريجناكير أوريجينال أقراص', genericNameEn: 'Prenatal Vitamins + Iron + Folic Acid + DHA', genericNameAr: 'فيتامينات حمل + حديد + حمض فوليك', category: 'Mother & Pregnancy', defaultSellingPrice: '156.00', margin: '22', taxable: false, trackExpiry: true, requirePrescription: OTC, unit: B, unitsPerPack: 30 },
  { nameEn: 'Pregnacare Plus Tablets + Omega-3', nameAr: 'بريجناكير بلس أقراص + أوميجا 3', genericNameEn: 'Prenatal Multivitamin + Omega-3', genericNameAr: 'فيتامينات حمل + أوميجا 3', category: 'Mother & Pregnancy', defaultSellingPrice: '240.00', margin: '22', taxable: false, trackExpiry: true, requirePrescription: OTC, unit: B, unitsPerPack: 56 },
  { nameEn: 'Elevit Pronatal Tablets', nameAr: 'إليفيت برونيتال أقراص', genericNameEn: 'Prenatal Multivitamin + Minerals', genericNameAr: 'فيتامينات ومعادن متعددة للحمل', category: 'Mother & Pregnancy', defaultSellingPrice: '192.00', margin: '20', taxable: false, trackExpiry: true, requirePrescription: OTC, unit: B, unitsPerPack: 30 },
  { nameEn: 'Iron Bisglycinate 25mg Capsules', nameAr: 'حديد بيسجلايسينات 25 مجم كبسول', genericNameEn: 'Iron Bisglycinate', genericNameAr: 'حديد بيسجلايسينات', category: 'Mother & Pregnancy', defaultSellingPrice: '90.00', margin: '25', taxable: false, trackExpiry: true, requirePrescription: OTC, unit: B, unitsPerPack: 30 },
  { nameEn: 'Duphaston 10mg Tablets', nameAr: 'دوفاستون 10 مجم أقراص', genericNameEn: 'Dydrogesterone', genericNameAr: 'ديدروجيستيرون', category: 'Mother & Pregnancy', defaultSellingPrice: '132.00', margin: '18', taxable: false, trackExpiry: true, requirePrescription: RX, unit: B, unitsPerPack: 20 },
  { nameEn: 'Cyclogest 400mg Pessaries', nameAr: 'سيكلوجست 400 مجم تحاميل', genericNameEn: 'Progesterone', genericNameAr: 'بروجيسترون', category: 'Mother & Pregnancy', defaultSellingPrice: '120.00', margin: '20', taxable: false, trackExpiry: true, requirePrescription: RX, unit: B, unitsPerPack: 15 },
  { nameEn: 'Clexane 40mg Pre-filled Syringe', nameAr: 'كليكسان 40 مجم سرنجة معبأة', genericNameEn: 'Enoxaparin', genericNameAr: 'إينوكسابارين', category: 'Mother & Pregnancy', defaultSellingPrice: '96.00', margin: '18', taxable: false, trackExpiry: true, requirePrescription: RX, unit: P, unitsPerPack: 1 },
];
