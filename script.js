document.addEventListener("DOMContentLoaded", function () {
    const gymWorkoutContainer = document.getElementById('gym-workout-container');
    const homeWorkoutContainer = document.getElementById('home-workout-container');
    const workoutInfo = document.getElementById('workout-info');

    if (!gymWorkoutContainer || !homeWorkoutContainer) {
        console.error('Could not find workout containers');
        return;
    }

    // Function to fetch workout data from JSON file
    async function fetchWorkoutData(day) {
        try {
            const response = await fetch(`day${day}.json`);
            if (!response.ok) {
                throw new Error('Failed to fetch workout data');
            }
            const data = await response.json();

            // Fetch core workout data
            const coreData = await fetchCoreWorkoutData();
            data.coreWorkout = coreData;

            return data;
        } catch (error) {
            console.error('Error fetching workout data:', error);
            throw error;
        }
    }

    async function fetchCoreWorkoutData() {
        try {
            const response = await fetch('coreWorkouts.json');
            if (!response.ok) {
                throw new Error('Failed to fetch core workout data');
            }
            return await response.json();
        } catch (error) {
            console.error('Error fetching core workout data:', error);
            throw error;
        }
    }
    
    
    async function displayWorkoutData(day) {
        try {
            const data = await fetchWorkoutData(day);
            gymWorkoutContainer.innerHTML = ''; // Clear previous gym workout data
            homeWorkoutContainer.innerHTML = ''; // Clear previous home workout data
    
            // Initialize totalTime
            let totalTime = data.totalTime;
    
            // Create and append h2 element for gym workout section
            const gymHeader = document.createElement('h2');
            gymHeader.textContent = 'Gym Workout';
            gymWorkoutContainer.appendChild(gymHeader);
    
            // Display gym workout data
            data.exercises.forEach(exercise => {
                if (exercise.name !== "Core Superset") { // Handle main workout (gym)
                    const exerciseElement = document.createElement('div');
                    exerciseElement.classList.add('exercise');
    
                    const header = document.createElement('h3');
                    header.innerText = `${exercise.name} | Reps: ${exercise.reps} | Sets: ${exercise.sets} | Time: ${exercise.time} min`;
    
                    const details = document.createElement('div');
                    details.classList.add('hidden');
    
                    const musclesWorked = createDetail('Muscles Worked', exercise.musclesWorked);
                    const repsSets = createDetail('Reps/Sets', `Reps: ${exercise.reps}, Sets: ${exercise.sets}, Time: ${exercise.time} min`);
                    const repGoal = createDetail('Rep Goal to Increase Weight', exercise.repGoal);
                    const equipment = createDetail('Equipment', exercise.equipment);
    
                    appendChildren(details, musclesWorked, repsSets, repGoal, equipment);
    
                    if (exercise.alternative) {
                        const alternative = document.createElement('p');
                        alternative.innerHTML = `<small><strong>Alternative Exercise:</strong> ${exercise.alternative.name} | Reps: ${exercise.alternative.reps} | Sets: ${exercise.alternative.sets} | Time: ${exercise.alternative.time} min | Equipment: ${exercise.alternative.equipment}</small>`;
                        details.appendChild(alternative);
                    }
    
                    const expandButton = document.createElement('button');
                    expandButton.innerText = 'Expand';
                    expandButton.addEventListener('click', () => toggleDetails(details, expandButton));
    
                    // Append header, details, and then expand button
                    appendChildren(exerciseElement, header, details, expandButton);
                    gymWorkoutContainer.appendChild(exerciseElement);
                }
            });
    
            // Display core workout data for home workout
            const coreExercisesData = await fetchCoreWorkoutData();
            const coreWorkouts = coreExercisesData.coreWorkouts[day.toString()]; // Access core workouts for the selected day
    
            const coreHeader = document.createElement('h2');
            coreHeader.innerText = 'Core Exercises';
            homeWorkoutContainer.appendChild(coreHeader);
    
            let coreTotalTime = 0; // Initialize core total time
    
            coreWorkouts.forEach(coreExerciseDetails => {
                const coreElement = document.createElement('div');
                coreElement.classList.add('exercise');
    
                const header = document.createElement('h3');
                header.innerText = coreExerciseDetails.name;
    
                const details = document.createElement('div');
                details.classList.add('hidden');
    
                const reps = createDetail('reps', coreExerciseDetails.reps);
                const sets = createDetail('sets', coreExerciseDetails.sets);
                const time = createDetail('time', coreExerciseDetails.time);
                appendChildren(details, reps, sets, time);
    
                const expandButton = document.createElement('button');
                expandButton.innerText = 'Expand';
                expandButton.addEventListener('click', () => toggleDetails(details, expandButton));
    
                coreElement.appendChild(header);
                coreElement.appendChild(details);
                coreElement.appendChild(expandButton);
                homeWorkoutContainer.appendChild(coreElement);
    
                // Parse time value and add to coreTotalTime
                const timeString = coreExerciseDetails.time;
                const timeArray = timeString.split(' ');
                if (timeArray.length === 2 && timeArray[1] === 'min') {
                    const exerciseTime = parseInt(timeArray[0]);
                    console.log(`Exercise: ${coreExerciseDetails.name}, Time: ${exerciseTime}`);
                    coreTotalTime += exerciseTime;
                }
            });
    
            // Display core total time underneath the "Core Exercises" heading
            const coreTotalTimeHeader = document.createElement('h4');
            coreTotalTimeHeader.innerText = `Total Core Time: ${coreTotalTime} min`;
            homeWorkoutContainer.insertBefore(coreTotalTimeHeader, homeWorkoutContainer.childNodes[1]); // Place it above the workout moves
    
            updateHeader(data.workoutType, totalTime);
        } catch (error) {
            console.error('Error displaying workout data:', error);
        }
    }
    
    
    
    
    
    
    
    

    // Function to create a detail element
    function createDetail(label, value) {
        const detail = document.createElement('p');
        detail.innerHTML = `<strong>${label}:</strong> ${value}`;
        return detail;
    }

    // Function to toggle details visibility
    function toggleDetails(details, expandButton) {
        details.classList.toggle('show');
        if (details.classList.contains('show')) {
            expandButton.innerText = 'Close';
        } else {
            expandButton.innerText = 'Expand';
        }
    }

    // Function to append multiple children to a parent element
    function appendChildren(parent, ...children) {
        children.forEach(child => parent.appendChild(child));
    }

    // Function to get workout day based on PPL schedule
    function getWorkoutDay() {
        const dayOfWeek = new Date().getDay();
        const schedule = {
            0: null,  // Sunday: Rest day
            1: 3,     // Monday: Leg day
            2: 1,     // Tuesday: Push day
            3: 2,     // Wednesday: Pull day
            4: 3,     // Thursday: Leg day
            5: 1,     // Friday: Push day
            6: 2      // Saturday: Pull day
        };
        return schedule[dayOfWeek];
    }

    // Function to update the header with workout info
    function updateHeader(workoutType, totalTime) {
        const date = new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' });
        workoutInfo.innerText = `${date} - ${workoutType} | Estimated Time: ${totalTime}min`;
    }

    // Load workout data based on current day in PPL schedule
    const workoutDay = getWorkoutDay();
    if (workoutDay) {
        displayWorkoutData(workoutDay);
    } else {
        gymWorkoutContainer.innerHTML = '<p>Rest day! No workout scheduled.</p>';
        homeWorkoutContainer.innerHTML = ''; // Clear home workout on rest day
        const date = new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' });
        workoutInfo.innerText = `${ date } - Rest Day`;
    }
});
