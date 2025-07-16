import Post from "../models/Post.js";
import Comment from "../models/Comment.js";
import { fileRemover } from "../utils/fileRemover.js";

const createPost = async (req, res, next) => {
  try {
    let { title, body, tags } = req.body;
    tags = JSON.parse(tags);
    const photo = req.file.path;
    const userId = req.user._id;
    const post = await Post.create({ title, body, photo, user: userId, tags });
    return res.status(201).json({
      post,
    });
  } catch (error) {
    next(error);
  }
};

const updatePost = async (req, res, next) => {
  try {
    const { postId } = req.params;
    let { title, body, tags } = req.body;
    tags = JSON.parse(tags);
    const updateFields = {};
    if (title !== undefined) updateFields.title = title;
    if (body !== undefined) updateFields.body = body;
    if (tags !== undefined) updateFields.tags = tags;

    const updatedPost = await Post.findByIdAndUpdate(postId, updateFields, {
      new: true,
    });

    if (!updatedPost) {
      return next(new Error("Post not found"));
    }

    res.status(201).json(updatedPost);
  } catch (error) {
    next(error);
  }
};

const updatePostPhoto = async (req, res, next) => {
  try {
    const { postId } = req.params;
    const post = await Post.findById(postId);

    if (post.photo) {
      fileRemover(post.photo);
    }
    if (req.file) {
      post.photo = req.file.filename;
    } else {
      post.photo = "";
    }
    const updatedPost = await post.save();
    return res.status(201).json({
      photo: updatedPost.photo,
    });
  } catch (error) {
    next(error);
  }
};

const deletePost = async (req, res, next) => {
  try {
    const { postId } = req.params;
    const post = await Post.findByIdAndDelete(postId);

    if (!post) {
      const error = new Error("Post was not found");
      return next(error);
    }

    if (post.photo) {
      fileRemover(post.photo);
    }

    await Comment.deleteMany({ post: post._id });

    return res.json({
      message: "Post is successfully deleted",
    });
  } catch (error) {
    next(error);
  }
};

const getPost = async (req, res, next) => {
  try {
    const { postId } = req.params;
    const post = await Post.findById(postId).populate([
      {
        path: "user",
        select: ["avatar", "name"],
      },
      {
        path: "tags",
        select: ["tagName"],
      },
      {
        path: "comments",
        select: ["description"],
      },
    ]);

    if (!post) {
      const error = new Error("Post was not found");
      return next(error);
    }

    return res.json(post);
  } catch (error) {
    next(error);
  }
};

const getAllPosts = async (req, res, next) => {
  try {
    const filter = req.query.searchKeyword;
    const tags = req.query.tags ? req.query.tags.split(",") : []; // Expecting tags to be comma-seperated

    let where = {};

    if (filter) {
      where.title = { $regex: filter, $options: "i" };
    }

    if (tags.length > 0) {
      where.tags = { $in: tags };
    }

    let query = Post.find(where);
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * pageSize;
    const total = await Post.find(where).countDocuments();
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
          path: "tags",
          select: ["tagName"],
        },
      ])
      .sort({ updatedAt: "desc" });

    return res.json(result);
  } catch (error) {
    next(error);
  }
};

export {
  createPost,
  updatePost,
  updatePostPhoto,
  deletePost,
  getPost,
  getAllPosts,
};
