import { onRequest } from "firebase-functions/v2/https";
import express, { Request, Response, NextFunction } from "express";
import { bookingFormSchema, characterArraySchema } from "./types";
import { ZodError } from "zod";
import { validateRequestBody } from "zod-express-middleware";
import { PrismaClient } from "@prisma/client";
import cors, { CorsOptions } from "cors";

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

const allowedOrigin = "http://localhost:5173";
const corsOptions: CorsOptions = {
  origin: (origin, callback) => {
    if (!origin || origin.startsWith(allowedOrigin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  optionsSuccessStatus: 200,
};

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

app.get("/", (_req, res) => {
  return res.send(rootReturnValue);
});

// NEEDS AUTHENTICATION
app.get("/event", cors(corsOptions), async (_req, res) => {
  const allEvents = await prisma.event.findMany();
  return res.status(200).json(allEvents);
});

app.get("/activity", async (_req, res) => {
  const allActivities = await prisma.activity.findMany();
  return res.status(200).json(allActivities);
});

app.get("/activitiesForEvent", cors(corsOptions), async (_req, res) => {
  const allActivitiesForEvent = await prisma.activitiesForEvent.findMany();
  return res.status(200).json(allActivitiesForEvent);
});

// NEEDS AUTHENTICATION
app.get("/address", cors(corsOptions), async (_req, res) => {
  const allAddresses = await prisma.address.findMany();
  return res.status(200).json(allAddresses);
});

app.get("/character", async (_req, res) => {
  const allCharacters = await prisma.character.findMany();
  return res.status(200).json(allCharacters);
});

app.post(
  "/character",
  validateRequestBody(characterArraySchema),
  async (req, res) => {
    try {
      const createdCharacters = await prisma.character.createMany({
        data: req.body,
      });
      return res.status(200).json({
        message: "Created characters.",
        characters: createdCharacters,
      });
    } catch (error) {
      return res.status(400).json({
        message: "Error creating characters.",
        error: error instanceof Error ? error.message : error,
      });
    }
  }
);

app.delete(
  "/character",
  validateRequestBody(characterArraySchema),
  async (req, res) => {
    const names = req.body.map((character) => character.name);
    try {
      const deletedCharacters = await prisma.character.deleteMany({
        where: {
          name: {
            in: names,
          },
        },
      });

      return res.status(200).json({
        message: "Deleted characters.",
        count: deletedCharacters.count,
      });
    } catch (error) {
      return res.status(400).json({
        message: "Error deleting characters.",
        error: error instanceof Error ? error.message : error,
      });
    }
  }
);

app.get("/charactersAtEvent", cors(corsOptions), async (_req, res) => {
  const allCharactersAtEvent = await prisma.charactersAtEvent.findMany();
  return res.status(200).json(allCharactersAtEvent);
});

app.get("/package", async (_req, res) => {
  const allPackages = await prisma.package.findMany();
  return res.status(200).json(allPackages);
});

app.get("/status", cors(corsOptions), async (_req, res) => {
  const allStatuses = await prisma.status.findMany();
  return res.status(200).json(allStatuses);
});

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
