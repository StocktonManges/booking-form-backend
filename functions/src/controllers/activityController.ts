import { PrismaClient } from "@prisma/client";
import { Router } from "express";
import {
  validateRequestBody,
  validateRequestParams,
} from "zod-express-middleware";
import {
  activateOrDeactivateParamSchema,
  activityArraySchema,
  activityOptionalSchema,
} from "../types";
import { z } from "zod";

export const activityController = Router();
const prisma = new PrismaClient();

const getAllActivityNames = async () => {
  return await prisma.activity
    .findMany({
      select: {
        name: true,
      },
    })
    .then((activities) => activities.map((activity) => activity.name));
};

const verifyNameIsUnique = async (newName: string) => {
  const allActivityNames = await getAllActivityNames();

  return allActivityNames.every((activityName) => activityName !== newName);
};

// Get all active activities
activityController.get("/", async (_req, res) => {
  const allActiveActivities = await prisma.activity.findMany({
    where: {
      isActive: true,
    },
  });
  return res.status(200).json(allActiveActivities);
});

// Get all activities
activityController.get("/all", async (_req, res) => {
  const allActivities = await prisma.activity.findMany();
  return res.status(200).json(allActivities);
});

activityController.post(
  "/",
  validateRequestBody(activityArraySchema),
  async (req, res) => {
    // Check if names are unique.
    const namesAreUniqueArr = await Promise.all(
      req.body.map(async (activity) => {
        const nameIsUnique = await verifyNameIsUnique(activity.name);
        if (!nameIsUnique) {
          return activity.name;
        }
        return true;
      })
    );

    const namesAreUnique = namesAreUniqueArr.every((item) => item === true);
    if (!namesAreUnique) {
      const invalidActivities = namesAreUniqueArr.filter(
        (item) => item !== true
      );
      return res.status(400).json({
        message:
          "No activities created. One or more entered names are already in use.",
        invalidActivities,
      });
    }

    // Create activities.
    const activityNoIdArr = req.body.map((activityInfo) => {
      const { id, ...activityNoId } = activityInfo;
      return activityNoId;
    });
    try {
      const createdActivities = await prisma.activity.createMany({
        data: activityNoIdArr,
      });
      const activityNames = req.body.map((activity) => activity.name);
      return res.status(200).json({
        message: "Created activities.",
        count: createdActivities.count,
        activities: activityNames,
      });
    } catch (error) {
      return res.status(400).json({
        message: "Error creating activities.",
        error: error instanceof Error ? error.message : error,
      });
    }
  }
);

activityController.delete(
  "/",
  validateRequestBody(activityArraySchema),
  async (req, res) => {
    const names = req.body.map((activity) => activity.name);

    // Verify that none of the activities have a history of being booked.
    const activityForEventIds = await prisma.activitiesForEvent
      .findMany()
      .then((activityForEvent) =>
        activityForEvent.map((item) => item.activityId)
      );

    const activitiesNeverBookedArr = req.body.map((activity) => {
      if (activityForEventIds.includes(activity.id)) {
        return activity;
      }
      return true;
    });
    const activitiesNeverBooked = activitiesNeverBookedArr.every(
      (item) => item === true
    );
    if (!activitiesNeverBooked) {
      const activitiesWithHistory = activityArraySchema.parse(
        activitiesNeverBookedArr.filter((item) => item !== true)
      );
      return res.status(400).json({
        message:
          "Unable to delete activities. One or more activities have an event history.",
        activitiesWithHistory,
      });
    }

    // Delete activities.
    try {
      const deletedActivities = await prisma.activity.deleteMany({
        where: {
          name: {
            in: names,
          },
        },
      });

      const activityNames = req.body.map((activity) => activity.name);

      return res.status(200).json({
        message: "Deleted activities.",
        count: deletedActivities.count,
        activities: activityNames,
      });
    } catch (error) {
      return res.status(400).json({
        message: "Error deleting activities.",
        error: error instanceof Error ? error.message : error,
      });
    }
  }
);

// Update a single activity.
activityController.patch(
  "/",
  validateRequestBody(activityOptionalSchema),
  async (req, res) => {
    const activityId = +req.body.id;
    const { id, ...dataNoId } = req.body;

    // Verify the new name is unique.
    if (req.body.name) {
      const nameIsUnique = await verifyNameIsUnique(req.body.name);
      if (!nameIsUnique) {
        return res.status(400).json({
          message: `Activity names must be unique. '${req.body.name}' is already used.`,
        });
      }
    }

    // Update activity.
    const updatedActivity = await prisma.activity.update({
      where: {
        id: activityId,
      },
      data: dataNoId,
    });

    return res
      .status(200)
      .json({ message: "Updated activity.", updatedActivity });
  }
);

// Batch activate or deactivate activities.
activityController.patch(
  "/:activateOrDeactivate",
  validateRequestBody(
    z.array(
      z.string({
        errorMap: () => ({ message: "Must be an array of activity names." }),
      })
    )
  ),
  validateRequestParams(activateOrDeactivateParamSchema),
  async (req, res) => {
    const activateOrDeactivate = req.params.activateOrDeactivate === "activate";

    // Validate the spelling of all names.
    const allActivityNames = await getAllActivityNames();

    const allEntriesValidArr = req.body.map((activityName) => {
      if (!allActivityNames.includes(activityName)) {
        return activityName;
      }
      return true;
    });

    if (!allEntriesValidArr.every((elm) => elm === true)) {
      const invalidEntries = allEntriesValidArr.filter(
        (elm) => typeof elm === "string"
      );
      return res.status(400).json({
        message: "No updates performed. One or more entries were invalid.",
        invalidEntries,
      });
    }

    // If all names are valid, update all activities.
    const updatedActivities = await prisma.activity.updateMany({
      where: {
        name: {
          in: req.body,
        },
      },
      data: { isActive: activateOrDeactivate },
    });

    if (updatedActivities.count === 0) {
      return res
        .status(400)
        .json({ message: "No updates performed. Invalid activity names." });
    }

    return res.status(200).json({
      message: `Successfully ${req.params.activateOrDeactivate}d activities.`,
      count: updatedActivities.count,
      activities: req.body,
    });
  }
);
