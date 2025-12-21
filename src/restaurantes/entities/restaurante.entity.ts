import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Usuario } from '../../auth/entities/usuario.entity';
import { Producto } from '../../productos/entities/producto.entity';
import { Comanda } from '../../comandas/entities/comanda.entity';

@Entity('restaurantes')
export class Restaurante {
  @PrimaryGeneratedColumn()
  id_restaurante: number;

  @Column()
  nombre: string;

  @Column()
  direccion: string;

  @Column({ nullable: true })
  telefono: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  tasa_cambio: number;

  @OneToMany(() => Usuario, (usuario) => usuario.restaurante)
  usuarios: Usuario[];

  @OneToMany(() => Producto, (producto) => producto.restaurante)
  productos: Producto[];

  @OneToMany(() => Comanda, (comanda) => comanda.restaurante)
  comandas: Comanda[];
}
