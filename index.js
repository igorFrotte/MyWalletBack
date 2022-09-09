import express from 'express';
import cors from 'cors';
import { MongoClient, ObjectId } from "mongodb";
import joi from 'joi';
import dayjs from 'dayjs';
import dotenv from 'dotenv';

dotenv.config();
const app = express();
app.use(express.json());
app.use(cors());

const mongoClient = new MongoClient(process.env.MONGO_URI);

let db;

mongoClient.connect().then(() => {
  db = mongoClient.db("myWallet");
});

/* const nameSchema = joi.object({
  name: joi.string().required()
}); */

setInterval( async () => {
  const realTime = Date.now();
  const HOURS_2 = 1000 * 60 * 60 * 2;

  try {
    const tokens = await db.collection("token").find().toArray()

    tokens.map( async (e) => {
      if(realTime - e.creatTime > HOURS_2){
        await db
          .collection("participante")
          .deleteOne({_id: ObjectId(e._id)});
      }
    });
  } catch (error) {
    console.log(error);
  }
}, 60000);

app.listen(5000);