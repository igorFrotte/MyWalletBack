import express from 'express';
import cors from 'cors';
import { MongoClient, ObjectId } from "mongodb";
import joi from 'joi';
import dayjs from 'dayjs';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import { v4 as uuid } from 'uuid';

dotenv.config();
const app = express();
app.use(express.json());
app.use(cors());

const mongoClient = new MongoClient(process.env.MONGO_URI);

let db;

mongoClient.connect().then(() => {
  db = mongoClient.db("myWallet");
});

const signUpSchema = joi.object({
  name: joi.string().required(),
  email: joi.string().email().required(),
  password: joi.string().required()
}); 

const signInSchema = joi.object({
  email: joi.string().email().required(),
  password: joi.string().required()
}); 

const transactionSchema = joi.object({
  type: joi.string().required().valid('positive','negative'),
  value: joi.number().positive().precision(2).required(),
  description: joi.string().required()
}); 

setInterval( async () => {
  const realTime = Date.now();
  const HOURS_2 = 1000 * 60 * 60 * 2;

  try {
    const tokens = await db.collection("token").find().toArray()

    console.log("Interval Executada");

    tokens.map( async (e) => {
      if(realTime - e.creatTime > HOURS_2){ 
        await db
          .collection("token")
          .deleteOne({_id: ObjectId(e._id)});
        console.log("tirei mxm");
      }
    });
  } catch (error) {
    console.log(error);
  }
}, 60000);

app.post("/sign-up", async (req, res) => {
  const { name, password } = req.body;

  const validation = signUpSchema.validate(req.body, { abortEarly: false });

  if (validation.error) {
    const erros = validation.error.details.map((detail) => detail.message);
    return res.status(422).send(erros);
  }

  try {
    const userExist = await db
      .collection("user")
      .findOne({ name });

    if(userExist){
      return res.status(409).send("Usuário existente");
    }

    const passwordHash = bcrypt.hashSync(password, 10);

    await db.collection('user').insertOne({ ...req.body, password: passwordHash })

    res.status(201).send(); 
  } catch (error) {
    res.status(500).send(error.message);
  }
});

app.post("/sign-in", async (req, res) => {
  const { email, password } = req.body;

  const validation = signInSchema.validate(req.body, { abortEarly: false });

  if (validation.error) {
    const erros = validation.error.details.map((detail) => detail.message);
    return res.status(422).send(erros);
  }

  try {
    const user = await db.collection('user').findOne({email});
    if(!user) {
      return res.status(404).send('Usuário ou senha não encontrada');
    }

    const isValid = bcrypt.compareSync(password, user.password);
    if(!isValid) {
      return res.status(404).send('Usuário ou senha não encontrada');
    }

    const token = uuid();
    db.collection('token').insertOne({
      token,
      userId: user._id,
      creatTime: Date.now()
    })

    return res.status(200).send({token, user: user.name});
  } catch (error) {
    return res.status(500).send(error.message);
  }
});

app.get("/transactions", async (req, res) => {
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
});

app.post("/transactions", async (req, res) => {
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
});

app.listen(5000);