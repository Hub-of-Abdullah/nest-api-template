import { Injectable, Logger } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { Migration } from './migration.interface';

interface MigrationRecord {
  name: string;
  version: number;
  appliedAt: Date;
}

@Injectable()
export class MigrationRunner {
  private readonly logger = new Logger(MigrationRunner.name);

  constructor(@InjectConnection() private connection: Connection) {}

  async runMigrations(migrations: Migration[]): Promise<void> {
    const db = this.connection.db;
    
    if (!db) {
      throw new Error('Database connection is not available');
    }
    
    const migrationsCollection = db.collection<MigrationRecord>('migrations');

    // Create migrations collection if it doesn't exist
    await migrationsCollection.createIndex({ name: 1 }, { unique: true });

    // Get applied migrations
    const appliedMigrations = await migrationsCollection
      .find({})
      .sort({ version: 1 })
      .toArray();

    const appliedVersions = new Set(appliedMigrations.map(m => m.version));

    // Sort migrations by version
    const sortedMigrations = migrations.sort((a, b) => a.version - b.version);

    for (const migration of sortedMigrations) {
      if (!appliedVersions.has(migration.version)) {
        this.logger.log(`Running migration: ${migration.name} (v${migration.version})`);
        
        try {
          await migration.up();
          
          await migrationsCollection.insertOne({
            name: migration.name,
            version: migration.version,
            appliedAt: new Date(),
          });
          
          this.logger.log(`✅ Migration completed: ${migration.name}`);
        } catch (error: any) {
          this.logger.error(`❌ Migration failed: ${migration.name}`);
          this.logger.error(error.message);
          
          // Check if it's a non-critical error (like index already exists)
          if (error.message?.includes('already exists') || 
              error.code === 86 || 
              error.codeName === 'IndexKeySpecsConflict') {
            this.logger.log(`⚠️ Migration ${migration.name} had non-critical errors, marking as applied`);
            
            // Still mark as applied since indexes were processed
            await migrationsCollection.insertOne({
              name: migration.name,
              version: migration.version,
              appliedAt: new Date(),
            }).catch(() => {}); // Ignore if already exists
          } else {
            throw error;
          }
        }
      }
    }
  }

  async rollbackMigration(migration: Migration): Promise<void> {
    const db = this.connection.db;
    
    if (!db) {
      throw new Error('Database connection is not available');
    }
    
    const migrationsCollection = db.collection<MigrationRecord>('migrations');

    this.logger.log(`Rolling back migration: ${migration.name}`);
    
    try {
      await migration.down();
      
      await migrationsCollection.deleteOne({
        name: migration.name,
        version: migration.version,
      });
      
      this.logger.log(`✅ Rollback completed: ${migration.name}`);
    } catch (error) {
      this.logger.error(`❌ Rollback failed: ${migration.name}`, error);
      throw error;
    }
  }
}