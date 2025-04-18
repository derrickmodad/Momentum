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
            console.log("DEBUG: " + newDay.id);
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
        inner.innerHTML = "No items for today";
        div.appendChild(inner);
        div.id = "itemsForDayInner";
        itemDiv.appendChild(div);
    } else {
        buildItemView(day);
        buildItemViewCalendar(day);
    }
}

function buildItemView(day) {
    let items = itemsForDays[day - 1];
    let mainItemDiv = document.getElementById("itemsForDay");
    for (let i = 0; i < items.length; i++) {
        
        //divs for structure
        let itemDiv = document.createElement("div");
        itemDiv.id = "item" + i;
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
        title.textContent = items[i].title;
        upperRight.appendChild(title);

        //add desc to bottom right
        let desc = document.createElement("p");
        desc.textContent = items[i].desc;
        lowerRight.appendChild(desc);

        let editButton = document.createElement("button");
        editButton.className = "itemEditButton";
        editButton.onclick = function() {
            editItem(i, day);
        }
        editButton.innerHTML = "Edit";
        lowerRight.appendChild(editButton);
        
        //give left div color
        //left.classList.add(items[i].color);
        left.style.backgroundColor = items[i].color;
        left.style.color = determineTextColor(items[i].color);
        let leftContent = document.createElement("div");
        leftContent.className = "leftContent";

        //hidden button for task completion
        let checkMarkButton = document.createElement("button");
        checkMarkButton.innerHTML = "<img src='images/checkMark.png' class='checkMark'/>";
        checkMarkButton.className = "checkMarkButton";
        let checkMarkButtonContainer = document.createElement("div");
        checkMarkButtonContainer.className = "checkMarkButtonContainer";
        checkMarkButtonContainer.appendChild(checkMarkButton);
        checkMarkButtonContainer.style.display = "none";
        left.appendChild(checkMarkButtonContainer);

        left.onmouseenter = function() {
            const content = this.querySelector('.leftContent'); // Find the content within THIS left div
            content.style.display = "none";

            const checkMark = this.querySelector('.checkMarkButtonContainer');
            checkMark.style.display = "block";
        };

        left.onmouseleave = function() {
            const content = this.querySelector('.leftContent'); // Find the content within THIS left div
            content.style.display = "block";

            const checkMark = this.querySelector('.checkMarkButtonContainer');
            checkMark.style.display = "none";
        };

        if (items[i].type == "task") {
            //priority, deadline
            
            //add priority to upperRight div
            let prio = document.createElement("p");
            prio.textContent = "Priority: " + items[i].priority;
            upperRight.appendChild(prio);

            //add image to left div
            // let taskImg = document.createElement("img");
            // taskImg.src = "images/taskImage.png";
            // taskImg.className = "itemImgScaleDown";
            // left.appendChild(taskImg);

            //add deadline to left div
            let deadline = document.createElement("p");
            deadline.textContent = "Deadline: " + items[i].deadline;
            leftContent.appendChild(deadline);
        } else {
            //location, startTime, endTime

            //add location to upperRight div
            let location = document.createElement("p");
            location.textContent = items[i].location;
            upperRight.appendChild(location);

            //add start to left div
            let start = document.createElement("p");
            start.textContent = "Start: " + items[i].startTime;
            leftContent.appendChild(start);

            //add image to left div
            // let eventImg = document.createElement("img");
            // eventImg.src = "images/eventImage.png";
            // eventImg.className = "itemImgScaleDown";
            // left.appendChild(eventImg);

            //add end to left div
            let end = document.createElement("p");
            end.textContent = "End: " + items[i].endTime;
            leftContent.appendChild(end);
        }

        //build the item
        right.appendChild(upperRight);
        right.appendChild(lowerRight);
        left.appendChild(leftContent);
        itemDiv.appendChild(left);
        itemDiv.appendChild(right);
        mainItemDiv.appendChild(itemDiv);
    }
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
            title.innerHTML = "+ " + remainingItems + " Items";
            item.appendChild(title);
            item.style.backgroundColor = "gray";
            item.style.color = determineTextColor("gray");
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
            return "black";
            break;
        case "orange":
            return "black";
            break;
        case "yellow":
            return "black";
            break;
        case "green":
            return "white";
            break;
        case "blue":
            return "white";
            break;
        case "purple":
            return "white";
            break;
        case "gray":
            return "black";
            break;
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