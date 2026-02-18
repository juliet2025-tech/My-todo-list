// ===== GET ELEMENTS =====
const taskInput = document.getElementById("taskInput");
//“Go to my HTML file and find the element that has id="taskInput" and store it inside this variable
const dueDateInput = document.getElementById("dueDate");
//Hey JavaScript, look inside my webpage.Find the HTML element that has this ID → dueDate
const reminderInput = document.getElementById("reminder");
//Look inside my HTML page,Find the HTML element that has the ID = reminder
const prioritySelect = document.getElementById("priority");
const addBtn = document.getElementById("addBtn");
//look inside my html page and find an element with id : addBtn
const taskList = document.getElementById("taskList");

const searchInput = document.getElementById("searchTask");
const allBtn = document.getElementById("allTasks");
const completedBtn = document.getElementById("completedTasks");
const pendingBtn = document.getElementById("pendingTasks");
const clearCompletedBtn = document.getElementById("clearCompleted");
const sortDueDateBtn = document.getElementById("sortDueDate");

// ===== REQUEST NOTIFICATION PERMISSION =====
if (Notification.permission !== "granted") {
    Notification.requestPermission();
}

if ("Notification" in window) {
    Notification.requestPermission().then(permission => {
        console.log("Notification permission:", permission);
    });
}





// ===== TASK STORAGE =====
let tasks = [];
//Create a variable called tasks and store an empty list inside it. This list will hold all the tasks the user creates.
let filterMode = "all";
//this code is used to show if a task has been completed,pending, 

// ===== ADD TASK =====
addBtn.addEventListener("click", addTask);
// When the user clicks the "Add Task" button, run the addTask() function
// 1. addBtn is the button element from HTML
// 2. addEventListener("click", ...) tells the button to listen for clicks
// 3. addTask is the function that runs when the button is clicked, which adds the task to the list

