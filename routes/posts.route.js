const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/auth-middleware");
const { Posts, Likes } = require("../models");
const { Op } = require("sequelize");

// 게시글 등록
router.post("/posts", authMiddleware, async (req, res) => {
  const { title, content } = req.body;
  const { userId } = res.locals.user;
  if (!content || !title) {
    res.status(400).json({ message: "포스트 내용을 입력해주세요" });
  }
  try {
    const post = await Posts.create({
      UserId: userId,
      title,
      content,
    });
    res.status(201).json({ data: post });
  } catch (error) {
    res.status(500).json({ errorMessage: error });
  }
});
// 게시글 등록 끝

// 게시글 목록 조회
router.get("/posts", async (req, res) => {
  try {
    const posts = await Posts.findAll({
      attributes: ["postId", "title", "createdAt", "updatedAt"],
      order: [["createdAt", "DESC"]],
    });
    res.status(200).json({ data: posts });
  } catch (error) {
    res.status(500).json({ message: error });
  }
});
// 게시글 목록 조회 끝

// 게시글 상세 조회
router.get("/posts/:postId", async (req, res) => {
  const { postId } = req.params;
  try {
    const post = await Posts.findOne({
      attributes: [
        "postId",
        "title",
        "content",
        "likeCount",
        "createdAt",
        "updatedAt",
      ],
      where: { postId },
    });
    //게시글 없을 때
    if (!post) {
      res.status(404).json({ message: "해당하는 게시글이 없습니다." });
      return;
    }
    res.status(200).json({ data: post });
  } catch (error) {
    res.status(500).json({ message: error });
  }
});
// 게시글 상세 조회 끝

// 좋아요한 게시글 조회 시작
router.get("/like-posts", authMiddleware, async (req, res) => {
  const { userId } = res.locals.user;

  const likePosts = await Posts.findAll({
    where: {
      "$Likes.UserId$": { [Op.eq]: userId },
    },
    include: [{ model: Likes, as: "Likes", attributes: ["likeId"] }],
    order: [["createdAt", "DESC"]],
  });
  res.status(200).json({ data: likePosts });
});
// 좋아요한 게시글 조회 끝

// 게시글 수정
router.put("/posts/:postId", authMiddleware, async (req, res) => {
  const { postId } = req.params;
  const { userId } = res.locals.user;
  const { title, content } = req.body;

  // 게시글을 조회합니다.
  try {
    const post = await Posts.findOne({ where: { postId } });
    //게시글 없을 때
    if (!post) {
      res.status(404).json({ message: "게시글이 존재하지 않습니다." });
      return;
    } else if (post.UserId !== userId) {
      // 유저 다를 때
      res.status(401).json({ message: "권한이 없습니다." });
      return;
    }
  } catch (error) {
    res.status(500).json({ message: error });
    return;
  }

  try {
    // 게시글을 수정
    await Posts.update(
      { title, content }, // title과 content 컬럼을 수정
      {
        where: {
          [Op.and]: [{ postId }, { UserId: userId }],
        },
      }
    );
    res.status(200).json({ data: "게시글이 수정되었습니다." });
  } catch (error) {
    res.status(500).json({ message: error });
  }
});
// 게시글 수정 끝

// 게시글 삭제
router.delete("/posts/:postId", authMiddleware, async (req, res) => {
  const { postId } = req.params;
  const { userId } = res.locals.user;
  try {
    // 게시글을 조회
    const post = await Posts.findOne({ where: { postId } });
    if (!post) {
      res.status(404).json({ message: "게시글이 존재하지 않습니다." });
      return;
    } else if (post.UserId !== userId) {
      res.status(401).json({ message: "권한이 없습니다." });
      return;
    }
  } catch (error) {
    res.status(500).json({ message: error });
    return;
  }

  // 게시글의 권한을 확인하고, 게시글을 삭제
  try {
    await Posts.destroy({
      where: {
        [Op.and]: [{ postId }, { UserId: userId }],
      },
    });
    res.status(200).json({ data: "게시글이 삭제되었습니다." });
  } catch (error) {
    res.status(500).json({ message: error });
  }
});
// 게시글 삭제 끝

module.exports = router;
