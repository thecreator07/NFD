import multer from "multer";

//multer handle file in form
//multer.diskStorage will give access to store the files in Disc storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./public/temp"); //storage path for image
  },
  //we can modify the filename here
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

export const upload = multer({ storage: storage });
