import { PrismaClient } from "@prisma/client";
import { Router } from "express";
import {
  validateRequestBody,
  validateRequestParams,
} from "zod-express-middleware";
import { activateOrDeactivateParamSchema, activityArraySchema } from "../types";
import { z } from "zod";

export const activityController = Router();
const prisma = new PrismaClient();

activityController.get("/", async (_req, res) => {
  const allActivities = await prisma.activity.findMany();
  return res.status(200).json(allActivities);
});

activityController.post(
  "/",
  validateRequestBody(activityArraySchema),
  async (req, res) => {
    try {
      const createdActivities = await prisma.activity.createMany({
        data: req.body,
      });
      return res.status(200).json({
        message: "Created activities.",
        activities: createdActivities,
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
    try {
      const deletedActivities = await prisma.activity.deleteMany({
        where: {
          name: {
            in: names,
          },
        },
      });

      return res.status(200).json({
        message: "Deleted activities.",
        count: deletedActivities.count,
      });
    } catch (error) {
      return res.status(400).json({
        message: "Error deleting activities.",
        error: error instanceof Error ? error.message : error,
      });
    }
  }
);

// Batch activate or deactivate activities
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

    const updatedActivities = await prisma.activity.updateMany({
      where: {
        name: {
          in: req.body,
        },
      },
      data: { isActive: activateOrDeactivate },
    });

    return res.status(200).json({
      message: "Updated activities.",
      characters: updatedActivities,
    });
  }
);
