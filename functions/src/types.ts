import { z } from "zod";

export const bookingFormSchema = z.object({
  id: z.number().optional(),
  email: z.string(),
  parentName: z.string(),
  phoneNumber: z.string(),
  dateTime: z.date(),
  address: z.object({
    street: z.string(),
    city: z.string(),
    state: z.string(),
  }),
  outdoors: z.boolean(),
  packageName: z.string(),
  participants: z.number(),
  minParticipantAge: z.number(),
  maxParticipantAge: z.number(),
  birthdayChildName: z.string(),
  birthdayChildAge: z.number(),
  firstInteraction: z.boolean(),
  notes: z.string(),
  couponCode: z.string(),
  referralCode: z.string(),
  howDidYouFindUs: z.string(),
  charactersAtEvent: z.array(z.string()),
  activitiesForEvent: z.array(z.string()),
  status: z.number(),
});

export const characterSchema = z.object({
  id: z.number(),
  name: z.string(),
  isActive: z.boolean(),
});

export const characterArraySchema = z.array(characterSchema);

export const activitySchema = z.object({
  id: z.number(),
  name: z.string(),
  isActive: z.boolean(),
});

export const activityArraySchema = z.array(activitySchema);

export const activateOrDeactivateParamSchema = z.object({
  activateOrDeactivate: z.union(
    [z.literal("activate"), z.literal("deactivate")],
    {
      errorMap: () => ({
        message: "The URL parameter must be 'activate' or 'deactivate'.",
      }),
    }
  ),
});
