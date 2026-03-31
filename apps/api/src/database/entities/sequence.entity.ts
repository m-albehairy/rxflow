import { Entity, Column, PrimaryGeneratedColumn, Unique } from 'typeorm';

@Entity('sequences')
@Unique(['prefix', 'year'])
export class Sequence {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  prefix: string;

  @Column()
  year: number;

  @Column({ default: 0 })
  lastValue: number;
}
