import { onRequest } from "firebase-functions/v2/https";
import express, { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import { PrismaClient } from "@prisma/client";
import cors from "cors";
import { characterController } from "./controllers/characterController";
import { bookingFormController } from "./controllers/bookingFormController";
import { activityController } from "./controllers/activityController";

const rootReturnValue = `<h1>Welcome to the Event Pro API!</h1>
<div>Checkout all of our public endpoints:</div>
<ol>
<li>
  <a href="https://bookingform-jhcx7uxfca-uc.a.run.app/activitiesForEvent">
    activitiesForEvent
  </a>
</li>
<li>
  <a href="https://bookingform-jhcx7uxfca-uc.a.run.app/activity">
    activity
  </a>
</li>
<li>
  <a href="https://bookingform-jhcx7uxfca-uc.a.run.app/address">
    address
  </a>
</li>
<li>
  <a href="https://bookingform-jhcx7uxfca-uc.a.run.app/character">
    character
  </a>
</li>
<li>
  <a href="https://bookingform-jhcx7uxfca-uc.a.run.app/charactersAtEvent">
    charactersAtEvent
  </a>
</li>
<li>
  <a href="https://bookingform-jhcx7uxfca-uc.a.run.app/event">event</a>
</li>
<li>
  <a href="https://bookingform-jhcx7uxfca-uc.a.run.app/package">
    package
  </a>
</li>
<li>
  <a href="https://bookingform-jhcx7uxfca-uc.a.run.app/status">
    status
  </a>
</li>
</ol>`;

// const allowedOrigin = "http://localhost:5173";
// const corsOptions: CorsOptions = {
//   origin: (origin, callback) => {
//     if (!origin || origin.startsWith(allowedOrigin)) {
//       callback(null, true);
//     } else {
//       callback(new Error("Not allowed by CORS"));
//     }
//   },
//   optionsSuccessStatus: 200,
// };

const prisma = new PrismaClient();
const app = express();

app.use(express.json());
app.use(cors());
app.use("/character", characterController);
app.use("/activity", activityController);
app.use("/", bookingFormController);

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

app.get("/", (_req, res) => {
  return res.send(rootReturnValue);
});

// NEEDS AUTHENTICATION
app.get("/event", async (_req, res) => {
  const allEvents = await prisma.event.findMany();
  return res.status(200).json(allEvents);
});

app.get("/activitiesForEvent", async (_req, res) => {
  const allActivitiesForEvent = await prisma.activitiesForEvent.findMany();
  return res.status(200).json(allActivitiesForEvent);
});

// NEEDS AUTHENTICATION
app.get("/address", async (_req, res) => {
  const allAddresses = await prisma.address.findMany();
  return res.status(200).json(allAddresses);
});

app.get("/charactersAtEvent", async (_req, res) => {
  const allCharactersAtEvent = await prisma.charactersAtEvent.findMany();
  return res.status(200).json(allCharactersAtEvent);
});

app.get("/package", async (_req, res) => {
  const allPackages = await prisma.package.findMany();
  return res.status(200).json(allPackages);
});

app.get("/status", async (_req, res) => {
  const allStatuses = await prisma.status.findMany();
  return res.status(200).json(allStatuses);
});

app.use(errorHandlingMiddleware);

export const bookingForm = onRequest(app);
