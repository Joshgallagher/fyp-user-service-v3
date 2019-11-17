import { Entity, Column, BaseEntity, PrimaryGeneratedColumn, Unique } from 'typeorm';
import { Length, IsEmail, IsDefined, IsNotEmpty } from 'class-validator';

@Entity()
@Unique(['email'])
export class User extends BaseEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    @IsDefined()
    @IsNotEmpty()
    @Length(1)
    name: string;

    @Column()
    @IsDefined()
    @IsNotEmpty()
    @Length(1)
    @IsEmail()
    email: string;

    @Column()
    @IsDefined()
    @IsNotEmpty()
    @Length(6)
    password: string;
}
