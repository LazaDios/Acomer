import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Rol } from './rol.entity';
import { Restaurante } from '../../restaurantes/entities/restaurante.entity';
import * as bcrypt from 'bcrypt';
import { ApiProperty } from '@nestjs/swagger';

@Entity('usuarios')
export class Usuario {

  @ApiProperty({
    description: 'Identificador único del usuario',
    example: 1,
    readOnly: true,
  })
  @PrimaryGeneratedColumn()
  id_usuario: number;

  @ApiProperty({
    description: 'Nombre de usuario único para inicio de sesión',
    example: 'juan.perez',
    maxLength: 255,
  })
  @Column({ unique: true, nullable: true })
  username: string;

  @ApiProperty({
    description: 'Correo electrónico del usuario',
    example: 'juan.perez@gmail.com',
    maxLength: 255,
  })
  @Column({ unique: true, nullable: true })
  email: string;

  @ApiProperty({
    description: 'ID de Google para usuarios registrados con Gmail',
    example: '1234567890',
    readOnly: true,
  })
  @Column({ name: 'google_id', unique: true, nullable: true })
  google_id: string;

  @ApiProperty({
    description: 'Contraseña del usuario (hasheada). Opcional si usa Google Login.',
    example: 'mySecurePassword123',
    writeOnly: true,
    maxLength: 255,
  })
  @Column({ nullable: true })
  password: string;

  @ApiProperty({
    description: 'Nombre completo del usuario',
    example: 'Juan Pérez',
    maxLength: 255,
  })
  @Column()
  nombre_completo: string;

  @Column({ nullable: true })
  cedula: string;



  @ApiProperty({
    description: 'Rol del usuario (relación con la tabla roles)',
    type: () => Rol,
  })
  @ManyToOne(() => Rol, (rol) => rol.usuarios, { eager: true, nullable: false })
  @JoinColumn({ name: 'rol_id' })
  rol: Rol;

  @ApiProperty({
    description: 'ID de la clave foránea del rol del usuario',
    example: 2,
    type: Number,
  })
  @Column({ name: 'rol_id', type: 'int', nullable: false })
  rol_id: number;

  @ManyToOne(() => Restaurante, (restaurante) => restaurante.usuarios, { nullable: true })
  @JoinColumn({ name: 'id_restaurante' })
  restaurante: Restaurante;

  @Column({ nullable: true })
  id_restaurante: number;

  async hashPassword() {
    if (this.password) {
      this.password = await bcrypt.hash(this.password, 10);
    }
  }

  async comparePassword(password_plain: string): Promise<boolean> {
    if (!this.password) return false;
    return bcrypt.compare(password_plain, this.password);
  }
}