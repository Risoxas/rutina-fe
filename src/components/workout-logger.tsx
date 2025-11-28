'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { logWorkout } from '@/app/actions';
import { Play } from 'lucide-react';

interface RoutineExercise {
  id: string;
  sets: number;
  reps: number;
  exercise: { id: string; name: string };
}

interface Routine {
  id: string;
  name: string;
  exercises: RoutineExercise[];
}

interface WorkoutLoggerProps {
  routine: Routine;
  onComplete: () => void;
}

export function WorkoutLogger({ routine, onComplete }: WorkoutLoggerProps) {
  const [open, setOpen] = useState(false);
  // State to track logs: { [exerciseId]: { [setIndex]: { weight: number, reps: number } } }
  const [logs, setLogs] = useState<Record<string, Record<number, { weight: string, reps: string }>>>({});
  const [loading, setLoading] = useState(false);

  const handleInputChange = (exerciseId: string, setIndex: number, field: 'weight' | 'reps', value: string) => {
    setLogs(prev => ({
      ...prev,
      [exerciseId]: {
        ...prev[exerciseId],
        [setIndex]: {
          ...prev[exerciseId]?.[setIndex],
          [field]: value
        }
      }
    }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    const exercisesToLog = routine.exercises.map((ex) => {
      const exLogs = logs[ex.exercise.id] || {};
      const sets = [];
      // Default to routine sets if not logged (or partial log)
      // But ideally we only log what was entered.
      // For now, let's assume we log all sets defined in routine, defaulting to 0 if not entered?
      // Or better, iterate through the target sets.

      for (let i = 0; i < (ex.sets || 3); i++) {
        const setLog = exLogs[i] || {};
        sets.push({
          setNumber: i + 1,
          reps: parseInt(setLog.reps || ex.reps?.toString() || '0'),
          weight: parseFloat(setLog.weight || '0')
        });
      }
      return {
        exerciseId: ex.exercise.id,
        sets
      };
    });

    const formData = new FormData();
    formData.append('routineId', routine.id);
    formData.append('exercises', JSON.stringify(exercisesToLog));

    const result = await logWorkout(formData);
    setLoading(false);
    if (result?.success) {
      setOpen(false);
      onComplete();
    } else {
      alert('Failed to log workout');
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="w-full mt-2">
          <Play className="mr-2 h-4 w-4" /> Start Workout
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Log Workout: {routine.name}</DialogTitle>
          <DialogDescription>Record your sets, reps, and weight.</DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {routine.exercises.map((ex) => (
            <div key={ex.id} className="border rounded-lg p-4">
              <h4 className="font-medium mb-2">{ex.exercise.name}</h4>
              <div className="grid gap-2">
                <div className="grid grid-cols-10 gap-2 text-sm font-medium text-muted-foreground mb-1">
                  <div className="col-span-1">Set</div>
                  <div className="col-span-4">Weight (kg/lbs)</div>
                  <div className="col-span-4">Reps</div>
                </div>
                {Array.from({ length: ex.sets || 3 }).map((_, i) => (
                  <div key={i} className="grid grid-cols-10 gap-2 items-center">
                    <div className="col-span-1 text-center">{i + 1}</div>
                    <div className="col-span-4">
                      <Input
                        type="number"
                        placeholder="0"
                        value={logs[ex.exercise.id]?.[i]?.weight || ''}
                        onChange={(e) => handleInputChange(ex.exercise.id, i, 'weight', e.target.value)}
                      />
                    </div>
                    <div className="col-span-4">
                      <Input
                        type="number"
                        placeholder={ex.reps?.toString() || "0"}
                        value={logs[ex.exercise.id]?.[i]?.reps || ''}
                        onChange={(e) => handleInputChange(ex.exercise.id, i, 'reps', e.target.value)}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <DialogFooter>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? 'Saving...' : 'Finish Workout'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
