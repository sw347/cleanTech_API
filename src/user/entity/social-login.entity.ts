import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { UserEntity } from './user.entity';

@Entity({ name: 'social_login', database: 'main' })
export class SocialLoginEntity {
  @PrimaryGeneratedColumn({ name: 'id', type: 'int' })
  id: number;

  @Column({ name: 'user_id', type: 'int', nullable: false })
  userId: number;

  @Column({ name: 'type', type: 'varchar', length: 191, nullable: false })
  type: string;

  @Column({ name: 'identifier', type: 'varchar', length: 191, nullable: false })
  identifier: string;

  @OneToOne(() => UserEntity, (user) => user.socialLogin, {
    createForeignKeyConstraints: false,
  })
  @JoinColumn({ name: 'user_id', referencedColumnName: 'id' })
  user: UserEntity;
}
