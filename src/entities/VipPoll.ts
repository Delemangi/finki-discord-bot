import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity()
export class VipPoll {
  @PrimaryColumn('uuid')
  public id!: string;

  @Column('text', { nullable: false })
  public user!: string;
}
