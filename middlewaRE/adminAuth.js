// import jsonwebtoken from 'jsonwebtoken'
import jwt from 'jsonwebtoken';



const adminAuth = (req, res, next) => {
    console.log('adminAuth');

    console.log(req.headers);

    const authHeader = req.headers['authorization'];
    console.log('authHeader:-', authHeader);

    if (!authHeader) {
        return res.status(401).send('Autherization header is missing')
    }
    const token = authHeader.split(' ')[1]
    console.log('token:=', token);
    if (!token) {
        console.log('no');

        return res.status(401).send('No token provided, authorization denied')

    }
    try {
        //    const decode=jsonwebtoken.verify(token.process.env.jwt_secret_key); 
        const decode = jwt.verify(token, process.env.jwt_secret_key).user;

        console.log('decoded:=', decode)
        if (decode.Admin) { 
            req.userId = decode._id 
            next()
        }
    } catch (error) {
        return res.status(403).json({ message: 'Token is not valid' });
    }
}

export { adminAuth }