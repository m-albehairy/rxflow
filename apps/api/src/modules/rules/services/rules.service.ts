import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { Rule } from '../../../database/entities/rule.entity';
import { RulesEngineService } from '../../../shared/rules/rules-engine.service';
import { ErrorMessages } from '../../../common/constants/error-messages';
import { RuleType } from '@pharmapos/shared';
import { CreateRuleDto } from '../dto/create-rule.dto';
import { UpdateRuleDto } from '../dto/update-rule.dto';

@Injectable()
export class RulesService {
  constructor(
    @InjectRepository(Rule) private ruleRepo: Repository<Rule>,
    private rulesEngine: RulesEngineService,
  ) {}

  async findAll(type?: string, activeOnly?: boolean): Promise<Rule[]> {
    const qb = this.ruleRepo.createQueryBuilder('r').where('r.deletedAt IS NULL');
    if (type) qb.andWhere('r.type = :type', { type });
    if (activeOnly) qb.andWhere('r.isActive = true');
    return qb.orderBy('r.priority', 'DESC').getMany();
  }

  async findById(id: string): Promise<Rule> {
    const rule = await this.ruleRepo.findOne({ where: { id, deletedAt: IsNull() } });
    if (!rule) throw new NotFoundException('Rule not found');
    return rule;
  }

  async create(dto: CreateRuleDto): Promise<Rule> {
    const rule = this.ruleRepo.create(dto);
    return this.ruleRepo.save(rule);
  }

  async update(id: string, dto: UpdateRuleDto): Promise<Rule> {
    const rule = await this.findById(id);
    Object.assign(rule, dto);
    return this.ruleRepo.save(rule);
  }

  async remove(id: string): Promise<void> {
    const rule = await this.findById(id);
    if (rule.isSystem) throw new BadRequestException(ErrorMessages.RULE_SYSTEM_CANNOT_DELETE);
    await this.ruleRepo.softDelete(id);
  }

  async evaluate(type: string, context: Record<string, unknown>) {
    const rules = await this.findAll(type, true);
    const definitions = rules.map((r) => ({
      id: r.id,
      name: r.name,
      condition: r.condition as any,
      action: r.action as any,
      priority: r.priority,
      isActive: r.isActive,
    }));
    return this.rulesEngine.evaluate(definitions, context);
  }
}
