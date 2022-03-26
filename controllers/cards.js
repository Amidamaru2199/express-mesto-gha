const Card = require('../models/card');
const NotFoundError = require('../errors/NotFoundError');
const BadRquestError = require('../errors/BadRequestError');
const DeletionError = require('../errors/DeletionError');

module.exports.createCard = (req, res, next) => {
  const { name, link } = req.body;
  const owner = req.user._id;

  Card.create({ name, link, owner })
    .then((card) => res.send({
      name: card.name,
      link: card.link,
      owner: card.owner,
      _id: card._id,
    }))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        next(new BadRquestError('Переданы некорректные данные при создании карточки'));
      } else {
        next(err);
      }
    });
};

module.exports.getCards = (req, res, next) => {
  Card.find({})
    .then((cards) => res.send(cards))
    .catch((err) => {
      next(err);
    });
};

module.exports.deleteCard = (req, res, next) => {
  Card.findById(req.params.cardId)
    .then((card) => { //
      if (!card) {
        throw new NotFoundError('Карточка с указанным _id не найдена');
      }
      if (String(card.owner) === req.user._id) {
        return Card.findByIdAndRemove(req.params.cardId)
          .then(() => { //
            res.send({ message: 'Пост удален' });
          });
      }
      throw new DeletionError('Нельзя удалять чужую карточку');
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        next(new BadRquestError('Не валидный id'));
      } else {
        next(err);
      }
    });
};

module.exports.likeCard = (req, res, next) => {
  Card.findByIdAndUpdate(
    req.params.cardId,
    { $addToSet: { likes: req.user._id } }, // добавить _id в массив, если его там нет
    { new: true },
  )
    .then((like) => {
      if (!like) {
        throw new NotFoundError('Карточка с указанным _id не найдена'); // 404
      }
      res.send(like);
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        next(new BadRquestError('Не валидный id'));
      } else {
        next(err);
      }
    });
};

module.exports.dislikeCard = (req, res, next) => {
  Card.findByIdAndUpdate(
    req.params.cardId,
    { $pull: { likes: req.user._id } }, // убрать _id из массива
    { new: true },
  )
    .then((like) => {
      if (!like) {
        throw new NotFoundError('Карточка с указанным _id не найдена'); // 404
      }
      res.send(like);
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        next(new BadRquestError('Не валидный id'));
      } else {
        next(err);
      }
    });
};
