const code = localStorage.getItem("currentGroup");
const username = localStorage.getItem("username");
const groupNameElem = document.getElementById("group-name");
const progressBar = document.getElementById("progress-bar");
const taskList = document.getElementById("task-list");

groupNameElem.textContent = `Group ${code}`;

// Load group data or initialize
let groupData = JSON.parse(localStorage.getItem("group_" + code) || "{}");
if (!groupData.tasks) groupData.tasks = [];
if (!groupData.members) groupData.members = {};
if (!groupData.members[username]) groupData.members[username] = { completedTasks: [] };

saveGroupData();
renderTasks();
updateProgress();

// Navigation
document.getElementById("back-btn").addEventListener("click", () => {
  window.location.href = "index.html";
});

document.getElementById("leave-btn").addEventListener("click", () => {
  localStorage.removeItem("currentGroup");
  window.location.href = "index.html";
});

// Task form controls
const addBtn = document.getElementById("add-task-btn");
const form = document.getElementById("task-form");
const saveBtn = document.getElementById("save-task-btn");
const cancelBtn = document.getElementById("cancel-task-btn");

addBtn.addEventListener("click", () => form.style.display = "block");
cancelBtn.addEventListener("click", () => form.style.display = "none");

saveBtn.addEventListener("click", () => {
  const name = document.getElementById("task-name").value.trim();
  const due = document.getElementById("task-due").value;
  const points = parseInt(document.getElementById("task-points").value) || 0;

  if (!name || !due || !points) return alert("Please fill out all fields!");

  groupData.tasks.push({ name, due, points });
  saveGroupData();
  renderTasks();

  // Reset form
  document.getElementById("task-name").value = "";
  document.getElementById("task-due").value = "";
  document.getElementById("task-points").value = "";
  form.style.display = "none";
});

function renderTasks() {
  taskList.innerHTML = "";
  if (groupData.tasks.length === 0) {
    taskList.innerHTML = "<p>No tasks yet.</p>";
    return;
  }

  groupData.tasks.forEach((t, i) => {
    const div = document.createElement("div");
    const completed = groupData.members[username].completedTasks.includes(i);
    div.classList.add("task-item");
    div.innerHTML = `
      <b>${t.name}</b> (${t.points} pts) - Due: ${t.due}
      <button ${completed ? "disabled" : ""} onclick="completeTask(${i})">
        ${completed ? "✅ Done" : "Mark Complete"}
      </button>
    `;
    taskList.appendChild(div);
  });
}

window.completeTask = function (index) {
  const member = groupData.members[username];
  if (!member.completedTasks.includes(index)) {
    member.completedTasks.push(index);
    saveGroupData();
    renderTasks();
    updateProgress();
  }
};

function updateProgress() {
  const allPoints = groupData.tasks.reduce((sum, t) => sum + t.points, 0);
  const completedPoints = Object.values(groupData.members)
    .flatMap(m => m.completedTasks)
    .reduce((sum, i) => sum + (groupData.tasks[i]?.points || 0), 0);
  const percent = allPoints ? (completedPoints / allPoints) * 100 : 0;
  progressBar.style.width = percent + "%";

  // 🐣 Update pet evolution
  updatePet();
}

function saveGroupData() {
  localStorage.setItem("group_" + code, JSON.stringify(groupData));
}


function updatePet() {
  // Calculate user's personal points (based on tasks completed)
  const member = groupData.members[username];
  let points = member.completedTasks
    .reduce((sum, i) => sum + (groupData.tasks[i]?.points || 0), 0);

  const pet = document.getElementById("pet");
  const petStage = document.getElementById("pet-stage");

  let stage = "";
  let image = "";

  if (points < 10) {
    stage = "Egg";
    image = "https://upload.wikimedia.org/wikipedia/commons/9/9b/Cartoon_egg.png";
  } else if (points < 20) {
    stage = "Hatched";
    image = "https://upload.wikimedia.org/wikipedia/commons/2/28/Chick_hatching_from_egg_cartoon.png";
  } else if (points < 35) {
    stage = "Baby";
    image = "https://upload.wikimedia.org/wikipedia/commons/3/3a/Cute_Baby_Chick.png";
  } else if (points < 50) {
    stage = "Teen";
    image = "https://upload.wikimedia.org/wikipedia/commons/6/6e/Cartoon_dog.png";
  } else {
    stage = "Adult";
    image = "https://upload.wikimedia.org/wikipedia/commons/2/23/Cartoon_Dragon.png";
  }

  pet.src = image;
  petStage.textContent = `Stage: ${stage}`;
}
