/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import React, { useState, useEffect, useRef } from "react";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import {
  PauseCircle,
  PlayCircle,
  RotateCcw,
  SkipForward,
  Volume2,
  VolumeX,
} from "lucide-react";

import { workouts } from '@/data/workouts';
import confetti from 'canvas-confetti';

type TrainerProps = {
  selectedWorkout: string | null;
};

const WORKOUT_STATE  = {
  /* Initial State */
  IDLE: 0,
  /* Running States */
  PREPARING: 1,
  EXERCISING: 2,
  RESTING: 3,
  /* Paused State */
  PAUSED: 4,
  /* Terminal State */
  COMPLETED: 5
};

const workoutStateMap = {
  [WORKOUT_STATE.IDLE]: "IDLE",
  [WORKOUT_STATE.PREPARING]: "PREPARING",
  [WORKOUT_STATE.EXERCISING]: "EXERCISING",
  [WORKOUT_STATE.RESTING]: "RESTING",
  [WORKOUT_STATE.PAUSED]: "PAUSED",
  [WORKOUT_STATE.COMPLETED]: "COMPLETED"
};

const workoutStateString = (state: number) => {
  return workoutStateMap[state as keyof typeof workoutStateMap];
};

const Trainer = ({ selectedWorkout }: TrainerProps) => {
  const [time, setTime] = useState(0);
  const [workoutState, setWorkoutState] = useState(WORKOUT_STATE.IDLE);
  const [prevWorkoutState, setPrevWorkoutState] = useState(WORKOUT_STATE.IDLE);
  const [isMuted, setIsMuted] = useState(false);
  const exerciseIndex = useRef(0);
  const exercises = selectedWorkout ? workouts[selectedWorkout].exercises : [];
  const isSpeaking = useRef(false);

  // Custom speak function
  const speak = (text: string): void => {
    if (!isMuted && window.speechSynthesis && !isSpeaking.current) {
      isSpeaking.current = true;
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1;
      utterance.pitch = 1;
      utterance.onend = () => {
        isSpeaking.current = false;
      };
      window.speechSynthesis.speak(utterance);
    }
  };

  useEffect(() => {
    console.log("== Logging State ==");
    let appState = "UNKNOWN";
    if (isWorkoutAppRunning()) appState = "RUNNING";
    if (isWorkoutAppIdle()) appState = "IDLE";
    if (isWorkoutAppPaused()) appState = "PAUSED";
    if (isWorkoutAppCompleted()) appState = "COMPLETED";
    console.log("Application State:", appState);
    console.log("Workout State:", workoutState);
    console.log("Exercise Index:", exerciseIndex.current);
    console.log("== Logging State ==");
  }, [workoutState]);


  useEffect(() => {
    console.log("time:", time);
  }, [time]);


  useEffect(() => {
    console.log("isMuted:", isMuted);
  }, [isMuted]);

  /* Workout State Management */
  /* Setters */
  const setIdleWorkoutState = () => {
    setWorkoutState(WORKOUT_STATE.IDLE);
  };

  const setPreparingWorkoutState = () => {
    setWorkoutState(WORKOUT_STATE.PREPARING);
  };

  const setExercisingWorkoutState = () => {
    setWorkoutState(WORKOUT_STATE.EXERCISING);
  };

  const setRestingWorkoutState = () => {
    setWorkoutState(WORKOUT_STATE.RESTING);
  };

  const setPausedWorkoutState = () => {
    setWorkoutState(WORKOUT_STATE.PAUSED);
  };

  const setCompletedWorkoutState = () => {
    setWorkoutState(WORKOUT_STATE.COMPLETED);
  };

  /* Getters */
  const isIdle = () => workoutState === WORKOUT_STATE.IDLE;
  const isPreparing = () => workoutState === WORKOUT_STATE.PREPARING;
  const isExercising = () => workoutState === WORKOUT_STATE.EXERCISING;
  const isResting = () => workoutState === WORKOUT_STATE.RESTING;
  const isPaused = () => workoutState === WORKOUT_STATE.PAUSED;
  const isCompleted = () => workoutState === WORKOUT_STATE.COMPLETED;


  /* Workout Application States */
  const isWorkoutAppRunning = () => {
    console.log('Checking Application State (Running):', { current: workoutState });
    return isPreparing() ||
           isExercising() ||
           isResting();
  };

  const isWorkoutAppIdle = () => {
    console.log('Checking Application State (Idle):', { current: workoutState });
    return isIdle();
  };

  const isWorkoutAppPaused = () => {
    console.log('Checking Application State (Paused):', { current: workoutState });
    return isPaused();
  };

  const isWorkoutAppCompleted = () => {
    console.log('Checking Application State (Completed):', { current: workoutState });
    return isCompleted();
  };

  /* Workout State Actions */
  const startWorkout = () => {
    const exercise = exercises[0];
    setPreparingWorkoutState();
    setNonZeroTimer(exercise.preparation);
    speak(`Starting ${exercise.name} in ${exercise.preparation} seconds`);
  };

  const continueWorkout = () => {
    const exercise = exercises[exerciseIndex.current];
    setWorkoutState(prevWorkoutState);
    speak(`Continuing ${exercise.name} from ${workoutStateString(prevWorkoutState)}`);
  };

  const startPreparing = () => {
    const exercise = exercises[exerciseIndex.current];
    setPreparingWorkoutState();
    setNonZeroTimer(exercise.preparation);
    speak(`Starting ${exercise.name} in ${exercise.preparation} seconds`);
    if (exercise.instruction) {
      speak(`Remember: ${exercise.instruction}`);
    }
  };

  const startExercising = () => {
    const exercise = exercises[exerciseIndex.current];
    setExercisingWorkoutState();
    setNonZeroTimer(exercise.duration);
    speak(`Begin ${exercise.name} for ${exercise.duration} seconds.`);
  };

  const startResting = () => {
    const currExercise = exercises[exerciseIndex.current];
    setNonZeroTimer(currExercise.cooldown);
    speak(`Rest for ${currExercise.cooldown} seconds`);
    setRestingWorkoutState();
    exerciseIndex.current = exerciseIndex.current + 1;
  };

  const completeWorkout = () => {
    setCompletedWorkoutState();
    setZeroTimer();
    speak("Congratulations! Workout complete!");
  };

  const pauseWorkout = () => {
    console.log("Pausing workout from: ", workoutStateString(workoutState));
    setPrevWorkoutState(workoutState);
    setPausedWorkoutState();
    speak("Workout paused");
  };

  const resetWorkout = () => {
    setIdleWorkoutState();
    exerciseIndex.current = 0;
    setZeroTimer();
    speak("Workout reset. Ready to begin.");
  };

  /* Timer State Management */

  // Ensure timer is at least 3 seconds
  const setNonZeroTimer = (time: number) => {
    time = time > 3 ? time : 3;
    setTime(time);
  };

  // Acceptable override of timer 3s rule
  const setZeroTimer = () => {
    setTime(0);
  };

  const skipExercise = () => {
    if (exerciseIndex.current < exercises.length - 1) {
      setRestingWorkoutState();
      setZeroTimer();
      exerciseIndex.current = exerciseIndex.current + 1;
    }
  };



  // Timer
  useEffect(() => {
    let interval: NodeJS.Timeout | undefined;

    console.log("useEffect triggered");

    if (isWorkoutAppRunning()) {
      interval = setInterval(() => {
        setTime(prev => {
          const newTime = prev - 1;

          if (newTime >= 1 && newTime <= 3 && (isPreparing() || isExercising()) && !isSpeaking.current) {
            speak(newTime.toString());
          }

          if (newTime < 1) {
            const exercise = exercises[exerciseIndex.current];

            if (!exercise) {
              console.error("No exercise found in exercises array", exercises, "at index", exerciseIndex.current, "with length", exercises.length);
              return 0;
            }

            switch (workoutState) {
              case WORKOUT_STATE.PREPARING:
                console.info("Workout state: PREPARING -> EXERCISING", exercise);
                startExercising();
                break;

              case WORKOUT_STATE.EXERCISING:
                console.info("Workout state: EXERCISING -> RESTING", exercise);
                if (exerciseIndex.current < exercises.length - 1) {
                  startResting();
                } else {
                  console.warn("Last exercise, but not completed");
                }
                break;

              case WORKOUT_STATE.RESTING:
                console.info("Workout state: RESTING -> PREPARING", exercise);
                if (exerciseIndex.current == exercises.length - 1) {
                  const exercise = exercises[exerciseIndex.current];
                  speak(`Rest for ${exercise.cooldown} seconds`);
                  completeWorkout();
                } else {
                  startPreparing();
                }
                break;

              default:
                console.warn("Unexpected state:", workoutState);
                return 0;
            }
          }
          return newTime;
        });
      }, 1000);
      console.log("Interval set", interval);
    } else {
      console.warn("State is being changed while application is not running.");
    }

    return () => {
      console.log("Interval cleared", interval);
      clearInterval(interval);
    };
  }, [workoutState]);

  const getExerciseIndicatorColor = (idx: number) => {
    if (idx === exerciseIndex.current) {
      switch (workoutState) {
        case WORKOUT_STATE.PREPARING:
          return "bg-yellow-500 w-3 h-3 ring-2 ring-yellow-300 ring-offset-1 animate-[bounce_1s_infinite]";
        case WORKOUT_STATE.EXERCISING:
          return "bg-blue-500 w-3 h-3 ring-2 ring-blue-300 ring-offset-1 animate-pulse";
        case WORKOUT_STATE.RESTING:
          return "bg-orange-500 w-3 h-3 ring-2 ring-orange-300 ring-offset-1";
        case WORKOUT_STATE.PAUSED:
          return "bg-gray-500 w-3 h-3 ring-2 ring-gray-300 ring-offset-1";
        case WORKOUT_STATE.COMPLETED:
          return "bg-green-500 w-3 h-3 ring-2 ring-green-300 ring-offset-1";
        default:
          return "bg-gray-300 w-2 h-2";
      }
    }
    return idx < exerciseIndex.current ? "bg-green-500 w-2 h-2" : "bg-gray-300 w-2 h-2";
  };

  const getHeaderText = () => {
    let hdrText = "";
    switch (workoutState) {
      case WORKOUT_STATE.COMPLETED:
        hdrText = "Workout Complete!"
        break;
      case WORKOUT_STATE.RESTING:
        hdrText = `${exercise.name} - Resting`
        break;
      case WORKOUT_STATE.PREPARING:
        hdrText = `${exercise.name} - Preparing`
        break;
      case WORKOUT_STATE.EXERCISING:
        hdrText = `${exercise.name} - Exercising`
        break;
      case WORKOUT_STATE.PAUSED:
        hdrText = `${exercise.name} - Paused`
        break;
      case WORKOUT_STATE.IDLE:
        hdrText = selectedWorkout ? `Waiting to start: ${workouts[selectedWorkout].name}` : "No workout selected"
        break;
      default:
        hdrText = "Unknown State";
    }
    return hdrText;
  }

  const percentageCompletedString = () => {
    return exercise ? `${Math.round(((exerciseIndex.current) / exercises.length) * 100)}% completed` : "No workout selected"
  };

  const handlePauseOrStart = () => {
    if (isWorkoutAppIdle()) {
      startWorkout();
    } else if (isWorkoutAppRunning()) {
      pauseWorkout();
    } else if (isWorkoutAppPaused()) {
      continueWorkout();
    }
  }

  const exercise = exercises[exerciseIndex.current];

  // Add this effect to trigger confetti when workout is completed
  useEffect(() => {
    if (workoutState === WORKOUT_STATE.COMPLETED) {
      const end = Date.now() + (3 * 1000); // run for 3 seconds

      const colors = ['#00ff00', '#26ff00', '#4cff00']; // green colors for success

      (function frame() {
        confetti({
          particleCount: 3,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: colors
        });
        confetti({
          particleCount: 3,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: colors
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      }());
    }
  }, [workoutState]);

  return (
    <Card className="w-full max-w-md mx-auto">
      {!selectedWorkout || exercises.length === 0 ? (
        <CardContent className="py-8">
          <div className="text-center space-y-4">
            <div className="text-2xl font-bold text-gray-700">No Workout Selected</div>
            <p className="text-gray-500">Please select a workout to begin your training session.</p>
          </div>
        </CardContent>
      ) : (
        <>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div className="text-2xl font-bold">
                {getHeaderText()}
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  setIsMuted((prev) => !prev);
                  if (isMuted) {
                    speak("Voice guidance on");
                  }
                }}
                className="flex items-center"
              >
                {isMuted ? <VolumeX /> : <Volume2 />}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {workoutState !== WORKOUT_STATE.COMPLETED &&
                workoutState !== WORKOUT_STATE.RESTING && (
                  <div className="space-y-4">
                    <div className="text-lg text-center">
                      {percentageCompletedString()}
                    </div>
                    <div className="text-gray-600 text-center">
                      {exercise?.instruction || "No instruction provided"}
                    </div>
                  </div>
                )}

              <div className="text-4xl font-bold text-center">
                {Math.floor(time / 60)}:{(time % 60).toString().padStart(2, "0")}
              </div>

              {/* Nav Bar */}
              <div className="flex justify-center space-x-4">
                {/* Pause, Restart, and Reset button */}
                <Button
                  onClick={handlePauseOrStart}
                  className="flex items-center"
                >
                  {isWorkoutAppRunning()  ? (
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
                {/* Reset button */}
                <Button
                  onClick={resetWorkout}
                  variant="outline"
                  className="flex items-center"
                >
                  <RotateCcw className="mr-2" /> Reset
                </Button>
                {/* Skip button */}
                <Button
                  onClick={skipExercise}
                  variant="outline"
                  className="flex items-center"
                >
                  <SkipForward className="mr-2" /> Skip
                </Button>
              </div>

              {/* Exercise Indicator */}
              <div className="flex justify-between mt-4">
                {exercises.map((_, idx) => (
                  <div
                    key={idx}
                    className={`rounded-full transition-all duration-200 ${getExerciseIndicatorColor(idx)}`}
                  />
                ))}
              </div>
            </div>
          </CardContent>
        </>
      )}
    </Card>
  );
};

export default Trainer;