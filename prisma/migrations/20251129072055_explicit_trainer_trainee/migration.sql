/*
  Warnings:

  - You are about to drop the column `trainerId` on the `User` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_trainerId_fkey";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "trainerId";

-- CreateTable
CREATE TABLE "TrainerTrainee" (
    "id" TEXT NOT NULL,
    "trainerId" TEXT NOT NULL,
    "traineeId" TEXT NOT NULL,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TrainerTrainee_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkoutLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "routineId" TEXT,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WorkoutLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkoutExerciseLog" (
    "id" TEXT NOT NULL,
    "workoutLogId" TEXT NOT NULL,
    "exerciseId" TEXT NOT NULL,
    "setNumber" INTEGER NOT NULL,
    "reps" INTEGER NOT NULL,
    "weight" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "WorkoutExerciseLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "TrainerTrainee_trainerId_idx" ON "TrainerTrainee"("trainerId");

-- CreateIndex
CREATE INDEX "TrainerTrainee_traineeId_idx" ON "TrainerTrainee"("traineeId");

-- CreateIndex
CREATE UNIQUE INDEX "TrainerTrainee_trainerId_traineeId_key" ON "TrainerTrainee"("trainerId", "traineeId");

-- CreateIndex
CREATE INDEX "WorkoutExerciseLog_workoutLogId_idx" ON "WorkoutExerciseLog"("workoutLogId");

-- CreateIndex
CREATE INDEX "WorkoutExerciseLog_exerciseId_idx" ON "WorkoutExerciseLog"("exerciseId");

-- AddForeignKey
ALTER TABLE "TrainerTrainee" ADD CONSTRAINT "TrainerTrainee_trainerId_fkey" FOREIGN KEY ("trainerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrainerTrainee" ADD CONSTRAINT "TrainerTrainee_traineeId_fkey" FOREIGN KEY ("traineeId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkoutLog" ADD CONSTRAINT "WorkoutLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkoutLog" ADD CONSTRAINT "WorkoutLog_routineId_fkey" FOREIGN KEY ("routineId") REFERENCES "Routine"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkoutExerciseLog" ADD CONSTRAINT "WorkoutExerciseLog_workoutLogId_fkey" FOREIGN KEY ("workoutLogId") REFERENCES "WorkoutLog"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkoutExerciseLog" ADD CONSTRAINT "WorkoutExerciseLog_exerciseId_fkey" FOREIGN KEY ("exerciseId") REFERENCES "Exercise"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
