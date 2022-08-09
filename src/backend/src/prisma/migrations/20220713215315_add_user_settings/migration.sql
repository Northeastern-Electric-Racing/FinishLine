-- CreateEnum
CREATE TYPE "Theme" AS ENUM ('LIGHT', 'DARK');

-- CreateTable
CREATE TABLE "User_Settings" (
    "id" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "defaultTheme" "Theme" NOT NULL DEFAULT E'DARK',

    PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_Settings.userId_unique" ON "User_Settings"("userId");

-- AddForeignKey
ALTER TABLE "User_Settings" ADD FOREIGN KEY ("userId") REFERENCES "User"("userId") ON DELETE CASCADE ON UPDATE CASCADE;
