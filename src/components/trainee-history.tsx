import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"

interface WorkoutLogExercise {
    exercise: { name: string };
}

interface WorkoutLog {
    id: string;
    date: string | Date;
    routine?: { name: string };
    exercises: WorkoutLogExercise[];
}

interface TraineeHistoryProps {
    workoutLogs: WorkoutLog[];
}

export function TraineeHistory({ workoutLogs }: TraineeHistoryProps) {
    return (
        <Card className="w-full border-0 shadow-none">
            <CardHeader className="px-0 pt-0">
                <CardTitle>Workout History</CardTitle>
                <CardDescription>Recent workouts logged by the trainee.</CardDescription>
            </CardHeader>
            <CardContent className="px-0">
                <ScrollArea className="h-[400px] w-full rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Date</TableHead>
                                <TableHead>Routine</TableHead>
                                <TableHead>Exercises</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {workoutLogs.map((log) => (
                                <TableRow key={log.id}>
                                    <TableCell className="font-medium">
                                        {new Date(log.date).toLocaleDateString()}
                                    </TableCell>
                                    <TableCell>
                                        {log.routine?.name || "Custom Workout"}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col gap-1">
                                            {Object.values(log.exercises.reduce((acc: Record<string, { name: string; sets: number }>, ex) => {
                                                const name = ex.exercise.name;
                                                if (!acc[name]) {
                                                    acc[name] = { name, sets: 0 };
                                                }
                                                acc[name].sets += 1;
                                                return acc;
                                            }, {})).map((group) => (
                                                <span key={group.name} className="text-xs text-muted-foreground">
                                                    {group.name}: {group.sets} sets
                                                </span>
                                            ))}
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {workoutLogs.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={3} className="text-center py-8 text-muted-foreground">
                                        No workouts logged yet.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </ScrollArea>
            </CardContent>
        </Card>
    )
}
