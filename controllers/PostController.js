import PostModel from "../models/Post.js";
import cloudinary from "../utils/cloudinary.js";
export const getLastTags = async (req, res) => {
  try {
    const posts = await PostModel.find().limit(5).exec();
    const tags = posts.map((obj) => obj.tags.flat().slice(0, 5));
    res.json(tags);
  } catch (err) {
    console.log(err);
    res.status(500).json({
      msg: "Не удалось получить теги",
    });
  }
};

export const getAll = async (req, res) => {
  try {
    const posts = await PostModel.find().populate("user").exec();
    res.json(posts);
  } catch (err) {
    console.log(err);
    res.status(500).json({
      msg: "Не удалось получить статьи",
    });
  }
};

export const getOne = async (req, res) => {
  try {
    const postId = req.params.id;

    PostModel.findOneAndUpdate(
      {
        _id: postId,
      },
      {
        $inc: { viewsCount: 1 },
      },
      {
        returnDocument: "after",
      },
      (err, doc) => {
        if (err) {
          console.log(err);
          return res.status(500).json({
            msg: "Не удалось получить статью",
          });
        }

        if (!doc) {
          return res.status(404).json({
            message: "Статья не найдена",
          });
        }

        res.json(doc);
      }
    ).populate("user");
  } catch (err) {
    console.log(err);
    res.status(500).json({
      msg: "Не удалось получить статьи",
    });
  }
};

export const remove = async (req, res) => {
  try {
    const postId = req.params.id;
    PostModel.findOneAndDelete(
      {
        _id: postId,
      },
      (err, doc) => {
        if (err) {
          console.log(err);
          return res.status(500).json({
            msg: "Не удалось удалить статьи",
          });
        }

        if (!doc) {
          return res.status(404).json({
            message: "Статья не найдена",
          });
        }

        res.json({
          success: true,
        });
      }
    );
  } catch (err) {
    console.log(err);
    res.status(500).json({
      msg: "Не удалось получить статьи",
    });
  }
};

export const create = async (req, res) => {
  const imageName = req.body.imageUrl;
  const result = await cloudinary.uploader.upload(`${imageName}`, {
    public_id: `${Date.now()}`,
    resource_type: "auto",
    folder: "mern",
  });

  try {
    const doc = new PostModel({
      title: req.body.title,
      text: req.body.text,
      imageURL: result.url,
      tags: req.body.tags.split(","),
      user: req.userId,
    });

    const post = await doc.save();
    res.json(post);
  } catch (err) {
    console.log(err);
    res.status(500).json({
      msg: "Не удалось создать статью",
    });
  }
};

export const update = async (req, res) => {
  const imageName = req.body.imageUrl;
  const result = await cloudinary.uploader.upload(`${imageName}`, {
    public_id: `${Date.now()}`,
    resource_type: "auto",
    folder: "mern",
  });
  try {
    const postId = req.params.id;
    await PostModel.updateOne(
      {
        _id: postId,
      },
      {
        title: req.body.title,
        text: req.body.text,
        imageURL: result.url,
        user: req.userId,
        tags: req.body.tags.split(","),
      }
    );

    res.json({
      success: true,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      msg: "Не удалось обновить статью",
    });
  }
};
