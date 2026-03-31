import { Controller, Get, Post, Patch, Delete, Param, Body, Query } from '@nestjs/common';
import { RulesService } from '../services/rules.service';
import { RequirePermission } from '../../../common/decorators/permission.decorator';
import { CreateRuleDto } from '../dto/create-rule.dto';
import { UpdateRuleDto } from '../dto/update-rule.dto';
import { EvaluateRulesDto } from '../dto/evaluate-rules.dto';

@Controller('rules')
export class RulesController {
  constructor(private rulesService: RulesService) {}

  @Get()
  async findAll(@Query('type') type?: string, @Query('active') active?: string) {
    return this.rulesService.findAll(type, active === 'true');
  }

  @Post()
  @RequirePermission('settings:manage')
  async create(@Body() dto: CreateRuleDto) {
    return this.rulesService.create(dto);
  }

  @Patch(':id')
  @RequirePermission('settings:manage')
  async update(@Param('id') id: string, @Body() dto: UpdateRuleDto) {
    return this.rulesService.update(id, dto);
  }

  @Delete(':id')
  @RequirePermission('settings:manage')
  async remove(@Param('id') id: string) {
    return this.rulesService.remove(id);
  }

  @Post('evaluate')
  async evaluate(@Body() dto: EvaluateRulesDto) {
    return this.rulesService.evaluate(dto.type, dto.context);
  }
}
