import mongo from "../db/db.js";

async function validToken(req, res, next){
    const token = req.headers.authorization?.replace('Bearer ', '');

    try {
        let db = await mongo();

        const session = await db.collection('token').findOne({ token });
        if (!session) {
        return res.status(401).send();
        }

        res.locals.session = session;
        next();
    } catch (error) {
    return res.status(500).send(error.message);
    }
}

export default validToken;