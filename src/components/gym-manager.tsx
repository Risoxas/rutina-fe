'use client';

import { useState, useEffect, useCallback } from 'react';
import { TrainerDashboard } from '@/components/trainer-dashboard';
import { TraineeDashboard } from '@/components/trainee-dashboard';
import { Button } from '@/components/ui/button';
import { logout, getDashboardData, getTraineeAnalytics } from '@/app/actions';
import { LogOut } from 'lucide-react';
import { Role } from '@prisma/client';

interface GymManagerProps {
  user: {
    id: string;
    name?: string | null;
    email?: string | null;
    roles?: Role[];
  };
}

export function GymManager({ user }: GymManagerProps) {
  // Default to first role or TRAINEE
  const [role, setRole] = useState<Role>(user.roles?.[0] || Role.TRAINEE);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [dashboardResult, analyticsResult] = await Promise.all([
        getDashboardData(user.id, role),
        role === Role.TRAINEE ? getTraineeAnalytics(user.id) : Promise.resolve(null)
      ]);

      // Type guard or simple check
      const dashRes = dashboardResult as { error?: string;[key: string]: unknown };

      if (dashRes?.error) {
        setError(dashRes.error);
        setDashboardData(null);
      } else {
        let combinedData = dashRes;
        if (role === Role.TRAINEE && analyticsResult?.success) {
          combinedData = { ...combinedData, analytics: analyticsResult.analytics };
        }
        setDashboardData(combinedData);
      }
    } catch (err) {
      console.error("Failed to fetch dashboard data or analytics:", err);
      setError("Failed to load dashboard data.");
      setDashboardData(null);
    } finally {
      setLoading(false);
    }
  }, [role, user.id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 font-sans">
      <main className="max-w-6xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl mb-4 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Gym Routine Manager
            </h1>
            <p className="text-lg text-zinc-600 dark:text-zinc-400">
              Welcome back, {user.name || user.email}
            </p>
          </div>
          <Button variant="outline" onClick={() => logout()}>
            <LogOut className="mr-2 h-4 w-4" /> Sign Out
          </Button>
        </div>

        {/* Role Switcher if user has multiple roles */}
        {user.roles && user.roles.length > 1 && (
          <div className="mb-6 flex gap-2">
            {user.roles.map((r) => (
              <Button
                key={r}
                variant={role === r ? "default" : "outline"}
                onClick={() => setRole(r)}
              >
                {r} View
              </Button>
            ))}
          </div>
        )}

        {loading ? (
          <div className="text-center py-10">Loading dashboard...</div>
        ) : error ? (
          <div className="text-center py-10 text-red-500">{error}</div>
        ) : (
          <>
            {role === Role.TRAINER ? (
              <TrainerDashboard data={dashboardData} onRefresh={fetchData} userId={user.id} />
            ) : (
              <TraineeDashboard data={dashboardData} onRefresh={fetchData} analytics={dashboardData?.analytics} />
            )}
          </>
        )}
      </main>
    </div>
  );
}
