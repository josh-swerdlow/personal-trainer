import morning_mobility from './workouts/morning_mobility.json'
import jumps from './workouts/jumps.json';
import off_ice from './workouts/off_ice.json';
import spins from './workouts/spins.json';
import spirals from './workouts/spirals.json';
import stretch from './workouts/stretch.json';
import short_stretch from './workouts/short_stretch.json'
import warmup from './workouts/warmup.json';
import weekend_stretch from './workouts/weekend_stretch.json';


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
    [morning_mobility.name] : morning_mobility,
    [jumps.name] : jumps,
    [off_ice.name] : off_ice,
    [spins.name] : spins,
    [spirals.name] : spirals,
    [stretch.name] : stretch,
    [short_stretch.name] : short_stretch,
    [warmup.name] : warmup,
    [weekend_stretch.name] : weekend_stretch,
};

// You might also want to export this for use in the Select component
export const workoutNames = Object.keys(workouts);