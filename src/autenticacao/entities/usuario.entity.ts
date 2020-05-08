import { ObjectID } from 'mongodb';
import { Document } from 'mongoose';
import { GrpcEntity, Usuario } from 'descricao-servicos';
import { ContatoEntity } from './contato.entity';
import { Funcao } from '../enums/funcao';

export interface UsuarioEntity extends Document, GrpcEntity<Usuario.Usuario> {
  _id: ObjectID;
  nome: string;
  email: string;
  emailConfirmado: boolean;
  senha: string;
  funcao: Funcao;
  contatos: ContatoEntity[];
  gerarToken(tipo: string, tempoExpiracao: number): string;
}
