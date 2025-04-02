"use strict";

/**
 * PLAN
 * 
 * //get the taskbar
    //build the task
    //append to body
    //show event || task on calendar for given day

    //method for adding --
    //save the div "currentTasks" and its children
    //hide the currentTasks
    //show the form addTask
    //on submit, generate new task, hide form, 
    //  append task to currentTasks, show currentTasks

    //if event selected, show start time box and end time
    //if task selected, show deadline box
 */

let itemsForDays = [];

class Item {
    constructor(title, desc) {
        this.title = title;
        this.desc = desc;
    }
}

class Task extends Item {
    constructor(title, desc, priority, deadline) {
        super(title, desc);
        this.priority = priority;
        this.deadline = deadline;
    }
}

class Event extends Item {
    constructor(title, desc, location, startTime, endTime) {
        super(title, desc);
        this.location = location;
        this.startTime = startTime;
        this.endTime = endTime;
    }
}

initTaskCreation();

function initTaskCreation() {
    setupDaysGlobal();
    setupTaskCreationFormControls();
    setupItemType();
    
    document.getElementById("addTaskButton").addEventListener("click", function() {
        toggleTaskMenuVisibility();
        this.disabled = true;
    });
}

function toggleTaskMenuVisibility() {
    let currentTasks = document.getElementById("currentTasks");
    let taskCreationMenu = document.getElementById("taskCreation");

    if (currentTasks.style.display === "" || currentTasks.style.display === "block") {
        currentTasks.style.display = "none";
        taskCreationMenu.style.display = "block";
    } else {
        currentTasks.style.display = "block";
        taskCreationMenu.style.display = "none";
    }
}

function setupItemType() {
    let eventRadio = document.getElementById("eventSelectButton");
    let taskRadio = document.getElementById("taskSelectButton");
    let eventOptions = document.getElementById("eventOptions");
    let taskOptions = document.getElementById("taskOptions");

    function updateVisibility() {
        if (eventRadio.checked) {
            eventOptions.style.display = "block";
            taskOptions.style.display = "none";
        } else if (taskRadio.checked) {
            eventOptions.style.display = "none";
            taskOptions.style.display = "block";
        }
    }

    eventRadio.addEventListener("change", updateVisibility);
    taskRadio.addEventListener("change", updateVisibility);
}

function setupTaskCreationFormControls() {
    let form = document.getElementById("addTask");

    //cancel button
    let cancel = document.getElementById("cancelTaskCreation");
    cancel.addEventListener("click", function() {
        form.reset();
        toggleTaskMenuVisibility();
        document.getElementById("addTaskButton").disabled = false;
    });

    //finish button
    let finish = document.getElementById("finishTaskCreation");
    finish.addEventListener("click", function() {
        generateNewTask();
        form.reset();
        document.getElementById("eventOptions").style.display = "none";
        document.getElementById("taskOptions").style.display = "none";
        toggleTaskMenuVisibility();
        document.getElementById("addTaskButton").disabled = false;
    })
}

//sets up the global array that holds items for each day
function setupDaysGlobal() {
    let numDays = new Date();
    numDays = new Date(numDays.getFullYear(), numDays.getMonth() + 1, 0).getDate();

    for (let i = 0; i < numDays; i++) {
        itemsForDays.push([]);
    }
}

function findDay() {
    let date = document.getElementById("taskBarHeaderDay").innerHTML;
    let dayRE = /\w+,\s\w+\s(\d{1,2}),/i;
    let day = date.match(dayRE);
    return day[1];
}

//function to build event/task
//this function will encode the task and append it to current tasks
//it will not change the styles or call toggleTaskMenuVisibility
//  this is due to the calling button (finishTaskCreation) calling
//      it once this function finishes creating the task
function generateNewTask() {
    let day = findDay() - 1;
    let form = document.getElementById("addTask");

    let eventButton = document.getElementById("eventSelectButton");
    let newItem;

    if (eventButton.checked) {
        let title, desc, location, startTime, endTime;
        title = form.elements.titleOfItem.value;
        desc = form.elements.descriptionOfItem.value;
        location = form.elements.eventLocation.value;
        startTime = form.elements.eventStartTime.value;
        endTime = form.elements.eventEndTime.value;

        newItem = new Event(title, desc, location, startTime, endTime);
    } else {
        let title, desc, priority, deadline;
        title = form.elements.titleOfItem.value;
        desc = form.elements.descriptionOfItem.value;
        priority = form.elements.taskPriority.value; //check this
        deadline = form.elements.taskDeadline.value;

        newItem = new Task(title, desc, priority, deadline);
    }

    itemsForDays[day].push(newItem);
    console.log(itemsForDays[day]);
}

//SHOULD BE DONE NOW ----
//working on making the data structures for the tasks/events
//there should be a day data structure that holds a list of tasks/events
//it should be in a list
//when a day is selected, the list[day] should be displayed in the div
//---- LEAVING FOR REFERENCE (REMOVE IF DETERMINED UNNEEDED)

//NOW NEED TO SHOW THE TASKS/EVENTS FOR THE SELECTED DAY
//IF NO TASKS, SAY NO TASKS with like a message or something

//ALSO, CHECK THAT REQUIRED FORM ELEMENTS PROHIBIT SUBMISSION UNTIL FILLED IN
// SPOILER: I DON'T THINK THEY DO THAT, SO THERE CAN BE NULL VALUES 