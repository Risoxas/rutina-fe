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
  const [days, setDays] = useState<{ id: string; name: string; exercises: any[] }[]>([
    { id: '1', name: 'Day 1', exercises: [] }
  ]);
  const [selectedDayId, setSelectedDayId] = useState<string>('1');

  const [selectedExerciseId, setSelectedExerciseId] = useState<string>('');
  const [sets, setSets] = useState(3);
  const [reps, setReps] = useState<string>("10");
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

  const handleAddDay = () => {
    const newId = Math.random().toString(36).substr(2, 9);
    setDays([...days, { id: newId, name: `Day ${days.length + 1}`, exercises: [] }]);
    setSelectedDayId(newId);
  };

  const handleRemoveDay = (dayId: string) => {
    if (days.length <= 1) return;
    const newDays = days.filter(d => d.id !== dayId);
    setDays(newDays);
    if (selectedDayId === dayId) {
      setSelectedDayId(newDays[0].id);
    }
  };

  const handleDayNameChange = (dayId: string, newName: string) => {
    setDays(days.map(d => d.id === dayId ? { ...d, name: newName } : d));
  };

  const handleAddExerciseToDay = () => {
    if (!selectedExerciseId) return;
    const exercise = allExercises.find(e => e.id === selectedExerciseId);
    if (exercise) {
      setDays(days.map(d => {
        if (d.id === selectedDayId) {
          return { ...d, exercises: [...d.exercises, { ...exercise, sets, reps }] };
        }
        return d;
      }));
      setSelectedExerciseId(''); // Reset selection
    }
  };

  const removeExerciseFromDay = (dayId: string, exerciseIndex: number) => {
    setDays(days.map(d => {
      if (d.id === dayId) {
        const newExercises = [...d.exercises];
        newExercises.splice(exerciseIndex, 1);
        return { ...d, exercises: newExercises };
      }
      return d;
    }));
  };

  async function handleCreateRoutine(formData: FormData) {
    setError(null);
    const hasExercises = days.some(d => d.exercises.length > 0);
    if (!hasExercises) {
      setError("Please add at least one exercise to one of the days.");
      return;
    }

    // Append days as JSON
    // We need to map our internal ID structure to what the backend expects (just the array)
    const daysPayload = days.map(d => ({
      name: d.name,
      exercises: d.exercises.map(e => ({
        id: e.id,
        sets: e.sets,
        reps: e.reps
      }))
    }));

    formData.append('days', JSON.stringify(daysPayload));
    if (traineeId) {
      formData.append('traineeId', traineeId);
    }

    const result = await createRoutine(formData);
    if (result?.error) {
      setError(result.error);
    } else {
      setDays([{ id: '1', name: 'Day 1', exercises: [] }]);
      setSelectedDayId('1');
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

  const selectedDay = days.find(d => d.id === selectedDayId);

  return (
    <div className="py-4">
      <form action={handleCreateRoutine} className="space-y-4">
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="r-name" className="text-right">Name</Label>
          <Input id="r-name" name="name" className="col-span-3" required placeholder="e.g. Week 1 Routine" />
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="r-desc" className="text-right">Description</Label>
          <Input id="r-desc" name="description" className="col-span-3" placeholder="e.g. Strength focus" />
        </div>

        <div className="border-t pt-4 mt-4">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-medium">Routine Days</h4>
            <Button type="button" variant="outline" size="sm" onClick={handleAddDay}>
              <Plus className="h-4 w-4 mr-2" /> Add Day
            </Button>
          </div>

          <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
            {days.map((day) => (
              <Button
                key={day.id}
                type="button"
                variant={selectedDayId === day.id ? "default" : "outline"}
                onClick={() => setSelectedDayId(day.id)}
                className="whitespace-nowrap"
              >
                {day.name}
              </Button>
            ))}
          </div>

          {selectedDay && (
            <div className="bg-muted/30 p-4 rounded-lg border">
              <div className="flex items-center gap-4 mb-4">
                <Label className="whitespace-nowrap">Day Name:</Label>
                <Input
                  value={selectedDay.name}
                  onChange={(e) => handleDayNameChange(selectedDay.id, e.target.value)}
                  className="max-w-[200px]"
                />
                {days.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveDay(selectedDay.id)}
                    className="text-red-500 ml-auto"
                  >
                    Remove Day
                  </Button>
                )}
              </div>

              <div className="flex items-center mb-2">
                <h5 className="font-medium mr-2 text-sm">Exercises for {selectedDay.name}</h5>
                <Dialog open={newExerciseOpen} onOpenChange={setNewExerciseOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm" title="Create New Exercise">
                      New <Plus className="h-3 w-3 ml-1" />
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

              <div className="grid grid-cols-12 gap-2 justify-between items-end mb-4 bg-background p-3 rounded border">
                <div className="col-span-6">
                  <Label className="mb-1 block text-xs">Exercise</Label>
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
                  <Label className="mb-1 block text-xs">Sets</Label>
                  <Input type="number" max={20} value={sets} onChange={e => setSets(parseInt(e.target.value))} />
                </div>
                <div className="col-span-2">
                  <Label className="mb-1 block text-xs">Reps</Label>
                  <Input type="text" value={reps} onChange={e => setReps(e.target.value)} placeholder="e.g. 12-15" />
                </div>
                <div className="col-span-2">
                  <Button type="button" onClick={handleAddExerciseToDay} className="w-full">Add</Button>
                </div>
              </div>

              <div className="space-y-2">
                {selectedDay.exercises.map((ex, idx) => (
                  <div key={idx} className="flex justify-between items-center bg-background p-2 rounded border">
                    <span className="font-medium">{ex.name}</span>
                    <div className="flex items-center gap-4">
                      <span className="text-sm text-muted-foreground">{ex.sets} sets x {ex.reps} reps</span>
                      <Button variant="ghost" size="sm" onClick={() => removeExerciseFromDay(selectedDay.id, idx)} className="text-red-500 h-auto p-1">Remove</Button>
                    </div>
                  </div>
                ))}
                {selectedDay.exercises.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">No exercises added to this day yet.</p>}
              </div>
            </div>
          )}
        </div>

        {error && <div className="text-red-500 text-sm">{error}</div>}

        <div className="flex justify-end">
          <Button type="submit">Save Routine</Button>
        </div>
      </form>
    </div>
  );
}
