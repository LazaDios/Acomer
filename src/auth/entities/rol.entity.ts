//Define la entidad Rol con los tipos de rol (ADMINISTRADOR, MESONERO, COCINERO). 
//Este es un buen punto de partida porque los usuarios dependen de los roles.
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Usuario } from './usuario.entity';

/**
 * Enumeración para los nombres de los roles.
 * Esto ayuda a evitar errores tipográficos y mejora la legibilidad.
 */
export enum NombreRol {
  ADMINISTRADOR = 'administrador',
  MESONERO = 'mesonero',
  COCINERO = 'cocinero',
}

/**
 * Entidad Rol que mapea a la tabla 'roles' en la base de datos.
 * Define los diferentes roles de usuario en el sistema.
 */
@Entity('roles') // Define el nombre de la tabla en la base de datos
export class Rol {
  @PrimaryGeneratedColumn() // Columna de clave primaria autoincremental
  id_rol: number;

  @Column({
    type: 'enum', // Define el tipo de columna como un ENUM (enumeración)
    enum: NombreRol, // Usa el enum 'NombreRol' para los valores permitidos
    unique: true, // Asegura que no haya roles con el mismo nombre
    nullable: false, // El nombre del rol no puede ser nulo
  })
  nombre: NombreRol;

  /**
   * Relación One-to-Many con la entidad Usuario.
   * Un rol puede tener muchos usuarios.
   * 'usuario => usuario.rol' especifica la propiedad 'rol' en la entidad Usuario
   * que se relaciona con este Rol.
   */
  @OneToMany(() => Usuario, (usuario) => usuario.rol)
  usuarios: Usuario[];
}