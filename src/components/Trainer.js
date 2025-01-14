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

const WORKOUT_STAGE = {
  /* Initial Stage */
  IDLE: 0,
  /* Running Stages */
  PREPARING: 1,
  EXERCISING: 2,
  RESTING: 3,
  /* Terminal Stage */
  COMPLETED: 4
};

const Trainer = () => {
  const [time, setTime] = useState(0);
  const [workoutState, setWorkoutState] = useState({
    stage: WORKOUT_STAGE.IDLE,
    exerciseIndex: 0,
  });
  const [isMuted, setIsMuted] = useState(false);
  // const isTransitioning = useRef(false);
  const isProcessing = useRef(false);

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

    console.log("Workout State:", {
      stage: Object.keys(WORKOUT_STAGE)[workoutState.stage], // Shows name instead of number
      exerciseIndex: workoutState.exerciseIndex,
      exercise: exercises[workoutState.exerciseIndex].name,
    });
  }, [workoutState]);


  useEffect(() => {
    console.log("time:", time);
  }, [time]);


  useEffect(() => {
    console.log("isMuted:", isMuted);
  }, [isMuted]);

  /* Workout State Management */
  /* Setters */
  const setXWorkoutState = (newStage) => {
    setWorkoutState(prev => ({...prev, stage: newStage}));
  };

  const setPreparingWorkoutState = () => {
    setXWorkoutState(WORKOUT_STAGE.PREPARING);
  };

  const setExercisingWorkoutState = () => {
    setXWorkoutState(WORKOUT_STAGE.EXERCISING);
  };

  // const setRestingWorkoutState = () => {
  //   setXWorkoutState(WORKOUT_STAGE.RESTING);
  // };

  const setIdleWorkoutState = () => {
    setXWorkoutState(WORKOUT_STAGE.IDLE);
  };

  const setCompletedWorkoutState = () => {
    setXWorkoutState(WORKOUT_STAGE.COMPLETED);
  };

  const setWorkoutStateIndex = (newIndex) => {
    setWorkoutState((prev) => ({
      ...prev,
      exerciseIndex: newIndex,
    }));
  };

  // const incrWorkoutStateIndex = () => {
  //   setWorkoutState((prev) => ({
  //     ...prev,
  //     exerciseIndex: prev.exerciseIndex + 1,
  //   }))
  // };

  /* Getters */
  const isStateX = (X) => {
    // console.log('Checking state:', { current: workoutState.stage, expected: X });
    return workoutState.stage === X;
  };

  const isIdle = () => { return isStateX(WORKOUT_STAGE.IDLE); };

  const isPreparing = () => {
    return isStateX(WORKOUT_STAGE.PREPARING);
  };

  const isExercising = () => {
    return isStateX(WORKOUT_STAGE.EXERCISING);
  };

  const isResting = () => {
    return isStateX(WORKOUT_STAGE.RESTING);
  };

  const isCompleted = () => {
    return isStateX(WORKOUT_STAGE.COMPLETED);
  };

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
    const exercise = exercises[workoutState.exerciseIndex];
    setPreparingWorkoutState();
    setTime(exercise.preparation);
    speak(`Starting ${exercise.name} in ${exercise.preparation} seconds`);
  };

  const startExercising = () => {
    const exercise = exercises[workoutState.exerciseIndex];
    setExercisingWorkoutState();
    setTime(exercise.duration);
    speak(
      `Begin ${exercise.name} for ${exercise.duration} seconds. Remember: ${exercise.instruction}`
    );
  };

  const startResting = () => {
    const currExercise = exercises[workoutState.exerciseIndex];
    setTime(currExercise.cooldown);
    speak(`Rest for ${currExercise.cooldown} seconds`);
    setWorkoutState((prev) => ({
      ...prev,
      stage: WORKOUT_STAGE.RESTING,
      exerciseIndex: prev.exerciseIndex + 1}));
    // setRestingWorkoutState();
    // incrWorkoutStateIndex();
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

  // Timer @Jared, but is in this useEffect. It double runs.
  useEffect(() => {
    let interval;
    console.log("Start: useEffect");

    // Clear any existing intervals immediately
    if (interval) {
      console.log("Cleared interval (begining):", interval);
      clearInterval(interval);
    }

    if (isWorkoutAppRunning()) {
      interval = setInterval(() => {
        if (isProcessing.current) {
          console.log("Skipping update - already processing");
          return;
        }

        setTime(prev => {
          console.log('setTime callback  executing',
            'interval:', interval,
            'prev:', prev,
            'isProcessing:', isProcessing.current,
            'stage:', workoutState.stage);
          if (isProcessing.current) {
            console.log("Skipping update - already processing");
            return prev;  // Return prev instead of decrementing when locked
          }

          isProcessing.current = true;

          if (prev <= 3) {
            speak(prev.toString());
          }

          if (prev <= 1) {
            const exercise = exercises[workoutState.exerciseIndex];

            switch (workoutState.stage) {
              case WORKOUT_STAGE.PREPARING:
                console.log("Workout Stage: PREPARING -> EXERCISING", exercise);
                startExercising();
                break;

              case WORKOUT_STAGE.EXERCISING:
                console.log("Workout Stage: EXERCISING -> RESTING", exercise);
                if (workoutState.exerciseIndex < exercises.length - 1) {
                  console.log("Going to rest");
                  startResting(); // @Jared this dbl increments
                } else {
                  console.warn("Last exercise, but not completed");
                }
                break;

              case WORKOUT_STAGE.RESTING:
                console.log("Workout Stage: RESTING -> PREPARING", exercise);
                // Last exercise
                if (workoutState.exerciseIndex == exercises.length - 1) {
                  const exercise = exercises[workoutState.exerciseIndex];
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

          isProcessing.current = false;
          return prev - 1;
        });
      }, 1000);
      console.log("Created interval:", interval);
    } else {
      console.log("Application is not running. UseEffect will not run");
    }

    console.log("End: useEffect");
    return () => {
      if (interval) {
        console.log("Cleared interval (return):", interval);
        clearInterval(interval);
      }
      isProcessing.current = false;
    };
  }, [workoutState]);

  const exercise = exercises[workoutState.exerciseIndex];

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div className="text-2xl font-bold">
            {workoutState === WORKOUT_STAGE.COMPLETED
              ? "Workout Complete!"
              : workoutState === WORKOUT_STAGE.RESTING
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
          {!workoutState === WORKOUT_STAGE.COMPLETED &&
           !workoutState === WORKOUT_STAGE.RESTING && (
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
                  idx === workoutState.exerciseIndex
                    ? "bg-blue-500"
                    : idx < workoutState.exerciseIndex
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