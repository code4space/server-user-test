const { comparePassword, hashPassword } = require('../helper/bcrypt')
const path = require('path');
const handleError = require('../helper/error')
const { getToken } = require('../helper/jwt')
const Absents = require('../model/absensi')
const Users = require('../model/user')

class Admin {
    static async login(req, res, next) {
        try {
            const { email, password } = req.body
            if (!email) throw handleError('Unauthorized', 'email is required!')
            if (!password) throw handleError('Unauthorized', 'Password is required!')

            const user = await Users.findOne({ email })
            if (!user || !comparePassword(password, user.password) || !user.admin) {
                throw handleError('Not Found', 'Invalid email or Password!')
            }

            const payload = { id: user.id, admin: user.admin };
            const access_token = getToken(payload)

            res.status(200).json({ access_token })
        } catch (error) {
            next(error)
        }
    }

    static async getUserInfo(req, res, next) {
        try {
            if (!req.user.admin) throw handleError('Unauthorized', "You're not unauthorized")
            const query = req.query
            const perPage = 15;
            const skip = ((query?.page || 1) - 1) * perPage;

            function nextMonth(format) {
                const date = format ? new Date(format + '-01') : new Date();
                let month = date.getMonth() + 2
                let year = date.getFullYear()
                if (month === 13) {
                    month = '01'
                    year += 1
                }
                return new Date(`${year}-${month}-01`);
            }

            function currentDate(format) {
                const date = format ? new Date(format + '-01') : new Date();
                const month = date.getMonth() === 11 ? '01' : date.getMonth() + 1
                const year = date.getFullYear()
                return new Date(`${year}-${month}-01`);
            }


            const startDate = query?.from ? currentDate(query.from) : currentDate();
            const endDate = query?.from ? nextMonth(query.to) : nextMonth();

            const user = await Users.find({ admin: false }, "-password -__v")
            const todayAbsent = await Absents.find({
                tgl_masuk: {
                    $gte: startDate,
                    $lt: endDate
                }
            }, '-__v', { sort: { tgl_masuk: -1 } }).skip(skip).limit(perPage).populate('user', 'name')
            const allDataAbsen = await Absents.countDocuments({
                tgl_masuk: {
                    $gte: startDate,
                    $lt: endDate
                }
            })
            const totalPages = Math.ceil(allDataAbsen / perPage);
            res.status(200).json({ userInfo: user, absen: todayAbsent, totalPages })
        } catch (error) {
            next(error)
        }
    }

    static async updateUser(req, res, next) {
        try {
            if (!req.user.admin) throw handleError('Unauthorized', "You're not unauthorized")

            let { email, password, name, phone, position, id } = req.body
            if (email?.length === 0) throw handleError('Bad Request', 'email is required!')
            const set = {}
            if (password?.length > 0) {
                set.password = hashPassword(password)
            }
            if (req.file) set.image = `upload/${req.file.filename}`

            set.email = email
            set.name = name
            set.phone = phone
            set.position = position

            const result = await Users.findByIdAndUpdate(
                { _id: id },
                { $set: set }
            );

            res.status(201).json({ imagePath: result.image })
        } catch (error) {
            next(error)
        }
    }
}

module.exports = Admin