import { onRequest } from "firebase-functions/v2/https";
import express, { Request, Response, NextFunction } from "express";
import { bookingFormSchema } from "./types";
import { ZodError } from "zod";
import { validateRequestBody } from "zod-express-middleware";

const app = express();

app.use(express.json());

const errorHandlingMiddleware = (
  err: Error,
  _req: Request,
  res: Response,
  next: NextFunction
) => {
  if (err instanceof ZodError) {
    res.status(400).json({ message: "A zod error occurred.", err });
    return next();
  }
  if (err) {
    res.status(500).json("Sorry something broke");
  }
  next();
};

const parseDateTimeFields = (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  if (req.body.dateTime) {
    req.body.dateTime = new Date(req.body.dateTime);
  }
  next();
};

app.get("/", (_req, res) => {
  return res.send("<h1>Hello world! You're awesome</h1>");
});

app.post(
  "/",
  parseDateTimeFields,
  validateRequestBody(bookingFormSchema),
  (req, res) => {
    return res.status(200).json({ eventData: req.body });
  }
);

app.use(errorHandlingMiddleware);

exports.bookingForm = onRequest(app);
