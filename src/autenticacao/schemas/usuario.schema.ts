import { Schema } from 'mongoose';
import * as uniqueValidator from 'mongoose-unique-validator';
import isEmail from 'validator/lib/isEmail';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import { UsuarioEntity } from '../entities/usuario.entity';
import { Funcao } from '../enums/funcao';
import { ContatoSchema } from './contato.schema';
import { TipoToken } from '../enums/tipo.token';
import { TempoHelper } from '../helpers/tempo.helper';
import { Common } from 'descricao-servicos';
import { RpcException } from '@nestjs/microservices';

export const UsuarioSchema = new Schema<UsuarioEntity>({
  nome: {
    type: String,
    required: [true, 'É necessário informar o seu nome'],
  },
  email: {
    type: String,
    required: [true, 'É necessário informar o seu e-mail'],
    trim: true,
    unique: true,
    lowercase: true,
    validate: [isEmail, 'Por favor, informe um e-mail válido']
  },
  emailConfirmado: {
    type: Boolean,
    default: false,
  },
  senha: {
    type: String,
    required: [true, 'É necessário informar a sua senha'],
    minlength: [6, 'A senha deve ter pelo menos 6 caracteres'],
  },
  funcao: {
    type: String,
    enum: [
      Funcao.CLIENTE,
      Funcao.DOUTOR,
    ],
    default: Funcao.CLIENTE
  },
  contatos: [ContatoSchema]
});

UsuarioSchema.plugin(uniqueValidator, {
  message: 'E-mail já cadastrado'
});

UsuarioSchema.pre<UsuarioEntity>('save', function() {
  if (this.isModified('senha')) {
    this.senha = bcrypt.hashSync(this.senha, bcrypt.genSaltSync(12));
  }
});

UsuarioSchema.methods.gerarToken = function(tipo, tempoExpiracao) {
  const iat = Date.now();

  return jwt.sign({
    sub: this._id.toHexString(),
    iat,
    exp: iat + tempoExpiracao,
    tipo,
    funcao: this.funcao,
  }, process.env.JWT_SECRET)
};

UsuarioSchema.methods.toGRPCMessage = function() {
  return {
    id: this._id.toHexString(),
    nome: this.nome,
    email: this.email,
    funcao: this.funcao,
    contatos: this.contatos?.map(contato => contato.toGRPCMessage()),
  }
};

UsuarioSchema.statics.autenticarUsuario = async function(email: string, senha: string): Promise<string> {
  const usuario: UsuarioEntity = await this.findOne({ email });

  if (!usuario || !bcrypt.compareSync(senha, usuario.senha)) {
    throw new RpcException({ code: Common.GrpcStatus.UNAUTHENTICATED, message: 'E-mail e/ou senha incorretos' });
  } else if (!usuario.emailConfirmado) {
    throw new RpcException({
      code: Common.GrpcStatus.PERMISSION_DENIED,
      message: 'Confirme seu e-mail para poder ter acesso a sua conta',
    });
  }

  return usuario.gerarToken(TipoToken.AUTENTICACAO, TempoHelper.dias(30));
};

UsuarioSchema.statics.encontrarPeloToken = async function(token: string): Promise<UsuarioEntity> {
  const decoded = jwt.decode(token) as { sub: string, exp: number };

  if (Date.now() > decoded.exp) {
    return null;
  }

  return this.findById(decoded.sub);
};
