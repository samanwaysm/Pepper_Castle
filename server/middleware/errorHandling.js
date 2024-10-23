
const errorMiddleware = (err, req, res, next) => {
    console.log('a');
    const status = 500; // Default to 500 if status is not provided
    console.log('b');
    console.log(status);
    console.log('c');
    
    if (status === 404) {
        console.log('d');
        res.status(status).render('user/404Error');
        console.log('e');
    } else {
        console.log('f');
        res.status(status).render('user/500Error');
        console.log('g');
    }
    console.log('H');
};

module.exports = errorMiddleware;