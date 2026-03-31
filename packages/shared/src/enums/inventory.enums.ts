export enum ProductUnit {
  PIECE = 'piece',
  BOX = 'box',
  STRIP = 'strip',
  BOTTLE = 'bottle',
  VIAL = 'vial',
  TUBE = 'tube',
  SACHET = 'sachet',
}

export enum BatchStatus {
  ACTIVE = 'ACTIVE',
  EXPIRED = 'EXPIRED',
  DEPLETED = 'DEPLETED',
}

export enum AdjustmentReason {
  PHYSICAL_COUNT = 'PHYSICAL_COUNT',
  DAMAGE = 'DAMAGE',
  RETURN = 'RETURN',
  THEFT = 'THEFT',
  TRANSFER = 'TRANSFER',
  OTHER = 'OTHER',
}
