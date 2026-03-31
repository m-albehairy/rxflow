export enum RuleType {
  SALE = 'SALE',
  INVENTORY = 'INVENTORY',
  USER = 'USER',
  CREDIT = 'CREDIT',
}

export enum RuleActionType {
  BLOCK = 'BLOCK',
  WARN = 'WARN',
  REQUIRE_APPROVAL = 'REQUIRE_APPROVAL',
  AUTO_ADJUST = 'AUTO_ADJUST',
  NOTIFY = 'NOTIFY',
}
