import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { CleanEntity } from '../../clean/entity/clean.entity';


@Entity({ name: "duty", database: "main"})
export class DutyEntity {
  @PrimaryGeneratedColumn({name: "id", type: "int"})
  id: number;
  
  @JoinColumn()
  @OneToOne(() => CleanEntity)
  cleanId: number;
  
  @Column()
  username: string;
  
  @Column({ name: "created_at", type: "bigint", nullable: false })
  createdAt: number;
  
  @Column({ name: "deleted_at", type: "bigint", nullable: true })
  deletedAt?: number;
}