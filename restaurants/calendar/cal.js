const calendarPlan = {}; // Use localStorage for persistence if you want
const today = new Date();
const calendarGrid = document.getElementById("calendar-grid");
const monthYearDisplay = document.getElementById("month-year");
const prevMonthBtn = document.getElementById("prev-month");
const nextMonthBtn = document.getElementById("next-month");

const dayDetail = document.getElementById("day-detail");
const detailDate = document.getElementById("detail-date");

const detailBreakfast = document.getElementById("detail-breakfast-location");
const detailLunch = document.getElementById("detail-lunch-location");
const detailDinner = document.getElementById("detail-dinner-location");

const detailSnackList = document.getElementById("detail-snack-list");
const detailAddSnackBtn = document.getElementById("detail-add-snack");

const detailPlannedLocation = document.getElementById(
  "detail-planned-location"
);

const detailSaveBtn = document.getElementById("detail-save");
const detailCloseBtn = document.getElementById("detail-close");

let currentYear, currentMonth; // month is 0-based
let selectedDateStr = null;

function formatDate(year, month, day) {
  // Format YYYY-MM-DD
  const mm = (month + 1).toString().padStart(2, "0");
  const dd = day.toString().padStart(2, "0");
  return `${year}-${mm}-${dd}`;
}

function loadMonth(year, month) {
  currentYear = year;
  currentMonth = month;
  monthYearDisplay.textContent = new Date(year, month).toLocaleString(
    "default",
    {
      month: "long",
      year: "numeric",
    }
  );

  calendarGrid.querySelectorAll(".day-cell").forEach((el) => el.remove());

  // First day of month and total days
  const firstDay = new Date(year, month, 1).getDay(); // 0 Sun ... 6 Sat
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Days in previous month to fill grid if firstDay != 0
  const prevMonthDays = new Date(year, month, 0).getDate();

  // Add blank days for previous month
  for (let i = 0; i < firstDay; i++) {
    const dayNum = prevMonthDays - firstDay + 1 + i;
    const blankCell = document.createElement("div");
    blankCell.classList.add("day-cell", "inactive");
    blankCell.textContent = dayNum;
    calendarGrid.appendChild(blankCell);
  }

  // Add days of current month
  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = formatDate(year, month, day);
    const dayCell = document.createElement("div");
    dayCell.classList.add("day-cell");
    dayCell.dataset.date = dateStr;
    if (
      day == today.getDate() &&
      month == today.getMonth() &&
      year == today.getFullYear()
    )
      dayCell.classList.add("today");
    const daytopbar = document.createElement("div");
    daytopbar.classList.add("day-top-bar");
    dayCell.appendChild(daytopbar);
    const dayNumber = document.createElement("div");
    dayNumber.classList.add("day-number");
    dayNumber.textContent = day;

    daytopbar.appendChild(dayNumber);

    // Show summary of plan if exists
    const plan = calendarPlan[dateStr];
    if (plan) {
      ["breakfast", "lunch", "dinner"].forEach((meal) => {
        if (plan.meals && plan.meals[meal] && plan.meals[meal].location) {
          const mealSummary = document.createElement("h3");
          mealSummary.classList.add("meal-summary");
          mealSummary.classList.add("fa-solid");

          switch (meal[0]) {
            case "b":
              mealSummary.classList.add("fa-bacon");
              break;
            case "l":
              mealSummary.classList.add("fa-burger");
              break;
            case "d":
              mealSummary.classList.add("fa-pizza-slice");
              break;
          }
          dayCell.appendChild(mealSummary);
        }
      });

      if (plan.plannedLocation) {
        const plannedSummary = document.createElement("div");
        plannedSummary.classList.add("planned-location-summary");

        plannedSummary.textContent = plan.plannedLocation;
        daytopbar.appendChild(plannedSummary);
      }
    }

    dayCell.addEventListener("click", () => openDayDetail(dateStr));
    calendarGrid.appendChild(dayCell);
  }
}

