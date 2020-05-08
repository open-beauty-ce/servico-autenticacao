import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UsuariosController } from './usuarios.controller';
import { UsuarioSchema } from './schemas/usuario.schema';
import { AutenticacaoController } from './autenticacao.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: 'Usuario',
        schema: UsuarioSchema,
      },
    ]),
  ],
  controllers: [UsuariosController, AutenticacaoController]
})
export class AutenticacaoModule {}
