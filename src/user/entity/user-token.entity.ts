import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { UserEntity } from "./user.entity";

@Entity({name: 'user_token', database: 'main'})
export class UserTokenEntity {
  @PrimaryGeneratedColumn({name: 'id', type: 'int'})
  id: number;

  @Column({name: 'user_id', type: 'int', nullable: false})
  userId: number;

  @Column({
    name: 'refresh_token',
    type: 'varchar',
    length: 191,
    nullable: false,
  })
  refreshToken: string;

  @OneToOne(() => UserEntity, (user) => user.id, { createForeignKeyConstraints: false})
  @JoinColumn({name: 'user_id', referencedColumnName: 'id'})
  user: UserEntity;

}