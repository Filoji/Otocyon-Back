import express, { Request, Response } from "express";
import cors from "cors"
import { PrismaClient } from '@prisma/client'
import bodyParser from "body-parser";
import { userRouter } from "./user";

export const prisma = new PrismaClient()
export const app = express();
const port = process.env.PORT || 3000;

app
  .use(cors({ origin: "*" }))
  .use(bodyParser.json())
  .use(bodyParser.urlencoded({ extended: true }))
  .use('/user', userRouter)

app
  .get('/', (req: Request, res: Response) => {
    res.send({
      "message": "Hello, world!"
    })
  });

app
  .listen(port, () => {
    console.log(`Server running on port ${port}`);
  })