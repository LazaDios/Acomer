import { MigrationInterface, QueryRunner } from "typeorm";

export class Inicial1764624658312 implements MigrationInterface {
    name = 'Inicial1764624658312'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."roles_nombre_enum" AS ENUM('administrador', 'mesonero', 'cocinero')`);
        await queryRunner.query(`CREATE TABLE "roles" ("id_rol" SERIAL NOT NULL, "nombre" "public"."roles_nombre_enum" NOT NULL, CONSTRAINT "UQ_a5be7aa67e759e347b1c6464e10" UNIQUE ("nombre"), CONSTRAINT "PK_25f8d4161f00a1dd1cbe5068695" PRIMARY KEY ("id_rol"))`);
        await queryRunner.query(`CREATE TABLE "usuarios" ("id_usuario" SERIAL NOT NULL, "username" character varying NOT NULL, "password" character varying NOT NULL, "nombre_completo" character varying NOT NULL, "rol_id" integer NOT NULL, "restaurante_id" integer, CONSTRAINT "UQ_9f78cfde576fc28f279e2b7a9cb" UNIQUE ("username"), CONSTRAINT "PK_dfe59db369749f9042499fd8107" PRIMARY KEY ("id_usuario"))`);
        await queryRunner.query(`CREATE TABLE "restaurantes" ("id_restaurante" SERIAL NOT NULL, "nombre" character varying NOT NULL, "direccion" character varying NOT NULL, "telefono" character varying, CONSTRAINT "PK_2b2e55144a8f13db3cd9caf8aec" PRIMARY KEY ("id_restaurante"))`);
        await queryRunner.query(`CREATE TYPE "public"."comanda_estado_comanda_enum" AS ENUM('Abierta', 'Preparando', 'Finalizada', 'Cerrada', 'Cancelada')`);
        await queryRunner.query(`CREATE TABLE "comanda" ("comanda_id" SERIAL NOT NULL, "mesa" character varying NOT NULL, "nombre_mesonero" character varying NOT NULL, "estado_comanda" "public"."comanda_estado_comanda_enum" NOT NULL DEFAULT 'Abierta', "total_comanda" numeric(5,2) NOT NULL, "fecha_hora_comanda" TIMESTAMP NOT NULL DEFAULT now(), "restaurante_id" integer, CONSTRAINT "PK_6e450be788cc1bf315af9c43a15" PRIMARY KEY ("comanda_id"))`);
        await queryRunner.query(`CREATE TABLE "detalle_comandas" ("id_detalle_comanda" SERIAL NOT NULL, "cantidad" integer NOT NULL, "precioUnitario" numeric(10,2) NOT NULL, "subtotal" numeric(10,2), "descripcion" character varying(255), "comanda_id" integer, "producto_id" integer, CONSTRAINT "PK_2e17bffb57cb415b1d27aaab145" PRIMARY KEY ("id_detalle_comanda"))`);
        await queryRunner.query(`CREATE TABLE "producto" ("id_producto" SERIAL NOT NULL, "nombre_producto" character varying NOT NULL, "precio_producto" numeric(5,2) NOT NULL, "restaurante_id" integer, CONSTRAINT "PK_e6f07eaa38082ffd9e20e961691" PRIMARY KEY ("id_producto"))`);
        await queryRunner.query(`ALTER TABLE "usuarios" ADD CONSTRAINT "FK_9e519760a660751f4fa21453d3e" FOREIGN KEY ("rol_id") REFERENCES "roles"("id_rol") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "usuarios" ADD CONSTRAINT "FK_7ba064af415d3da35c33731f743" FOREIGN KEY ("restaurante_id") REFERENCES "restaurantes"("id_restaurante") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "comanda" ADD CONSTRAINT "FK_248ca82cf9f43bd40c2132acd07" FOREIGN KEY ("restaurante_id") REFERENCES "restaurantes"("id_restaurante") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "detalle_comandas" ADD CONSTRAINT "FK_665055fb1312dbd0c78d87a3156" FOREIGN KEY ("comanda_id") REFERENCES "comanda"("comanda_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "detalle_comandas" ADD CONSTRAINT "FK_3a5f89a7809dd92873f59f5282f" FOREIGN KEY ("producto_id") REFERENCES "producto"("id_producto") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "producto" ADD CONSTRAINT "FK_9d78735a3d53778ecfc33844c92" FOREIGN KEY ("restaurante_id") REFERENCES "restaurantes"("id_restaurante") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "producto" DROP CONSTRAINT "FK_9d78735a3d53778ecfc33844c92"`);
        await queryRunner.query(`ALTER TABLE "detalle_comandas" DROP CONSTRAINT "FK_3a5f89a7809dd92873f59f5282f"`);
        await queryRunner.query(`ALTER TABLE "detalle_comandas" DROP CONSTRAINT "FK_665055fb1312dbd0c78d87a3156"`);
        await queryRunner.query(`ALTER TABLE "comanda" DROP CONSTRAINT "FK_248ca82cf9f43bd40c2132acd07"`);
        await queryRunner.query(`ALTER TABLE "usuarios" DROP CONSTRAINT "FK_7ba064af415d3da35c33731f743"`);
        await queryRunner.query(`ALTER TABLE "usuarios" DROP CONSTRAINT "FK_9e519760a660751f4fa21453d3e"`);
        await queryRunner.query(`DROP TABLE "producto"`);
        await queryRunner.query(`DROP TABLE "detalle_comandas"`);
        await queryRunner.query(`DROP TABLE "comanda"`);
        await queryRunner.query(`DROP TYPE "public"."comanda_estado_comanda_enum"`);
        await queryRunner.query(`DROP TABLE "restaurantes"`);
        await queryRunner.query(`DROP TABLE "usuarios"`);
        await queryRunner.query(`DROP TABLE "roles"`);
        await queryRunner.query(`DROP TYPE "public"."roles_nombre_enum"`);
    }

}
