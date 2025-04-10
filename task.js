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
    constructor(title, desc, color) {
        this.title = title;
        this.desc = desc;
        this.color = color
    }
}

class Task extends Item {
    constructor(title, desc, color, priority, deadline) {
        super(title, desc, color);
        this.priority = priority;
        this.deadline = deadline;
    }
}

class Event extends Item {
    constructor(title, desc, color, location, startTime, endTime) {
        super(title, desc, color);
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
            eventOptions.className = "subItemInfo";
            taskOptions.className = "hidden";
        } else if (taskRadio.checked) {
            eventOptions.className = "hidden";
            taskOptions.className = "subItemInfo";
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
        document.getElementById("eventOptions").className = "hidden";
        document.getElementById("taskOptions").className = "hidden";
        toggleTaskMenuVisibility();
        document.getElementById("addTaskButton").disabled = false;
    });

    //finish button
    let finish = document.getElementById("finishTaskCreation");
    finish.addEventListener("click", function() {
        generateNewTask();
        form.reset();
        document.getElementById("eventOptions").className = "hidden";
        document.getElementById("taskOptions").className = "hidden";
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

    let title, desc, color;
    title = form.elements.titleOfItem.value;
    desc = form.elements.descriptionOfItem.value;
    color = form.elements.itemColorOption.value;

    if (eventButton.checked) {
        let location, startTime, endTime;
        location = form.elements.eventLocation.value;
        startTime = form.elements.eventStartTime.value;
        endTime = form.elements.eventEndTime.value;
        newItem = new Event(title, desc, color, location, startTime, endTime);
    } else {
        let priority, deadline;
        priority = form.elements.taskPriority.value; //check this
        deadline = form.elements.taskDeadline.value;
        newItem = new Task(title, desc, color, priority, deadline);
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

//-------------
//TO DO:

//STYLE THE TASK CREATION MENU
//--update: getting closer, just got the layout for the event and task submenus
//              did notice that the priority is off by a few pixels on the task side
//              i dont know if this matters, the priority menu might change later if i can come up with a custom radio button

//ADD RECURRING TO EVENTS/TASKS

//NOW NEED TO SHOW THE TASKS/EVENTS FOR THE SELECTED DAY
//IF NO TASKS, SAY NO TASKS with like a message or something

//SHOW TASKS/EVENTS ON CALENDAR

//ALSO, CHECK THAT REQUIRED FORM ELEMENTS PROHIBIT SUBMISSION UNTIL FILLED IN
// SPOILER: I DON'T THINK THEY DO THAT, SO THERE CAN BE NULL VALUES 

//weird bug in itemCreation that says non visible elements should be filled in
//like task elements shouldnt be null when making an event item

//DROP DOWN BUTTONS FOR VIEW, MONTH, YEAR
// this is next to calendar so user can change to like a weekly (or even daily) view, and can change the month/year

//------------

//BACKBURNER:

//uh, add color options to the event/task creation menu
// like, user can set color to easily identify what the item is for
//--update: so got the selection list, but it seems hard to style
//  will have to look into later
//  
//--update: i think that instead of selection list, customized radio buttons could be used instead 

//------------