"use strict";

buildCalendar();

function buildCalendar() {
    let calendar = document.getElementById("calendar");
    let today = new Date();
    let numDaysInMonth = getDaysInMonth(today.getFullYear(), today.getMonth());
    let generatedCalendar = document.createElement("table");
    generatedCalendar.id = "generatedCalendar";

    let row = document.createElement("tr");
    let days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    for (let day of days) {
        let header = document.createElement("td");
        header.innerHTML = day;
        row.appendChild(header);
    }
    generatedCalendar.appendChild(row);
    
    row = document.createElement("tr");

    let firstDay = new Date(today.getFullYear(), today.getMonth(), 1).getDay();  
    
    for (let i = 0; i < firstDay; i++) {
        let emptyCell = document.createElement("td");
        row.appendChild(emptyCell);
    }
    
    today = today.getDate();
    for (let i = 1; i <= numDaysInMonth; i++) {
        let newDay = document.createElement("td");
        newDay.innerHTML = i;
        newDay.className = "calendarCell";
        newDay.id = "calendarDay" + i;
        newDay.addEventListener("click", function() {
            focusDay(i);
        });

        if (i === today) {
            newDay.classList.add("calendarCellActive");
            focusDay(i);
        }

        row.appendChild(newDay);

        if ((firstDay + i - 1) % 7 === 6) {
            generatedCalendar.appendChild(row);
            row = document.createElement("tr");
        }
    }

    if (row.children.length > 0) {
        generatedCalendar.appendChild(row);
    }

    calendar.appendChild(generatedCalendar);
    styleCurrentDay(today);
}

function getDaysInMonth(year, month) {
    return new Date(year, month + 1, 0).getDate();
}

function styleCurrentDay(day) {
    let calDay = document.getElementById("calendarDay" + day);
    calDay.innerHTML = "";
    let dayDiv = document.createElement("div");
    dayDiv.innerHTML = day;
    dayDiv.className = "currentDayNumberStyle";
    calDay.appendChild(dayDiv);
}

function focusDay(day) {
    let header = document.getElementById("taskBarHeaderDay");
    let dateForHeader = new Date();
    dateForHeader = new Date(dateForHeader.getFullYear(), dateForHeader.getMonth(), day);
    
    const options = {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
    };

    dateForHeader = dateForHeader.toLocaleDateString(navigator.language, options);
    header.innerHTML = dateForHeader; 

    displayItems(day);
}

function displayItems(day) {
    let itemDiv = document.getElementById("itemsForDay");
    if (itemDiv.childElementCount !== 0) {
        itemDiv.innerHTML = "";
    }
    if (itemsForDays[day - 1].length === 0) {
        let div = document.createElement("div");
        let inner = document.createElement("h3");
        inner.innerHTML = "No upcoming items";
        div.appendChild(inner);
        div.id = "itemsForDayInner";
        itemDiv.appendChild(div);
    }
    buildItemView(day);
    if (document.getElementById("calendarDay" + day) !== null)
        buildItemViewCalendar(day);
}

function buildItemView(day) {
    let activeItems = itemsForDays[day - 1];
    let completedItems = completedItemsForDays[day - 1];
    let mainItemDiv = document.getElementById("itemsForDay");
    let completedItemDiv = document.getElementById("completedItemsForDay");

    for (let i = 0; i < activeItems.length; i++) {
        let curr = buildItem(activeItems[i], true);
        mainItemDiv.appendChild(curr);
    }

    if (completedItems.length > 0) {
        completedItemDiv.style.display = "block";
        completedItemDiv.innerHTML = "";
        let header = document.createElement("h2");
        header.textContent = "Completed";
        completedItemDiv.appendChild(header);
    } else {
        completedItemDiv.style.display = "none";
        completedItemDiv.innerHTML = "";
    }

    for (let i = 0; i < completedItems.length; i++) {
        let curr = buildItem(completedItems[i], false);
        completedItemDiv.appendChild(curr);
    }
}

