const errorHandler = (err, req, res, next) => {
    let code = 500;

    if (err.code === 'Bad Request') code = 400
    else if (err.code === 'Unauthorized') code = 401
    else if (err.code === 'Forbidden') code = 403
    else if (err.code === 'Not Found') code = 404
    else if (err.code === 'Conflict') code = 409
    else if (err.code === 'Internal Server Error') code = 500

    res.status(code).json({ message: err.message || 'Internal Server Error' });
};

module.exports = { errorHandler }