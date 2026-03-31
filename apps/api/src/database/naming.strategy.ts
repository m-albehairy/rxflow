import { DefaultNamingStrategy, NamingStrategyInterface } from 'typeorm';

export class SnakeCaseNamingStrategy extends DefaultNamingStrategy implements NamingStrategyInterface {
  tableName(className: string, customName: string | undefined): string {
    if (customName) return customName;
    return this.toSnakeCase(className) + 's';
  }

  columnName(propertyName: string, customName: string | undefined, embeddedPrefixes: string[]): string {
    if (customName) return customName;
    return embeddedPrefixes.concat(propertyName).map(this.toSnakeCase).join('_');
  }

  relationName(propertyName: string): string {
    return this.toSnakeCase(propertyName);
  }

  joinColumnName(relationName: string, referencedColumnName: string): string {
    return this.toSnakeCase(relationName) + '_' + referencedColumnName;
  }

  joinTableName(firstTableName: string, secondTableName: string): string {
    return this.toSnakeCase(firstTableName) + '_' + this.toSnakeCase(secondTableName);
  }

  joinTableColumnName(tableName: string, propertyName: string, columnName?: string): string {
    return this.toSnakeCase(tableName) + '_' + (columnName || this.toSnakeCase(propertyName));
  }

  private toSnakeCase(str: string): string {
    return str.replace(/([A-Z])/g, (match, p1, offset) => (offset > 0 ? '_' : '') + p1.toLowerCase());
  }
}
