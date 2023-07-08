const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/auth-middleware");
const { Likes, Posts, Users } = require("../models");
const { Op } = require("sequelize");

router.post("/likes/:postId", authMiddleware, async (req, res) => {
  const { userId } = res.locals.user;
  const { postId } = req.params;

  const isExisted = await Likes.findOne({
    where: {
      [Op.and]: [{ UserId: userId }, { PostId: postId }],
    },
  });

  if (isExisted) {
    try {
      await Likes.destroy({
        where: {
          [Op.and]: [{ UserId: userId }, { PostId: postId }],
        },
      });
      await Posts.decrement({ likeCount: 1 }, { where: { postId } });
      return res.status(200).json({ isLiked: false });
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }

  try {
    await Likes.create({
      UserId: userId,
      PostId: postId,
    });
    await Posts.increment({ likeCount: 1 }, { where: { postId } });
    res.status(200).json({ isLiked: true });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
