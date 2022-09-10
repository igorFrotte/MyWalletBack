import joi from 'joi';
import mongo from '../db/db.js';
import bcrypt from 'bcrypt';
import { v4 as uuid } from 'uuid';

const signUpSchema = joi.object({
    name: joi.string().required(),
    email: joi.string().email().required(),
    password: joi.string().required()
}); 
  
const signInSchema = joi.object({
    email: joi.string().email().required(),
    password: joi.string().required()
}); 

let db = await mongo();

const signUP = async (req, res) => {
    const { email, password } = req.body;
  
    const validation = signUpSchema.validate(req.body, { abortEarly: false });
  
    if (validation.error) {
      const erros = validation.error.details.map((detail) => detail.message);
      return res.status(422).send(erros);
    }
  
    try {
      const userExist = await db
        .collection("user")
        .findOne({ email });
  
      if(userExist){
        return res.status(409).send("Usuário existente");
      }
  
      const passwordHash = bcrypt.hashSync(password, 10);
  
      await db.collection('user').insertOne({ ...req.body, password: passwordHash })
  
      res.status(201).send(); 
    } catch (error) {
      res.status(500).send(error.message);
    }
};

const signIn = async (req, res) => {
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
  };

  export { signIn, signUP };