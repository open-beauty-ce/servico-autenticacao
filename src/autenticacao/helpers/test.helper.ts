import { Test, TestingModule } from '@nestjs/testing';
import { getConnectionToken, getModelToken } from '@nestjs/mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { Connection } from 'mongoose';
import { UsuarioModel } from '../models/usuario.model';
import { AppModule } from '../../app.module';

const mongod = new MongoMemoryServer({
  instance: {
    auth: false,
    dbName: 'autenticacao',
    port: 27019,
  },
  autoStart: false,
});

export class TestHelper {

  private static module: TestingModule;

  static async getModule(): Promise<TestingModule> {
    if (!this.module) {
      this.module = await Test.createTestingModule({
        imports: [
          AppModule
        ]
      }).compile();
    }

    return this.module;
  }

  static async startDatabase(): Promise<void> {
    await mongod.start();
  }

  static async stopDatabase(): Promise<void> {
    const module: TestingModule = await this.getModule();
    const connection: Connection = await module.get<Connection>(getConnectionToken());

    await connection.close();
    await mongod.stop();
  }

  static async clearDatabase(): Promise<void> {
    const module: TestingModule = await this.getModule();
    const usuarioModel: UsuarioModel = module.get<UsuarioModel>(getModelToken('Usuario'));

    await Promise.all([
      usuarioModel.deleteMany({}),
    ]);
  }
}
