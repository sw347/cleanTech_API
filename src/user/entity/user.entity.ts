import { Column, Entity, JoinColumn, ManyToOne, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { UserProfileEntity } from "./user-profile.entity";
import { SocialLoginEntity } from "./social-login.entity";

@Entity({ name: "user", database: "main" })
export class UserEntity {
  @PrimaryGeneratedColumn({ name: "id", type: "int" })
  id: number;

  @Column({ name: "email", type: "varchar", length: 191 })
  email: string;

  @Column({ name: "name", type: "varchar", length: 191, nullable: false })
  name: string;

  @Column({name: 'role', type: 'varchar'})
  role: string;

  @Column({ name: "profile_id", type: "int", nullable: false })
  profileId: number;

  @Column({ name: "created_at", type: "bigint", nullable: false })
  createdAt: number;

  @Column({ name: "updated_at", type: "bigint", nullable: false })
  updatedAt: number;

  @Column({ name: "deleted_at", type: "bigint", nullable: true })
  deletedAt?: number;

  @ManyToOne(() => UserProfileEntity, (profile) => profile.id, {
    createForeignKeyConstraints: false
  })
  @JoinColumn({ name: "profile_id", referencedColumnName: "id" })
  profile: UserProfileEntity;

  @OneToOne(() => SocialLoginEntity, (socialLogin) => socialLogin.user, {
    createForeignKeyConstraints: false
  })
  socialLogin: SocialLoginEntity;

}
