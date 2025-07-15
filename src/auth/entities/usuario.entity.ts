//Define la entidad Usuario, incluyendo campos como username, password (que deberá ser hasheada), 
//nombre_completo y una relación con la entidad Rol.
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Rol } from './rol.entity'; // Importamos la entidad Rol
import * as bcrypt from 'bcrypt'; // Importamos bcrypt para hashear contraseñas de forma segura
import { ApiProperty } from '@nestjs/swagger';

/**
 * Entidad Usuario que mapea a la tabla 'usuarios' en la base de datos.
 * Representa a un usuario del sistema con su información personal y rol.
 */
@Entity('usuarios') // Define el nombre de la tabla en la base de datos
export class Usuario {

  @ApiProperty({
        description: 'Identificador único del usuario',
        example: 1,
        readOnly: true, // Indica que este campo es generado y no debe ser enviado en peticiones de creación/actualización
    })
  @PrimaryGeneratedColumn() // Columna de clave primaria autoincremental
  id_usuario: number;


  @ApiProperty({
        description: 'Nombre de usuario único para inicio de sesión',
        example: 'juan.perez',
        maxLength: 255, // Si tienes una limitación de longitud en la DB
    })
  @Column({ unique: true, nullable: false }) // Nombre de usuario único y no nulo
  username: string;


  @ApiProperty({
        description: 'Contraseña del usuario (hasheada en la base de datos)',
        example: 'mySecurePassword123',
        writeOnly: true, // Importante: indica que solo se usa para escribir (no se devuelve en respuestas)
        maxLength: 255, // Si tienes una limitación de longitud en la DB
    })
  @Column({ nullable: false }) // Contraseña del usuario (se almacenará hasheada)
  password: string;

  @ApiProperty({
        description: 'Nombre completo del usuario',
        example: 'Juan Pérez García',
        maxLength: 255, // Si tienes una limitación de longitud en la DB
    })
  @Column({ nullable: false }) // Nombre completo del usuario
  nombre_completo: string;

  @ApiProperty({
        description: 'Objeto del rol asignado al usuario',
        type: () => Rol, // Usa una función para evitar problemas de referencia circular
        example: { id_rol: 1, nombre: 'administrador' }, // Ejemplo de cómo se vería el objeto Rol
        readOnly: true, // El rol generalmente no se actualiza directamente así en el DTO
    })
  @ManyToOne(() => Rol, (rol) => rol.usuarios, { eager: true, nullable: false })
  @JoinColumn({ name: 'rol_id' }) // Define la columna de clave foránea en la tabla 'usuarios'
  rol: Rol;

  @ApiProperty({
        description: 'ID de la clave foránea del rol del usuario',
        example: 2,
        type: Number, // Especifica el tipo
    })
  @Column({ name: 'rol_id', type: 'int', nullable: false })
  rol_id: number;


  async hashPassword() {
    // Genera un "salt" (cadena aleatoria) y luego lo usa para hashear la contraseña.
    // El costo de 10 es un buen equilibrio entre seguridad y rendimiento.
    this.password = await bcrypt.hash(this.password, 10);
  }

  /**
   * Método para comparar una contraseña en texto plano con la contraseña hasheada almacenada.
   * Utilizado durante el proceso de inicio de sesión.
   * @param password_plain La contraseña en texto plano a comparar.
   * @returns Verdadero si las contraseñas coinciden, falso en caso contrario.
   */
  async comparePassword(password_plain: string): Promise<boolean> {
    return bcrypt.compare(password_plain, this.password);
  }
}