function openDayDetail(dateStr) {
  selectedDateStr = dateStr;
  detailDate.textContent = dateStr;

  const plan = calendarPlan[dateStr];
  if (plan) {
    detailBreakfast.value = plan.meals.breakfast.location || "";
    detailLunch.value = plan.meals.lunch.location || "";
    detailDinner.value = plan.meals.dinner.location || "";

    detailPlannedLocation.value = plan.plannedLocation || "";

    detailSnackList.innerHTML = "";
    plan.snacks.forEach(({ location, notes }) => {
      addSnackInput(location, notes);
    });
  } else {
    detailBreakfast.value = "";
    detailLunch.value = "";
    detailDinner.value = "";
    detailPlannedLocation.value = "";
    detailSnackList.innerHTML = "";
  }

  dayDetail.hidden = false;
  dayDetail.scrollIntoView({ behavior: "smooth" });
}

function addSnackInput(location = "", notes = "") {
  const div = document.createElement("div");
  div.classList.add("snack-input");

  const locInput = document.createElement("input");
  locInput.type = "text";
  locInput.placeholder = "Snack location";
  locInput.value = location;
  locInput.classList.add("snack-location");
  locInput.setAttribute("list", "restaurant-suggestions");

  const notesInput = document.createElement("input");
  notesInput.type = "text";
  notesInput.placeholder = "Notes (optional)";
  notesInput.value = notes;
  notesInput.classList.add("snack-notes");

  const removeBtn = document.createElement("button");
  removeBtn.type = "button";
  removeBtn.textContent = "X";
  removeBtn.addEventListener("click", () => div.remove());

  div.append(locInput, notesInput, removeBtn);
  detailSnackList.appendChild(div);
}

detailAddSnackBtn.addEventListener("click", () => addSnackInput());

detailSaveBtn.addEventListener("click", () => {
  if (!selectedDateStr) return alert("No date selected");

  calendarPlan[selectedDateStr] = {
    meals: {
      breakfast: { location: detailBreakfast.value.trim() },
      lunch: { location: detailLunch.value.trim() },
      dinner: { location: detailDinner.value.trim() },
    },
    snacks: [],
    plannedLocation: detailPlannedLocation.value.trim(),
  };

  detailSnackList.querySelectorAll(".snack-input").forEach((div) => {
    const location = div.querySelector(".snack-location").value.trim();
    const notes = div.querySelector(".snack-notes").value.trim();
    if (location)
      calendarPlan[selectedDateStr].snacks.push({ location, notes });
  });

  loadMonth(currentYear, currentMonth); // refresh calendar
  alert("Plan saved!");
  dayDetail.hidden = true;
});

detailCloseBtn.addEventListener("click", () => {
  dayDetail.hidden = true;
});

prevMonthBtn.addEventListener("click", () => {
  let newMonth = currentMonth - 1;
  let newYear = currentYear;
  if (newMonth < 0) {
    newMonth = 11;
    newYear--;
  }
  loadMonth(newYear, newMonth);
});

nextMonthBtn.addEventListener("click", () => {
  let newMonth = currentMonth + 1;
  let newYear = currentYear;
  if (newMonth > 11) {
    newMonth = 0;
    newYear++;
  }
  loadMonth(newYear, newMonth);
});
function populateRestaurantSuggestions() {
  const list = document.getElementById("restaurant-suggestions");
  list.innerHTML = "";

  let restaurantData = [];

  try {
    restaurantData = JSON.parse(localStorage.getItem("restaurantData")) || [];
  } catch (e) {
    console.warn("Invalid restaurantData format in localStorage");
  }

  restaurantData.forEach((entry) => {
    if (entry.datatype === "Restaurant" && entry.name) {
      const option = document.createElement("option");
      option.value = entry.name;
      list.appendChild(option);
    }
  });
  detailBreakfast.setAttribute("list", "restaurant-suggestions");
  detailLunch.setAttribute("list", "restaurant-suggestions");
  detailDinner.setAttribute("list", "restaurant-suggestions");
}

// Init with current month

loadMonth(today.getFullYear(), today.getMonth());
document.addEventListener("DOMContentLoaded", populateRestaurantSuggestions);
