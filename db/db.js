import { MongoClient} from "mongodb";
import dotenv from 'dotenv';
dotenv.config();

const mongoClient = new MongoClient(process.env.MONGO_URI);

export default async function mongo (){
    let connection;
    try{
        connection = await mongoClient.db('myWallet');
        return connection;
    } catch (error) {
        console.error(error);
        return error; 
    }
}