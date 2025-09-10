"use strict";

var selectedYear;
var selectedMonth;
var prevSelectedYear;
var prevSelectedMonth;
buildMonthYearSelection(); 

initializeCalendar();

function initializeCalendar() {
    buildCalendar();
    updateCalendarView();
}

function buildMonthYearSelection() {
    const monthSelect = document.getElementById("monthSelect");
    const monthNames = ["January", "February", "March", "April", "May", "June", 
        "July", "August", "September", "October", "November", "December"];
    
    monthNames.forEach((month, index) => {
        let option = document.createElement("option");
        option.value = index + 1;
        option.textContent = month;
        monthSelect.appendChild(option);
    });

    const yearSelect = document.getElementById("yearSelect");
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth();
    const future = currentYear + 5;
    const past = currentYear - 10;
    for (let i = future; i >= past; i--) {
        let option = document.createElement("option");
        option.value = i;
        option.textContent = i;
        yearSelect.appendChild(option);
    }

    yearSelect.value = currentYear;
    monthSelect.value = currentMonth + 1;
    selectedYear = yearSelect.value;
    selectedMonth = monthSelect.value - 1; //account for off by 1
    prevSelectedYear = selectedYear;
    prevSelectedMonth = selectedMonth;
}

document.getElementById("updateMonthYearButton").addEventListener("click", () => {
    const monthSelect = document.getElementById("monthSelect");
    const yearSelect = document.getElementById("yearSelect");
    
    //check for changes to month or year
    let change = false;
    if (selectedMonth != monthSelect.value - 1) {
        prevSelectedMonth = selectedMonth;
        selectedMonth = monthSelect.value - 1;
        change = true;
    }
    if (selectedYear != yearSelect.value) {
        prevSelectedYear = selectedYear;
        selectedYear = yearSelect.value;
        change = true;
    }

    if (change) {
        updateCalendarView();
    }
});

//this is the master function for building the calendar based on selected month/year, and also call the saving/querying functions in task.js
async function updateCalendarView() {
    document.getElementById("calendar").removeChild(document.getElementById("generatedCalendar"));
    loading(true);
    await masterChange();
    loading(false);
    buildCalendar();

    let numDaysInMonth = getDaysInMonth(selectedYear, selectedMonth);
    for (let i = 0; i < numDaysInMonth; i++) {
        displayItems(i + 1);
    }

    let today = new Date();
    if (today.getFullYear() == selectedYear && today.getMonth() == selectedMonth) {
        focusDay(today.getDate());
    } else {
        focusDay(1);
    }
}

function loading(toggle) {
    let loading = document.getElementById("loading");
    if (toggle) 
        loading.classList.remove("hidden");
    else 
        loading.classList.add("hidden");
}

function buildCalendar() {
    let calendar = document.getElementById("calendar");

    let today = new Date();

    let numDaysInMonth = getDaysInMonth(selectedYear, selectedMonth);

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

    let firstDay = new Date(selectedYear, selectedMonth, 1).getDay();  
    
    for (let i = 0; i < firstDay; i++) {
        let emptyCell = document.createElement("td");
        row.appendChild(emptyCell);
    }
    let currentDay = today;
    today = today.getDate();

    let currentMonthYear = currentDay.getFullYear() == selectedYear && currentDay.getMonth() == selectedMonth;

    for (let i = 1; i <= numDaysInMonth; i++) {
        let newDay = document.createElement("td");
        newDay.innerHTML = i;
        newDay.className = "calendarCell";
        newDay.id = "calendarDay" + i;
        newDay.addEventListener("click", function() {
            focusDay(i);
        });

        if (currentMonthYear && i === today) {
            newDay.classList.add("calendarCellActive");
            newDay.classList.add("activeDay");
            focusDay(i);
        }

        if (!currentMonthYear && i === 1) {
            newDay.classList.add("activeDay");
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

    //check to see if current day is visible on calendar
    if (currentMonthYear) {
        styleCurrentDay(today);
    }   
}

function getDaysInMonth(year, month) {
    return new Date(year, month + 1, 0).getDate();
}

//this function is called to add the blue circle to highlight the current day of the month
function styleCurrentDay(day) {
    let calDay = document.getElementById("calendarDay" + day);
    calDay.innerHTML = "";
    let dayDiv = document.createElement("div");
    dayDiv.innerHTML = day;
    dayDiv.className = "currentDayNumberStyle";
    calDay.appendChild(dayDiv);
}

//this function is called to add the styling for the day the user has selected (currently the black border to signify the user chose that day)
function styleActiveDay(day) {
    let calDay = document.getElementById("calendarDay" + day);
    let activeDay = document.querySelector(".activeDay");
    if (activeDay !== null)
        activeDay.classList.remove("activeDay");
    if (calDay !== null)
        calDay.classList.add("activeDay");
}

//this function is called to update the header for the item view on the right side and style the day (essentially the master function for updating the selected day)
function focusDay(day) {
    let header = document.getElementById("taskBarHeaderDay");
    let dateForHeader = new Date(selectedYear, selectedMonth, day);
    
    const options = {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
    };

    dateForHeader = dateForHeader.toLocaleDateString(navigator.language, options);
    header.innerHTML = dateForHeader; 

    styleActiveDay(day);
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

    if (active) {
        let editButton = document.createElement("button");
        editButton.className = "itemEditButton";
        editButton.onclick = function() {
            editItem(item.id);
        }
        editButton.innerHTML = "Edit";
        lowerRight.appendChild(editButton);
    }
    
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

function toggleDropdown() {
  document.getElementById("managementDropdown").classList.toggle("show");
}

document.addEventListener("click", function (e) {
  if (!e.target.closest("#managementDropdown")) {
    document.getElementById("managementDropdown").classList.remove("show");
  }
});

document.getElementById("logout").addEventListener("click", async function(e) {
  e.preventDefault();
  const { error } = await supabase.auth.signOut();
  if (!error) 
    window.location.href = "login.html";
});
