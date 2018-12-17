var express = require('express');
var router = express.Router();
var UserModel = require("../models/User");
var UploadModel = require("../models/Upload");
var fs = require("fs");
var path = require("path")
var timer = require("time-ago");
let sharp = require("sharp");
process.env.ROOT = path.dirname(__dirname);

router.post("/delete", (req, res) => {
  //image id
  let id = req.body.id;
  //user id
  let user_id = req.body.user_id;
  //image paths
  let imagePath =  user_id + "/" + req.body.name;
  let resized =  user_id + "/resize_" + req.body.name;

  UploadModel.deleteOne({
    _id: id
  }, err => {
    if (err) {
      res.json({
        error: ['could not delete item']
      })
    } else {
        fs.unlinkSync(imagePath)
        fs.unlinkSync(resized);
      res.json({
        deleted: true
      });
    }

  })
})
router.post("/update", (req, res) => {
  let id = req.body.id;
  let desc = req.body.description;
  console.log(id, desc)
  UploadModel.findByIdAndUpdate(id, {
    description: desc
  }, (err, response) => {
    if (err)
      res.json({
        error: ['could not update']
      })
    else
      res.json({
        updated: true
      });
  })
})

router.get("/download/:folder/:image", (req, res) => {
  let image = process.env.ROOT + "/" + req.params.folder + "/" + req.params.image;
  res.sendfile(image);
})
router.get("/images", (req, res) => {
  //get id and page

  let userId = req.query.id;
  let page = req.query.page || 0;
  let limit = parseInt(req.query.limit) || 3;
  UploadModel.find({
      user_id: userId
    })
    .limit(limit)
    .skip(page * limit)
    .sort({
      _id: 'desc'
    })
    .lean()
    .exec((err, result) => {
      if (err) {
        console.log(err)
      }
      let newResult = result.map((val) => {
        val.image = "http://10.0.2.2:3000/download/" + val.image;
        val.resize = "http://10.0.2.2:3000/download/" + val.resize;
        val.created_at = timer.ago(val.created_at)
        return val;
      })
      if (newResult.length == 0) {
        res.json({
          final: true
        });
      } else {
        res.json(newResult);
      }
    })
})

router.post("/upload", (req, res) => {
  let userId = req.body.id;
  let img = req.files.image;
  let path = userId + "/" + img.name;
  let resize = userId + "/resize_" + img.name;
  if (!fs.existsSync(userId))
    fs.mkdirSync(userId);
  img.mv(path, err => {
    if (err) {
      res.end(err)
    }
    //resize image
    //resize the image
    sharp(path)
      .resize(200, 200)
      .toFile(resize)
      .then(res => "image cropped")
      .catch(err => console.log(err))
    //save to databas
    let upload = new UploadModel({
      description: req.body.description,
      image: path,
      resize: resize,
      user_id: userId
    });
    upload.save()
      .then(() => {
        res.end();
      }).catch(err => {
        console.log(err)
        res.end();
      })
  })

})

router.post("/authenticate", (req, res) => {
  UserModel.findOne({
    email: req.body.email,
    password: req.body.password
  }, (err, output) => {
    if (err) {
      console.log(err)
      res.end()
    }
    if (!output)
      res.json({
        error: ['no record found']
      })
    else
      res.json(output);
  });
})

router.post("/register", (req, res) => {
  let user = new UserModel({
    email: req.body.email,
    password: req.body.password
  })
  let error = user.validateSync();
  if (error) {
    res.json({
      error: returnErrors(error)
    })

  } else {
    user.save(err => {
      res.send(user);
    })
  }
})

function returnErrors(error) {
  let errArr = [];
  for (let err in error.errors) {
    errArr.push(error.errors[err].message);
  }
  return errArr;
}
module.exports = router;