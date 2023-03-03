// eslint-disable-next-line import/no-cycle
import { PollOption } from './PollOption.js';
import {
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  Relation
} from 'typeorm';

@Entity()
export class PollVote {
  @PrimaryGeneratedColumn('uuid')
  public id!: string;

  @Column('text', {
    nullable: false
  })
  public user!: string;

  @ManyToOne(() => PollOption, (option) => option.votes, {
    nullable: false,
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
  })
  public option!: Relation<PollOption>;
}
