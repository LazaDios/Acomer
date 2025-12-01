// ormconfig.ts (¡Este archivo debe estar en la RAÍZ de tu proyecto!)

import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
import { join } from 'path';

dotenv.config(); // Carga variables de entorno para desarrollo local

const isProduction = process.env.NODE_ENV === 'production';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,

// Rutas desde la raíz del proyecto.
  // Si tus entidades están en src/entities:
  entities: [join(__dirname, 'src', '**', '*.entity{.ts,.js}')],

  // Si tus migraciones están en src/database/migrations:
  migrations: [join(__dirname, 'src', 'database', 'migrations', '*.ts')],

  synchronize: false, // ¡IMPORTANTE! SIEMPRE false en producción. Usa migraciones.
  logging: true, // Útil para depurar, puedes cambiar a 'all' o false
  ssl: isProduction
    ? {
        rejectUnauthorized: false, // Necesario para Render.com
      }
    : false, // Desactiva SSL para desarrollo local si tu PostgreSQL no lo soporta
});