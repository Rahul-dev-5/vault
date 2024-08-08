//utils/asyncErrorhandler.js
const asyncErrorHandler = (func) => async (req, res, next) =>{
    try {
        await func(req, res, next)
    } catch (error) {
        res.status(error.code || 500)
        .json({
            success : false,
            message : error.message
        })
    }
}

module.exports = asyncErrorHandler


// const asyncErrorHandler = (requestHandler) => {
//     return (req, res, next) => {
//         Promise.resolve(requestHandler(req, res, next)).catch((err) => next(err))
//     }
// }


// module.exports =  asyncErrorHandler 