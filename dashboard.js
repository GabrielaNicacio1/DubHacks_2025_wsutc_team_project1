// dashboard.js (hybrid tab-isolated version)

const tabId = sessionStorage.getItem("tabId");
function getData(key) {
  return JSON.parse(localStorage.getItem(`${tabId}_${key}`) || "null");
}
function setData(key, value) {
  localStorage.setItem(`${tabId}_${key}`, JSON.stringify(value));
}

const currentUser = getData("currentUser");
const dashboard = document.getElementById("dashboard");

function loadDashboard() {
  const groups = getData("groups") || [];
  dashboard.innerHTML = `<h2>${currentUser}'s Groups</h2>`;

  const userGroups = groups.filter(g => g.members.includes(currentUser));
  if (userGroups.length === 0) {
    dashboard.innerHTML += `<p>You are not in any groups yet.</p>`;
    return;
  }

  userGroups.forEach(group => {
    const div = document.createElement("div");
    div.className = "group-card";
    const memberList = group.members.map(m => `<li>${m}</li>`).join("");
    div.innerHTML = `
      <h3>${group.name}</h3>
      <p><strong>Code:</strong> ${group.code}</p>
      <p><strong>Members:</strong></p>
      <ul class="member-list">${memberList}</ul>
      <button onclick="enterGroup('${group.code}')">Enter Group</button>
      <button onclick="leaveGroup('${group.code}')">Leave Group</button>
    `;
    dashboard.appendChild(div);
  });
}

function enterGroup(code) {
  setData("currentGroup", code);
  window.location.href = "group.html";
}

function leaveGroup(code) {
  let groups = getData("groups") || [];
  const group = groups.find(g => g.code === code);
  if (!group) return;

  group.members = group.members.filter(m => m !== currentUser);
  if (group.members.length === 0) {
    groups = groups.filter(g => g.code !== code);
  }
  setData("groups", groups);
  loadDashboard();
}

loadDashboard();
