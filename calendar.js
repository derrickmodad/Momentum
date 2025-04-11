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
}

function getDaysInMonth(year, month) {
    return new Date(year, month + 1, 0).getDate();
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
    }
}

function buildItemView(day) {
    let items = itemsForDays[day - 1];
    let mainItemDiv = document.getElementById("itemsForDay");
    for (let i = 0; i < items.length; i++) {
        let itemDiv = document.createElement("div");
        itemDiv.id = "item" + i;
        itemDiv.className = "item";
        
        // itemDiv.innerHTML += items[i].title;
        let item = document.createElement("h3");
        item.innerHTML = items[i].title;
        itemDiv.appendChild(item);

        // itemDiv.innerHTML += items[i].desc;
        item = document.createElement("p");
        item.innerHTML = items[i].desc;
        itemDiv.appendChild(item);
        
        
        // itemDiv.innerHTML += items[i].color;
        itemDiv.classList.add(items[i].color);

        if (items[i].type == "task") {
            //priority, deadline
            // itemDiv.innerHTML += items[i].priority;
            item = document.createElement("p");
            item.innerHTML = "Priority: " + items[i].priority;
            itemDiv.appendChild(item);

            // itemDiv.innerHTML += items[i].deadline;
            item = document.createElement("p");
            item.innerHTML = "Deadline: " + items[i].deadline;
            itemDiv.appendChild(item);
        } else {
            //location, startTime, endTime
            // itemDiv.innerHTML += items[i].location;
            item = document.createElement("p");
            item.innerHTML = items[i].location;
            itemDiv.appendChild(item);

            // itemDiv.innerHTML += items[i].startTime;
            item = document.createElement("p");
            item.innerHTML = "Start: " + items[i].startTime;
            itemDiv.appendChild(item);

            // itemDiv.innerHTML += items[i].endTime;
            item = document.createElement("p");
            item.innerHTML = "End: " + items[i].endTime;
            itemDiv.appendChild(item);
        }
        mainItemDiv.appendChild(itemDiv);
    }
}

/*

--------------
|  |         |
|  |         |
--------------

div structure? color on left, info about item on right
*/