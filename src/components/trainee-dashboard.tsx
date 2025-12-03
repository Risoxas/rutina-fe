'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Activity, Scale } from 'lucide-react';

import { addBodyComposition } from '@/app/actions';
import { WorkoutLogger } from './workout-logger';
import { AnalyticsDashboard } from './analytics-dashboard';

interface Exercise {
  id: string;
  name: string;
}

interface RoutineExercise {
  id: string;
  sets: number;
  reps: number;
  exercise: Exercise;
}

interface Routine {
  id: string;
  name: string;
  description?: string;
  exercises: RoutineExercise[];
}

interface WorkoutLog {
  id: string;
  routineId: string;
  date: string | Date;
}

interface User {
  id: string;
  bodyCompositions: { weight: number; date: string | Date }[];
  routines: Routine[];
  workoutLogs: WorkoutLog[];
}

interface TraineeDashboardProps {
  data: {
    user: User;
    routines: Routine[];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    bodyComposition: any[];
  };
  onRefresh: () => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  analytics?: any;
}

export function TraineeDashboard({ data, onRefresh, analytics }: TraineeDashboardProps) {
  if (!data || !data.user) {
    return <div className="p-4">No user data available.</div>;
  }

  const user = data.user;
  const latestBodyComp = user.bodyCompositions?.[0];
  const currentWeight = latestBodyComp?.weight || 'N/A';
  const routines = user.routines || [];

  async function handleBodyCompSubmit(formData: FormData) {
    await addBodyComposition(user.id, formData);
    if (onRefresh) {
      onRefresh();
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 sm:gap-0">
        <h2 className="text-3xl font-bold tracking-tight">My Dashboard</h2>
      </div>

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Weight</CardTitle>
            <Scale className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{currentWeight} kg</div>
            {latestBodyComp && (
              <p className="text-xs text-muted-foreground">Last logged: {new Date(latestBodyComp.date).toLocaleDateString()}</p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Assigned Routines</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{routines.length}</div>
            <p className="text-xs text-muted-foreground">Active plans</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="routines" className="space-y-4">
        <TabsList>
          <TabsTrigger value="routines">My Routines</TabsTrigger>
          <TabsTrigger value="progress">Progress</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="routines" className="space-y-4">
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {routines.map((routine) => (
              <Card key={routine.id}>
                <CardHeader>
                  <CardTitle>{routine.name}</CardTitle>
                  <CardDescription>{routine.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">{routine.exercises?.length || 0} exercises</p>
                  <div className="space-y-2">
                    {routine.exercises?.map((ex) => (
                      <div key={ex.id} className="text-sm">
                        <span className="font-medium">{ex.exercise.name}</span>: {ex.sets}x{ex.reps}
                      </div>
                    ))}
                  </div>
                  {user.workoutLogs?.some((log) =>
                    log.routineId === routine.id &&
                    new Date(log.date).toDateString() === new Date().toDateString()
                  ) ? (
                    <Button disabled className="w-full mt-2 bg-green-100 text-green-800 border-green-200 hover:bg-green-100">
                      <Activity className="mr-2 h-4 w-4" /> Completed Today
                    </Button>
                  ) : (
                    <WorkoutLogger routine={routine} onComplete={onRefresh} />
                  )}
                </CardContent>
              </Card>
            ))}
            {routines.length === 0 && (
              <p className="text-muted-foreground col-span-full text-center py-8">No routines assigned yet.</p>
            )}
          </div>
        </TabsContent>

        <TabsContent value="progress" className="space-y-4">
          {/* Existing Progress Tab Content */}
          <Card>
            <CardHeader>
              <CardTitle>Log Body Composition</CardTitle>
              <CardDescription>
                Track your weight and body measurements.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form action={handleBodyCompSubmit} className="space-y-4 max-w-sm">
                <div className="grid w-full items-center gap-1.5">
                  <Label htmlFor="weight">Weight (kg)</Label>
                  <Input type="number" id="weight" name="weight" placeholder="0.0" step="0.1" required />
                </div>
                <div className="grid w-full items-center gap-1.5">
                  <Label htmlFor="bodyFat">Body Fat (%)</Label>
                  <Input type="number" id="bodyFat" name="bodyFat" placeholder="0.0" step="0.1" />
                </div>
                <div className="grid w-full items-center gap-1.5">
                  <Label htmlFor="muscleMass">Muscle Mass (kg)</Label>
                  <Input type="number" id="muscleMass" name="muscleMass" placeholder="0.0" step="0.1" />
                </div>
                <Button type="submit">Log Entry</Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          {analytics ? (
            <AnalyticsDashboard data={analytics} />
          ) : (
            <p className="text-center py-8 text-muted-foreground">Loading analytics...</p>
          )}
        </TabsContent>
      </Tabs>
    </div >
  );
}
