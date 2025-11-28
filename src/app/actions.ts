'use server';

import { prisma } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { Role } from '../generated/client/enums'; // Import Role enum
import { signIn, signOut, auth } from '@/auth';
import { AuthError } from 'next-auth';
import bcrypt from 'bcryptjs';

export async function authenticate(
  prevState: string | undefined,
  formData: FormData,
) {
  try {
    await signIn('credentials', formData);
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case 'CredentialsSignin':
          return 'Invalid credentials.';
        default:
          return 'Something went wrong.';
      }
    }
    throw error;
  }
}

export async function registerUser(formData: FormData) {
  const enableRegistration = process.env.NEXT_PUBLIC_ENABLE_REGISTRATION === 'true';
  if (!enableRegistration) {
    return { error: 'Registration is currently disabled.' };
  }

  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const name = formData.get('name') as string;
  const role = formData.get('role') as Role || Role.TRAINEE;

  if (!email || !password) {
    return { error: 'Email and password are required' };
  }

  const allowedEmails = process.env.ALLOWED_EMAILS?.split(',') || [];
  if (allowedEmails.length > 0 && !allowedEmails.includes(email)) {
    return { error: 'This email is not authorized to register.' };
  }

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    return { error: 'User already exists' };
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      name,
      roles: [role],
    },
  });
  
  // Automatically sign in after registration? 
  // For now, just return success and let user login.
  return { success: true };
}

export async function logout() {
  await signOut();
}

export async function getRoutines() {
  return await prisma.routine.findMany({
    include: {
      exercises: {
        include: {
          exercise: true,
        },
        orderBy: {
          order: 'asc',
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
}

export async function createRoutine(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: 'Unauthorized' };
  }

  const name = formData.get('name') as string;
  const description = formData.get('description') as string;
  const exercisesJson = formData.get('exercises') as string;
  const traineeId = formData.get('traineeId') as string;

  if (!name) {
    return { error: 'Name is required' };
  }

  // If traineeId is provided, use it as userId (assign to trainee)
  // Otherwise default to session user (trainer's template) - though user wants strict assignment now
  const targetUserId = traineeId || session.user.id;
  
  interface ExerciseInput {
    id: string;
    sets?: string;
    reps?: string;
  }
  
  let exercises: ExerciseInput[] = [];
  try {
    if (exercisesJson) {
      exercises = JSON.parse(exercisesJson);
    }
  } catch (e) {
    console.error("Failed to parse exercises", e);
    return { error: 'Invalid exercise data' };
  }

  try {
    await prisma.routine.create({
      data: {
        name,
        description,
        userId: targetUserId,
        exercises: {
          create: exercises.map((ex, index) => ({
            exerciseId: ex.id,
            sets: ex.sets ? parseInt(ex.sets) : null,
            reps: ex.reps ? parseInt(ex.reps) : null,
            order: index,
          })),
        },
      },
    });
  } catch (error) {
    console.error("Failed to create routine:", error);
    return { error: 'Failed to create routine' };
  }

  revalidatePath('/');
  return { success: true };
}

export async function deleteRoutine(id: string) {
  await prisma.routine.delete({
    where: { id },
  });
  revalidatePath('/');
}

// New Actions

export async function getTrainees(trainerId: string) {
  return await prisma.user.findMany({
    where: {
      roles: { has: Role.TRAINEE },
      trainerId: trainerId,
    },
    include: {
      routines: true,
      workoutLogs: {
        orderBy: { date: 'desc' },
        include: {
          routine: true,
          exercises: {
            include: {
              exercise: true
            }
          }
        }
      },
      bodyCompositions: {
        orderBy: { date: 'desc' },
        take: 1,
      },
    },
  });
}

export async function addBodyComposition(userId: string, formData: FormData) {
  const weight = parseFloat(formData.get('weight') as string);
  const bodyFat = formData.get('bodyFat') ? parseFloat(formData.get('bodyFat') as string) : null;
  const muscleMass = formData.get('muscleMass') ? parseFloat(formData.get('muscleMass') as string) : null;

  await prisma.bodyComposition.create({
    data: {
      userId,
      weight,
      bodyFat,
      muscleMass,
    },
  });

  revalidatePath('/');
}

export async function getDashboardData(userId: string, role: Role) {
  if (role === Role.TRAINER) {
    const trainees = await getTrainees(userId);
    const totalTrainees = trainees.length;
    const routines = await prisma.routine.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: { exercises: { include: { exercise: true } } }
    });
    const exercises = await prisma.exercise.findMany({ orderBy: { name: 'asc' } });
    const activeRoutines = routines.length;
    return { totalTrainees, activeRoutines, trainees, routines, exercises };
  } else {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        routines: {
          include: { exercises: { include: { exercise: true } } }
        },
        bodyCompositions: { orderBy: { date: 'desc' }, take: 1 },
        workoutLogs: {
          orderBy: { date: 'desc' },
          take: 5, // Fetch recent logs to check for today's completion
          include: { routine: true }
        }
      }
    });
    return { user };
  }
}

