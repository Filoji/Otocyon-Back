import { Router, Request, Response } from "express";
import { body, matchedData, param, validationResult } from "express-validator";
import { createHmac } from "node:crypto";
import { prisma } from "./app";
import dotenv from "dotenv";
import { Prisma } from "@prisma/client";

dotenv.config()

interface UpdateRequest {
  NewPassword?: string,
  NewMail?: string,
  NewUsername?: string
}

interface UserData {
  id?: string,
  username?: string,
  mail?: string,
  password?: string
}

const isUpdateRequest = (object: any): object is UpdateRequest => {
  return ('NewPassword' in object) || ('NewMail' in object) || ('NewUsername' in object)
}

const UpdateRequestToUserData = (object: UpdateRequest): UserData => {
  return {
    username: object.NewUsername,
    mail: object.NewMail,
    password: object.NewPassword
  }
}

const sha256 = (password: string) => {
  return createHmac(
    'sha256',
    process.env.SECRET_KEY === undefined ? 'secret' : process.env.SECRET_KEY
  ).update(password).digest('hex')
}

export const userRouter = Router();

userRouter.route('/')
  .get((req: Request, res: Response) => {
    res.status(200).send({ Message: "User API" })
  })
  .post(
    body('Username').notEmpty(),
    body('Mail').notEmpty().isEmail(),
    body('Password').notEmpty(),
    async (req: Request, res: Response) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) { return res.status(400).send(errors); }
      const data = matchedData(req);
      try {
        const user = await prisma.user.create({
          data: {
            username: data.Username,
            mail: data.Mail,
            password: sha256(data.Password)
          }
        });
        res.status(201).send({ Message: "User created." })
      } catch (e) {
        if (e instanceof Prisma.PrismaClientKnownRequestError) {
          if (e.code === "P2002") { return res.status(409).send({ Message: "Username or Mail already used." }); }
        }
        res.status(500).send({ Message: "Creation impossible." });
        throw e;
      }
    }
  )
  .put(
    body('id').notEmpty(),
    body('Password').notEmpty(),
    body('Request').notEmpty(),
    async (req: Request, res: Response) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) { return res.status(400).send(errors); }
      const data = matchedData(req);
      if (!isUpdateRequest(data.Request)) { return res.status(400).send({ Message: "Bad request." }) }
      const user = await prisma.user.findUnique({ where: { id: data.id } });
      if (user === null) { return res.status(404).send("User not found."); }
      if (user.password !== sha256(data.Password)) { res.status(400).send("Cannot loggin"); }
      const Changes: UpdateRequest = {
        NewMail: data.Request.NewMail ? data.Request.NewMail : user.mail,
        NewUsername: data.Request.NewUsername ? data.Request.NewUsername : user.username,
        NewPassword: data.Request.NewPassword ? data.Request.NewPassword : user.password
      };
      try {
        const changedUser = await prisma.user.update({ where: { id: data.id }, data: UpdateRequestToUserData(Changes) });
        res.status(201).send({ Message: "User Updated." })
      } catch (e) {
        if (e instanceof Prisma.PrismaClientKnownRequestError) {
          if (e.code === "P2002") { return res.status(409).send({ Message: "Username or Mail already used." }); }
        }
        res.status(500).send({ Message: "Creation impossible." });
        throw e;
      }
    }
  )
  .delete(
    body('id').notEmpty(),
    body('Password').notEmpty(),
    async (req: Request, res: Response) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) { return res.status(400).send(errors); }
      const data = matchedData(req);
      const user = await prisma.user.findUnique({ where: { id: data.id } });
      if (user === null) { return res.status(404).send({ Message: "User not found." }); }
      if (user.password !== sha256(data.Password)) { return res.status(400).send({ Message: "Cannot loggin" }); }
      const deletedUser = await prisma.user.delete({ where: { id: data.id } });
      if (deletedUser === null) { return res.status(500).send({ Message: "User has not been deleted." }); }
      res.status(200).send({ Message: "User deleted." });
    }
  )

userRouter.route('/:Username')
  .get(
    param('Username').notEmpty(),
    async (req: Request, res: Response) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) { return res.status(400).send(errors); }
      const data = matchedData(req);
      const user = await prisma.user.findUnique({ where: { username: data.Username } });
      if (user === null) { return res.status(404).send({ Message: "User not found." }); }
      res.status(200).send(user);
    }
  )

userRouter.route('/id/:id')
  .get(
    param('id').notEmpty(),
    async (req: Request, res: Response) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) { return res.status(400).send(errors); }
      const data = matchedData(req);
      const user = await prisma.user.findUnique({ where: { id: data.id } });
      if (user === null) { return res.status(404).send({ Message: "User not found." }); }
      res.status(200).send(user);
    }
  )