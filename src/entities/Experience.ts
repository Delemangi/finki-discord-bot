import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Experience {
  @PrimaryGeneratedColumn('uuid')
  public id!: string;

  @Column('text', { nullable: false })
  public user!: string;

  @Column('text', { nullable: false })
  public tag!: string;

  @Column('int', { default: 0, nullable: false })
  public messages!: number;

  @Column('bigint', { default: 0, nullable: false })
  public experience!: number;

  @Column('int', { default: 0, nullable: false })
  public level!: number;
}
