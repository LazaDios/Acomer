import { Injectable } from '@nestjs/common';
import { CreateComandaDto } from './dto/create-comanda.dto';
import { UpdateComandaDto } from './dto/update-comanda.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Comanda } from './entities/comanda.entity';

@Injectable()
export class ComandasService {

  constructor(
    @InjectRepository(Comanda)
    private comandaRepository: Repository<Comanda>,
  ) {}

  async create(createComandaDto: CreateComandaDto) {
    const comanda = this.comandaRepository.create(createComandaDto);
    return await this.comandaRepository.save(comanda);

  }

  async findAll() {
    return await this.comandaRepository.find();
  }

  async findOne(id: number) {
    return await this.comandaRepository.findOneBy({id});
  }

  async update(id: number, updateComandaDto: UpdateComandaDto) {
    return await this.comandaRepository.update(id, updateComandaDto);
  }

  async remove(id: number) {
    return await this.comandaRepository.softDelete(id);
  }
}
