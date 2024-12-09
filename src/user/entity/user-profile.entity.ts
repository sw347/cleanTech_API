import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity({name: 'user_profile', database: 'main'})
export class UserProfileEntity {
  @PrimaryGeneratedColumn({name: 'id', type: 'int'})
  id: number;

  @Column({name: 'name', type: 'varchar', length: 191, nullable:  false})
  name: string;

  @Column({name: 'profile_url', type: 'varchar', length: 191, nullable:  false})
  profileUrl: string;

  @Column({name: 'version', type: 'int', nullable: false})
  version: number;

  @Column({name: 'order', type: 'int', nullable: false})
  order: number;

  @Column({name: 'created_at', type: 'bigint', nullable: false})
  createdAt: number;

  @Column({name: 'updated_at', type: 'bigint', nullable: false})
  updatedAt: number;

  @Column({name: 'deleted_at', type: 'bigint', nullable: true})
  deletedAt?: number;
}