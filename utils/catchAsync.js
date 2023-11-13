module.exports = (callBack) => {
    return (req, res, next) => {
        callBack(req, res, next).catch(err => next(err));
    };
};