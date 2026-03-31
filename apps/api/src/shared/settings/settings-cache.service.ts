import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { TTL_SETTINGS } from '@pharmapos/shared';

interface CachedSettings {
  data: Map<string, { value: unknown; isLocked: boolean; group: string }>;
  timestamp: number;
}

@Injectable()
export class SettingsCacheService {
  private cache: CachedSettings | null = null;

  constructor(private dataSource: DataSource) {}

  /**
   * Get a single setting value by key. Returns from cache if fresh.
   */
  async get<T = unknown>(key: string): Promise<T | null> {
    const settings = await this.loadAll();
    const setting = settings.get(key);
    return setting ? (setting.value as T) : null;
  }

  /**
   * Get a setting value with a default fallback.
   */
  async getOrDefault<T = unknown>(key: string, defaultValue: T): Promise<T> {
    const value = await this.get<T>(key);
    return value ?? defaultValue;
  }

  /**
   * Check if a setting is locked (immutable after setup).
   */
  async isLocked(key: string): Promise<boolean> {
    const settings = await this.loadAll();
    const setting = settings.get(key);
    return setting?.isLocked ?? false;
  }

  /**
   * Get all settings as a Map.
   */
  async getAll(): Promise<Map<string, { value: unknown; isLocked: boolean; group: string }>> {
    return this.loadAll();
  }

  /**
   * Get settings by group.
   */
  async getByGroup(group: string): Promise<Record<string, unknown>> {
    const settings = await this.loadAll();
    const result: Record<string, unknown> = {};
    settings.forEach((setting, key) => {
      if (setting.group === group) {
        result[key] = setting.value;
      }
    });
    return result;
  }

  /**
   * Invalidate cache — call after any setting is updated.
   */
  invalidate(): void {
    this.cache = null;
  }

  private async loadAll(): Promise<Map<string, { value: unknown; isLocked: boolean; group: string }>> {
    if (this.cache && Date.now() - this.cache.timestamp < TTL_SETTINGS) {
      return this.cache.data;
    }

    const rows = await this.dataSource.query(
      `SELECT key, value, is_locked, "group" FROM settings WHERE deleted_at IS NULL`,
    );

    const data = new Map<string, { value: unknown; isLocked: boolean; group: string }>();
    for (const row of rows) {
      data.set(row.key, {
        value: row.value,
        isLocked: row.is_locked,
        group: row.group,
      });
    }

    this.cache = { data, timestamp: Date.now() };
    return data;
  }
}
