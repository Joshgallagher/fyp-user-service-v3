import { Entity, Column, BaseEntity, PrimaryGeneratedColumn, Unique } from 'typeorm';
import { Length, IsEmail, IsNotEmpty, IsUUID } from 'class-validator';

@Entity()
@Unique(['email'])
export class User extends BaseEntity {
    @PrimaryGeneratedColumn('uuid')
    @IsNotEmpty()
    @IsUUID()
    id: string;

    @Column()
    @IsNotEmpty()
    name: string;

    @Column()
    @IsNotEmpty()
    @IsEmail()
    email: string;

    @Column()
    @IsNotEmpty()
    @Length(6)
    password: string;
}