function buildItem(item, active) {
    let itemDiv = document.createElement("div");
    itemDiv.id = item.id;
    itemDiv.className = "itemDiv";

    let left = document.createElement("div");
    left.className = "itemDivLeft";

    let right = document.createElement("div");
    right.className = "itemDivRight";

    let upperRight = document.createElement("div");
    upperRight.className = "itemDivRightUpperRight";

    let lowerRight = document.createElement("div");
    lowerRight.className = "itemDivRightLowerRight";
    
    //add title to upperRight div
    let title = document.createElement("h3");
    title.textContent = item.title;
    upperRight.appendChild(title);

    //add desc to bottom right
    let desc = document.createElement("p");
    desc.textContent = item.desc;
    lowerRight.appendChild(desc);

    let editButton = document.createElement("button");
    editButton.className = "itemEditButton";
    editButton.onclick = function() {
        editItem(i, day);
    }
    editButton.innerHTML = "Edit";
    lowerRight.appendChild(editButton);
    
    //give left div color
    if (active) {
        left.style.backgroundColor = item.color;
        left.style.color = determineTextColor(item.color);
    } else {
        left.style.backgroundColor = determineBackGroundColor(item.color);
        left.style.color = "black";
    }
    let leftContent = document.createElement("div");
    leftContent.className = "leftContent";

    //hidden button for task action
    let actionButton = document.createElement("button");
    let actionButtonContainer = document.createElement("div");
    if (active) {
        actionButton.innerHTML = "<img src='images/checkMark.png' class='actionButton'/>";
        actionButton.className = "checkMarkButton";
        actionButton.onclick = function() {
            completeItem(itemDiv.id);
        };
        actionButtonContainer.className = "actionButtonContainer";
        actionButtonContainer.appendChild(actionButton);
        actionButtonContainer.style.display = "none";
    } else {
        actionButton.innerHTML = "<img src='images/undoArrow.png' class='actionButton'/>";
        actionButton.className = "undoArrowButton";
        actionButton.onclick = function() {
            undoCompleteItem(itemDiv.id);
        };
        actionButtonContainer.className = "actionButtonContainer";
        actionButtonContainer.style.backgroundColor = "rgb(85, 85, 85)";
        actionButtonContainer.appendChild(actionButton);
        actionButtonContainer.style.display = "none";
    }
    left.appendChild(actionButtonContainer);

    left.onmouseenter = function() {
        const content = this.querySelector('.leftContent');
        content.style.display = "none";

        const checkMark = this.querySelector('.actionButtonContainer');
        checkMark.style.display = "block";
    };

    left.onmouseleave = function() {
        const content = this.querySelector('.leftContent');
        content.style.display = "flex";

        const checkMark = this.querySelector('.actionButtonContainer');
        checkMark.style.display = "none";
    };

    //build pill with item type
    let pill = document.createElement("div");
    let pillText = document.createElement("p");
    pillText.textContent = item.type[0].toUpperCase() + item.type.slice(1);
    pill.appendChild(pillText);
    pill.className = "itemTypePill";
    pillText.className = "itemTypePillText";

    //add task pill to left div
    leftContent.appendChild(pill);

    if (item.type == "task") {
        //priority, deadline
        
        //add priority to upperRight div
        let prio = document.createElement("p");
        prio.textContent = "Priority: " + item.priority;
        upperRight.appendChild(prio);

        //add deadline to left div
        let deadline = document.createElement("p");
        deadline.textContent = "Deadline: " + item.deadline;
        leftContent.appendChild(deadline);
    } else {
        //location, startTime, endTime

        //add location to upperRight div
        let location = document.createElement("p");
        location.textContent = item.location;
        upperRight.appendChild(location);

        //add start to left div
        let start = document.createElement("p");
        start.textContent = "Start: " + item.startTime;
        leftContent.appendChild(start);

        //add end to left div
        let end = document.createElement("p");
        end.textContent = "End: " + item.endTime;
        leftContent.appendChild(end);
    }

    //build the item
    right.appendChild(upperRight);
    right.appendChild(lowerRight);
    left.appendChild(leftContent);
    itemDiv.appendChild(left);
    itemDiv.appendChild(right);
    return itemDiv;
}

function buildItemViewCalendar(day) {
    let calDay = document.getElementById("calendarDay" + day);
    let items = itemsForDays[day - 1];

    calDay.innerHTML = "";
    calDay.innerHTML = day;

    //if calendar cell is current day
    if (calDay.classList.contains("calendarCellActive")) {
        styleCurrentDay(day);
    }

    const maxItemsToShow = 5;
    let remainingItems = items.length - maxItemsToShow + 1;
    
    let outerDiv = document.createElement("div");
    outerDiv.className = "calendarItemGroup";
    let counter = 1;
    for (let i = 0; i < items.length; i++) {
        if (counter === maxItemsToShow) {
            let item = document.createElement("div");
            let title = document.createElement("p");
            title.innerHTML = "+ " + remainingItems + " Item" + (remainingItems === 1 ? "" : "s");
            item.appendChild(title);
            item.style.backgroundColor = "black";
            item.style.color = "white";
            item.style.fontWeight = "bold";
            item.className = "calendarItem";
            outerDiv.appendChild(item);
            break;
        } else {
            let item = document.createElement("div");
            let title = document.createElement("p");
            title.innerHTML = items[i].title;
            item.appendChild(title);
            item.style.backgroundColor = items[i].color;
            item.style.color = determineTextColor(items[i].color);
            item.className = "calendarItem";
            outerDiv.appendChild(item);
            counter++;
        }
    }

    calDay.appendChild(outerDiv);
}

function determineTextColor(bgc) {
    switch (bgc) {
        case "red":
            return "white";
        case "orange":
            return "black";
        case "yellow":
            return "black";
        case "green":
            return "white";
        case "blue":
            return "white";
        case "purple":
            return "white";
        case "gray":
            return "black";
    }
}

function determineBackGroundColor(bgc) {
    switch (bgc) {
        case "red":
            return "lightcoral";
        case "orange":
            return "lightsalmon";
        case "yellow":
            return "lightyellow";
        case "green":
            return "lightgreen";
        case "blue":
            return "lightblue";
        case "purple":
            return "plum";
        case "gray":
            return "lightgray";
    }
}

/*

--------------
|  |         |
|  |         |
--------------

div structure? color on left, info about item on right

structure for items:

div id='itemDiv'
    div id='left' color=passed color from form
        p id='start'
        p id='end/deadline'
    div id='right'
        div id='upper'
            h3 id='title'
            p id='location/priority'
        div id='lower'
            p id='desc'
*/