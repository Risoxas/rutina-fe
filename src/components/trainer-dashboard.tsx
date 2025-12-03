'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Users, Dumbbell } from 'lucide-react';

import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { createTrainee, addExercise, updateExercise, getAllTrainers, addTrainerToTrainee, getUnassignedTrainees, addSelfAsTrainee } from '@/app/actions';
import { RoutineBuilder } from './routine-builder';
import { TraineeHistory } from './trainee-history';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Pencil, Check } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { cn } from '@/lib/utils';

interface TrainerDashboardProps {
  data: {
    totalTrainees: number;
    activeRoutines: number;
    traineeId?: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    trainees: any[];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    exercises?: any[];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    routines?: any[];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    workoutLogs?: any[];
  };
  onRefresh: () => void;
  userId: string;
  isAlreadyTrainee?: boolean;
}

const BODY_PARTS = [
  "Chest", "Back", "Legs", "Shoulders", "Arms", "Core", "Cardio", "Full Body"
];

export function TrainerDashboard({ data, onRefresh, userId, isAlreadyTrainee }: TrainerDashboardProps) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [manageTrainersOpen, setManageTrainersOpen] = useState(false);
  const [selectedTraineeId, setSelectedTraineeId] = useState<string | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [availableTrainers, setAvailableTrainers] = useState<any[]>([]);

  const [selectedTrainerId, setSelectedTrainerId] = useState<string>('');
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [unassignedTrainees, setUnassignedTrainees] = useState<any[]>([]);

  // Exercise Management State
  const [editExerciseOpen, setEditExerciseOpen] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [editingExercise, setEditingExercise] = useState<any>(null);
  const [filterBodyPart, setFilterBodyPart] = useState<string>("All");

  // Multi-select state
  const [selectedBodyParts, setSelectedBodyParts] = useState<string[]>([]);

  async function handleFetchUnassigned() {
    const trainees = await getUnassignedTrainees();
    setUnassignedTrainees(trainees);
  }

  async function handleClaimTrainee(traineeId: string) {
    console.log('[TrainerDashboard] Claiming trainee:', traineeId, 'for user:', userId);
    if (!userId) {
      console.error('[TrainerDashboard] No userId available!');
      return;
    }
    const result = await addTrainerToTrainee(traineeId, userId);
    if (result?.error) {
      // Handle error (maybe show toast)
      console.error(result.error);
    } else {
      // Refresh list and dashboard
      await handleFetchUnassigned();
      onRefresh();
    }
  }

  async function handleManageTrainers(traineeId: string) {
    setSelectedTraineeId(traineeId);
    const trainers = await getAllTrainers(userId);
    setAvailableTrainers(trainers);
    setManageTrainersOpen(true);
  }

  async function handleAddTrainer() {
    if (!selectedTraineeId || !selectedTrainerId) return;

    const result = await addTrainerToTrainee(selectedTraineeId, selectedTrainerId);
    if (result?.error) {
      setError(result.error);
    } else {
      setManageTrainersOpen(false);
      setSelectedTrainerId('');
      // Optional: show success message
    }
  }

  async function handleSubmit(formData: FormData) {
    setError(null);
    const result = await createTrainee(formData);
    if (result?.error) {
      setError(result.error);
    } else {
      setOpen(false);
      onRefresh();
    }
  }

  async function handleExerciseSubmit(formData: FormData) {
    setError(null);
    formData.append('bodyParts', JSON.stringify(selectedBodyParts));
    const result = await addExercise(formData);
    if (result?.error) {
      setError(result.error);
    } else {
      setOpen(false);
      setSelectedBodyParts([]);
      onRefresh();
    }
  }

  async function handleUpdateExercise(formData: FormData) {
    setError(null);
    formData.append('bodyParts', JSON.stringify(selectedBodyParts));
    const result = await updateExercise(formData);
    if (result?.error) {
      setError(result.error);
    } else {
      setEditExerciseOpen(false);
      setEditingExercise(null);
      setSelectedBodyParts([]);
      onRefresh();
    }
  }

  async function handleAddSelf() {
    const result = await addSelfAsTrainee(userId);
    if (result?.error) {
      // Handle error (maybe show toast)
      console.error(result.error);
    } else {
      onRefresh();
    }
  }

  const filteredExercises = data.exercises?.filter(ex =>
    filterBodyPart === "All" || (ex.bodyParts && ex.bodyParts.includes(filterBodyPart))
  ) || [];

  const toggleBodyPart = (part: string) => {
    setSelectedBodyParts(prev =>
      prev.includes(part) ? prev.filter(p => p !== part) : [...prev, part]
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0">
        <h2 className="text-3xl font-bold tracking-tight">Trainer Dashboard</h2>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Add Trainee
            </Button>
          </DialogTrigger>
          {!isAlreadyTrainee && (
            <Button variant="outline" className="ml-2" onClick={handleAddSelf}>
              Add Myself as Trainee
            </Button>
          )}
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Add New Trainee</DialogTitle>
              <DialogDescription>
                Create an account for your new trainee. They will be linked to you.
              </DialogDescription>
            </DialogHeader>
            <form action={handleSubmit} className="grid gap-4 py-4">
              <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-2 sm:gap-4">
                <Label htmlFor="name" className="text-left sm:text-right">
                  Name
                </Label>
                <Input id="name" name="name" className="col-span-1 sm:col-span-3" required />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-2 sm:gap-4">
                <Label htmlFor="email" className="text-left sm:text-right">
                  Email
                </Label>
                <Input id="email" name="email" type="email" className="col-span-1 sm:col-span-3" required />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-2 sm:gap-4">
                <Label htmlFor="password" className="text-left sm:text-right">
                  Password
                </Label>
                <Input id="password" name="password" type="password" className="col-span-1 sm:col-span-3" required />
              </div>
              {error && <div className="text-red-500 text-sm col-span-4 text-center">{error}</div>}
              <DialogFooter>
                <Button type="submit">Create Account</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>


        <Dialog open={manageTrainersOpen} onOpenChange={setManageTrainersOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Manage Trainers</DialogTitle>
              <DialogDescription>
                Add another trainer to this trainee.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-2 sm:gap-4">
                <Label htmlFor="trainer-select" className="text-left sm:text-right">
                  Trainer
                </Label>
                <select
                  id="trainer-select"
                  className="col-span-1 sm:col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={selectedTrainerId}
                  onChange={(e) => setSelectedTrainerId(e.target.value)}
                >
                  <option value="">Select a trainer...</option>
                  {availableTrainers.map((t) => (
                    <option key={t.id} value={t.id}>{t.name || t.email}</option>
                  ))}
                </select>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleAddTrainer} disabled={!selectedTrainerId}>Add Trainer</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Trainees</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.totalTrainees}</div>
            <p className="text-xs text-muted-foreground">Active students</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Routines</CardTitle>
            <Dumbbell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.activeRoutines}</div>
            <p className="text-xs text-muted-foreground">Across all trainees</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="trainees" className="space-y-4">
        <TabsList>
          <TabsTrigger value="trainees">Trainees</TabsTrigger>

          <TabsTrigger value="unassigned" onClick={handleFetchUnassigned}>New Signups</TabsTrigger>
          <TabsTrigger value="exercises">Exercise Library</TabsTrigger>
        </TabsList>
        <TabsContent value="trainees" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Trainees</CardTitle>
              <CardDescription>
                Manage your trainees and their assigned routines.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Joined</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data?.trainees && data.trainees.map((trainee) => (
                      <TableRow key={trainee.id}>
                        <TableCell className="font-medium">{trainee.name || 'N/A'}</TableCell>
                        <TableCell>{trainee.email}</TableCell>
                        <TableCell>{new Date(trainee.createdAt).toLocaleDateString()}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex flex-col sm:flex-row justify-end gap-2">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button variant="outline" size="sm">Add Routine</Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                                <DialogHeader>
                                  <DialogTitle>Assign Routine to {trainee.name}</DialogTitle>
                                  <DialogDescription>Create a new routine for this trainee.</DialogDescription>
                                </DialogHeader>
                                <RoutineBuilder
                                  exercises={data.exercises || []}
                                  onRefresh={onRefresh}
                                  traineeId={trainee.id}
                                />
                              </DialogContent>
                            </Dialog>
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button variant="outline" size="sm">History</Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                                <DialogHeader>
                                  <DialogTitle>Workout History - {trainee.name}</DialogTitle>
                                  <DialogDescription>View past workouts for this trainee.</DialogDescription>
                                </DialogHeader>
                                <TraineeHistory workoutLogs={trainee.workoutLogs || []} />
                              </DialogContent>
                            </Dialog>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleManageTrainers(trainee.id)}
                            >
                              Manage Trainers
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                    {data.trainees?.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center">No trainees found.</TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="unassigned" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>New Signups</CardTitle>
              <CardDescription>
                Trainees who have signed up but are not assigned to any trainer.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Joined</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {unassignedTrainees.map((trainee) => (
                      <TableRow key={trainee.id}>
                        <TableCell className="font-medium">{trainee.name || 'N/A'}</TableCell>
                        <TableCell>{trainee.email}</TableCell>
                        <TableCell>{new Date(trainee.createdAt).toLocaleDateString()}</TableCell>
                        <TableCell className="text-right">
                          <Button
                            size="sm"
                            onClick={() => handleClaimTrainee(trainee.id)}
                          >
                            Claim Trainee
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                    {unassignedTrainees.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center">No unassigned trainees found.</TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="exercises" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Exercise Library</CardTitle>
              <CardDescription>
                Manage your collection of exercises.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-medium">All Exercises</h3>
                  <Select value={filterBodyPart} onValueChange={setFilterBodyPart}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Filter by Body Part" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="All">All Body Parts</SelectItem>
                      {BODY_PARTS.map(part => (
                        <SelectItem key={part} value={part}>{part}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" onClick={() => setSelectedBodyParts([])}>
                      <Plus className="mr-2 h-4 w-4" /> Add Exercise
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add New Exercise</DialogTitle>
                      <DialogDescription>
                        Add a new movement to the library.
                      </DialogDescription>
                    </DialogHeader>
                    <form action={handleExerciseSubmit} className="grid gap-4 py-4">
                      <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-2 sm:gap-4">
                        <Label htmlFor="ex-name" className="text-left sm:text-right">
                          Name
                        </Label>
                        <Input id="ex-name" name="name" className="col-span-1 sm:col-span-3" required />
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-2 sm:gap-4">
                        <Label htmlFor="ex-desc" className="text-left sm:text-right">
                          Description
                        </Label>
                        <Input id="ex-desc" name="description" className="col-span-1 sm:col-span-3" />
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-2 sm:gap-4">
                        <Label className="text-left sm:text-right">
                          Body Parts
                        </Label>
                        <div className="col-span-1 sm:col-span-3">
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button variant="outline" className="w-full justify-between">
                                {selectedBodyParts.length > 0 ? `${selectedBodyParts.length} selected` : "Select body parts"}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-[200px] p-0">
                              <Command>
                                <CommandInput placeholder="Search body part..." />
                                <CommandList>
                                  <CommandEmpty>No body part found.</CommandEmpty>
                                  <CommandGroup>
                                    {BODY_PARTS.map((part) => (
                                      <CommandItem
                                        key={part}
                                        value={part}
                                        onSelect={() => toggleBodyPart(part)}
                                      >
                                        <Check
                                          className={cn(
                                            "mr-2 h-4 w-4",
                                            selectedBodyParts.includes(part) ? "opacity-100" : "opacity-0"
                                          )}
                                        />
                                        {part}
                                      </CommandItem>
                                    ))}
                                  </CommandGroup>
                                </CommandList>
                              </Command>
                            </PopoverContent>
                          </Popover>
                          <div className="flex flex-wrap gap-1 mt-2">
                            {selectedBodyParts.map(part => (
                              <Badge key={part} variant="secondary" className="text-xs">
                                {part}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-2 sm:gap-4">
                        <Label htmlFor="ex-video" className="text-left sm:text-right">
                          Video URL
                        </Label>
                        <Input id="ex-video" name="videoUrl" className="col-span-1 sm:col-span-3" placeholder="https://..." />
                      </div>
                      <DialogFooter>
                        <Button type="submit">Add Exercise</Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>

              {/* Edit Dialog */}
              <Dialog open={editExerciseOpen} onOpenChange={setEditExerciseOpen}>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Edit Exercise</DialogTitle>
                    <DialogDescription>
                      Update exercise details.
                    </DialogDescription>
                  </DialogHeader>
                  {editingExercise && (
                    <form action={handleUpdateExercise} className="grid gap-4 py-4">
                      <input type="hidden" name="id" value={editingExercise.id} />
                      <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-2 sm:gap-4">
                        <Label htmlFor="edit-name" className="text-left sm:text-right">
                          Name
                        </Label>
                        <Input id="edit-name" name="name" defaultValue={editingExercise.name} className="col-span-1 sm:col-span-3" required />
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-2 sm:gap-4">
                        <Label htmlFor="edit-desc" className="text-left sm:text-right">
                          Description
                        </Label>
                        <Input id="edit-desc" name="description" defaultValue={editingExercise.description || ''} className="col-span-1 sm:col-span-3" />
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-2 sm:gap-4">
                        <Label className="text-left sm:text-right">
                          Body Parts
                        </Label>
                        <div className="col-span-1 sm:col-span-3">
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button variant="outline" className="w-full justify-between">
                                {selectedBodyParts.length > 0 ? `${selectedBodyParts.length} selected` : "Select body parts"}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-[200px] p-0">
                              <Command>
                                <CommandInput placeholder="Search body part..." />
                                <CommandList>
                                  <CommandEmpty>No body part found.</CommandEmpty>
                                  <CommandGroup>
                                    {BODY_PARTS.map((part) => (
                                      <CommandItem
                                        key={part}
                                        value={part}
                                        onSelect={() => toggleBodyPart(part)}
                                      >
                                        <Check
                                          className={cn(
                                            "mr-2 h-4 w-4",
                                            selectedBodyParts.includes(part) ? "opacity-100" : "opacity-0"
                                          )}
                                        />
                                        {part}
                                      </CommandItem>
                                    ))}
                                  </CommandGroup>
                                </CommandList>
                              </Command>
                            </PopoverContent>
                          </Popover>
                          <div className="flex flex-wrap gap-1 mt-2">
                            {selectedBodyParts.map(part => (
                              <Badge key={part} variant="secondary" className="text-xs">
                                {part}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-2 sm:gap-4">
                        <Label htmlFor="edit-video" className="text-left sm:text-right">
                          Video URL
                        </Label>
                        <Input id="edit-video" name="videoUrl" defaultValue={editingExercise.videoUrl || ''} className="col-span-1 sm:col-span-3" placeholder="https://..." />
                      </div>
                      <DialogFooter>
                        <Button type="submit">Save Changes</Button>
                      </DialogFooter>
                    </form>
                  )}
                </DialogContent>
              </Dialog>

              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredExercises.map((exercise) => (
                  <Card key={exercise.id} className="relative group">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <CardTitle className="pr-8">{exercise.name}</CardTitle>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => {
                            setEditingExercise(exercise);
                            setSelectedBodyParts(exercise.bodyParts || []);
                            setEditExerciseOpen(true);
                          }}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {exercise.bodyParts && exercise.bodyParts.map((part: string) => (
                          <Badge key={part} variant="secondary" className="text-xs">
                            {part}
                          </Badge>
                        ))}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-2">{exercise.description || 'No description'}</p>
                      {exercise.videoUrl && (
                        <a href={exercise.videoUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-500 hover:underline">
                          Watch Video
                        </a>
                      )}
                    </CardContent>
                  </Card>
                ))}
                {filteredExercises.length === 0 && (
                  <p className="text-sm text-muted-foreground col-span-full text-center py-8">
                    No exercises found.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

      </Tabs>
    </div >
  );
}

