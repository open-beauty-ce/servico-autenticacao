import * as _ from 'lodash';
import { Controller, UseFilters } from '@nestjs/common';
import { UsuarioModel } from './models/usuario.model';
import { InjectModel } from '@nestjs/mongoose';
import { Common, Usuario, ValidationErrorFilter } from 'descricao-servicos';
import { GrpcMethod, RpcException } from '@nestjs/microservices';

@Controller('usuarios')
@UseFilters(ValidationErrorFilter)
export class UsuariosController implements Usuario.Controller.Usuario {

  constructor(
    @InjectModel('Usuario')
    private usuarioModel: UsuarioModel,
  ) {
  }

  @GrpcMethod('UsuarioController', 'atualizarUsuario')
  async atualizarUsuario(params: Usuario.Input.AtualizarUsuario): Promise<Usuario.Usuario> {
    const usuario = await this.usuarioModel.findById(params.filtro.id);

    if (!usuario) {
      throw new RpcException({ code: Common.GrpcStatus.NOT_FOUND, message: 'Usuário não encontrado' });
    }

    if (typeof params.dados === 'object' && params.dados) {
      _.merge(usuario, params.dados);
      await usuario.save();
    }

    return usuario.toGRPCMessage();
  }

  @GrpcMethod('UsuarioController', 'criarUsuario')
  async criarUsuario(dados: Usuario.Input.DadosUsuario): Promise<Usuario.Usuario> {
    const usuario = new this.usuarioModel(dados);

    await usuario.save();

    return usuario.toGRPCMessage();
  }

  @GrpcMethod('UsuarioController', 'excluirUsuario')
  async excluirUsuario(filtro: Common.Input.FiltroPeloId): Promise<Common.SituacaoExclusao> {
    const usuario = await this.usuarioModel.deleteOne({
      _id: filtro.id
    });

    return {
      sucesso: usuario.deletedCount > 0
    }
  }

  @GrpcMethod('UsuarioController', 'pegarUsuario')
  async pegarUsuario(filtro: Common.Input.FiltroPeloId): Promise<Usuario.Usuario> {
    const usuario = await this.usuarioModel.findById(filtro.id);

    if (!usuario) {
      throw new RpcException({ code: Common.GrpcStatus.NOT_FOUND, message: 'Usuário não encontrado' });
    }

    return usuario.toGRPCMessage();
  }

  @GrpcMethod('UsuarioController', 'listarUsuarios')
  async listarUsuarios(params: Usuario.Input.FiltroUsuarios): Promise<Usuario.Usuarios> {
    const usuarios = await this.usuarioModel.paginate(params?.filtro || {}, {
      limit: params?.paginacao?.limite || 10,
      page: params?.paginacao?.pagina || 1,
      sort: params?.ordenacao,
    });

    return {
      itens: usuarios.docs.map(usuario => usuario.toGRPCMessage()),
      total: usuarios.total,
      paginas: usuarios.pages,
      pagina: usuarios.page
    }
  }
}
