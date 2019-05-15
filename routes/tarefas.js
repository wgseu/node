var express = require('express');
const { Op } = require('sequelize')
var router = express.Router();
const { verifyToken } = require('../authentication')

const { Tarefa } = require('../models/sequelize')

// GET /tarefas
router.get('/', verifyToken, function(req, res, next) {
    const titulo = req.query.titulo;
  
    const where = {};process.env.SECRET
    if (titulo) {
      where.titulo = {
        [Op.like]: '%' + titulo + '%'
      }
    }
    Tarefa.findAll({
      attributes: ['id', 'titulo', 'concluido', 'usuarioId'],
      where
    })
      .then(function (tarefas) {
        res.status(200).json(tarefas)
      })
      .catch(function (error) {
        console.log(error)
        res.status(422).send()
      })
  });

  // GET /tarefas/1
router.get('/:tarefaId', verifyToken, function(req, res, next) {
    const tarefaId = req.params.tarefaId
  
    Tarefa.findByPk(tarefaId)
      .then(function (tarefa) {
        if (tarefa) {
          const tarefaJson = tarefa.toJSON()
          res.status(200).json(tarefaJson)
        } else {
          res.status(404).send()
        }
      })
      .catch(function (error) {
        console.log(error)
        res.status(422).send()
      })
  });
  
  // DELETE /tarefas/3
router.delete('/:tarefaId', verifyToken, function(req, res, next) {
    const tarefaId = req.params.tarefaId
  
    Tarefa.destroy({
      where: {
        id: tarefaId
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
        next(error) // delega o tratamento de erro para o express
      })
  });

  // PUT /tarefas/4
router.put('/:tarefaId', verifyToken, function(req, res, next) {
    const tarefaId = req.params.tarefaId
    const body = req.body
    console.log('params', req.params)
    console.log('reqqqqqqqqqq', req.id)
    Tarefa.findOne({
      where: {
        id: tarefaId
      }
    })
      .then(function(tarefa) {
        if (tarefa) {
          return tarefa.update({
            titulo: body.titulo,
            concluido: body.concluido
          })
            .then(function (tarefaAtualizado) {
              const tarefaJson = tarefaAtualizado.toJSON()
              res.status(200).json(tarefaJson)
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
  

// POST /tarefas
router.post('/', verifyToken, function (req, res, next) {
    const tarefa = req.body;
  
    Tarefa.create({
        titulo: tarefa.titulo,
        concluido: tarefa.concluido,
        usuarioId: req.id
    })
      .then(function (tarefaCriada) {
        // tarefa inserida com sucesso
        res.status(201).json(tarefaCriada)
      })
      .catch(function (error) {
        console.log(error)
        res.status(422).send();
      })
  });

module.exports = router;
