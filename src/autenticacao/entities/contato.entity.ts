import { ObjectID } from 'mongodb';
import { Document } from 'mongoose';
import { GrpcEntity, Usuario } from 'descricao-servicos';

export interface ContatoEntity extends Document, GrpcEntity<Usuario.Contato> {
  _id: ObjectID;
  telefone: string;
  whatsapp: boolean;
}
