import { Injectable, Logger } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { Migration } from './migration.interface';

@Injectable()
export class CreateIndexesMigration implements Migration {
  name = 'CreateIndexes';
  version = 1;
  private readonly logger = new Logger(CreateIndexesMigration.name);

  constructor(@InjectConnection() private connection: Connection) {}

  async up(): Promise<void> {
    const db = this.connection.db;
    
    if (!db) {
      throw new Error('Database connection is not available');
    }

    this.logger.log('Creating database indexes...');

    try {
      // Users collection indexes
      const usersCollection = db.collection('users');
      await this.createIndexSafely(usersCollection, { employeeCode: 1 }, { unique: true, name: 'employeeCode_unique' });
      await this.createIndexSafely(usersCollection, { phone: 1 }, { name: 'phone_idx' });
      await this.createIndexSafely(usersCollection, { role: 1 }, { name: 'role_idx' });
      await this.createIndexSafely(usersCollection, { createdAt: 1 }, { name: 'createdAt_idx' });
      this.logger.log('✅ Users indexes processed');

      // Auth sessions collection indexes
      const sessionsCollection = db.collection('sessions');
      await this.createIndexSafely(sessionsCollection, { employeeCode: 1 }, { name: 'sessions_employeeCode_idx' });
      await this.createIndexSafely(sessionsCollection, { expiresAt: 1 }, { expireAfterSeconds: 0, name: 'sessions_ttl_idx' });
      await this.createIndexSafely(sessionsCollection, { deviceId: 1 }, { name: 'sessions_deviceId_idx' });
      this.logger.log('✅ Sessions indexes processed');

      // OTP collection indexes
      const otpCollection = db.collection('otps');
      await this.createIndexSafely(otpCollection, { employeeCode: 1 }, { name: 'otps_employeeCode_idx' });
      await this.createIndexSafely(otpCollection, { expiresAt: 1 }, { expireAfterSeconds: 0, name: 'otps_ttl_idx' });
      await this.createIndexSafely(otpCollection, { createdAt: 1 }, { name: 'otps_createdAt_idx' });
      this.logger.log('✅ OTP indexes processed');

      this.logger.log('All indexes processed successfully');
    } catch (error) {
      this.logger.error('Error creating indexes:', error);
      throw error;
    }
  }

  private async createIndexSafely(collection: any, indexSpec: any, options: any): Promise<void> {
    try {
      // Check if index already exists
      const existingIndexes = await collection.listIndexes().toArray();
      const indexExists = existingIndexes.some((index: any) => 
        index.name === options.name ||
        JSON.stringify(index.key) === JSON.stringify(indexSpec)
      );

      if (indexExists) {
        this.logger.log(`Index ${options.name} already exists, skipping...`);
        return;
      }

      await collection.createIndex(indexSpec, options);
      this.logger.log(`✅ Created index: ${options.name}`);
    } catch (error: any) {
      // If index already exists or there's a conflict, log and continue
      if (error.code === 86 || error.codeName === 'IndexKeySpecsConflict') {
        this.logger.log(`Index conflict for ${options.name}, likely already exists with different options`);
      } else {
        this.logger.warn(`Failed to create index ${options.name}:`, error.message);
      }
    }
  }

  async down(): Promise<void> {
    const db = this.connection.db;
    
    if (!db) {
      throw new Error('Database connection is not available');
    }
    
    this.logger.log('Dropping database indexes...');

    // Drop users indexes
    const usersCollection = db.collection('users');
    await usersCollection.dropIndex('employeeCode_unique').catch(() => {});
    await usersCollection.dropIndex('phone_idx').catch(() => {});
    await usersCollection.dropIndex('role_idx').catch(() => {});
    await usersCollection.dropIndex('createdAt_idx').catch(() => {});

    // Drop sessions indexes
    const sessionsCollection = db.collection('sessions');
    await sessionsCollection.dropIndex('sessions_employeeCode_idx').catch(() => {});
    await sessionsCollection.dropIndex('sessions_ttl_idx').catch(() => {});
    await sessionsCollection.dropIndex('sessions_deviceId_idx').catch(() => {});

    // Drop OTP indexes
    const otpCollection = db.collection('otps');
    await otpCollection.dropIndex('otps_employeeCode_idx').catch(() => {});
    await otpCollection.dropIndex('otps_ttl_idx').catch(() => {});
    await otpCollection.dropIndex('otps_createdAt_idx').catch(() => {});

    this.logger.log('All indexes dropped');
  }
}