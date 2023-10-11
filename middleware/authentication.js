const handleError = require("../helper/error")
const { verifyToken } = require("../helper/jwt")
const Users = require("../model/user")


async function auth(req, res, next) {
    try {
        const accessToken = req.headers.access_token
        if (!accessToken) {
            throw handleError('Unauthorized', 'Access Denied')
        } else {
            let payload = verifyToken(accessToken)
            let user = await Users.findById(payload.id)
            if (!user) {
                throw handleError('Unauthorized', 'Access Denied')
            } else {
                req.user = {
                    id: user.id,
                    admin: payload.admin
                }
                next()
            }
        }
    } catch (error) {
        next(error)
    }
}

module.exports = auth