const jwt = require('jsonwebtoken')

function verifyToken (req, res, next) {
  const token = req.headers.authorization
  try {
      const payload = jwt.verify(token, process.env.SECRET)
      req.id = payload.id
      next()

  } catch(e) {
      res.status(401).send('autenticação invalida')

  }
}

function signToken(id) {
  console.log(id);
    return jwt.sign(id, process.env.SECRET)
}

module.exports = {
    verifyToken,
    signToken
}