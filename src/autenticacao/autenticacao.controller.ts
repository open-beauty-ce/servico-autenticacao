import { Controller } from '@nestjs/common';
import { Common, Usuario } from 'descricao-servicos';
import { GrpcMethod, RpcException } from '@nestjs/microservices';
import { InjectModel } from '@nestjs/mongoose';
import { UsuarioModel } from './models/usuario.model';

@Controller('autenticacao')
export class AutenticacaoController implements Usuario.Controller.Autenticacao {

  constructor(
    @InjectModel('Usuario')
    private usuarioModel: UsuarioModel,
  ) {
  }

  @GrpcMethod('AutenticacaoController', 'autenticar')
  async autenticar(dados: Usuario.Input.Autenticacao): Promise<Usuario.Token> {
    return {
      token: await this.usuarioModel.autenticarUsuario(dados.email, dados.senha)
    };
  }

  @GrpcMethod('AutenticacaoController', 'usuarioAutenticado')
  async usuarioAutenticado(params: Usuario.Token): Promise<Usuario.Usuario> {
    const usuario = await this.usuarioModel.encontrarPeloToken(params.token);

    if (!usuario) {
      throw new RpcException({ code: Common.GrpcStatus.UNAUTHENTICATED, message: 'Usuário não autenticado' });
    }

    return usuario.toGRPCMessage();
  }
}
