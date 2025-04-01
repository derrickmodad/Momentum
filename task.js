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
initTaskCreation();

function initTaskCreation() {
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
    cancel.addEventListener("click", function(e) {
        form.reset();
        toggleTaskMenuVisibility();
        document.getElementById("addTaskButton").disabled = false;
    });

    //finish button
    let finish = document.getElementById("finishTaskCreation");
    finish.addEventListener("click", function() {
        generateNewTask();
        toggleTaskMenuVisibility();
        document.getElementById("addTaskButton").disabled = false;
    })
}

function findDay() {
    let date = document.getElementById("taskBarHeaderDay").innerHTML;
    let dayRE = /\w+,\s\w+\s(\d{1,2}),/i;
    let day = date.match(dayRE);
    return day;
}

//function to build event/task
//this function will encode the task and append it to current tasks
//it will not change the styles or call toggleTaskMenuVisibility
//  this is due to the calling button (finishTaskCreation) calling
//      it once this function finishes creating the task
function generateNewTask() {
    let day = findDay();
    let form = document.getElementById("addTask");
}