import express from 'express';
import cors from 'cors';
import mongo from './db/db.js';
import signRouter from "./routers/sign.routers.js"
import transRouter from "./routers/trans.routers.js"

const app = express();
app.use(express.json());
app.use(cors());

let db = await mongo();

app.use(signRouter);
app.use(transRouter);

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
          .deleteOne({_id: e._id});
        console.log("tirei mxm");
      }
    });
  } catch (error) {
    console.log(error);
  }
}, 60000);

app.listen(5000);