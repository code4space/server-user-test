const { comparePassword, hashPassword } = require('../helper/bcrypt')
const path = require('path');
const handleError = require('../helper/error')
const { getToken } = require('../helper/jwt')
const Absents = require('../model/absensi')
const Users = require('../model/user')

class User {
    static async login(req, res, next) {
        try {
            const { email, password } = req.body
            if (!email) throw handleError('Unauthorized', 'email is required!')
            if (!password) throw handleError('Unauthorized', 'Password is required!')

            const user = await Users.findOne({ email })
            if (!user || !comparePassword(password, user.password)) {
                throw handleError('Not Found', 'Invalid email or Password!')
            }

            const payload = { id: user.id, admin: user.admin };
            const access_token = getToken(payload)

            res.status(200).json({ access_token })
        } catch (error) {
            next(error)
        }
    }

    static async register(req, res, next) {
        try {
            let { email, password, name, phone, position, image, admin } = req.body
            if (!email) throw handleError('Bad Request', 'email is required!')
            if (!password) throw handleError('Bad Request', 'Password is required!')
            if (!name) name = ""
            if (!phone) phone = ""
            if (!position) position = ""
            if (!image) image = ""

            await Users.create({
                email,
                password: hashPassword(password),
                name, phone, position, admin: admin ?? false, image
            }).catch(error => {
                if (error.code === 11000) throw handleError('Conflict', `User with email ${email} already exist`)
            })
            res.status(201).json({ message: `User with email ${email} has been created` })
        } catch (error) {
            next(error)
        }
    }

    static async getUserInfo(req, res, next) {
        try {
            const query = req.query
            const perPage = 15;
            const skip = ((query?.page || 1) - 1) * perPage;

            function nextMonth(format) {
                const date = format ? new Date(format + '-01') : new Date();
                const month = date.getMonth() === 11 ? '01' : date.getMonth() + 2
                const year = date.getFullYear()
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

            const { name, email, phone, image, position, _id } = await Users.findById(req.user.id)
            const todayAbsent = await Absents.find({
                user: req.user.id, tgl_masuk: {
                    $gte: startDate,
                    $lt: endDate
                }
            }, 'tgl_masuk tgl_pulang', { sort: { tgl_masuk: -1 } }).skip(skip).limit(perPage);
            const allDataAbsen = await Absents.countDocuments({
                user: req.user.id, tgl_masuk: {
                    $gte: startDate,
                    $lt: endDate
                }
            })
            const totalPages = Math.ceil(allDataAbsen / perPage);
            res.status(200).json({ userInfo: { name, email, phone, image, position, id: _id }, absen: todayAbsent, totalPages })
        } catch (error) {
            console.log(error);
            next(error)
        }
    }

    static async absenMasuk(req, res, next) {
        try {
            const today = new Date('2023-10-06')
            const todayAbsent = await Absents.findOne({ user: req.user.id }, null, { sort: { tgl_masuk: -1 } });
            if (!todayAbsent) {
                await Absents.create({
                    user: req.user.id,
                    tgl_masuk: today,
                    tgl_pulang: false
                })
                return res.status(201).json({ message: "Absen masuk success" })
            }

            const { tgl_masuk } = todayAbsent
            // Compare dates
            if (
                tgl_masuk.getDate() === today.getDate() &&
                tgl_masuk.getMonth() === today.getMonth() &&
                tgl_masuk.getFullYear() === today.getFullYear()
            ) {
                res.status(200).json({ message: "Today user already absent" })
            } else {
                await Absents.create({
                    user: req.user.id,
                    tgl_masuk: today,
                    tgl_pulang: false
                })
                res.status(201).json({ message: "Absen masuk success" })
            }

        } catch (error) {
            next(error)
        }
    }

    static async absenPulang(req, res, next) {
        try {
            const today = new Date('2023-10-06')
            const todayAbsent = await Absents.findOne({ user: req.user.id }, null, { sort: { tgl_masuk: -1 } });

            if (!todayAbsent) return res.status(200).json({ message: "User must 'Absen Masuk' first!" })

            // Compare dates
            await Absents.updateOne(
                { user: req.user.id, tgl_masuk: todayAbsent.tgl_masuk },
                { $set: { tgl_pulang: today } }
            );
            res.status(201).json({ message: "Absen pulang success" })
        } catch (error) {
            next(error)
        }
    }

    static async updateUser(req, res, next) {
        try {
            let { email, password, name, phone, position } = req.body
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
                { _id: req.user.id },
                { $set: set }
            );

            res.status(201).json({ imagePath: result.image })
        } catch (error) {
            console.log(error)
            next(error)
        }
    }
}

module.exports = User