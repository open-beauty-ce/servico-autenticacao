import { Schema } from 'mongoose';
import { ContatoEntity } from '../entities/contato.entity';

export const ContatoSchema = new Schema<ContatoEntity>({
  telefone: {
    type: String,
    required: [true, 'É necessário informar o telefone de contato']
  },
  whatsapp: {
    type: Boolean,
    default: false
  }
});

ContatoSchema.methods.toGRPCMessage = function() {
  return {
    id: this._id.toHexString(),
    telefone: this.telefone,
    whatsapp: this.whatsapp,
  }
};
