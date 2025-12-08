import { MigrationInterface, QueryRunner } from "typeorm";

export class GoogleAuth1764625396797 implements MigrationInterface {
    name = 'GoogleAuth1764625396797'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "usuarios" ADD "email" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "usuarios" ADD CONSTRAINT "UQ_446adfc18b35418aac32ae0b7b5" UNIQUE ("email")`);
        await queryRunner.query(`ALTER TABLE "usuarios" ADD "google_id" character varying`);
        await queryRunner.query(`ALTER TABLE "usuarios" ADD CONSTRAINT "UQ_7297e3daa75b842415eddc76cc5" UNIQUE ("google_id")`);
        await queryRunner.query(`ALTER TABLE "usuarios" ALTER COLUMN "username" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "usuarios" ALTER COLUMN "password" DROP NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "usuarios" ALTER COLUMN "password" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "usuarios" ALTER COLUMN "username" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "usuarios" DROP CONSTRAINT "UQ_7297e3daa75b842415eddc76cc5"`);
        await queryRunner.query(`ALTER TABLE "usuarios" DROP COLUMN "google_id"`);
        await queryRunner.query(`ALTER TABLE "usuarios" DROP CONSTRAINT "UQ_446adfc18b35418aac32ae0b7b5"`);
        await queryRunner.query(`ALTER TABLE "usuarios" DROP COLUMN "email"`);
    }

}
