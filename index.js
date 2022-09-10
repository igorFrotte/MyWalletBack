import express from 'express';
import cors from 'cors';
import { MongoClient, ObjectId } from "mongodb";
import joi from 'joi';
import dayjs from 'dayjs';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';

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



app.listen(5000);