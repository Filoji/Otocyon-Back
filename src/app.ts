import express, { Request, Response } from "express";
import cors from "cors"

const app = express();
const port = process.env.PORT || 3000;
app
  .use(cors({
  	origin: "*"
}))

app.get('/', (req : Request, res : Response) => {
	res.send({
		"message" : "Hello, world!"
	})
});

app.listen(port, () => {
	console.log(`Server running on port ${port}`);
})