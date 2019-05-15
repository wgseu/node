const { Op } = require('sequelize')
const express = require('express');
const router = express.Router();
const { signToken  } = require('../authentication')
const bcrypt = require('bcryptjs');

const { Usuario } = require('../models/sequelize')

// Todas as rotas definidas aqui
// estão dentro da url '/usuarios/'

// GET /usuarios
router.get('/', function (req, res, next) {
  const nome = req.query.nome;
  const email = req.query.email;

  const where = {};
  if (nome) {
    where.nome = {
      [Op.like]: '%' + nome + '%'
    }
  }
  if (email) {
    where.email = email
  }

  Usuario.findAll({
    attributes: ['id', 'nome', 'email'],
    where
  })
    .then(function (usuarios) {
      res.status(200).json(usuarios)
    })
    .catch(function (error) {
      console.log(error)
      res.status(422).send()
    })
});

// GET /usuarios/4
router.get('/:usuarioId', function (req, res, next) {
  const usuarioId = req.params.usuarioId

  Usuario.findByPk(usuarioId)
    .then(function (usuario) {
      if (usuario) {
        const usuarioJson = usuario.toJSON()
        delete usuarioJson.senha
        res.status(200).json(usuarioJson)
      } else {
        res.status(404).send()
      }
    })
    .catch(function (error) {
      console.log(error)
      res.status(422).send()
    })
});

// DELETE /usuarios/4
router.delete('/:usuarioId', function (req, res, next) {
  const usuarioId = req.params.usuarioId

  Usuario.destroy({
    where: {
      id: usuarioId
    }
  })
    .then(function (removidos) {
      if (removidos > 0) {
        res.status(204).send()
      } else {
        res.status(404).send()
      }
    })
    .catch(function (error) {
      console.log(error)
      // res.status(422).send()
      next(error) // delega o tratamento de erro para o express
    })
});

// PUT /usuarios/4
router.put('/:usuarioId', async function (req, res, next) {
  const usuarioId = req.params.usuarioId
  const body = req.body
  Usuario.findByPk(usuarioId)
    .then(function (usuario) {
      if (usuario) {
        return usuario.update({
          nome: body.nome,
          email: body.email,
          nascimento: body.nascimento,
          senha: body.senha, // criar uma específica para alterar a senha
        })
          .then(function (usuarioAtualizado) {
            const usuarioJson = usuarioAtualizado.toJSON()
            delete usuarioJson.senha
            res.status(200).json(usuarioJson)
          })
      } else {
        res.status(404).send()
      }
    })
    .catch(function (error) {
      console.log(error)
      res.status(422).send()
    })
});

//POST /usuarios/login
router.post('/login', function (req, res) {
  // recebe as credenciais do usuário e valida com as informações de
  // autenticação
  const email = req.body.email;
  const senha = req.body.senha;
  Usuario.findOne({
    where: {
      email: email
    }
  })
  .then( function(usuario){
    if(bcrypt.compare(senha, usuario.senha))
    {
      res
      .status(200)
      .send({ usuario, token: signToken({ id: usuario.id}, process.env.SECRET ) })
    }
  })
  .catch( function(error){
    console.log(error)
    res.status(422).send()
  })
})

// POST /usuarios
router.post('/', function (req, res, next) {
  const usuario = req.body;

  bcrypt.hash( usuario.senha, 10)
  .then( function(result) {
    const pass = result

    Usuario.create({
      nome: usuario.nome,
      email: usuario.email,
      nascimento: usuario.nascimento,
      senha: pass,
    })
      .then(function (usuarioCriado) {
        // usuário inserido com sucesso
        delete usuarioCriado.senha;
        res.status(201).json(usuarioCriado)
      })
      .catch(function (error) {
        // falha ao inserior o usuário
        if (Array.isArray(error.errors)) {
          const sequelizeError = error.errors[0]
          if (sequelizeError.type === 'unique violation'
            && sequelizeError.path === 'email') {
            res.status(422).send('O e-mail informado já existe no banco de dados.');
            return;
          }
        }
        res.status(422).send();
      })

  })
  .catch( function() {
    res.status(422).send("Erro ao criar usuario tente novamente");
  })
});

module.exports = router;
