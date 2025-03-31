"use strict";

document.getElementById("addTaskButton").addEventListener("click", function() {
    let date = document.getElementById("taskBarHeaderDay").innerHTML;
    let dayRE = /\w+,\s\w+\s(\d{1,2}),/i;
    let day = date.match(dayRE);
    //console.log(day[1]);
    
    generateNewTask(day);
    //function to generate task and append it to given day
});

function generateNewTask(day) {
    //get the taskbar
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

    let taskBarBody = document.getElementById("taskBarBody");

}