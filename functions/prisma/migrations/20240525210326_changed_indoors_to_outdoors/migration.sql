-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Event" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "email" TEXT NOT NULL,
    "parentName" TEXT NOT NULL,
    "phoneNumber" TEXT NOT NULL,
    "dateTime" DATETIME NOT NULL,
    "addressId" INTEGER NOT NULL,
    "outdoors" BOOLEAN NOT NULL,
    "packageId" INTEGER NOT NULL,
    "participants" INTEGER NOT NULL,
    "minParticipantAge" INTEGER NOT NULL,
    "maxParticipantAge" INTEGER NOT NULL,
    "birthdayChildName" TEXT NOT NULL,
    "birthdayChildAge" INTEGER NOT NULL,
    "firstInteraction" BOOLEAN NOT NULL,
    "notes" TEXT,
    "couponCode" TEXT,
    "referralCode" TEXT,
    "howDidYouFindUs" TEXT,
    "statusId" INTEGER NOT NULL,
    CONSTRAINT "Event_addressId_fkey" FOREIGN KEY ("addressId") REFERENCES "Address" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Event_packageId_fkey" FOREIGN KEY ("packageId") REFERENCES "Package" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Event_statusId_fkey" FOREIGN KEY ("statusId") REFERENCES "Status" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Event" ("addressId", "birthdayChildAge", "birthdayChildName", "couponCode", "dateTime", "email", "firstInteraction", "howDidYouFindUs", "id", "maxParticipantAge", "minParticipantAge", "notes", "outdoors", "packageId", "parentName", "participants", "phoneNumber", "referralCode", "statusId") SELECT "addressId", "birthdayChildAge", "birthdayChildName", "couponCode", "dateTime", "email", "firstInteraction", "howDidYouFindUs", "id", "maxParticipantAge", "minParticipantAge", "notes", "outdoors", "packageId", "parentName", "participants", "phoneNumber", "referralCode", "statusId" FROM "Event";
DROP TABLE "Event";
ALTER TABLE "new_Event" RENAME TO "Event";
CREATE UNIQUE INDEX "Event_addressId_key" ON "Event"("addressId");
PRAGMA foreign_key_check("Event");
PRAGMA foreign_keys=ON;
