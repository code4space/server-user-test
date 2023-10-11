const route = require("express").Router();
const User = require('../controllers/user')
const auth = require('../middleware/authentication')
const fs = require('fs');
const multer = require("multer");
const mime = require('mime-types');
const Admin = require("../controllers/admin");
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "upload/");
    },
    filename: (req, file, cb) => {
        const extension = mime.extension(file.mimetype);
        if (!extension) {
            return callback(new Error('Invalid file type'));
        }
        if (fs.existsSync(`upload/${req.id}.${extension}`)) {
            fs.unlinkSync(`upload/${req.id}.${extension}`);
        }
        cb(null, `${req.user.id}.${extension}`);
    },
});
const upload = multer({ storage });

route.post('/user/login', User.login)
route.post('/admin/login', Admin.login)
route.post('/user/register', User.register)

route.use(auth)

route.get("/user", User.getUserInfo)
route.get("/user/all", Admin.getUserInfo)
route.patch("/admin", upload.single('image'), Admin.updateUser)
route.patch("/user", upload.single('image'), User.updateUser)
route.post("/user/absen/masuk", User.absenMasuk)
route.post("/user/absen/pulang", User.absenPulang)

module.exports = route;
