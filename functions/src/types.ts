import { z } from "zod";

// const wish = z.literal("wish");
// const dream = z.literal("dream");
// const fantasy = z.literal("fantasy");

export const bookingFormSchema = z.object({
  id: z.number().optional(),
  email: z.string(),
  parentFirstName: z.string(),
  parentLastName: z.string(),
  phoneNumber: z.number(),
  dateTime: z.date(),
  address: z.object({
    lineOne: z.string(),
    lineTwo: z.string(),
    city: z.string(),
    state: z.string(),
  }),
  indoors: z.boolean(),
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
