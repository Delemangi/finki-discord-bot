// eslint-disable-next-line import/no-cycle
import {
  Column,
  Entity,
  PrimaryGeneratedColumn
} from 'typeorm';

@Entity()
export class Reminder {
  @PrimaryGeneratedColumn('uuid')
  public id!: string;

  @Column('text', { nullable: false })
  public description!: string;

  @Column('timestamp', { nullable: false })
  public date!: Date;

  @Column('text', { nullable: false })
  public owner!: string;

  @Column('boolean', {
    default: false,
    nullable: false
  })
  public private!: boolean;

  @Column('text', { nullable: true })
  public channel!: string;
}
