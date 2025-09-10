"use strict";

let itemsForDays = [];
let completedItemsForDays = [];
let currentlyEditing = null;

class Item {
    constructor(title, desc, color) {
        this.title = title;
        this.desc = desc;
        this.color = color;
        this.id = generateID();
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

function generateID() {
    return Date.now();
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
    finish.addEventListener("click", async function() {
        if (currentlyEditing !== null) {
            itemsForDays[currentlyEditing.day].splice(currentlyEditing.index, 1);
            generateNewTask();
            currentlyEditing = null;
        } else {
            generateNewTask();
        }
        form.reset();
        document.getElementById("eventOptions").className = "hidden";
        document.getElementById("taskOptions").className = "hidden";
        toggleTaskMenuVisibility();
        document.getElementById("addTaskButton").disabled = false;

        await masterSave();

        displayItems(findDay());
    });
}

//sets up the global array that holds items for each day for initial current month year
function setupDaysGlobal() {
    let numDays = new Date();
    numDays = new Date(numDays.getFullYear(), numDays.getMonth() + 1, 0).getDate();

    for (let i = 0; i < numDays; i++) {
        itemsForDays.push([]);
        completedItemsForDays.push([]);
    }
}

//function for handling the change of the month/year in calendar.js
async function masterChange() {
    //load array with new month and year data
    await setupDaysGlobalParameterized(selectedMonth, selectedYear);
}

async function masterSave() {
    //save what is in the itemsForDays and completedItemsForDays arrays
    await saveItemArraysOnChange();
}

async function saveItemArraysOnChange() {
    const {data} = await supabase.auth.getUser();
    const user = data.user;

    let insert1 = packArray(itemsForDays, false, user);
    let insert2 = packArray(completedItemsForDays, true, user);
    let insertList = insert1.concat(insert2);

    if (insertList.length !== 0) {
        const { data, error } = await supabase.from('tasks').upsert(insertList);
        if (error) {
            console.log(error);
        }
    }
}

//used for when the month/year is changed
function packArray(arr, complete, user) {
    let insertList = [];
    for (let i = 0; i < arr.length; i++) {
        if (arr[i].length !== 0) {
            for (let it of arr[i]) {
                let itemOBJ = {};
                itemOBJ.user_id = user.id;
                itemOBJ.taskID = it.id; 
                itemOBJ.title = it.title; 
                itemOBJ.description = it.desc;
                itemOBJ.color = it.color;
                itemOBJ.type = it.type;
                if (it.type === "task") {
                    itemOBJ.priority = it.priority;
                    itemOBJ.deadline = it.deadline;
                } else {
                    itemOBJ.location = it.location;
                    itemOBJ.start_time = it.startTime;
                    itemOBJ.end_time = it.endTime;
                }
                itemOBJ.completed = complete;
                itemOBJ.year = selectedYear;
                itemOBJ.month = selectedMonth;
                itemOBJ.day = i;
                insertList.push(itemOBJ);
            }
        }
    }
    return insertList;
}

//parameterized version for setup of array for different months/years
async function setupDaysGlobalParameterized(month, year) {
    let numDays = new Date(year, month + 1, 0).getDate();
    itemsForDays = [];
    completedItemsForDays = [];

    for (let i = 0; i < numDays; i++) {
        let { data: tasks, error } = await supabase.from('tasks')
        .select()
        .eq('year', selectedYear)
        .eq('month', selectedMonth)
        .eq('day', i);
        if (tasks.length !== 0) {
            let [todo, completed] = unpackArray(tasks);
            itemsForDays.push(todo);
            completedItemsForDays.push(completed);
        } else {
            itemsForDays.push([]);
            completedItemsForDays.push([]);
        }
    }
}

function unpackArray(tasks) {
    let itemArray = [];
    let completedItemArray = [];
    for (let i = 0; i < tasks.length; i++) {
        let t = tasks[i];
        if (tasks[i].type === "task") {
            let task = new Task(t.title, t.description, t.color, t.priority, t.deadline);
            task.id = t.taskID;
            if (t.completed) {
                completedItemArray.push(task);
            } else {
                itemArray.push(task);
            }
        } else {
            let event = new Event(t.title, t.description, t.color, t.location, t.start_time, t.end_time);
            event.id = t.taskID;
            if (t.completed) {
                completedItemArray.push(event);
            } else {
                itemArray.push(event);
            }
        }
    }
    // console.log(itemArray);
    return [itemArray, completedItemArray];
}


function findDay() {
    let date = document.getElementById("taskBarHeaderDay").innerHTML;
    let dayRE = /\w+,\s\w+\s(\d{1,2}),/i;
    let day = date.match(dayRE);
    return day[1];
}

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

    if (currentlyEditing) {
        newItem.id = currentlyEditing.item.id;
    }

    itemsForDays[day].push(newItem);
    sortItems(day);
    console.log(newItem);
}

function editItem(itemID) {
    let day = findDay() - 1;
    let index;
    for (let i = 0; i < itemsForDays[day].length; i++) {
        if (itemsForDays[day][i].id === itemID) {
            index = i;
            break;
        }
    }
    let item = itemsForDays[day][index];
    document.getElementById("addTaskButton").disabled = true;
    toggleTaskMenuVisibility();
    sideLoadForm(item);
    currentlyEditing = {index, day, item};
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
}

async function completeItem(id) {
    //find item to be removed
    id = Number(id);
    let day = findDay();
    const items = itemsForDays[day - 1];
    let index = -1;
    for (let i = 0; i < items.length; i++) {
        if (items[i].id === id) {
            index = i;
            break;
        }
    }

    //if item found, add to completed and remove from itemsForDays
    if (index !== -1) {
        completedItemsForDays[day - 1].push(items[index]);
        itemsForDays[day - 1].splice(index, 1);
        await masterSave();
        displayItems(day);
    } else {
        console.log("could not find " + id + " in day " + day + "!");
    }
}

async function undoCompleteItem(id) {
    //find item to be removed
    id = Number(id);
    let day = findDay();
    const items = completedItemsForDays[day - 1];
    let index;
    for (let i = 0; i < items.length; i++) {
        if (items[i].id === id) {
            index = i;
            break;
        }
    }

    //if item found, add to itemsForDays and remove from completed
    if (index !== null) {
        itemsForDays[day - 1].push(items[index]);
        sortItems(day - 1);
        completedItemsForDays[day - 1].splice(index, 1);
        await masterSave();
        displayItems(day);
    } else {
        console.log("could not find " + id + " in day " + day + "!");
    }
}

function sortItems(day) {
    let itemsToSort = itemsForDays[day];

    itemsToSort.sort((a, b) => {
        let aTime, bTime;
        if (a.type == "event")
            aTime = timeToMinutes(a.startTime); 
        else  
            aTime = timeToMinutes(a.deadline);

        if (b.type == "event")
            bTime = timeToMinutes(b.startTime); 
        else  
            bTime = timeToMinutes(b.deadline);
        
        return aTime - bTime;
    });
}

function timeToMinutes(timeStr) {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
}
