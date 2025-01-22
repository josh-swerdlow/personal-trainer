"use client";

import Trainer from '../components/Trainer';
import BottomBanner from '../components/BottomBanner';
import { Select } from "@mantine/core";
import { useState } from 'react';
import { workoutNames } from '../data/workouts';

export default function Home() {
    const [selectedWorkout, setSelectedWorkout] = useState<string | null>(null);

    return (
        <main className="container mx-auto p-4">
            <Select
                checkIconPosition="left"
                data={workoutNames}
                pb={10}
                label="Select a workout"
                placeholder="Pick value"
                value={selectedWorkout}
                onChange={setSelectedWorkout}
            />
            <Trainer selectedWorkout={selectedWorkout} />
            <BottomBanner />
        </main>
    );
}