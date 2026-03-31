import { Controller, Get, Query } from '@nestjs/common';
import { AuditQueryService } from '../services/audit-query.service';
import { RequirePermission } from '../../../common/decorators/permission.decorator';
import { FilterAuditDto } from '../dto/filter-audit.dto';

@Controller('audit')
export class AuditController {
  constructor(private auditQueryService: AuditQueryService) {}

  @Get()
  @RequirePermission('reports:view')
  async findAll(@Query() filter: FilterAuditDto) {
    return this.auditQueryService.findAll(filter);
  }
}
