'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface BodyCompEntry {
  date: string | Date;
  weight: number;
  bodyFat?: number | null;
  muscleMass?: number | null;
}

interface StrengthEntry {
  date: string;
  weight: number;
}

interface AnalyticsDashboardProps {
  data: {
    bodyComposition: BodyCompEntry[];
    strength: Record<string, StrengthEntry[]>;
  };
}

export function AnalyticsDashboard({ data }: AnalyticsDashboardProps) {
  const [selectedExercise, setSelectedExercise] = useState<string>(Object.keys(data.strength)[0] || '');

  const bodyCompData = useMemo(() => {
    return data.bodyComposition.map(entry => ({
      date: new Date(entry.date).toLocaleDateString(),
      weight: entry.weight,
      bodyFat: entry.bodyFat,
      muscleMass: entry.muscleMass
    }));
  }, [data.bodyComposition]);

  const strengthData = useMemo(() => {
    if (!selectedExercise || !data.strength[selectedExercise]) return [];
    return data.strength[selectedExercise].map(entry => ({
      date: new Date(entry.date).toLocaleDateString(),
      weight: entry.weight
    }));
  }, [data.strength, selectedExercise]);

  const exerciseOptions = Object.keys(data.strength);

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Body Composition</CardTitle>
          <CardDescription>Track your weight and body fat trends.</CardDescription>
        </CardHeader>
        <CardContent className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={bodyCompData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip />
              <Legend />
              <Line yAxisId="left" type="monotone" dataKey="weight" stroke="#8884d8" name="Weight (kg)" />
              <Line yAxisId="right" type="monotone" dataKey="bodyFat" stroke="#82ca9d" name="Body Fat %" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Strength Progress</CardTitle>
              <CardDescription>Max weight lifted over time.</CardDescription>
            </div>
            <Select value={selectedExercise} onValueChange={setSelectedExercise}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select Exercise" />
              </SelectTrigger>
              <SelectContent>
                {exerciseOptions.map(ex => (
                  <SelectItem key={ex} value={ex}>{ex}</SelectItem>
                ))}
                {exerciseOptions.length === 0 && <SelectItem value="none" disabled>No data</SelectItem>}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="h-[300px]">
          {strengthData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={strengthData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="weight" stroke="#ff7300" name="Max Weight" />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              No data available for this exercise.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
