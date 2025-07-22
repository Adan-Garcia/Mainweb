let totalMeals = 0;
let totalSnacks = 0;
const people = [];

function saveState() {
  const state = {
    totalMeals,
    totalSnacks,
    people,
  };
  localStorage.setItem("creditData", JSON.stringify(state));
}

function loadState() {
  const json = localStorage.getItem("creditData");
  if (!json) return null;
  try {
    return JSON.parse(json);
  } catch {
    return null;
  }
}

function clearState() {
  localStorage.removeItem("creditData");
  document.getElementById("setupView").hidden = false;
  document.getElementById("personManager").hidden = true;
  document.getElementById("resetButton").hidden = true;
  location.reload();
}

function renderCards() {
  const container = document.getElementById("personCards");
  container.innerHTML = "";

  people.forEach((person, index) => {
    const card = document.createElement("div");
    card.className = "person-card";

    card.innerHTML = `
      <input class="person-name" value="${person.name}" data-index="${index}" id="${index}" />
      <div class="credit-col-container">
        <div class="credit-col">
          <span>Meals: ${person.meals}</span>
          <button class="btn" data-type="meal" data-action="add" data-index="${index}">+</button>
          <button class="btn" data-type="meal" data-action="sub" data-index="${index}">–</button>
        </div>
        <div class="credit-col">
          <span>Snacks: ${person.snacks}</span>
          <button class="btn" data-type="snack" data-action="add" data-index="${index}">+</button>
          <button class="btn" data-type="snack" data-action="sub" data-index="${index}">–</button>
        </div>
      </div>
    `;
    container.appendChild(card);
  });

  container.querySelectorAll(".btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const index = parseInt(btn.dataset.index, 10);
      const type = btn.dataset.type;
      const action = btn.dataset.action;
      const person = people[index];

      if (type === "meal") {
        const totalUsed = people.reduce((sum, p) => sum + p.meals, 0);
        if (action === "add" && totalUsed < totalMeals) {
          person.meals++;
        } else if (action === "sub" && person.meals > 0) {
          person.meals--;
        }
      } else if (type === "snack") {
        const totalUsed = people.reduce((sum, p) => sum + p.snacks, 0);
        if (action === "add" && totalUsed < totalSnacks) {
          person.snacks++;
        } else if (action === "sub" && person.snacks > 0) {
          person.snacks--;
        }
      }
      saveState();
      renderCards();
    });
  });

  container.querySelectorAll(".person-name").forEach((input) => {
    input.addEventListener("input", (e) => {
      const index = parseInt(e.target.dataset.index, 10);
      people[index].name = e.target.value;
      saveState();
    });
  });
}

function setupApp(fromSavedState = false) {
  if (fromSavedState) {
    const saved = loadState();
    if (!saved) return;
    totalMeals = saved.totalMeals;
    totalSnacks = saved.totalSnacks;
    people.splice(0, people.length, ...saved.people);
  }

  document.getElementById("setupView").hidden = true;
  document.getElementById("personManager").hidden = false;
  document.getElementById("resetButton").hidden = false;
  renderCards();
}

document.getElementById("startButton").addEventListener("click", () => {
  const numPeople = parseInt(document.getElementById("numPeople").value, 10);
  totalMeals = parseInt(document.getElementById("totalMeals").value, 10);
  totalSnacks = parseInt(document.getElementById("totalSnacks").value, 10);

  if (isNaN(numPeople) || numPeople <= 0)
    return alert("Enter valid number of people");
  if (isNaN(totalMeals) || isNaN(totalSnacks))
    return alert("Enter valid credits");

  const baseMeal = Math.floor(totalMeals / numPeople);
  const baseSnack = Math.floor(totalSnacks / numPeople);

  for (let i = 0; i < numPeople; i++) {
    people.push({
      name: `Person ${i + 1}`,
      meals: baseMeal,
      snacks: baseSnack,
    });
  }

  saveState();
  setupApp();
});

document.getElementById("resetButton").addEventListener("click", clearState);

// Auto-start if saved state exists
window.addEventListener("DOMContentLoaded", () => {
  const saved = loadState();
  if (saved) setupApp(true);
});