function addTask() {
const taskText = taskInput.value.trim();
    // This function is called when the user clicks the "Add Task" button.
    // It collects the input values, creates a task object, and adds it to the task list.

    // Get the text the user typed for the task and remove extra spaces at the start and end

    const dueDate = dueDateInput.value;
    // Get the due date the user selected from the due date input


    const reminder = reminderInput.value;
     // Get the reminder time the user selected from the reminder input

    const priority = prioritySelect.value;
    // Get the priority value (e.g., "low", "medium", "high") from the dropdown

    if(taskText === "") return;
    //If the user did not type anything in the task input box, stop the addTask 
    //function and don’t add an empty task to the list.

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
//tasks → is your array that stores all tasks

//.push() → is an array method used to add something to the end of the array

//task → is the new task object you just created

// ===== CLEAR INPUTS =====
// ===== CLEAR INPUT FIELDS FUNCTION =====
function clearInputs(){
    // This function clears everything the user typed after adding a task

    taskInput.value = "";
    // Makes the task input box empty

    dueDateInput.value = "";
    // Clears the selected due date

    reminderInput.value = "";
    // Clears the reminder time

    prioritySelect.value = "low";
    // Resets the priority dropdown back to "low"
}


// ===== DISPLAY TASKS FUNCTION =====
function renderTasks(){

    taskList.innerHTML = "";
    // Clears everything currently displayed in the task list before showing updated tasks

    let filteredTasks = tasks;
    // Create a new variable that starts with all tasks

    if(filterMode === "completed"){
        filteredTasks = tasks.filter(t => t.completed);
        // Keep only tasks that are completed
    }

    else if(filterMode === "pending"){
        filteredTasks = tasks.filter(t => !t.completed);
        // Keep only tasks that are NOT completed
    }

    const searchValue = searchInput.value.toLowerCase();
    // Get what the user typed in the search box and convert it to lowercase

    filteredTasks = filteredTasks.filter(t => 
        t.text.toLowerCase().includes(searchValue)
    );
    // Keep only tasks that match what the user searched for


    filteredTasks.forEach(task => {
    // Go through each task one by one to display it on the screen

        const li = document.createElement("li");
        // Create a list item for each task

        li.classList.add(task.priority);
        // Add the priority class (low, medium, high) to style it

        if(task.completed){
            li.classList.add("completed");
            // If task is done, add a "completed" style
        }


        // ===== CHECKBOX =====
        const checkbox = document.createElement("input");
        // Create checkbox input

        checkbox.type = "checkbox";
        // Make it a checkbox

        checkbox.checked = task.completed;
        // If task is completed, checkbox will be checked

        checkbox.addEventListener("change", ()=>{
            task.completed = checkbox.checked;
            // Update the task's completed status

            renderTasks();
            // Refresh the task list
        });


        // ===== TASK DETAILS =====
        const detailsDiv = document.createElement("div");
        // Create a container for task details

        detailsDiv.classList.add("task-details");
        // Add styling class

        const taskText = document.createElement("span");
        // Create a text element to hold task name

        taskText.textContent = task.text;
        // Show the task name typed by the user

        const date = document.createElement("small");
        // Create small text for due date

        date.classList.add("task-date");
        // Add styling class

        date.textContent = task.dueDate ? "Due: " + task.dueDate : "";
        // If due date exists, show it, else show nothing

        const reminder = document.createElement("small");
        // Create small text for reminder

        reminder.classList.add("task-reminder");
        // Add styling class

        reminder.textContent = task.reminder ? "Reminder: " + task.reminder : "";
        // If reminder exists, show it, else show nothing

        detailsDiv.appendChild(taskText);
        // Add task text inside the details container

        detailsDiv.appendChild(date);
        // Add due date inside the container

        detailsDiv.appendChild(reminder);
        // Add reminder inside the container


        // ===== EDIT BUTTON =====
        const editBtn = document.createElement("button");
        // Create an edit button

        editBtn.textContent = "Edit";
        // Write "Edit" on the button

        editBtn.classList.add("edit-btn");
        // Add styling class

        editBtn.addEventListener("click", ()=>{
            const newText = prompt("Edit task:", task.text);
            // Ask user to type new task name

            if(newText){
                task.text = newText;
                // Update the task text

                renderTasks();
                // Refresh the screen
            }
        });


        // ===== DELETE BUTTON =====
        const deleteBtn = document.createElement("button");
        // Create delete button

        deleteBtn.textContent = "Delete";
        // Write "Delete" on the button

        deleteBtn.classList.add("delete-btn");
        // Add styling class

        deleteBtn.addEventListener("click", ()=>{
            tasks = tasks.filter(t => t.id !== task.id);
            // Remove this task from the tasks array

            renderTasks();
            // Refresh the screen
        });


        li.appendChild(checkbox);
        // Add checkbox to the task item

        li.appendChild(detailsDiv);
        // Add task details

        li.appendChild(editBtn);
        // Add edit button

        li.appendChild(deleteBtn);
        // Add delete button

        taskList.appendChild(li);
        // Finally display the task on the screen
    });
}


// ===== SEARCH =====
searchInput.addEventListener("input", renderTasks);
// When user types in search box, refresh tasks instantly


// ===== FILTER BUTTONS =====
allBtn.addEventListener("click", ()=>{
    filterMode = "all";
    // Show all tasks

    renderTasks();
    // Refresh screen
});

completedBtn.addEventListener("click", ()=>{
    filterMode = "completed";
    // Show only completed tasks

    renderTasks();
    // Refresh screen
});

pendingBtn.addEventListener("click", ()=>{
    filterMode = "pending";
    // Show only unfinished tasks

    renderTasks();
    // Refresh screen
});


// ===== CLEAR COMPLETED TASKS =====
clearCompletedBtn.addEventListener("click", ()=>{
    tasks = tasks.filter(t => !t.completed);
    // Remove all completed tasks
 renderTasks();
    // Refresh screen
});


// ===== SORT BY DUE DATE =====
sortDueDateBtn.addEventListener("click", () => {
    tasks.sort((a, b) => {
        if (!a.dueDate) return 1; // Tasks without due date go to bottom
        if (!b.dueDate) return -1;
        return new Date(a.dueDate) - new Date(b.dueDate);
    });
    renderTasks(); // Re-render tasks in sorted order
});
