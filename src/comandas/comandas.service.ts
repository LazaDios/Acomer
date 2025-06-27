import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateComandaDto } from './dto/create-comanda.dto';
import { UpdateComandaDto } from './dto/update-comanda.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Comanda } from './entities/comanda.entity';
import { Repository } from 'typeorm';

@Injectable()
export class ComandasService {

  constructor(
    @InjectRepository(Comanda)
    private readonly comandaRepository: Repository<Comanda>
  ){}

  async create(createComandaDto: CreateComandaDto): Promise<Comanda> {

    const comanda = this.comandaRepository.create({
      mesa: createComandaDto.mesa,
      nombre_mesonero: createComandaDto.nombre_mesonero,
      estado_comanda: 'abierta',
      total_comanda: 0,
    });

    return await this.comandaRepository.save(comanda);
  }

  async findAll() {
    return await this.comandaRepository.find();
  }

 async findOne(comanda_id: number) {
    return await this.comandaRepository.findOneBy({comanda_id});
  }

  async update(comanda_id: number, UpdateComandaDto: UpdateComandaDto) {
    return await this.comandaRepository.update(comanda_id, UpdateComandaDto);
  }

 async remove(comanda_id: number): Promise<void> {
    const comanda = await this.comandaRepository.findOne({
      where: { comanda_id: comanda_id },
  });
   if (!comanda) {
      throw new NotFoundException(`Comanda con ID ${comanda_id} no encontrada.`);
    }
    // Al eliminar la comanda, la base de datos se encargará de eliminar los detalles asociados
    await this.comandaRepository.remove(comanda);
}
}
