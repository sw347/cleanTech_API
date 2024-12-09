import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity({ name: "clean", database: "main" })
export class CleanEntity {
  @PrimaryGeneratedColumn({ name: "id", type: "int" })
  id: number;

  @Column({ name: "name", type: "varchar", length: 191, nullable: false })
  name: string;

  @Column({name: 'role', type: 'varchar'})
  role: string;

  @Column()
  img: string;

  @Column()
  location: string;

  @Column({ name: "created_at", type: "bigint", nullable: false })
  createdAt: number;

  @Column({ name: "deleted_at", type: "bigint", nullable: true })
  deletedAt?: number;
}
