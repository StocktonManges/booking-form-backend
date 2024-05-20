import { onRequest } from "firebase-functions/v2/https";
import express, { Request, Response, NextFunction } from "express";
import { bookingFormSchema } from "./types";
import { ZodError } from "zod";
import { validateRequestBody } from "zod-express-middleware";
import { PrismaClient } from "@prisma/client";
import cors from "cors";

const prisma = new PrismaClient();
const app = express();

app.use(express.json());
app.use(cors());

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

app.get("/", cors(), (_req, res) => {
  return res.send("<h1>Hello world! You're awesome</h1>");
});

/* 

TODO

- Create address
- Create event
  - Reference addressId
  - Reference packageId
  - Reference statusId
- Create charactersAtEvent
- Create activitiesForEvent

*/

app.post(
  "/",
  parseDateTimeFields,
  validateRequestBody(bookingFormSchema),
  async (req, res) => {
    // Create address
    const newAddress = await Promise.resolve()
      .then(() => {
        return prisma.address.create({
          data: req.body.address,
        });
      })
      .catch(() => null);

    if (newAddress === null) {
      return res.status(400).json({ Message: "Invalid address data." });
    }

    // Find package ID
    const eventPackage = await Promise.resolve()
      .then(() =>
        prisma.package.findFirst({
          where: {
            name: req.body.packageName,
          },
        })
      )
      .catch(() => null);

    if (eventPackage === null) {
      return res.status(400).json({ message: "Invalid package name." });
    }

    const packageId = eventPackage.id;

    // Create Event
    const newEvent = await Promise.resolve()
      .then(() => {
        const {
          id,
          address,
          packageName,
          charactersAtEvent,
          activitiesForEvent,
          status,
          ...eventData
        } = req.body;
        return prisma.event.create({
          data: {
            ...eventData,
            addressId: newAddress.id,
            packageId,
            statusId: 1,
          },
        });
      })
      .catch(() => null);

    if (newEvent === null) {
      return res.status(400).json({ Message: "Invalid event data." });
    }

    // Create CharactersAtEvent

    const charactersAtEventIds = await Promise.all(
      req.body.charactersAtEvent.map(async (char) => {
        const charData = await prisma.character.findFirst({
          where: {
            name: char,
          },
        });

        if (charData === null) {
          return -1;
        }

        return charData.id;
      })
    );

    if (!charactersAtEventIds.every((charId) => charId !== -1)) {
      return res.status(400).json({ message: "Invalid character name." });
    }

    const charactersAtEventData = charactersAtEventIds.map((charId) => ({
      eventId: newEvent.id,
      characterId: charId,
    }));

    const newCharactersAtEvent = await Promise.resolve().then(() =>
      prisma.charactersAtEvent.createMany({
        data: charactersAtEventData,
      })
    );

    // Create ActivitiesForEvent

    const activitiesForEventIds = await Promise.all(
      req.body.activitiesForEvent.map(async (activity) => {
        const activityData = await prisma.activity.findFirst({
          where: {
            name: activity,
          },
        });

        if (activityData === null) {
          return -1;
        }

        return activityData.id;
      })
    );

    if (!activitiesForEventIds.every((activityId) => activityId !== -1)) {
      return res.status(400).json({ message: "Invalid activity name." });
    }

    const activitiesForEventData = activitiesForEventIds.map((activityId) => ({
      eventId: newEvent.id,
      activityId: activityId,
    }));

    const newActivitiesForEvent = await Promise.resolve().then(() =>
      prisma.activitiesForEvent.createMany({
        data: activitiesForEventData,
      })
    );

    return res.status(200).json({
      message: "Event created successfully.",
      newEvent,
      newCharactersAtEvent,
      newActivitiesForEvent,
    });
  }
);

app.use(errorHandlingMiddleware);

export const bookingForm = onRequest(app);
