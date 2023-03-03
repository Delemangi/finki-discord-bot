// eslint-disable-next-line import/no-cycle
import { Poll } from './Poll.js';
// eslint-disable-next-line import/no-cycle
import { PollVote } from './PollVote.js';
import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  Relation
} from 'typeorm';

@Entity()
export class PollOption {
  @PrimaryGeneratedColumn('uuid')
  public id!: string;

  @Column('text', {
    nullable: false
  })
  public name!: string;

  @ManyToOne(() => Poll, (poll) => poll.options, {
    nullable: false,
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
  })
  public poll!: Relation<Poll>;

  @OneToMany(() => PollVote, (vote) => vote.option, {
    cascade: true,
    nullable: true,
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
  })
  public votes!: Relation<PollVote>[];
}