export async function createTrainee(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: 'Unauthorized' };
  }

  const name = formData.get('name') as string;
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  if (!email || !password || !name) {
    return { error: 'All fields are required' };
  }

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    // If user exists, just link them to this trainer and ensure they have TRAINEE role
    const updatedRoles = existingUser.roles.includes(Role.TRAINEE) 
      ? existingUser.roles 
      : [...existingUser.roles, Role.TRAINEE];
      
    await prisma.user.update({
      where: { email },
      data: {
        roles: updatedRoles,
        trainerId: session.user.id,
      },
    });
    
    revalidatePath('/');
    return { success: true };
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      name,
      roles: [Role.TRAINEE],
      trainerId: session.user.id,
    },
  });

  revalidatePath('/');
  return { success: true };
}

export async function addExercise(formData: FormData) {
  const name = formData.get('name') as string;
  const description = formData.get('description') as string;
  const videoUrl = formData.get('videoUrl') as string;

  if (!name) {
    return { error: 'Name is required' };
  }

  const newExercise = await prisma.exercise.create({
    data: {
      name,
      description,
      videoUrl,
    },
  });

  revalidatePath('/');
  return { success: true, exercise: newExercise };
}

export async function getExercises() {
  return await prisma.exercise.findMany({
    orderBy: { name: 'asc' },
  });
}

export async function logWorkout(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: 'Not authenticated' };
  }

  const routineId = formData.get('routineId') as string;
  const exercisesJson = formData.get('exercises') as string;
  
  if (!exercisesJson) {
    return { error: 'No exercises logged' };
  }

  const exercises = JSON.parse(exercisesJson); // Array of { exerciseId, sets: [{ reps, weight, setNumber }] }

  try {
    interface WorkoutSet {
      setNumber: number;
      reps: number;
      weight: number;
    }
    interface WorkoutExercise {
      exerciseId: string;
      sets: WorkoutSet[];
    }

    // Create WorkoutLog
    const workoutLog = await prisma.workoutLog.create({
      data: {
        userId: session.user.id,
        routineId: routineId || null,
        exercises: {
          create: (exercises as WorkoutExercise[]).flatMap((ex) => 
            ex.sets.map((set) => ({
              exerciseId: ex.exerciseId,
              setNumber: set.setNumber,
              reps: set.reps,
              weight: set.weight
            }))
          )
        }
      }
    });
    
    revalidatePath('/');
    return { success: true, workoutLogId: workoutLog.id };
  } catch (error) {
    console.error('Failed to log workout:', error);
    return { error: 'Failed to log workout' };
  }
}

export async function getTraineeAnalytics(userId?: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: 'Not authenticated' };

  const targetUserId = userId || session.user.id;

  // Verify access if requesting another user's data
  if (targetUserId !== session.user.id) {
     // Add trainer check logic here if needed
  }

  try {
    // Fetch Body Composition History
    const bodyComps = await prisma.bodyComposition.findMany({
      where: { userId: targetUserId },
      orderBy: { date: 'asc' },
      select: { date: true, weight: true, bodyFat: true, muscleMass: true }
    });

    // Fetch Strength Progress (Max weight per exercise per day)
    const workoutLogs = await prisma.workoutLog.findMany({
      where: { userId: targetUserId },
      include: {
        exercises: {
          include: { exercise: true }
        }
      },
      orderBy: { date: 'asc' }
    });

    // Process logs to get max weight per exercise over time
    const strengthProgress: Record<string, { date: string, weight: number, exerciseName: string }[]> = {};

    workoutLogs.forEach(log => {
      const dateStr = log.date.toISOString().split('T')[0];
      log.exercises.forEach(exLog => {
        const exName = exLog.exercise.name;
        if (!strengthProgress[exName]) {
          strengthProgress[exName] = [];
        }
        
        // Check if we already have an entry for this date
        const existingEntry = strengthProgress[exName].find(e => e.date === dateStr);
        if (existingEntry) {
          if (exLog.weight > existingEntry.weight) {
            existingEntry.weight = exLog.weight;
          }
        } else {
          strengthProgress[exName].push({
            date: dateStr,
            weight: exLog.weight,
            exerciseName: exName
          });
        }
      });
    });

    return { 
      success: true, 
      analytics: {
        bodyComposition: bodyComps,
        strength: strengthProgress
      }
    };
  } catch (error) {
    console.error('Failed to fetch analytics:', error);
    return { error: 'Failed to fetch analytics' };
  }
}
