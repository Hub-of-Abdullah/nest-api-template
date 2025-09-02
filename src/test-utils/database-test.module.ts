import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

@Module({})
export class DatabaseTestModule {
  static async forRoot() {
    const mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();
    
    return {
      module: DatabaseTestModule,
      imports: [
        MongooseModule.forRoot(uri),
      ],
      providers: [
        {
          provide: 'MONGO_MEMORY_SERVER',
          useValue: mongod,
        },
      ],
      exports: ['MONGO_MEMORY_SERVER'],
    };
  }
}