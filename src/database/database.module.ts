import { Module, OnModuleInit } from '@nestjs/common';
import { MigrationRunner } from './migrations/migration-runner.service';
import { CreateIndexesMigration } from './migrations/001-create-indexes.migration';

@Module({
  providers: [MigrationRunner, CreateIndexesMigration],
  exports: [MigrationRunner],
})
export class DatabaseModule implements OnModuleInit {
  constructor(
    private migrationRunner: MigrationRunner,
    private createIndexesMigration: CreateIndexesMigration,
  ) {}

  async onModuleInit() {
    const migrations = [this.createIndexesMigration];
    await this.migrationRunner.runMigrations(migrations);
  }
}