const userRouter = require('express').Router();
const { getUserId, getUsers, updateUser, updateUserAvatar, getUserAuth } = require('../controllers/users');

userRouter.get('/users', getUsers);
userRouter.get('/users/:userId', getUserId);
userRouter.get('/users/me', getUserAuth);
userRouter.patch('/users/me', updateUser);
userRouter.patch('/users/me/avatar', updateUserAvatar);

module.exports = userRouter;
