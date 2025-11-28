'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createRoutine, addExercise } from '@/app/actions';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';

interface RoutineBuilderProps {
  exercises: { id: string; name: string }[];
  onRefresh: () => void;
  traineeId?: string;
}

export function RoutineBuilder({ exercises, onRefresh, traineeId }: RoutineBuilderProps) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [routineExercises, setRoutineExercises] = useState<any[]>([]);
  const [selectedExerciseId, setSelectedExerciseId] = useState<string>('');
  const [sets, setSets] = useState(3);
  const [reps, setReps] = useState(10);
  const [error, setError] = useState<string | null>(null);

  // State for nested "Add Exercise" dialog
  const [newExerciseOpen, setNewExerciseOpen] = useState(false);

  // Local state for newly added exercises to avoid full refresh
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [localExercises, setLocalExercises] = useState<any[]>([]);

  // Tooltip control state
  const [isSelectOpen, setIsSelectOpen] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const tooltipTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (tooltipTimeoutRef.current) {
        clearTimeout(tooltipTimeoutRef.current);
      }
    };
  }, []);

  // Combine prop exercises with locally added ones
  const allExercises = [...exercises, ...localExercises];

  const handleAddExerciseToRoutine = () => {
    if (!selectedExerciseId) return;
    const exercise = allExercises.find(e => e.id === selectedExerciseId);
    if (exercise) {
      setRoutineExercises([...routineExercises, { ...exercise, sets, reps }]);
      setSelectedExerciseId(''); // Reset selection
    }
  };

  const removeExerciseFromRoutine = (index: number) => {
    const newExercises = [...routineExercises];
    newExercises.splice(index, 1);
    setRoutineExercises(newExercises);
  };

  async function handleCreateRoutine(formData: FormData) {
    setError(null);
    if (routineExercises.length === 0) {
      setError("Please add at least one exercise.");
      return;
    }

    // Append exercises as JSON
    formData.append('exercises', JSON.stringify(routineExercises));
    if (traineeId) {
      formData.append('traineeId', traineeId);
    }

    const result = await createRoutine(formData);
    if (result?.error) {
      setError(result.error);
    } else {
      setRoutineExercises([]);
      onRefresh();
    }
  }

  async function handleQuickAddExercise(formData: FormData) {
    const result = await addExercise(formData);
    if (result?.success && result.exercise) {
      setNewExerciseOpen(false);
      // Add to local state instead of refreshing parent
      setLocalExercises(prev => [...prev, result.exercise]);
      setSelectedExerciseId(result.exercise.id);
    }
  }

  return (
    <div className="py-4">
      <form action={handleCreateRoutine} className="space-y-4">
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="r-name" className="text-right">Name</Label>
          <Input id="r-name" name="name" className="col-span-3" required />
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="r-desc" className="text-right">Description</Label>
          <Input id="r-desc" name="description" className="col-span-3" />
        </div>

        <div className="border-t pt-4 mt-4">
          <div className="flex items-center mb-2">
            <h4 className="font-medium mr-2">Exercises</h4>
            <Dialog open={newExerciseOpen} onOpenChange={setNewExerciseOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" title="Create New Exercise">
                  New
                  <Plus className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>New Exercise</DialogTitle>
                </DialogHeader>
                <form action={handleQuickAddExercise} className="grid gap-4 py-4">
                  <Input name="name" placeholder="Exercise Name" required />
                  <Input name="description" placeholder="Description" />
                  <Input name="videoUrl" placeholder="Video URL" />
                  <Button type="submit">Create</Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
          <div className="grid grid-cols-12 gap-2 justify-between items-end mb-4">
            <div className="col-span-6">
              <Label className="mb-1 block">Exercise</Label>
              <Select
                value={selectedExerciseId}
                onValueChange={setSelectedExerciseId}
                onOpenChange={setIsSelectOpen}
              >
                <TooltipProvider>
                  <Tooltip open={showTooltip && !isSelectOpen}>
                    <TooltipTrigger asChild>
                      <SelectTrigger
                        className="w-full overflow-hidden"
                        onMouseEnter={() => {
                          tooltipTimeoutRef.current = setTimeout(() => {
                            setShowTooltip(true);
                          }, 1000);
                        }}
                        onMouseLeave={() => {
                          if (tooltipTimeoutRef.current) {
                            clearTimeout(tooltipTimeoutRef.current);
                          }
                          setShowTooltip(false);
                        }}
                      >
                        <SelectValue placeholder="Select exercise..." />
                      </SelectTrigger>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{allExercises.find(e => e.id === selectedExerciseId)?.name || "Select exercise..."}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <SelectContent>
                  {allExercises.map(ex => (
                    <SelectItem key={ex.id} value={ex.id}>{ex.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>


            <div className="col-span-2">
              <Label className="mb-1 block">Sets</Label>
              <Input type="number" max={20} value={sets} onChange={e => setSets(parseInt(e.target.value))} />
            </div>
            <div className="col-span-2">
              <Label className="mb-1 block">Reps</Label>
              <Input type="number" max={20} value={reps} onChange={e => setReps(parseInt(e.target.value))} />
            </div>
            <div className="col-span-1">
              <Button type="button" onClick={handleAddExerciseToRoutine} className="w-full">Add</Button>
            </div>
          </div>

          <div className="space-y-2">
            {routineExercises.map((ex, idx) => (
              <div key={idx} className="flex justify-between items-center bg-secondary p-2 rounded">
                <span>{ex.name}</span>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-muted-foreground">{ex.sets} sets x {ex.reps} reps</span>
                  <Button variant="ghost" size="sm" onClick={() => removeExerciseFromRoutine(idx)} className="text-red-500 h-auto p-1">Remove</Button>
                </div>
              </div>
            ))}
            {routineExercises.length === 0 && <p className="text-sm text-muted-foreground text-center">No exercises added yet.</p>}
          </div>
        </div>

        {error && <div className="text-red-500 text-sm">{error}</div>}

        <div className="flex justify-end">
          <Button type="submit">Save Routine</Button>
        </div>
      </form>
    </div>
  );
}
