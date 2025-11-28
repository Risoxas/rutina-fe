'use client';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';

export type UserRole = 'TRAINER' | 'TRAINEE';

interface UserSwitcherProps {
  onRoleChange: (role: UserRole) => void;
  onUserChange: (userId: string) => void;
}

export function UserSwitcher({ onRoleChange, onUserChange }: UserSwitcherProps) {
  const [role, setRole] = useState<UserRole>('TRAINER');

  // Mock users for demo
  const trainers = [
    { id: 'trainer-1', name: 'John Trainer' },
  ];

  const trainees = [
    { id: 'trainee-1', name: 'Alice Trainee' },
    { id: 'trainee-2', name: 'Bob Trainee' },
  ];

  const handleRoleChange = (value: UserRole) => {
    setRole(value);
    onRoleChange(value);
    // Default to first user of that role
    if (value === 'TRAINER') {
      onUserChange(trainers[0].id);
    } else {
      onUserChange(trainees[0].id);
    }
  };

  return (
    <Card className="w-full mb-8">
      <CardHeader>
        <CardTitle>Demo User Switcher</CardTitle>
      </CardHeader>
      <CardContent className="flex gap-4 items-end">
        <div className="grid w-full max-w-sm items-center gap-1.5">
          <Label htmlFor="role">Role</Label>
          <Select onValueChange={(val) => handleRoleChange(val as UserRole)} defaultValue={role}>
            <SelectTrigger id="role">
              <SelectValue placeholder="Select role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="TRAINER">Trainer</SelectItem>
              <SelectItem value="TRAINEE">Trainee</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
}
