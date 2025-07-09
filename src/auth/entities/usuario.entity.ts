//Define la entidad Usuario, incluyendo campos como username, password (que deberá ser hasheada), 
//nombre_completo y una relación con la entidad Rol.
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Rol } from './rol.entity'; // Importamos la entidad Rol
import * as bcrypt from 'bcrypt'; // Importamos bcrypt para hashear contraseñas de forma segura

/**
 * Entidad Usuario que mapea a la tabla 'usuarios' en la base de datos.
 * Representa a un usuario del sistema con su información personal y rol.
 */
@Entity('usuarios') // Define el nombre de la tabla en la base de datos
export class Usuario {
  @PrimaryGeneratedColumn() // Columna de clave primaria autoincremental
  id_usuario: number;

  @Column({ unique: true, nullable: false }) // Nombre de usuario único y no nulo
  username: string;

  @Column({ nullable: false }) // Contraseña del usuario (se almacenará hasheada)
  password: string;

  @Column({ nullable: false }) // Nombre completo del usuario
  nombre_completo: string;

  /**
   * Relación Many-to-One con la entidad Rol.
   * Muchos usuarios pueden tener un solo rol.
   * '{ eager: true }' significa que el rol se cargará automáticamente
   * cada vez que se cargue un Usuario.
   */
  @ManyToOne(() => Rol, (rol) => rol.usuarios, { eager: true, nullable: false })
  @JoinColumn({ name: 'rol_id' }) // Define la columna de clave foránea en la tabla 'usuarios'
  rol: Rol;

    // Opcional: También puedes tener la columna de la clave foránea explícitamente si lo prefieres
  @Column({ name: 'rol_id', type: 'int', nullable: false })
  rol_id: number;

  /**
   * Método para hashear la contraseña del usuario antes de guardarla en la base de datos.
   * Se llama antes de que la entidad sea guardada.
   */
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