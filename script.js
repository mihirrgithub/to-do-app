const input = document.getElementById('todo-input');
const addBtn = document.getElementById('add-btn');
const list = document.getElementById('todo-list');

// Try to load saved todos from localStorage (if any)
const saved = localStorage.getItem('todos');
const todos = saved ? JSON.parse(saved) : [];

// AI Configuration
let apiKey = localStorage.getItem('cohere-api-key') || '';

// Category colors for styling
const categoryColors = {
  'Work': '#FF6B6B',
  'Personal': '#4ECDC4',
  'Shopping': '#FFE66D',
  'Health': '#95E1D3',
  'Learning': '#C7CEEA'
};

function saveTodos() {
  // Save current todos array to localStorage
  localStorage.setItem('todos', JSON.stringify(todos));
}

// AI: Get task category using simple keywords (local analysis)
function getCategoryLocally(text) {
  const lowerText = text.toLowerCase();
  
  if (lowerText.match(/work|meet|email|report|project|deadline|task/i)) {
    return 'Work';
  } else if (lowerText.match(/buy|shop|grocery|store|mall/i)) {
    return 'Shopping';
  } else if (lowerText.match(/run|exercise|gym|health|doctor|medicine|eat|sleep/i)) {
    return 'Health';
  } else if (lowerText.match(/learn|study|course|book|read|practice/i)) {
    return 'Learning';
  } else {
    return 'Personal';
  }
}

// AI: Get suggestions for similar tasks
function getAISuggestions(text) {
  if (!text || text.length < 2) return [];
  
  const lowerText = text.toLowerCase();
  const suggestions = todos
    .filter(todo => todo.text.toLowerCase().includes(lowerText) && todo.text !== text)
    .map(todo => todo.text)
    .slice(0, 3);
  
  return suggestions;
}

// Display AI suggestions
function showSuggestions(text) {
  const suggestionsContainer = document.getElementById('ai-suggestions');
  const suggestions = getAISuggestions(text);
  
  if (suggestions.length === 0) {
    suggestionsContainer.innerHTML = '';
    return;
  }
  
suggestionsContainer.innerHTML = suggestions
    .map(suggestion => `<div class="suggestion-item" onclick="setSuggestion('${suggestion.replace(/'/g, "\'")}'')">${suggestion}</div>`)
    .join('');
}

// Set suggestion as input
function setSuggestion(text) {
  input.value = text;
  document.getElementById('ai-suggestions').innerHTML = '';
  input.focus();
}

// Create a DOM node for a todo object and append it to the list
function createTodoNode(todo, index) {
  const li = document.createElement('li');
  
  // checkbox to toggle completion
  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.checked = !!todo.completed;
  checkbox.addEventListener("change", () => {
    todo.completed = checkbox.checked;
    textSpan.style.textDecoration = todo.completed ? 'line-through' : "";
    saveTodos();
  });
  
  // Category badge
  const categoryBadge = document.createElement('span');
  categoryBadge.className = 'category-badge';
  categoryBadge.textContent = todo.category || 'Personal';
  categoryBadge.style.backgroundColor = categoryColors[todo.category || 'Personal'];
  categoryBadge.style.marginRight = '8px';
  
  // Text of the todo
  const textSpan = document.createElement("span");
  textSpan.textContent = todo.text;
  textSpan.style.margin = '0 8px';
  if (todo.completed) {
    textSpan.style.textDecoration = 'line-through';
  }
  
  // Add double-click event listener to edit todo
  textSpan.addEventListener("dblclick", () => {
    const newText = prompt("Edit todo", todo.text);
    if (newText !== null) {
      todo.text = newText.trim();
      textSpan.textContent = todo.text;
      saveTodos();
      render();
    }
  });
  
  // Delete Todo Button
  const delBtn = document.createElement('button');
  delBtn.textContent = "Delete";
  delBtn.addEventListener('click', () => {
    todos.splice(index, 1);
    render();
    saveTodos();
  });
  
  li.appendChild(checkbox);
  li.appendChild(categoryBadge);
  li.appendChild(textSpan);
  li.appendChild(delBtn);
  return li;
}

// Render the whole todo list from todos array
function render() {
  list.innerHTML = '';
  
  // Recreate each item
  todos.forEach((todo, index) => {
    const node = createTodoNode(todo, index);
    list.appendChild(node);
  });
}

function addTodo() {
  const text = input.value.trim();
  if (!text) {
    return;
  }
  
  // Get category using local AI
  const category = getCategoryLocally(text);
  
  // Push a new todo object with category
  todos.push({ text: text, completed: false, category: category });
  input.value = '';
  document.getElementById('ai-suggestions').innerHTML = '';
  render();
  saveTodos();
}

// Event listeners
addBtn.addEventListener("click", addTodo);
input.addEventListener('keydown', (e) => {
  if (e.key == 'Enter') {
    addTodo();
  }
});

input.addEventListener('input', (e) => {
  showSuggestions(e.target.value);
});

// API Key Management
const setupAPIKeyListener = () => {
  const apiKeyInput = document.getElementById('api-key-input');
  const saveKeyBtn = document.getElementById('save-key-btn');
  
  if (apiKeyInput && saveKeyBtn) {
    if (apiKey) {
      apiKeyInput.value = '••••••••' + apiKey.slice(-4);
    }
    
    saveKeyBtn.addEventListener('click', () => {
      const newKey = apiKeyInput.value;
      if (newKey && newKey !== apiKey) {
        apiKey = newKey;
        localStorage.setItem('cohere-api-key', newKey);
        apiKeyInput.value = '••••••••' + newKey.slice(-4);
        saveKeyBtn.textContent = '✓ Saved';
        setTimeout(() => {
          saveKeyBtn.textContent = 'Save API Key';
        }, 2000);
      }
    });
  }
};

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
  setupAPIKeyListener();
  render();
});

render();
