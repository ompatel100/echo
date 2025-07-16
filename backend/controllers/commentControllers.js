import Comment from "../models/Comment.js";
import Post from "../models/Post.js";

const createComment = async (req, res, next) => {
  try {
    const { postId, description } = req.body;

    const post = await Post.findById(postId);

    if (!post) {
      const error = new Error("Post was not found");
      return next(error);
    }

    const newComment = new Comment({
      user: req.user._id,
      description,
      post: post._id,
    });

    const savedComment = await newComment.save();
    return res.json(savedComment);
  } catch (error) {
    next(error);
  }
};

const updateComment = async (req, res, next) => {
  try {
    const { description } = req.body;

    const comment = await Comment.findById(req.params.commentId);

    if (!comment) {
      const error = new Error("Comment was not found");
      return next(error);
    }

    comment.description = description || comment.description;

    const updatedComment = await comment.save();
    return res.json(updatedComment);
  } catch (error) {
    next(error);
  }
};

const deleteComment = async (req, res, next) => {
  try {
    const { commentId } = req.params;
    const comment = await Comment.findByIdAndDelete(commentId);

    if (!comment) {
      const error = new Error("Comment was not found");
      return next(error);
    }

    return res.json({
      message: "Comment is deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

const getAllComments = async (req, res, next) => {
  try {
    const filter = req.query.searchKeyword;
    let where = {};
    if (filter) {
      where.description = { $regex: filter, $options: "i" };
    }
    let query = Comment.find(where);
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * pageSize;
    const total = await Comment.find(where).countDocuments();
    const pages = Math.ceil(total / pageSize);

    res.header({
      "x-filter": filter,
      "x-totalcount": JSON.stringify(total),
      "x-currentpage": JSON.stringify(page),
      "x-pagesize": JSON.stringify(pageSize),
      "x-totalpagecount": JSON.stringify(pages),
    });

    if (page > pages) {
      return res.json([]);
    }

    const result = await query
      .skip(skip)
      .limit(pageSize)
      .populate([
        {
          path: "user",
          select: ["avatar", "name"],
        },
        {
          path: "post",
          select: ["_id", "title"],
        },
      ])
      .sort({ updatedAt: "desc" });

    return res.json(result);
  } catch (error) {
    next(error);
  }
};

export { createComment, updateComment, deleteComment, getAllComments };
