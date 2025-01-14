/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import React, { useState, useEffect, useRef } from "react";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  PauseCircle,
  PlayCircle,
  RotateCcw,
  Volume2,
  VolumeX,
} from "lucide-react";

const WORKOUT_STATE  = {
  /* Initial State */
  IDLE: 0,
  /* Running States */
  PREPARING: 1,
  EXERCISING: 2,
  RESTING: 3,
  /* Terminal State */
  COMPLETED: 4
};

const Trainer = () => {
  const [time, setTime] = useState(0);
  const [workoutState, setWorkoutState] = useState(WORKOUT_STATE.IDLE);
  const [isMuted, setIsMuted] = useState(false);
  const exerciseIndex = useRef(0);
  const exercises = [
    {
      name: "Push-ups",
      instruction: "Keep your core tight and elbows close",
      duration: 10,
      preparation: 5,
      cooldown: 5,
    },
    {
      name: "Squats",
      instruction: "Keep weight in heels, chest up",
      duration: 10,
      preparation: 5,
      cooldown: 5,
    },
    {
      name: "Plank",
      instruction: "Maintain straight line from head to heels",
      duration: 10,
      preparation: 5,
      cooldown: 5,
    },
  ];

  // Custom speak function
  const speak = (text) => {
    if (!isMuted && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1;
      utterance.pitch = 1;
      window.speechSynthesis.speak(utterance);
    }
  };

  useEffect(() => {
    let appState = "UNKNOWN";
    if (isWorkoutAppRunning()) appState = "RUNNING";
    if (isWorkoutAppIdle()) appState = "IDLE";
    if (isWorkoutAppCompleted()) appState = "COMPLETED";
    console.log("Application State:", appState);
    console.log("Exercise Index:", exerciseIndex.current);
    console.log("Workout State:", workoutState);
  }, [workoutState]);


  useEffect(() => {
    console.log("time:", time);
  }, [time]);


  useEffect(() => {
    console.log("isMuted:", isMuted);
  }, [isMuted]);

  /* Workout State Management */
  /* Setters */
  const setPreparingWorkoutState = () => {
    setWorkoutStage(WORKOUT_STATE.PREPARING);
  };

  const setExercisingWorkoutState = () => {
    setWorkoutStage(WORKOUT_STATE.EXERCISING);
  };

  const setIdleWorkoutState = () => {
    setWorkoutStage(WORKOUT_STATE.IDLE);
  };

  const setCompletedWorkoutState = () => {
    setWorkoutStage(WORKOUT_STATE.COMPLETED);
  };

  /* Getters */
  const isIdle = () => workoutState === WORKOUT_STATE.IDLE;
  const isPreparing = () => workoutState === WORKOUT_STATE.PREPARING;
  const isExercising = () => workoutState === WORKOUT_STATE.EXERCISING;
  const isResting = () => workoutState === WORKOUT_STATE.RESTING;
  const isCompleted = () => workoutState === WORKOUT_STATE.COMPLETED;


  /* Workout Application States */
  const isWorkoutAppRunning = () => {
    // console.log('Checking Application State (Running):', { current: workoutState.stage });
    return isPreparing() ||
           isExercising() ||
           isResting();
  };

  const isWorkoutAppIdle = () => {
    // console.log('Checking Application State (Idle):', { current: workoutState.stage });
    return isIdle();
  };

  const isWorkoutAppCompleted = () => {
    // console.log('Checking Application State (Completed):', { current: workoutState.stage });
    return isCompleted();
  };

  /* Workout State Actions */
  const startWorkout = () => {
    const exercise = exercises[0];
    setPreparingWorkoutState();
    setTime(exercise.preparation);
    speak(`Starting ${exercise.name} in ${exercise.preparation} seconds`);
  };

  const startPreparing = () => {
    const exercise = exercises[exerciseIndex];
    setPreparingWorkoutState();
    setTime(exercise.preparation);
    speak(`Starting ${exercise.name} in ${exercise.preparation} seconds`);
  };

  const startExercising = () => {
    const exercise = exercises[exerciseIndex];
    setExercisingWorkoutState();
    setTime(exercise.duration);
    speak(
      `Begin ${exercise.name} for ${exercise.duration} seconds. Remember: ${exercise.instruction}`
    );
  };

  const startResting = () => {
    const currExercise = exercises[exerciseIndex];
    setTime(currExercise.cooldown);
    speak(`Rest for ${currExercise.cooldown} seconds`);
    setWorkoutState(WORKOUT_STATE.RESTING);
    exerciseIndex.current++;
  };

  const completeWorkout = () => {
    setCompletedWorkoutState();
    setTime(0);
    speak("Congratulations! Workout complete!");
  };

  const pauseWorkout = () => {
    setIdleWorkoutState();
    speak("Workout paused");
  };

  const resetWorkout = () => {
    setIdleWorkoutState();
    setWorkoutStateIndex(0);
    setTime(exercises[0].duration);
    speak("Workout reset. Ready to begin.");
  };

  // Timer
  useEffect(() => {
    let interval;

    if (isWorkoutAppRunning()) {
      interval = setInterval(() => {

        setTime(prev => {

          if (prev <= 3) {
            speak(prev.toString());
          }

          if (prev <= 1) {
            const exercise = exercises[exerciseIndex];

            switch (workoutState.stage) {
              case WORKOUT_STATE.PREPARING:
                console.info("Workout Stage: PREPARING -> EXERCISING", exercise);
                startExercising();
                break;

              case WORKOUT_STATE.EXERCISING:
                console.info("Workout Stage: EXERCISING -> RESTING", exercise);
                if (exerciseIndex < exercises.length - 1) {
                  startResting();
                } else {
                  console.warn("Last exercise, but not completed");
                }
                break;

              case WORKOUT_STATE.RESTING:
                console.info("Workout Stage: RESTING -> PREPARING", exercise);
                // Last exercise
                if (exerciseIndex == exercises.length - 1) {
                  const exercise = exercises[exerciseIndex];
                  speak(`Rest for ${exercise.cooldown} seconds`);
                  completeWorkout();
                } else {
                  startPreparing();
                }
                break;

              default:
                console.warn("Unexpected Stage:", workoutState);
                return 0;
            }
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      console.warn("State is being changed while application is not running.");
    }

    // Cleanup
    return () => { clearInterval(interval); };
  }, [workoutState]);

  const exercise = exercises[exerciseIndex];

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div className="text-2xl font-bold">
            {workoutState === WORKOUT_STATE.COMPLETED
              ? "Workout Complete!"
              : workoutState === WORKOUT_STATE.RESTING
              ? "Rest Time"
              : workoutState.exercise}
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              setIsMuted(prev => !prev);
              speak(isMuted ? "Voice guidance on" : "");
            }}
            className="flex items-center"
          >
            {isMuted ? <VolumeX /> : <Volume2 />}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {!workoutState === WORKOUT_STATE.COMPLETED &&
           !workoutState === WORKOUT_STATE.RESTING && (
            <div className="space-y-4">
              <div className="text-lg text-center">
                {exercise.reps || exercise.time}
              </div>
              <div className="text-gray-600 text-center">
                {exercise.instruction}
              </div>
            </div>
          )}

          <div className="text-4xl font-bold text-center">
            {Math.floor(time / 60)}:{(time % 60).toString().padStart(2, "0")}
          </div>

          {/* Pause, Restart, Reset buttons */}
          <div className="flex justify-center space-x-4">
            <Button
              onClick={() => {
                if (isWorkoutAppRunning()) {
                  pauseWorkout();
                } else {
                  startWorkout();
                }
              }}
              className="flex items-center"
            >
              {isWorkoutAppRunning() ? (
                <>
                  <PauseCircle className="mr-2" /> Pause
                </>
              ) : (
                <>
                  <PlayCircle className="mr-2" />
                  {isWorkoutAppCompleted() ? "Restart" : "Start"}
                </>
              )}
            </Button>
            <Button
              onClick={resetWorkout}
              variant="outline"
              className="flex items-center"
            >
              <RotateCcw className="mr-2" /> Reset
            </Button>
          </div>

          <div className="flex justify-between mt-4">
            {exercises.map((_, idx) => (
              <div
                key={idx}
                className={`h-2 w-2 rounded-full ${
                  idx === exerciseIndex
                    ? "bg-blue-500"
                    : idx < exerciseIndex
                    ? "bg-green-500"
                    : "bg-gray-300"
                }`}
              />
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default Trainer;