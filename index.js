// ===== GET ELEMENTS =====
const taskInput = document.getElementById("taskInput");
const dueDateInput = document.getElementById("dueDate");
const reminderInput = document.getElementById("reminder");
const prioritySelect = document.getElementById("priority");
const categoryInput = document.getElementById("category");
const repeatSelect = document.getElementById("repeat"); // daily, weekly, none
const addBtn = document.getElementById("addBtn");
const taskList = document.getElementById("taskList");

const searchInput = document.getElementById("searchTask");
const allBtn = document.getElementById("allTasks");
const completedBtn = document.getElementById("completedTasks");
const pendingBtn = document.getElementById("pendingTasks");
const clearCompletedBtn = document.getElementById("clearCompleted");
const sortDueDateBtn = document.getElementById("sortDueDate");

// ===== NOTIFICATION PERMISSION =====
if ("Notification" in window && Notification.permission !== "granted") {
    Notification.requestPermission();
}

// ===== TASK STORAGE =====
let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
let filterMode = "all";

// ===== SAVE TO LOCAL STORAGE =====
function saveTasks() {
    localStorage.setItem("tasks", JSON.stringify(tasks));
}

// ===== ADD TASK =====
addBtn.addEventListener("click", addTask);

function addTask() {
    const taskText = taskInput.value.trim();
    const dueDate = dueDateInput.value;
    const reminder = reminderInput.value;
    const priority = prioritySelect.value;
    const category = categoryInput.value || "General";
    const repeat = repeatSelect.value || "none";

    if (!taskText) return;

    const task = {
        id: Date.now(),
        text: taskText,
        dueDate,
        reminder,
        priority,
        category,
        repeat,
        completed: false,
        notified: false
    };

    tasks.push(task);
    saveTasks();
    clearInputs();
    renderTasks();
}

// ===== CLEAR INPUTS =====
function clearInputs() {
    taskInput.value = "";
    dueDateInput.value = "";
    reminderInput.value = "";
    prioritySelect.value = "low";
    categoryInput.value = "";
    repeatSelect.value = "none";
}

// ===== RENDER TASKS =====
function renderTasks() {
    taskList.innerHTML = "";
    let filteredTasks = tasks;

    // Apply filter mode
    if (filterMode === "completed") filteredTasks = tasks.filter(t => t.completed);
    else if (filterMode === "pending") filteredTasks = tasks.filter(t => !t.completed);

    // Apply search filter
    const searchValue = searchInput.value.toLowerCase();
    filteredTasks = filteredTasks.filter(t => t.text.toLowerCase().includes(searchValue));

    // Render each task
    filteredTasks.forEach(task => {
        const li = document.createElement("li");
        li.classList.add(task.priority);

        // Add special style if in Completed filter
        if (task.completed && filterMode === "completed") {
            li.classList.add("completed-highlight");
        } else if (task.completed) {
            li.classList.add("completed");
        }

        // ===== CHECKBOX =====
        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.checked = task.completed;
        checkbox.addEventListener("change", () => {
            task.completed = checkbox.checked;
            handleRepetitiveTask(task);
            saveTasks();
            renderTasks();
        });

        // ===== TASK DETAILS =====
        const detailsDiv = document.createElement("div");
        detailsDiv.classList.add("task-details");

        const taskText = document.createElement("span");
        taskText.textContent = task.text;

        const date = document.createElement("small");
        date.classList.add("task-date");
        date.textContent = task.dueDate ? `Due: ${task.dueDate}` : "";

        const reminder = document.createElement("small");
        reminder.classList.add("task-reminder");
        reminder.textContent = task.reminder ? `Reminder: ${task.reminder}` : "";

        const category = document.createElement("small");
        category.classList.add("task-category");
        category.textContent = `Category: ${task.category}`;

        detailsDiv.append(taskText, date, reminder, category);

        // ===== EDIT BUTTON =====
        const editBtn = document.createElement("button");
        editBtn.textContent = "Edit";
        editBtn.classList.add("edit-btn");
        editBtn.addEventListener("click", () => {
            const newText = prompt("Edit task:", task.text);
            if (newText) {
                task.text = newText;
                saveTasks();
                renderTasks();
            }
        });

        // ===== DELETE BUTTON =====
        const deleteBtn = document.createElement("button");
        deleteBtn.textContent = "Delete";
        deleteBtn.classList.add("delete-btn");
        deleteBtn.addEventListener("click", () => {
            tasks = tasks.filter(t => t.id !== task.id);
            saveTasks();
            renderTasks();
        });

        li.append(checkbox, detailsDiv, editBtn, deleteBtn);
        taskList.appendChild(li);
    });
}

// ===== SEARCH & FILTER =====
searchInput.addEventListener("input", renderTasks);

// ===== ACTIVE FILTER BUTTON =====
function setActiveButton(button) {
    allBtn.classList.remove("active");
    completedBtn.classList.remove("active");
    pendingBtn.classList.remove("active");
    button.classList.add("active");
}

// Filter buttons
allBtn.addEventListener("click", ()=>{ filterMode="all"; renderTasks(); setActiveButton(allBtn); });
completedBtn.addEventListener("click", ()=>{ filterMode="completed"; renderTasks(); setActiveButton(completedBtn); });
pendingBtn.addEventListener("click", ()=>{ filterMode="pending"; renderTasks(); setActiveButton(pendingBtn); });

// ===== CLEAR COMPLETED =====
clearCompletedBtn.addEventListener("click", () => {
    tasks = tasks.filter(t => !t.completed);
    saveTasks();
    renderTasks();
});

// ===== SORT DUE DATE =====
sortDueDateBtn.addEventListener("click", () => {
    tasks.sort((a,b)=>{
        if(!a.dueDate) return 1;
        if(!b.dueDate) return -1;
        return new Date(a.dueDate) - new Date(b.dueDate);
    });
    renderTasks();
});

// ===== REMINDER CHECK =====
function checkReminders() {
    const now = new Date().getTime();
    tasks.forEach(task => {
        if(task.reminder && !task.notified) {
            const reminderTime = new Date(task.reminder).getTime();
            if(reminderTime <= now) {
                if("Notification" in window && Notification.permission === "granted") {
                    new Notification("⏰ Task Reminder", {body: task.text});
                }
                console.log(`Reminder triggered for: ${task.text}`);
                task.notified = true;
                saveTasks();
            }
        }
    });
}
setInterval(checkReminders, 30000);

// ===== REPETITIVE TASK HANDLER =====
function handleRepetitiveTask(task) {
    if(task.repeat==="daily") {
        const newTask = {...task, id: Date.now(), completed:false, notified:false};
        tasks.push(newTask);
    } else if(task.repeat==="weekly") {
        const newTask = {...task, id: Date.now(), completed:false, notified:false};
        const newDue = new Date(task.dueDate);
        newDue.setDate(newDue.getDate()+7);
        newTask.dueDate = newDue.toISOString().split("T")[0];
        tasks.push(newTask);
    }
}

// ===== INITIALIZE =====
window.addEventListener("DOMContentLoaded", ()=>{
    filterMode="all";
    setActiveButton(allBtn);
    renderTasks();
    checkReminders();
});

