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
    name: 'Nombre', // Especificamos el nombre exacto de la columna en Supabase
    type: 'enum',
    enum: NombreRol,
    unique: true,
    nullable: false,
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