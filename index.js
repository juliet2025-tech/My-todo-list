// ===== GET ELEMENTS =====
const taskInput = document.getElementById("taskInput");
const dueDateInput = document.getElementById("dueDate");
const reminderInput = document.getElementById("reminder");
const prioritySelect = document.getElementById("priority");
const addBtn = document.getElementById("addBtn");
const taskList = document.getElementById("taskList");

const searchInput = document.getElementById("searchTask");
const allBtn = document.getElementById("allTasks");
const completedBtn = document.getElementById("completedTasks");
const pendingBtn = document.getElementById("pendingTasks");
const clearCompletedBtn = document.getElementById("clearCompleted");

// ===== TASK STORAGE =====
let tasks = [];
let filterMode = "all";

// ===== ADD TASK =====
addBtn.addEventListener("click", addTask);

function addTask() {

    const taskText = taskInput.value.trim();
    const dueDate = dueDateInput.value;
    const reminder = reminderInput.value;
    const priority = prioritySelect.value;

    if(taskText === "") return;

    const task = {
        id: Date.now(),
        text: taskText,
        dueDate: dueDate,
        reminder: reminder,
        priority: priority,
        completed: false
    };

    tasks.push(task);
    clearInputs();
    renderTasks();
}

// ===== CLEAR INPUTS =====
function clearInputs(){
    taskInput.value = "";
    dueDateInput.value = "";
    reminderInput.value = "";
    prioritySelect.value = "low";
}

// ===== RENDER TASKS =====
function renderTasks(){

    taskList.innerHTML = "";

    let filteredTasks = tasks;

    if(filterMode === "completed"){
        filteredTasks = tasks.filter(t => t.completed);
    }
    else if(filterMode === "pending"){
        filteredTasks = tasks.filter(t => !t.completed);
    }

    const searchValue = searchInput.value.toLowerCase();
    filteredTasks = filteredTasks.filter(t => 
        t.text.toLowerCase().includes(searchValue)
    );

    filteredTasks.forEach(task => {

        const li = document.createElement("li");
        li.classList.add(task.priority);

        if(task.completed){
            li.classList.add("completed");
        }

        // ===== CHECKBOX =====
        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.checked = task.completed;

        checkbox.addEventListener("change", ()=>{
            task.completed = checkbox.checked;
            renderTasks();
        });

        // ===== TASK TEXT =====
        const detailsDiv = document.createElement("div");
        detailsDiv.classList.add("task-details");

        const taskText = document.createElement("span");
        taskText.textContent = task.text;

        const date = document.createElement("small");
        date.classList.add("task-date");
        date.textContent = task.dueDate ? "Due: " + task.dueDate : "";

        const reminder = document.createElement("small");
        reminder.classList.add("task-reminder");
        reminder.textContent = task.reminder ? "Reminder: " + task.reminder : "";

        detailsDiv.appendChild(taskText);
        detailsDiv.appendChild(date);
        detailsDiv.appendChild(reminder);

        // ===== EDIT BUTTON =====
        const editBtn = document.createElement("button");
        editBtn.textContent = "Edit";
        editBtn.classList.add("edit-btn");

        editBtn.addEventListener("click", ()=>{
            const newText = prompt("Edit task:", task.text);
            if(newText){
                task.text = newText;
                renderTasks();
            }
        });

        // ===== DELETE BUTTON =====
        const deleteBtn = document.createElement("button");
        deleteBtn.textContent = "Delete";
        deleteBtn.classList.add("delete-btn");

        deleteBtn.addEventListener("click", ()=>{
            tasks = tasks.filter(t => t.id !== task.id);
            renderTasks();
        });

        li.appendChild(checkbox);
        li.appendChild(detailsDiv);
        li.appendChild(editBtn);
        li.appendChild(deleteBtn);

        taskList.appendChild(li);
    });
}

// ===== SEARCH =====
searchInput.addEventListener("input", renderTasks);

// ===== FILTERS =====
allBtn.addEventListener("click", ()=>{
    filterMode = "all";
    renderTasks();
});

completedBtn.addEventListener("click", ()=>{
    filterMode = "completed";
    renderTasks();
});

pendingBtn.addEventListener("click", ()=>{
    filterMode = "pending";
    renderTasks();
});

// ===== CLEAR COMPLETED =====
clearCompletedBtn.addEventListener("click", ()=>{
    tasks = tasks.filter(t => !t.completed);
    renderTasks();
});
