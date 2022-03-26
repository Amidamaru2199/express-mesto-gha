const userRouter = require('express').Router();
const { celebrate, Joi } = require('celebrate');
const { getUserId, getUsers, updateUser, updateUserAvatar, getUserAuth } = require('../controllers/users');

userRouter.get('/users', getUsers);
userRouter.get('/users/me', getUserAuth);
userRouter.get(
  '/users/:userId',
  celebrate({
    params: Joi.object().keys({
      userId: Joi.string().length(24).hex().required(),
    }),
  }),
  getUserId,
);
userRouter.patch(
  '/users/me',
  celebrate({
    body: Joi.object().keys({
      name: Joi.string().required().min(2).max(30),
      about: Joi.string().required().min(2).max(30),
    }),
  }),
  updateUser,
);
userRouter.patch(
  '/users/me/avatar',
  celebrate({
    body: Joi.object().keys({
      avatar: Joi.string().required().pattern(/(https?:\/\/)(w{3}\.)?(((\d{1,3}\.){3}\d{1,3})|((\w-?)+\.[a-z0-9_-]{2,3}))(:\d{2,5})?((\/.+)+)?\/?#?/m),
    }),
  }),
  updateUserAvatar,
);

module.exports = userRouter;
