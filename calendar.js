"use strict";

buildCalendar();

document.getElementById("addTaskButton").addEventListener("click", function() {
    let date = document.getElementById("taskBarHeaderDay").innerHTML;
    let dayRE = /\d{1,2}\/(\d{1,2})\//;
    let day = date.match(dayRE);
    
    //generateNewTask(day);
    //function to generate task and append it to given day
});

function buildCalendar() {
    let calendar = document.getElementById("calendar");
    let today = new Date();
    let numDaysInMonth = getDaysInMonth(today.getFullYear(), today.getMonth());
    
    let generatedCalendar = document.createElement("table");
    generatedCalendar.id = "generatedCalendar";

    let row = document.createElement("tr");

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
            newDay.style.backgroundColor = "rgb(94, 161, 255)";
            focusDay(-1);
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
    //let body = document.getElementById("taskBarBody");
    
    let dateForHeader = new Date();
    if (day !== -1) {
        dateForHeader = new Date(dateForHeader.getFullYear(), dateForHeader.getMonth(), day);
    }

    dateForHeader = dateForHeader.toLocaleDateString();
    header.innerHTML = dateForHeader; 
}