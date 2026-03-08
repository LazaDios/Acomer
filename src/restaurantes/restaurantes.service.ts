import { Injectable } from '@nestjs/common';
import { CreateRestauranteDto } from './dto/create-restaurante.dto';
import { UpdateRestauranteDto } from './dto/update-restaurante.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Restaurante } from './entities/restaurante.entity';
import { Repository } from 'typeorm';
import { Usuario } from '../auth/entities/usuario.entity';

@Injectable()
export class RestaurantesService {
    constructor(
        @InjectRepository(Restaurante)
        private readonly restauranteRepository: Repository<Restaurante>,
        @InjectRepository(Usuario)
        private readonly usuarioRepository: Repository<Usuario>,
    ) { }

    async create(createRestauranteDto: CreateRestauranteDto) {
        const restaurante = this.restauranteRepository.create(createRestauranteDto);
        return await this.restauranteRepository.save(restaurante);
    }

    findAll() {
        return this.restauranteRepository.find();
    }

    findOne(id: number) {
        return this.restauranteRepository.findOneBy({ id_restaurante: id });
    }

    update(id: number, updateRestauranteDto: UpdateRestauranteDto) {
        return this.restauranteRepository.update(id, updateRestauranteDto);
    }

    remove(id: number) {
        return this.restauranteRepository.delete(id);
    }
}
