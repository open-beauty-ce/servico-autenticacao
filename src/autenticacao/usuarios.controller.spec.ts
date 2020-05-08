import { ObjectID } from 'mongodb';
import { TestingModule } from '@nestjs/testing';
import { UsuariosController } from './usuarios.controller';
import { UsuarioModel } from './models/usuario.model';
import { TestHelper } from './helpers/test.helper';
import { getModelToken } from '@nestjs/mongoose';
import { Funcao } from './enums/funcao';

describe('Usuarios Controller', () => {
  let controller: UsuariosController;
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

    controller = module.get<UsuariosController>(UsuariosController);
    usuarioModel = module.get<UsuarioModel>(getModelToken('Usuario'));
  });

  afterEach(async () => {
    await TestHelper.clearDatabase();
  });

  it('deve estar definido', () => {
    expect(controller).toBeDefined();
  });

  it('deve criar um usuário', async () => {
    const usuario = await controller.criarUsuario({
      nome: 'Usuário Teste',
      email: 'usuarioteste@email.com',
      funcao: Funcao.CLIENTE,
      senha: '123456',
      contatos: [{
        telefone: '+558599999999',
        whatsapp: true
      }]
    });

    expect(usuario.id).toBeDefined();
    expect(usuario.contatos.length).toEqual(1);
  });

  it('deve pegar um usuário pelo id', async () => {
    const usuario = await criarUsuarioPadrao();

    await usuario.save();

    const resposta = await controller.pegarUsuario({
      id: usuario._id.toHexString(),
    });

    expect(resposta.id).toEqual(usuario._id.toHexString());
  });

  it('deve retornar um erro tentar pegar um usuário inexistente', async () => {
    let resposta;

    try {
      resposta = await controller.pegarUsuario({
        id: `${new ObjectID()}`,
      });
    } catch (e) {
      expect(e.message).toEqual('Usuário não encontrado');
    }

    expect(resposta).not.toBeDefined();
  });

  it('deve excluir um usuário pelo id', async () => {
    const usuario = await criarUsuarioPadrao();

    await usuario.save();

    const resposta = await controller.excluirUsuario({
      id: usuario._id.toHexString(),
    });

    expect(resposta.sucesso).toBeTruthy();
  });

  it('deve atualizar um usuário pelo id', async () => {
    const usuario = await criarUsuarioPadrao();

    await usuario.save();

    const resposta = await controller.atualizarUsuario({
      filtro: {
        id: usuario._id.toHexString(),
      },
      dados: {
        nome: 'Usuário Teste 2',
      },
    });

    expect(resposta.nome).toEqual('Usuário Teste 2');
  });

  it('deve retornar um erro tentar atualizar um usuário inexistente', async () => {
    let resposta;

    try {
      resposta = await controller.atualizarUsuario({
        filtro: {
          id: `${new ObjectID()}`,
        },
        dados: {
          nome: 'Usuário Teste 2',
        },
      });
    } catch (e) {
      expect(e.message).toEqual('Usuário não encontrado');
    }

    expect(resposta).not.toBeDefined();
  });

  it('deve listar os usuários cadastrados', async () => {
    const usuario = await criarUsuarioPadrao();

    await usuario.save();

    const resposta = await controller.listarUsuarios({});

    expect(resposta.total).toEqual(1);
    expect(resposta.paginas).toEqual(1);
    expect(resposta.pagina).toEqual(1);
    expect(resposta.itens[0].id).toEqual(usuario._id.toHexString());
  });
});
