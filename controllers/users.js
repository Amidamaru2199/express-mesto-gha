const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken'); // импортируем модуль jsonwebtoken
const User = require('../models/user');
const NotFoundError = require('../errors/NotFoundError');
const BadRquestError = require('../errors/BadRequestError');
const DublicateError = require('../errors/DublicateError');

module.exports.login = (req, res, next) => {
  const { email, password } = req.body;

  User.findOne({ email }).select('+password')
    .then((user) => {
      if (!user) {
        return Promise.reject(new Error('Неправильные почта (или пароль)'));// Неправильные почта
      }
      // сравниваем переданный пароль и хеш из базы
      return bcrypt.compare(password, user.password)
        .then((matched) => {
          if (!matched) {
            // хеши не совпали — отклоняем промис
            return Promise.reject(new Error('Неправильные (почта или) пароль'));// хеши не совпали у пароля
          }
          return user;
        });
    })
    .then((user) => {
      const token = jwt.sign({ _id: user._id }, 'some-secret-key', { expiresIn: '7d' });
      res.send({ token });// вернём токен
    })
    .catch((err) => {
      next(new DublicateError(err.message));
    });
};

module.exports.createUser = (req, res, next) => {
  bcrypt.hash(req.body.password, 10)
    .then((hash) => User.create({
      name: req.body.name,
      about: req.body.about,
      avatar: req.body.avatar,
      email: req.body.email,
      password: hash, // записываем хеш в базу
      _id: req.body._id,
    }))
    .then((user) => {
      res.send({
        name: user.name,
        about: user.about,
        avatar: user.avatar,
        _id: user._id,
      });
    })
    // если данные не записались, вернём ошибку
    .catch((err) => {
      if (err.name === 'ValidationError') {
        next(new BadRquestError('Переданы некорректные данные при создании пользователя'));
      } else if (err.code === 11000) {
        next(new DublicateError('Пользователь с таким "email" уже существует'));
      }
    });
};

module.exports.getUsers = (req, res, next) => {
  User.find({})
    .then((users) => res.send(users))
    .catch(next);
};

module.exports.getUserId = (req, res, next) => {
  User.findById(req.params.userId)
    .then((user) => {
      if (!user) {
        throw new NotFoundError('Нет пользователя с таким id');
      } else {
        res.send({
          name: user.name,
          about: user.about,
          avatar: user.avatar,
          _id: user._id,
        });
      }
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        next(new BadRquestError('Не валидный id'));
      } else {
        next(err);
      }
    });
};

module.exports.getUserAuth = (req, res, next) => {
  User.findById(req.user._id)// запрос одного
    .then((users) => {
      if (!users) {
        throw new NotFoundError('Нет пользователя с таким id');
      } else {
        res.send({
          about: users.about,
          avatar: users.avatar,
          name: users.name,
          _id: users._id,
        });
      }
    })
    .catch((err) => {
      // console.dir(err);
      if (err.name === 'CastError') {
        next(new BadRquestError('Не валидный id'));
      } else {
        next(err);
      }
    });
};

module.exports.updateUser = (req, res, next) => {
  const { name, about } = req.body;

  User.findByIdAndUpdate(
    req.user._id,
    { name, about },
    {
      new: true, // обработчик then получит на вход обновлённую запись
      runValidators: true, // данные будут валидированы перед изменением
    },
  )
    .then((user) => res.send({
      name: user.name,
      about: user.about,
    }))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        next(new BadRquestError('Переданы некорректные данные при обновлении пользователя'));
      } else {
        next(err);
      }
    });
};

module.exports.updateUserAvatar = (req, res, next) => {
  const { avatar } = req.body;

  User.findByIdAndUpdate(
    req.user._id,
    { avatar },
    {
      new: true, // обработчик then получит на вход обновлённую запись
      runValidators: true, // данные будут валидированы перед изменением
    },
  )
    .then((user) => res.send({ avatar: user.avatar }))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        next(new BadRquestError('Некорректные данные'));
      } else {
        next(err);
      }
    });
};
