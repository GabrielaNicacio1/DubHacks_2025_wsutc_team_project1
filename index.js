// index.js (hybrid per-tab version)

// === TAB ISOLATION SETUP ===
if (!sessionStorage.getItem("tabId")) {
  const id = Math.random().toString(36).substring(2, 10);
  sessionStorage.setItem("tabId", id);
}
const tabId = sessionStorage.getItem("tabId");

// === Helper Functions for Tab-Scoped Storage ===
function setData(key, value) {
  localStorage.setItem(`${tabId}_${key}`, JSON.stringify(value));
}
function getData(key) {
  return JSON.parse(localStorage.getItem(`${tabId}_${key}`) || "null");
}
function removeData(key) {
  localStorage.removeItem(`${tabId}_${key}`);
}

// === UI SETUP ===
function generateGroupCode() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  return Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

window.addEventListener("DOMContentLoaded", () => {
  const currentUser = getData("currentUser");
  const profileSection = document.getElementById("profile-section");
  const createProfile = document.getElementById("create-profile-section");
  const createGroup = document.getElementById("create-group-section");
  const joinGroup = document.getElementById("join-group-section");

  if (currentUser) {
    createProfile.style.display = "none";
    profileSection.style.display = "block";
    createGroup.style.display = "block";
    joinGroup.style.display = "block";
    document.getElementById("profile-username").textContent = currentUser;
  } else {
    createProfile.style.display = "block";
    profileSection.style.display = "none";
    createGroup.style.display = "none";
    joinGroup.style.display = "none";
  }
});

// === CREATE PROFILE ===
document.getElementById("createProfileBtn").addEventListener("click", () => {
  const username = document.getElementById("newUsernameInput").value.trim();
  if (!username) return alert("Please enter a username.");
  setData("currentUser", username);
  alert(`Welcome, ${username}!`);
  location.reload();
});

// === LOGOUT ===
document.getElementById("logoutBtn").addEventListener("click", () => {
  if (confirm("Log out and clear this tab's data?")) {
    const prefix = tabId + "_";
    Object.keys(localStorage).forEach(k => {
      if (k.startsWith(prefix)) localStorage.removeItem(k);
    });
    removeData("currentUser");
    removeData("currentGroup");
    location.reload();
  }
});

// === DASHBOARD ===
document.getElementById("toDashboardBtn").addEventListener("click", () => {
  window.location.href = "dashboard.html";
});

// === CREATE GROUP ===
document.getElementById("createGroupBtn").addEventListener("click", () => {
  const username = getData("currentUser");
  const groupName = document.getElementById("groupNameInput").value.trim();
  if (!groupName) return alert("Please enter a group name.");

  const groupCode = generateGroupCode();
  const newGroup = { name: groupName, code: groupCode, admin: username, members: [username] };

  let groups = getData("groups") || [];
  groups.push(newGroup);
  setData("groups", groups);

  // Create leaderboard
  const leaderboardKey = `${tabId}_leaderboard_group_${groupCode}`;
  localStorage.setItem(leaderboardKey, JSON.stringify([{ name: username, points: 0, proofs: [] }]));

  setData("currentGroup", groupCode);
  alert(`Group "${groupName}" created! Code: ${groupCode}`);
  window.location.href = "dashboard.html";
});

// === JOIN GROUP ===
document.getElementById("joinGroupBtn").addEventListener("click", () => {
  const username = getData("currentUser");
  const code = document.getElementById("groupCodeInput").value.trim().toUpperCase();
  if (!code) return alert("Please enter a group code.");

  let groups = getData("groups") || [];
  const group = groups.find(g => g.code === code);

  if (!group) return alert("No group found with that code.");
  if (!group.members.includes(username)) group.members.push(username);
  setData("groups", groups);

  const leaderboardKey = `${tabId}_leaderboard_group_${code}`;
  let leaderboard = JSON.parse(localStorage.getItem(leaderboardKey) || "[]");
  if (!leaderboard.some(entry => entry.name === username)) {
    leaderboard.push({ name: username, points: 0, proofs: [] });
    localStorage.setItem(leaderboardKey, JSON.stringify(leaderboard));
  }

  setData("currentGroup", code);
  alert(`Joined group "${group.name}" successfully!`);
  window.location.href = "dashboard.html";
});

// === Shared helper for navigation ===
function enterGroup(code) {
  setData("currentGroup", code);
  window.location.href = "group.html";
}
