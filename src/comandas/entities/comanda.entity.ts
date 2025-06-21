import { Column, CreateDateColumn, DeleteDateColumn, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Comanda {

    @PrimaryGeneratedColumn()
    id: number;
    
    @Column()
    mesa: string;

    @CreateDateColumn()
    fecha: Date;

    @Column()
    estado: string = 'abierta';

    @Column()
    total: number = 0;

    @Column()
    mesero: string;

    @DeleteDateColumn()
    deletedAt: Date;

}   
