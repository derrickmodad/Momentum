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
let currentlyEditing = null;

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
        this.type = "task";
    }
}

class Event extends Item {
    constructor(title, desc, color, location, startTime, endTime) {
        super(title, desc, color);
        this.location = location;
        this.startTime = startTime;
        this.endTime = endTime;
        this.type = "event";
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
        toggleFormFields(taskCreationMenu, true);
        toggleFormFields(currentTasks, false);
    } else {
        currentTasks.style.display = "block";
        taskCreationMenu.style.display = "none";
        toggleFormFields(taskCreationMenu, false);
        toggleFormFields(currentTasks, true);
    }
}

function toggleFormFields(container, enable) {
    const fields = container.querySelectorAll("input, textarea, select, button");
    fields.forEach(function(i) {
        i.disabled = !enable;
    });
}

function setupItemType() {
    let eventRadio = document.getElementById("eventSelectButton");
    let taskRadio = document.getElementById("taskSelectButton");
    eventRadio.addEventListener("change", updateVisibility);
    taskRadio.addEventListener("change", updateVisibility);
}

function updateVisibility() {
    let eventRadio = document.getElementById("eventSelectButton");
    let taskRadio = document.getElementById("taskSelectButton");
    let eventOptions = document.getElementById("eventOptions");
    let taskOptions = document.getElementById("taskOptions");

    if (eventRadio.checked) {
        eventOptions.className = "subItemInfo";
        taskOptions.className = "hidden";
    } else if (taskRadio.checked) {
        eventOptions.className = "hidden";
        taskOptions.className = "subItemInfo";
    }
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
        currentlyEditing = null;
    });

    //finish button
    let finish = document.getElementById("finishTaskCreation");
    finish.addEventListener("click", function() {
        if (currentlyEditing !== null) {
            itemsForDays[currentlyEditing.day].splice(currentlyEditing.it, 1);
            currentlyEditing = null;
        }
        generateNewTask();
        form.reset();
        document.getElementById("eventOptions").className = "hidden";
        document.getElementById("taskOptions").className = "hidden";
        toggleTaskMenuVisibility();
        document.getElementById("addTaskButton").disabled = false;
        displayItems(findDay());
    });
}

//sets up the global array that holds items for each day
function setupDaysGlobal() {
    let numDays = new Date();
    numDays = new Date(numDays.getFullYear(), numDays.getMonth() + 1, 0).getDate();

    for (let i = 0; i < numDays; i++) {
        itemsForDays.push([]);
    }
}

//this will be used to load data from database into each day
function loadItems() {
    //itemsForDays[new Date().getDate() - 1] = new Event("Meeting", "Test Meeting", "red", "Test Location", BUILDING HERE)
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
    console.log(newItem.type);
    // console.log(itemsForDays[day]);
}

function editItem(it, day) {
    day -= 1;
    let item = itemsForDays[day][it]
    // console.log(itemsForDays[day][item]);
    toggleTaskMenuVisibility();
    sideLoadForm(item);
    currentlyEditing = {it, day};
}

function sideLoadForm(item) {
    let form = document.getElementById("addTask");
    form.elements.titleOfItem.value = item.title;
    form.elements.descriptionOfItem.value = item.desc;
    form.elements.itemColorOption.value = item.color;
    if (item.type === "event") {
        let eventButton = document.getElementById("eventSelectButton");
        eventButton.checked = true;
        updateVisibility();
        form.elements.eventLocation.value = item.location;
        form.elements.eventStartTime.value = item.startTime;
        form.elements.eventEndTime.value = item.endTime;
    } else {
        let taskButton = document.getElementById("taskSelectButton");
        taskButton.checked = true;
        updateVisibility();
        form.elements.taskPriority.value = item.priority; 
        form.elements.taskDeadline.value = item.deadline;
    }
function displayItems(day) {
    const currentTaksDiv = document.getElementById("currentTaks");

    let items = itemsForDays[day - 1].slice();
    items.sort((a, b) => {
        if (a.type == "event" && b.type == "event") {
            return new Date(a.startTime) - new Date(b.startTime);
        } else if (a.type == "task" && b.type == "task") {
            return new Date(a.deadline) - new Date(b.deadline);
        }
        return 0;
    });
    const maxItemsToShow = 5;
    let visibleItems = items.slice(0, maxItemsToShow);
    let remainingItems = items.length - maxItemsToShow;

    visibleItems.forEach((item) => {
        let itemDiv = document.createElement("div");
        itemDiv.className = "task-item";
        itemDiv.style.backgroundColor = item.color;
        itemDive.innerHTML = `
            <h3>${item.title}</h3>
            <p>${item.desc}</p>
            ${item.type == "task" ? `<p>Deadline: ${new Date(item.deadline).toLocaleString()}</p>` : ""}
            ${item.type == "event" ? `
                <p>Location: ${item.location}</p>
                <p>Start: ${new Date(item.startTime).toLocaleTimeString()}</p>
                <p>End: ${new Date(item.endTime).toLocaleTimeString}</p>
            ` : ""}
        `;
        currentTasksDiv.appendChild(itemDiv);
    });
    if (remainingItems > 0){
        let moreLabel = document.createElement("div");
        moreLabel.className = "task-item more-label";
        moreLabel.innerHTML = `+${remainingItems} more`;
        currentTasksDiv.appendChild(moreLabel);
    } 
}
