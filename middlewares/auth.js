const jwt = require('jsonwebtoken');
const UnauthorizedError = require('../errors/UnauthorizedError');

module.exports = (req, res, next) => {
  const { authorization } = req.headers;
  if (!authorization || !authorization.startsWith('Bearer ')) {
    return next(new UnauthorizedError('Нужно авторизироваться'));
  }
  const token = authorization.replace('Bearer ', '');
  let payload;
  try {
    payload = jwt.verify(token, 'some-secret-key');
  } catch (err) {
    next(new UnauthorizedError('Нужно авторизироваться'));
  }
  req.user = payload; // записываем пейлоуд в объект запроса
  return next(); // пропускаем запрос дальше
};
