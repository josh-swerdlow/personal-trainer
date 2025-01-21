import hiit from './workouts/hiit.json';
import core from './workouts/core.json';
import lower_body from './workouts/lower_body.json';
import stretch from './workouts/stretch.json';

export type Exercise = {
  name: string;
  instruction: string;
  duration: number;
  preparation: number;
  cooldown: number;
};

export type Workout = {
  name: string;
  description: string;
  exercises: Exercise[];
};

export const workouts: Record<string, Workout> = {
  [hiit.name]: hiit,
  [core.name]: core,
  [lower_body.name]: lower_body,
  [stretch.name]: stretch
};

// You might also want to export this for use in the Select component
export const workoutNames = Object.keys(workouts);