import { Router, Request, Response } from "express";
import { body, matchedData, param, validationResult } from "express-validator";
import { createHmac } from "node:crypto";
import { prisma } from "./app";
import dotenv from "dotenv";

dotenv.config()

const sha256 = (password: string) => {
  return createHmac(
    'sha256',
    process.env.SECRET_KEY === undefined ? 'secret' : process.env.SECRET_KEY
  ).update(password).digest('hex')
}

export const userRouter = Router();

userRouter.route('/')
  .get((req: Request, res: Response) => {
    res.send({
      Message: "User API"
    })
  })
  .post(
    body('Username').notEmpty(),
    body('Mail').notEmpty().isEmail(),
    body('Password').notEmpty(),
    async (req: Request, res: Response) => {
      const errors = validationResult(req);
      if (errors.isEmpty()) {
        const data = matchedData(req);
        console.log(`Username: ${data.Username}\nMail: ${data.Mail}\nPassword: ${sha256(data.Password)}\n`);
        const user = await prisma.user.create({
          data: {
            username: data.Username,
            mail: data.Mail,
            password: sha256(data.Password)
          }
        })
        if (user) {
          return res.send({ Message: `All goods, user ${user.id}!` })
        }
        return res.send({ Message: `Creation impossible.` })
      }
      res.send(errors)
    }
  )
  .delete(
    body('id').notEmpty(),
    body('Password').notEmpty(),
    async (req: Request, res: Response) => {
      const errors = validationResult(req);
      if (errors.isEmpty()) {
        const data = matchedData(req);
        const user = await prisma.user.findUnique({ where: { id: data.id } });
        if (user !== null) {
          if (user.password === sha256(data.Password)) {
            const deletedUser = await prisma.user.delete({ where: { id: user.id } });
            return res.send({ Message: "User Deleted!" });
          }
        }
        return res.send('User not found');
      }
      res.send(errors);
    }
  )

userRouter.route('/:Username')
  .get(
    param('Username').notEmpty(),
    async (req: Request, res: Response) => {
      const errors = validationResult(req);
      if (errors.isEmpty()) {
        const data = matchedData(req);
        const user = await prisma.user.findUnique({
          where: { username: data.Username }
        });
        if (user !== null) {
          return res.send(user);
        }
        return res.send({ Message: `No user named ${data.Username}.` });
      }
      res.send(errors);
    }
  )