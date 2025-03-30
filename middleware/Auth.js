// const jwt = require("jsonwebtoken");

// const verifyToken = (req,res,next)=> {
//     try{
//         const { authorization } = req.headers;

//         if (!authorization) {
//             return res.status(401).json('Invalid Authorization')
//         };
//         const token = authorization.replace('Bearer', ' ').trim();        
//         const verified = jwt.verify(token, process.env.JWT_SECRET);
//         req.user = verified.user;
//         next();
//     }catch(err){
//         console.error(err);
//         res.status(401).json({errorMessage:"Unauthorized"})
//     }
// }

// module.exports = verifyToken;

const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
    try {
        // Essayez d'abord de récupérer le token du cookie
        const tokenFromCookie = req.cookies.tokenLogin;

        if (!tokenFromCookie) {
            // Si le token n'est pas trouvé dans le cookie, essayez à partir des en-têtes
            const { authorization } = req.headers;

            if (!authorization) {
                return res.status(401).json('Invalid Authorization')
            }
            
            const token = authorization.replace('Bearer', ' ').trim();
            const verified = jwt.verify(token, process.env.JWT_SECRET);
            req.user = verified.user;
            next();
        } else {
            // Si le token est trouvé dans le cookie, vérifiez-le
            const verified = jwt.verify(tokenFromCookie, process.env.JWT_SECRET);
            req.user = verified.user;
            next();
        }
    } catch (err) {
        console.error(err);
        res.status(401).json({ errorMessage: "Unauthorized" });
    }
}

module.exports = verifyToken;
