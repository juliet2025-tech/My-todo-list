// ===== GET ELEMENTS =====
const taskInput = document.getElementById("taskInput");
const dueDateInput = document.getElementById("dueDate");
const reminderInput = document.getElementById("reminder");
const prioritySelect = document.getElementById("priority");
const categoryInput = document.getElementById("category");
const repeatSelect = document.getElementById("repeat");
const addBtn = document.getElementById("addBtn");
const taskList = document.getElementById("taskList");
const filterButtons = document.querySelectorAll(".filter-btns button");
const searchInput = document.getElementById("searchTask");
const allBtn = document.getElementById("alltask");
const completedBtn = document.getElementById("completedtask");
const pendingBtn = document.getElementById("pendingtask");
const clearCompletedBtn = document.getElementById("clearCompleted");
const sortDueDateBtn = document.getElementById("sortDueDate");

// ===== NOTIFICATION PERMISSION =====
if ("Notification" in window && Notification.permission !== "granted") {
  Notification.requestPermission();
}

// ===== TASK STORAGE =====
let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
let filterMode = "all";

// ===== SAVE TASKS =====
function saveTasks() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

// ===== CLEAR INPUTS =====
function clearInputs() {
  taskInput.value = "";
  dueDateInput.value = "";
  reminderInput.value = "";
  prioritySelect.value = "";
  categoryInput.value = "";
  repeatSelect.value = "";
}

// ===== FORMAT DATE =====
function formatDate(date) {
  const d = new Date(date);
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const year = d.getFullYear();
  return `${year}-${month}-${day}`;
}

// ===== ADD TASK =====
addBtn.addEventListener("click", () => {
  const text = taskInput.value.trim();
  if (!text) return alert("Please enter a task!");

  const task = {
    id: Date.now(),
    text,
    dueDate: dueDateInput.value || "",
    reminder: reminderInput.value || "",
    priority: prioritySelect.value || "Low",
    category: categoryInput.value.trim() || "General",
    repeat: repeatSelect.value || "none",
    completed: false,
    notified: false
  };

  tasks.push(task);
  saveTasks();
  clearInputs();
  renderTasks();
});

// ===== RENDER TASKS =====
function renderTasks() {
  taskList.innerHTML = "";
  let displayTasks = [...tasks];

  // ===== FILTER =====
  if (filterMode === "completed") displayTasks = displayTasks.filter(t => t.completed);
  if (filterMode === "pending") displayTasks = displayTasks.filter(t => !t.completed);

  // ===== SEARCH =====
  const searchVal = searchInput.value.toLowerCase().trim();
  if (searchVal) displayTasks = displayTasks.filter(t => t.text.toLowerCase().includes(searchVal));

  // ===== GENERATE LIST ITEMS =====
  displayTasks.forEach(task => {
    const li = document.createElement("li");
    li.classList.add(task.priority.toLowerCase()); // Priority color class
    if (task.completed) li.classList.add("completed");

    // ===== CHECKBOX =====
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = task.completed;
    checkbox.addEventListener("change", () => {
      task.completed = checkbox.checked;
      if (task.completed) handleRepeat(task);
      saveTasks();
      renderTasks();
    });

    // ===== TASK DETAILS =====
    const detailsDiv = document.createElement("div");
    detailsDiv.classList.add("task-details");

    const textSpan = document.createElement("span");
    textSpan.textContent = task.text;
    textSpan.classList.add("task-text");

    const metaDiv = document.createElement("div");
    metaDiv.classList.add("task-meta-info");
    if (task.dueDate) metaDiv.innerHTML += `<small class="task-date">Due: ${task.dueDate}</small>`;
    if (task.reminder) metaDiv.innerHTML += `<small class="task-reminder">Reminder: ${task.reminder}</small>`;
    metaDiv.innerHTML += `<small class="task-category">Category: ${task.category}</small>`;

    detailsDiv.append(textSpan, metaDiv);

    // ===== EDIT BUTTON =====
    const editBtn = document.createElement("button");
    editBtn.textContent = "Edit";
    editBtn.className = "edit-btn";
    editBtn.addEventListener("click", () => {
      const newText = prompt("Edit task:", task.text);
      if (newText) {
        task.text = newText.trim();
        saveTasks();
        renderTasks();
      }
    });

    // ===== DELETE BUTTON =====
    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "Delete";
    deleteBtn.className = "delete-btn";
    deleteBtn.addEventListener("click", () => {
      tasks = tasks.filter(t => t.id !== task.id);
      saveTasks();
      renderTasks();
    });

    const actionsDiv = document.createElement("div");
actionsDiv.classList.add("task-actions"); // This matches your CSS
actionsDiv.append(editBtn, deleteBtn);    // Put buttons inside this div

li.append(checkbox, detailsDiv, actionsDiv); // Append div to the task item
    taskList.appendChild(li);
  });
}

// ===== SEARCH & FILTER =====
searchInput.addEventListener("input", renderTasks);

function setActiveButton(button) {
  filterButtons.forEach(btn => btn.classList.remove("active"));
  button.classList.add("active");
}

filterButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    filterMode = btn.id === "completedtask" ? "completed" :
                 btn.id === "pendingtask" ? "pending" : "all";
    setActiveButton(btn);
    renderTasks();
  });
});

// ===== CLEAR COMPLETED =====
clearCompletedBtn.addEventListener("click", () => {
  tasks = tasks.filter(t => !t.completed);
  saveTasks();
  renderTasks();
});

// ===== SORT DUE DATE =====
sortDueDateBtn.addEventListener("click", () => {
  tasks.sort((a, b) => {
    if (!a.dueDate) return 1;
    if (!b.dueDate) return -1;
    return new Date(a.dueDate) - new Date(b.dueDate);
  });
  renderTasks();
});

// ===== REMINDERS =====
function checkReminders() {
  const now = new Date().getTime();
  tasks.forEach(task => {
    if (task.reminder && !task.notified) {
      const reminderTime = new Date(task.reminder).getTime();
      if (reminderTime <= now && "Notification" in window && Notification.permission === "granted") {
        new Notification("⏰ Task Reminder", { body: task.text });
        task.notified = true;
        saveTasks();
      }
    }
  });
}
setInterval(checkReminders, 30000);

// ===== REPETITIVE TASK =====
function handleRepeat(task) {
  if (task.repeat.toLowerCase() === "none") return;
  let baseDate = task.dueDate ? new Date(task.dueDate) : new Date();
  if (task.repeat.toLowerCase() === "daily") baseDate.setDate(baseDate.getDate() + 1);
  if (task.repeat.toLowerCase() === "weekly") baseDate.setDate(baseDate.getDate() + 7);

  const newTask = { 
    ...task, 
    id: Date.now() + 1, 
    completed: false, 
    notified: false, 
    dueDate: formatDate(baseDate)
  };
  tasks.push(newTask);
  saveTasks();
}

// ===== INITIALIZE =====
window.addEventListener("DOMContentLoaded", () => {
  filterMode = "all";
  setActiveButton(allBtn);
  renderTasks();
  checkReminders();
});