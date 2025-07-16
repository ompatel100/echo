import Tag from "../models/Tag.js";
import Post from "../models/Post.js";

const createTag = async (req, res, next) => {
  try {
    const { tagName } = req.body;

    const tag = await Tag.findOne({ tagName });

    if (tag) {
      const error = new Error("Tag is already created!");
      return next(error);
    }

    const newTag = new Tag({
      tagName,
    });

    const savedTag = await newTag.save();

    return res.status(201).json(savedTag);
  } catch (error) {
    next(error);
  }
};

const getSingleTag = async (req, res, next) => {
  try {
    const tag = await Tag.findById(req.params.tagId);

    if (!tag) {
      const error = new Error("Tag was not found!");
      return next(error);
    }

    return res.json(tag);
  } catch (error) {
    next(error);
  }
};

const getAllTags = async (req, res, next) => {
  try {
    const filter = req.query.searchKeyword;
    let where = {};
    if (filter) {
      where.title = { $regex: filter, $options: "i" };
    }
    let query = Tag.find(where);
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * pageSize;
    const total = await Tag.find(where).countDocuments();
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
      .sort({ updatedAt: "desc" });

    return res.json(result);
  } catch (error) {
    next(error);
  }
};

const updateTag = async (req, res, next) => {
  try {
    const { tagName } = req.body;

    const tag = await Tag.findByIdAndUpdate(
      req.params.tagId,
      {
        tagName,
      },
      {
        new: true,
      }
    );

    if (!tag) {
      const error = new Error("Category was not found");
      return next(error);
    }

    return res.json(tag);
  } catch (error) {
    next(error);
  }
};

const deleteTag = async (req, res, next) => {
  try {
    const { tagId } = req.params;

    await Post.updateMany(
      { tags: { $in: [tagId] } },
      { $pull: { tags: tagId } }
    );

    await Tag.deleteOne({ _id: tagId });

    res.send({
      message: "Tag is successfully deleted!",
    });
  } catch (error) {
    next(error);
  }
};

export { createTag, getSingleTag, getAllTags, updateTag, deleteTag };
