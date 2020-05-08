import { ObjectID } from 'mongodb';
import { TestingModule } from '@nestjs/testing';
import { AutenticacaoController } from './autenticacao.controller';
import { UsuarioModel } from './models/usuario.model';
import { TestHelper } from './helpers/test.helper';
import { getModelToken } from '@nestjs/mongoose';
import { UsuarioEntity } from './entities/usuario.entity';
import { decode, sign } from 'jsonwebtoken';
import { TipoToken } from './enums/tipo.token';
import { TempoHelper } from './helpers/tempo.helper';

describe('Autenticacao Controller', () => {
  let controller: AutenticacaoController;
  let usuarioModel: UsuarioModel;

  const criarUsuarioPadrao = (emailConfirmado = true) => new usuarioModel({
    nome: 'Usuário Teste',
    email: 'usuarioteste@email.com',
    senha: '123456',
    emailConfirmado,
    contatos: [{
      telefone: '+5585999999999',
      whatsapp: true
    }]
  });

  beforeAll(async () => {
    await TestHelper.startDatabase();
  });

  afterAll(async () => {
    await TestHelper.stopDatabase();
  });

  beforeEach(async () => {
    const module: TestingModule = await TestHelper.getModule();

    controller = module.get<AutenticacaoController>(AutenticacaoController);
    usuarioModel = module.get<UsuarioModel>(getModelToken('Usuario'));
  });

  afterEach(async () => {
    await TestHelper.clearDatabase();
  });

  beforeEach(async () => {
    const module: TestingModule = await TestHelper.getModule();

    controller = module.get<AutenticacaoController>(AutenticacaoController);
  });

  it('deve estar definido', () => {
    expect(controller).toBeDefined();
  });

  it('deve autenticar o usuário com email e senha', async () => {
    const usuario: UsuarioEntity = criarUsuarioPadrao();

    await usuario.save();

    const resposta = await controller.autenticar({
      email: 'usuarioteste@email.com',
      senha: '123456'
    });
    const token = decode(resposta.token) as { sub: string };

    expect(token.sub).toEqual(`${usuario._id}`);
  });

  it('não deve autenticar o usuário com email e senha incorretos', async () => {
    let resposta;

    try {
      resposta = await controller.autenticar({
        email: 'usuarioteste2@email.com',
        senha: '1234562'
      });
    } catch (e) {
      expect(e.message).toEqual('E-mail e/ou senha incorretos');
    }

    expect(resposta).not.toBeDefined();
  });

  it('não deve autenticar o usuário com senha incorreta', async () => {
    let resposta;
    const usuario: UsuarioEntity = criarUsuarioPadrao();


    try {
      await usuario.save();
      resposta = await controller.autenticar({
        email: 'usuarioteste@email.com',
        senha: '1234562'
      });
    } catch (e) {
      expect(e.message).toEqual('E-mail e/ou senha incorretos');
    }

    expect(resposta).not.toBeDefined();
  });

  it('não deve autenticar o usuário com email não confirmado', async () => {
    let resposta;
    const usuario: UsuarioEntity = criarUsuarioPadrao(false);

    try {
      await usuario.save();
      resposta = await controller.autenticar({
        email: 'usuarioteste@email.com',
        senha: '123456'
      });
    } catch (e) {
      expect(e.message).toEqual('Confirme seu e-mail para poder ter acesso a sua conta');
    }

    expect(resposta).not.toBeDefined();
  });

  it('deve pegar o usuário pelo token', async () => {
    const usuario: UsuarioEntity = criarUsuarioPadrao();

    await usuario.save();

    const resposta = await controller.usuarioAutenticado({
      token: usuario.gerarToken(TipoToken.AUTENTICACAO, TempoHelper.dias(30))
    });

    expect(`${usuario._id}`).toEqual(resposta.id);
  });

  it('não deve pegar o usuário pelo token', async () => {
    let resposta;

    try {
      resposta = await controller.usuarioAutenticado({
        token: sign({ sub: `${new ObjectID()}` }, process.env.JWT_SECRET)
      });
    } catch (e) {
      expect(e.message).toEqual('Usuário não autenticado');
    }

    expect(resposta).not.toBeDefined();
  });

  it('não deve pegar o usuário pelo token expirado', async () => {
    let resposta;

    try {
      resposta = await controller.usuarioAutenticado({
        token: sign({ exp: Date.now() - 1000 }, process.env.JWT_SECRET)
      });
    } catch (e) {
      expect(e.message).toEqual('Usuário não autenticado');
    }

    expect(resposta).not.toBeDefined();
  });
});
