
// ===== GET ELEMENTS =====
const taskInput = document.getElementById("taskInput");
const dueDateInput = document.getElementById("dueDate");
const reminderInput = document.getElementById("reminder");
const prioritySelect = document.getElementById("priority");
const categoryInput = document.getElementById("category");
const repeatSelect = document.getElementById("repeat"); // daily, weekly, none
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
    prioritySelect.value = "";
    categoryInput.value = "";
    repeatSelect.value = "";
}

// ===== RENDER TASKS =====
function renderTasks() {
    taskList.innerHTML = "";
    let filteredTasks = tasks;

    
// Apply filter mode
if (filterMode === "completed") 
    filteredTasks = tasks.filter(t => t.completed);
else if (filterMode === "pending") 
    filteredTasks = tasks.filter(t => !t.completed);

    // 👇 ADD IT RIGHT HERE
    console.log("Search value on load:", searchInput.value);

   // Apply search filter
const searchValue = searchInput.value.trim().toLowerCase();

if (searchValue !== "") {
    filteredTasks = filteredTasks.filter(t =>
        t.text.toLowerCase().includes(searchValue)
    );
}
    // Render each task
    filteredTasks.forEach(task => {
        const li = document.createElement("li");
        li.classList.add(task.priority);

        if (task.completed && filterMode === "completed") {
            li.classList.add("completed-highlight");
        } else if (task.completed) {
            li.classList.add("completed");
        }

        // ===== CHECKBOX =====
       // ===== CHECKBOX =====
const checkbox = document.createElement("input");
checkbox.type = "checkbox";
checkbox.checked = task.completed;
checkbox.addEventListener("change", () => {
    task.completed = checkbox.checked;

    // Only trigger repeat when marking task as completed
    if (task.completed) {
        handleRepetitiveTask(task);
    }

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
    filterButtons.forEach(btn => btn.classList.remove("active")); // remove from all
    button.classList.add("active"); // add to clicked
}

// Filter buttons click events
filterButtons.forEach(button => {
    button.addEventListener("click", () => {
        if (button.id === "alltask") filterMode = "all";
        else if (button.id === "completedtask") filterMode = "completed";
        else if (button.id === "pendingtask") filterMode = "pending";

        renderTasks();
        setActiveButton(button);
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

// ===== REMINDER CHECK =====
function checkReminders() {
    const now = new Date().getTime();
    tasks.forEach(task => {
        if (task.reminder && !task.notified) {
            const reminderTime = new Date(task.reminder).getTime();
            if (reminderTime <= now) {
                if ("Notification" in window && Notification.permission === "granted") {
                    new Notification("⏰ Task Reminder", { body: task.text });
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
// ===== HELPER FUNCTION =====
// ===== HELPER FUNCTION =====
// This ensures we get a YYYY-MM-DD string without timezone shifts
function formatLocalDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
}

// ===== REPETITIVE TASK HANDLER =====
function handleRepetitiveTask(task) {
    if (task.repeat === "none" || !task.completed) return;

    // 1. Get the base date. 
    // We use a regex replace to change '-' to '/' to avoid UTC/Local time confusion in some browsers
    let baseDate;
    if (task.dueDate) {
        baseDate = new Date(task.dueDate.replace(/-/g, '\/')); 
    } else {
        baseDate = new Date();
    }

    // 2. Create the new date object
    let newDate = new Date(baseDate);

    // 3. Increment based on type
    if (task.repeat === "daily") {
        newDate.setDate(newDate.getDate() + 1);
    } else if (task.repeat === "weekly") {
        newDate.setDate(newDate.getDate() + 7);
    }

    // 4. Create the new task object
    const newTask = {
        ...task,                // Copy all properties
        id: Date.now() + 1,     // Unique ID (added +1 to avoid collision with rapid clicks)
        dueDate: formatLocalDate(newDate),
        completed: false,       // New task is not done
        notified: false         // Reset notification for the new date
    };

    // 5. Add to array and update UI
    tasks.push(newTask);
    saveTasks();
    renderTasks();
}

// ===== INITIALIZE =====


window.addEventListener("DOMContentLoaded", () => {
    filterMode = "all";
    setActiveButton(allBtn); // allBtn is no longer null
    renderTasks();
    checkReminders();
});
