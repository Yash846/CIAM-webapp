import express from 'express';
import bodyparser from 'body-parser'
import './db.js'
import cors from "cors";
import { router } from "./routes/user.js";

const corsOptions ={
   origin:'*', 
   credentials:true,            //access-control-allow-credentials:true
   optionSuccessStatus:200,
}

const app = express();

app.use(bodyparser.urlencoded({ extended: true }));
app.use(cors(corsOptions)) 

app.use(bodyparser.json());

const PORT = 5000;
 
app.listen(PORT, () => {
    console.log(`Running on PORT ${PORT}`);
})

app.use('/user', router)


