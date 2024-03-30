import express, { Request, Response } from "express";
import cors from "cors"
import { PrismaClient } from '@prisma/client'
import bodyParser, { json } from "body-parser";
import { emitWarning } from "process";

const prisma = new PrismaClient()
const app = express();
const port = process.env.PORT || 3000;
app
  .use(cors({
    origin: "*"
  }))

app
  .use(bodyParser.json())
  .use(bodyParser.urlencoded({ extended: true }))

app
  .get('/', (req: Request, res: Response) => {
    res.send({
      "message": "Hello, world!"
    })
  });

app
  .get('/user/id/:id', async (req: Request, res: Response) => {
    const user = await prisma.user.findFirst({ where: { id: req.params.id } })
    res.send({
      id: user?.id,
      username: user?.username,
      mail: user?.mail,
    })
  });

app
  .get('/user/name/:username', async (req: Request, res: Response) => {
    const user = await prisma.user.findFirst({ where: { username: req.params.username } })
    res.send({
      id: user?.id,
      username: user?.username,
      mail: user?.mail,
    })
  });

app
  .post('/account', (req: Request, res: Response) => {
    if (req.body.hasOwnProperty('Username')) {
      console.log(`Username: ${req.body.Username}`)
    }
    if (req.body.hasOwnProperty('Mail')) {
      console.log(`Mail: ${req.body.Mail}`)
    }
    if (req.body.hasOwnProperty('Password')) {
      console.log(`Password: ${req.body.Password}`)
    }
    res.send({ Message: 'All goods!' })
  });

app
  .listen(port, () => {
    console.log(`Server running on port ${port}`);
  })