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
import { createTrainee, addExercise } from '@/app/actions';
import { RoutineBuilder } from './routine-builder';
import { TraineeHistory } from './trainee-history';

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
}

export function TrainerDashboard({ data, onRefresh }: TrainerDashboardProps) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
    const result = await addExercise(formData);
    if (result?.error) {
      setError(result.error);
    } else {
      // Ideally use separate state, but for now just close
      setOpen(false);
      onRefresh();
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold tracking-tight">Trainer Dashboard</h2>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Add Trainee
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Add New Trainee</DialogTitle>
              <DialogDescription>
                Create an account for your new trainee. They will be linked to you.
              </DialogDescription>
            </DialogHeader>
            <form action={handleSubmit} className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Name
                </Label>
                <Input id="name" name="name" className="col-span-3" required />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="email" className="text-right">
                  Email
                </Label>
                <Input id="email" name="email" type="email" className="col-span-3" required />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="password" className="text-right">
                  Password
                </Label>
                <Input id="password" name="password" type="password" className="col-span-3" required />
              </div>
              {error && <div className="text-red-500 text-sm col-span-4 text-center">{error}</div>}
              <DialogFooter>
                <Button type="submit">Create Account</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
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
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm">Add Routine</Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-4xl">
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
                            <Button variant="outline" size="sm" className="ml-2">History</Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-3xl">
                            <DialogHeader>
                              <DialogTitle>Workout History - {trainee.name}</DialogTitle>
                              <DialogDescription>View past workouts for this trainee.</DialogDescription>
                            </DialogHeader>
                            <TraineeHistory workoutLogs={trainee.workoutLogs || []} />
                          </DialogContent>
                        </Dialog>
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
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium">All Exercises</h3>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline">
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
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="ex-name" className="text-right">
                          Name
                        </Label>
                        <Input id="ex-name" name="name" className="col-span-3" required />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="ex-desc" className="text-right">
                          Description
                        </Label>
                        <Input id="ex-desc" name="description" className="col-span-3" />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="ex-video" className="text-right">
                          Video URL
                        </Label>
                        <Input id="ex-video" name="videoUrl" className="col-span-3" placeholder="https://..." />
                      </div>
                      <DialogFooter>
                        <Button type="submit">Add Exercise</Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>

              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {data.exercises?.map((exercise) => (
                  <Card key={exercise.id}>
                    <CardHeader>
                      <CardTitle>{exercise.name}</CardTitle>
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
                {(!data.exercises || data.exercises.length === 0) && (
                  <p className="text-sm text-muted-foreground col-span-full text-center py-8">
                    No exercises found. Click &quot;Add Exercise&quot; to create one.
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

