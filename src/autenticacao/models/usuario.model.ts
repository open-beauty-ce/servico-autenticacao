import { PaginateModel } from 'mongoose';
import { UsuarioEntity } from '../entities/usuario.entity';

export interface UsuarioModel extends PaginateModel<UsuarioEntity> {
  autenticarUsuario(email: string, senha: string): Promise<string>;
  encontrarPeloToken(token: string): Promise<UsuarioEntity>;
}
