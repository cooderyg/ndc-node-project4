const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/auth-middleware");
const { Comments } = require("../models");
const { Op } = require("sequelize");
require("dotenv").config();

// 댓글 등록
router.post("/comments/:postId", authMiddleware, async (req, res) => {
  const { comment } = req.body;
  const { userId } = res.locals.user;
  const postId = Number(req.params.postId);
  if (!comment) {
    res.status(400).json({ message: "댓글 내용을 입력해주세요" });
  }

  // 댓글 생성
  try {
    const commentResult = await Comments.create({
      UserId: userId,
      PostId: postId,
      comment,
    });
    res.status(201).json({ data: commentResult });
  } catch (error) {
    res.status(500).json({ message: error });
  }
});
// 댓글 등록 끝

// 댓글 목록 조회
router.get("/comments/:postId", async (req, res) => {
  const postId = Number(req.params.postId);

  try {
    // 댓글 목록찾기
    const comments = await Comments.findAll({
      where: { PostId: postId },
      attributes: ["postId", "userId", "createdAt", "updatedAt"],
      order: [["createdAt", "DESC"]],
    });
    res.status(200).json({ data: comments });
  } catch (error) {
    res.status(500).json({ message: error });
  }
});
// 댓글 목록 조회 끝

// 댓글 수정
router.put("/comments/:commentId", authMiddleware, async (req, res) => {
  const { userId } = res.locals.user;
  const { comment } = req.body;
  const commentId = Number(req.params.commentId);

  // 댓글을 조회
  try {
    const comment = await Comments.findOne({ where: { commentId } });
    // console.log(comment);
    //댓글 없을 때
    if (!comment) {
      res.status(404).json({ message: "댓글이 존재하지 않습니다." });
      return;
    } else if (comment.UserId !== userId) {
      // 유저 다를 때
      res.status(401).json({ message: "권한이 없습니다." });
      return;
    }
  } catch (error) {
    res.status(500).json({ message: error });
    return;
  }

  try {
    // 댓글을 수정
    const result = await Comments.update(
      { comment }, // title과 content 컬럼을 수정
      {
        where: {
          [Op.and]: [{ commentId }, { UserId: userId }],
        },
      }
    );
    res.status(200).json({ data: "댓글이 수정되었습니다." });
  } catch (error) {
    res.status(500).json({ message: error });
  }
});
// 댓글 수정 끝

// 댓글 삭제
router.delete("/comments/:commentId", authMiddleware, async (req, res) => {
  const { commentId } = req.params;
  const { userId } = res.locals.user;
  try {
    // 댓글을 조회
    const comment = await Comments.findOne({ where: { commentId } });
    // 댓글 없을 때
    if (!comment) {
      res.status(404).json({ message: "댓글이 존재하지 않습니다." });
      return;
    } else if (comment.UserId !== userId) {
      // 권한이 없을 때
      res.status(401).json({ message: "권한이 없습니다." });
      return;
    }
  } catch (error) {
    res.status(500).json({ message: error });
    return;
  }

  //  댓글을 삭제
  try {
    await Comments.destroy({
      where: {
        [Op.and]: [{ commentId }, { UserId: userId }],
      },
    });
    res.status(200).json({ data: "댓글이 삭제되었습니다." });
  } catch (error) {
    res.status(500).json({ message: error });
  }
});
// 댓글 삭제 끝

module.exports = router;
