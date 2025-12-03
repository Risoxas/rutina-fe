/*
  Warnings:

  - You are about to drop the column `routineId` on the `RoutineExercise` table. All the data in the column will be lost.
  - Added the required column `routineDayId` to the `RoutineExercise` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "RoutineExercise" DROP CONSTRAINT "RoutineExercise_routineId_fkey";

-- DropIndex
DROP INDEX "RoutineExercise_routineId_idx";

-- AlterTable
ALTER TABLE "Exercise" ADD COLUMN     "bodyParts" TEXT[];

-- AlterTable
ALTER TABLE "RoutineExercise" DROP COLUMN "routineId",
ADD COLUMN     "routineDayId" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "RoutineDay" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "routineId" TEXT NOT NULL,

    CONSTRAINT "RoutineDay_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "RoutineDay_routineId_idx" ON "RoutineDay"("routineId");

-- CreateIndex
CREATE INDEX "RoutineExercise_routineDayId_idx" ON "RoutineExercise"("routineDayId");

-- AddForeignKey
ALTER TABLE "RoutineDay" ADD CONSTRAINT "RoutineDay_routineId_fkey" FOREIGN KEY ("routineId") REFERENCES "Routine"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoutineExercise" ADD CONSTRAINT "RoutineExercise_routineDayId_fkey" FOREIGN KEY ("routineDayId") REFERENCES "RoutineDay"("id") ON DELETE CASCADE ON UPDATE CASCADE;
