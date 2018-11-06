export const catchErrors = (err, req, res, next) => {
    res.status(err.status || 500).json({message: err.message})
}