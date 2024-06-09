document.addEventListener("DOMContentLoaded", function () {
    const workoutContainer = document.getElementById('workout-container');
    const workoutInfo = document.getElementById('workout-info');

    if (!workoutContainer) {
        console.error('Could not find workout container');
        return;
    }

    // Function to fetch workout data from JSON file
    async function fetchWorkoutData(day) {
        try {
            const response = await fetch(`day${day}.json`);
            if (!response.ok) {
                throw new Error('Failed to fetch workout data');
            }
            return await response.json();
        } catch (error) {
            console.error('Error fetching workout data:', error);
            throw error;
        }
    }

    // Function to display workout data
    async function displayWorkoutData(day) {
        try {
            const data = await fetchWorkoutData(day);
            workoutContainer.innerHTML = ''; // Clear previous workout data

            // Initialize totalTime
            let totalTime = data.totalTime;

            data.exercises.forEach(exercise => {
                if (exercise.name !== "Core Superset") { // Skip Core Superset
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
                    expandButton.addEventListener('click', () => toggleDetails(exerciseElement, expandButton));

                    // Append header, details, and then expand button
                    appendChildren(exerciseElement, header, details, expandButton);
                    workoutContainer.appendChild(exerciseElement);
                }
            });

            // Handle the last Core Superset section
            // Handle the last Core Superset section
            // Handle the last Core Superset section
            const lastCoreSuperset = data.exercises.find(exercise => exercise.name === "Core Superset");
            if (lastCoreSuperset) {
                const coreElement = document.createElement('div');
                coreElement.classList.add('exercise');

                const coreHeader = document.createElement('h3');
                const coreTotalTime = lastCoreSuperset.exercises.reduce((total, exercise) => total + exercise.time, 0);
                coreHeader.innerText = `Core Superset | Time: ${coreTotalTime} min`;

                const coreDetails = document.createElement('div');
                coreDetails.classList.add('hidden');

                // Create detail elements for each core exercise
                lastCoreSuperset.exercises.forEach(coreExercise => {
                    const coreExerciseDetail = document.createElement('div');
                    coreExerciseDetail.classList.add('core-exercise'); // Add class for styling

                    const exerciseHeader = document.createElement('h4');
                    exerciseHeader.innerText = coreExercise.name; // Display core exercise name

                    const repsSets = createDetail('Reps/Sets', `Reps: ${coreExercise.reps}, Sets: ${coreExercise.sets}, Time: ${coreExercise.time} min`);
                    appendChildren(coreExerciseDetail, exerciseHeader, repsSets);
                    coreDetails.appendChild(coreExerciseDetail);
                });

                appendChildren(coreElement, coreHeader, coreDetails);
                workoutContainer.appendChild(coreElement);

                const coreExpandButton = document.createElement('button');
                coreExpandButton.innerText = 'Expand';
                coreExpandButton.addEventListener('click', () => toggleDetails(coreElement, coreExpandButton));
                coreElement.appendChild(coreExpandButton);

                // Add Core Superset time to total time
                totalTime += coreTotalTime;
            }



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
    function toggleDetails(exerciseElement, expandButton) {
        const details = exerciseElement.querySelector('.hidden');
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
        workoutContainer.innerHTML = '<p>Rest day! No workout scheduled.</p>';
        const date = new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' });
        workoutInfo.innerText = `${date} - Rest Day`;
    }

    // Function to toggle details visibility
function toggleDetails(exerciseElement, expandButton) {
    // Close all other expanded sections
    const expandedElements = document.querySelectorAll('.exercise.show');
    expandedElements.forEach(element => {
        if (element !== exerciseElement) {
            element.classList.remove('show');
            const expandButton = element.querySelector('button');
            if (expandButton) {
                expandButton.innerText = 'Expand';
            }
        }
    });

    // Toggle visibility of clicked section
    const details = exerciseElement.querySelector('.hidden');
    details.classList.toggle('show');
    if (details.classList.contains('show')) {
        expandButton.innerText = 'Close';
    } else {
        expandButton.innerText = 'Expand';
    }
}

});

