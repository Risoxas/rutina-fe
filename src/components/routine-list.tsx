'use client';

import { Trash2, Dumbbell, Calendar } from 'lucide-react';

// Define types locally for now since we don't have generated types yet
type Routine = {
  id: string;
  name: string;
  description: string | null;
  createdAt: Date;
  exercises: unknown[];
};

export function RoutineList({
  routines,
  deleteRoutine,
}: {
  routines: Routine[];
  deleteRoutine: (id: string) => Promise<void>;
}) {
  if (routines.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-zinc-300 bg-zinc-50 p-12 text-center dark:border-zinc-800 dark:bg-zinc-900/50">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800 mb-4">
          <Dumbbell className="h-6 w-6 text-zinc-400" />
        </div>
        <h3 className="text-lg font-medium text-zinc-900 dark:text-zinc-50">
          No routines yet
        </h3>
        <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400 max-w-sm">
          Create your first routine to get started tracking your workouts.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-1 lg:grid-cols-2 xl:grid-cols-2">
      {routines.map((routine) => (
        <div
          key={routine.id}
          className="group relative flex flex-col justify-between rounded-xl border border-zinc-200 bg-white p-6 shadow-sm transition-all hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900"
        >
          <div>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                  <Dumbbell className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-zinc-900 dark:text-zinc-50">
                    {routine.name}
                  </h3>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 flex items-center gap-1 mt-0.5">
                    <Calendar className="h-3 w-3" />
                    {new Date(routine.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>

            {routine.description && (
              <p className="mt-4 text-sm text-zinc-600 dark:text-zinc-400 line-clamp-2">
                {routine.description}
              </p>
            )}

            <div className="mt-4 flex items-center gap-2 text-xs font-medium text-zinc-500 dark:text-zinc-400">
              <span className="bg-zinc-100 dark:bg-zinc-800 px-2 py-1 rounded-md">
                {routine.exercises.length} Exercises
              </span>
            </div>
          </div>

          <div className="mt-6 flex items-center justify-end gap-2 border-t border-zinc-100 dark:border-zinc-800 pt-4">
            <button
              onClick={() => deleteRoutine(routine.id)}
              className="flex items-center justify-center rounded-lg p-2 text-zinc-400 transition-colors hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20 dark:hover:text-red-400"
              title="Delete routine"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
