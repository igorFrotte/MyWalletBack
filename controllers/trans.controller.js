import mongo from '../db/db.js';
import joi from 'joi';
import dayjs from 'dayjs';

const transactionSchema = joi.object({
    type: joi.string().required().valid('positive','negative'),
    value: joi.number().positive().precision(2).required(),
    description: joi.string().required()
}); 

let db = await mongo();

const create = async (req, res) => {
    const token = req.headers.authorization?.replace('Bearer ', '');
  
    const validation = transactionSchema.validate(req.body, { abortEarly: false });
    if (validation.error) {
      const erros = validation.error.details.map((detail) => detail.message);
      return res.status(422).send(erros);
    }
  
    const value = Number(req.body.value).toFixed(2);
  
    try {
      const session = await db.collection('token').findOne({ token });
      if (!session) {
        return res.send(401);
      }
  
      const transactions = await db
        .collection('transaction')
        .insertOne({ 
          ...req.body,
          value,
          userId: session.userId,
          date: dayjs(new Date()).format('DD/MM')
        });
  
      return res.status(200).send(transactions);
    } catch (error) {
      return res.status(500).send(error.message);
    }
};

const list = async (req, res) => {
    const token = req.headers.authorization?.replace('Bearer ', '');
  
    try {
      const session = await db.collection('token').findOne({ token });
      if (!session) {
        return res.send(401);
      }
  
      const transactions = await db.collection('transaction').find({ userId: session.userId }).toArray();
  
      return res.status(200).send(transactions);
    } catch (error) {
      return res.status(500).send(error.message);
    }
};

export { create, list };