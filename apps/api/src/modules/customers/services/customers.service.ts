import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull, DataSource } from 'typeorm';
import { Customer } from '../../../database/entities/customer.entity';
import { PaginationDto } from '../../../common/dto/pagination.dto';
import { DEFAULT_PAGE, DEFAULT_LIMIT, MAX_LIMIT } from '@pharmapos/shared';
import { CreateCustomerDto } from '../dto/create-customer.dto';
import { UpdateCustomerDto } from '../dto/update-customer.dto';

@Injectable()
export class CustomersService {
  constructor(
    @InjectRepository(Customer) private customerRepo: Repository<Customer>,
    private dataSource: DataSource,
  ) {}

  async findAll(pagination: PaginationDto, search?: string) {
    const page = Math.max(pagination.page || DEFAULT_PAGE, 1);
    const limit = Math.min(Math.max(pagination.limit || DEFAULT_LIMIT, 1), MAX_LIMIT);

    const qb = this.customerRepo.createQueryBuilder('c')
      .leftJoinAndSelect('c.creditAccount', 'ca')
      .where('c.deletedAt IS NULL');

    if (search) {
      qb.andWhere('(c.name ILIKE :search OR c.nameAr ILIKE :search OR c.phone ILIKE :search)', {
        search: `%${search}%`,
      });
    }

    const [data, total] = await qb
      .orderBy('c.name', 'ASC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return { data, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }

  async findById(id: string): Promise<Customer> {
    const customer = await this.customerRepo.findOne({
      where: { id, deletedAt: IsNull() },
      relations: ['creditAccount'],
    });
    if (!customer) throw new NotFoundException('Customer not found');
    return customer;
  }

  async getInvoices(customerId: string, pagination: PaginationDto) {
    const page = Math.max(pagination.page || DEFAULT_PAGE, 1);
    const limit = Math.min(Math.max(pagination.limit || DEFAULT_LIMIT, 1), MAX_LIMIT);

    const [data, total] = await this.dataSource.query(
      `SELECT i.* FROM invoices i WHERE i.customer_id = $1 AND i.deleted_at IS NULL ORDER BY i.created_at DESC LIMIT $2 OFFSET $3`,
      [customerId, limit, (page - 1) * limit],
    );

    const [countResult] = await this.dataSource.query(
      `SELECT COUNT(*) as total FROM invoices WHERE customer_id = $1 AND deleted_at IS NULL`,
      [customerId],
    );

    return {
      data: data || [],
      meta: { page, limit, total: parseInt(countResult?.total || '0', 10), totalPages: Math.ceil(parseInt(countResult?.total || '0', 10) / limit) },
    };
  }

  async getLedger(customerId: string) {
    const entries = await this.dataSource.query(
      `(SELECT 'INVOICE' as type, i.invoice_number as reference, i.total as amount, i.created_at as date
        FROM invoices i WHERE i.customer_id = $1 AND i.status = 'CREDIT' AND i.deleted_at IS NULL)
       UNION ALL
       (SELECT 'PAYMENT' as type, cp.id as reference, cp.amount as amount, cp.created_at as date
        FROM credit_payments cp
        JOIN credit_accounts ca ON cp.credit_account_id = ca.id
        WHERE ca.customer_id = $1 AND cp.deleted_at IS NULL)
       ORDER BY date DESC`,
      [customerId],
    );
    return entries;
  }

  async create(dto: CreateCustomerDto): Promise<Customer> {
    const customer = this.customerRepo.create(dto);
    return this.customerRepo.save(customer);
  }

  async update(id: string, dto: UpdateCustomerDto): Promise<Customer> {
    const customer = await this.findById(id);
    Object.assign(customer, dto);
    return this.customerRepo.save(customer);
  }
}
