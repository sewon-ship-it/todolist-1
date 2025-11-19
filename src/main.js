import './style.css'

// 날짜 포맷팅 함수
function formatDate(date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const weekdays = ['일', '월', '화', '수', '목', '금', '토']
  const weekday = weekdays[date.getDay()]
  return `${year}년 ${month}월 ${day}일 (${weekday})`
}

// 날짜 키 생성 함수 (YYYY-MM-DD 형식)
function getDateKey(date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

// localStorage에서 데이터 가져오기
function getStoredData(dateKey) {
  const stored = localStorage.getItem(`todo-${dateKey}`)
  return stored ? JSON.parse(stored) : { todos: [], gratitudes: ['', '', ''] }
}

// localStorage에 데이터 저장하기
function saveData(dateKey, data) {
  localStorage.setItem(`todo-${dateKey}`, JSON.stringify(data))
}

// 현재 선택된 날짜
let currentDate = new Date()
let draggedElement = null

// 앱 초기화
function initApp() {
  const dateKey = getDateKey(currentDate)
  const data = getStoredData(dateKey)
  
  renderApp(data)
}

// 앱 렌더링
function renderApp(data) {
  const dateKey = getDateKey(currentDate)
  const isToday = getDateKey(new Date()) === dateKey
  
  document.querySelector('#app').innerHTML = `
    <div class="container">
      <header>
        <h1>📝 Todo List</h1>
        <div class="date-section">
          <label for="date-picker">날짜 선택:</label>
          <input type="date" id="date-picker" value="${dateKey}" />
          <div class="current-date">${formatDate(currentDate)}${isToday ? ' (오늘)' : ''}</div>
        </div>
      </header>

      <div class="todo-section">
        <h2>할 일 목록</h2>
        <div class="todo-input-container">
          <input 
            type="text" 
            id="todo-input" 
            placeholder="할 일을 입력하세요..." 
            autocomplete="off"
          />
          <button id="add-todo-btn">추가</button>
        </div>
        <p class="drag-hint">💡 항목을 드래그하여 우선순위를 변경할 수 있습니다</p>
        <ul id="todo-list" class="todo-list"></ul>
      </div>

      <div class="gratitude-section">
        <h2>오늘의 감사 3가지</h2>
        <div class="gratitude-inputs">
          <input 
            type="text" 
            class="gratitude-input" 
            data-index="0"
            placeholder="감사한 일 1"
            value="${data.gratitudes[0] || ''}"
          />
          <input 
            type="text" 
            class="gratitude-input" 
            data-index="1"
            placeholder="감사한 일 2"
            value="${data.gratitudes[1] || ''}"
          />
          <input 
            type="text" 
            class="gratitude-input" 
            data-index="2"
            placeholder="감사한 일 3"
            value="${data.gratitudes[2] || ''}"
          />
        </div>
      </div>
    </div>
  `

  // 이벤트 리스너 설정
  setupEventListeners(data.todos)
}

// 이벤트 리스너 설정
function setupEventListeners(todos) {
  // 날짜 변경
  document.getElementById('date-picker').addEventListener('change', (e) => {
    currentDate = new Date(e.target.value)
    initApp()
  })

  // Todo 추가
  const todoInput = document.getElementById('todo-input')
  const addBtn = document.getElementById('add-todo-btn')
  
  const addTodo = () => {
    const text = todoInput.value.trim()
    if (text) {
      const dateKey = getDateKey(currentDate)
      const data = getStoredData(dateKey)
      data.todos.push({ id: Date.now(), text, completed: false })
      saveData(dateKey, data)
      renderApp(data)
      todoInput.value = ''
      todoInput.focus()
    }
  }

  addBtn.addEventListener('click', addTodo)
  todoInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      addTodo()
    }
  })

  // Todo 목록 렌더링
  renderTodos(todos)

  // 감사 입력 저장
  document.querySelectorAll('.gratitude-input').forEach(input => {
    input.addEventListener('input', (e) => {
      const index = parseInt(e.target.dataset.index)
      const dateKey = getDateKey(currentDate)
      const data = getStoredData(dateKey)
      data.gratitudes[index] = e.target.value
      saveData(dateKey, data)
    })
  })
}

// Todo 목록 렌더링
function renderTodos(todos) {
  const todoList = document.getElementById('todo-list')
  
  if (todos.length === 0) {
    todoList.innerHTML = '<li class="empty-message">할 일이 없습니다. 새로운 할 일을 추가해보세요!</li>'
    return
  }

  todoList.innerHTML = todos.map((todo, index) => `
    <li 
      class="todo-item ${todo.completed ? 'completed' : ''}" 
      data-id="${todo.id}"
      data-index="${index}"
      draggable="true"
    >
      <span class="priority-number">${index + 1}</span>
      <span class="todo-text">${todo.text}</span>
      <button class="delete-btn" data-id="${todo.id}">삭제</button>
    </li>
  `).join('')

  // Todo 클릭 (완료/미완료 토글)
  document.querySelectorAll('.todo-item').forEach(item => {
    item.addEventListener('click', (e) => {
      if (e.target.classList.contains('delete-btn')) return
      
      const id = parseInt(item.dataset.id)
      const dateKey = getDateKey(currentDate)
      const data = getStoredData(dateKey)
      const todo = data.todos.find(t => t.id === id)
      if (todo) {
        todo.completed = !todo.completed
        saveData(dateKey, data)
        renderApp(data)
      }
    })
  })

  // 삭제 버튼
  document.querySelectorAll('.delete-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation()
      const id = parseInt(btn.dataset.id)
      const dateKey = getDateKey(currentDate)
      const data = getStoredData(dateKey)
      data.todos = data.todos.filter(t => t.id !== id)
      saveData(dateKey, data)
      renderApp(data)
    })
  })

  // 드래그 앤 드롭
  setupDragAndDrop()
}

// 드래그 앤 드롭 설정
function setupDragAndDrop() {
  const todoList = document.getElementById('todo-list')
  const items = document.querySelectorAll('.todo-item')

  items.forEach(item => {
    item.addEventListener('dragstart', (e) => {
      draggedElement = item
      item.classList.add('dragging')
      e.dataTransfer.effectAllowed = 'move'
      e.dataTransfer.setData('text/html', item.innerHTML)
    })

    item.addEventListener('dragend', () => {
      if (draggedElement) {
        draggedElement.classList.remove('dragging')
      }
    })
  })

  // 컨테이너에 dragover와 drop 이벤트 추가
  todoList.addEventListener('dragover', (e) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    
    if (!draggedElement) return
    
    const afterElement = getDragAfterElement(todoList, e.clientY)
    if (afterElement == null) {
      todoList.appendChild(draggedElement)
    } else {
      todoList.insertBefore(draggedElement, afterElement)
    }
  })

  todoList.addEventListener('drop', (e) => {
    e.preventDefault()
    if (!draggedElement) return
    
    const dateKey = getDateKey(currentDate)
    const data = getStoredData(dateKey)
    
    // dragging 클래스 제거 (DOM에서 보이도록)
    draggedElement.classList.remove('dragging')
    
    // DOM에서 현재 순서대로 모든 todo-item을 가져옴
    const todoItems = Array.from(todoList.querySelectorAll('.todo-item'))
    
    // DOM 순서대로 todos 배열 재배열
    const newOrder = todoItems.map(item => {
      const id = parseInt(item.dataset.id)
      return data.todos.find(t => t.id === id)
    }).filter(Boolean) // undefined 제거
    
    // todos 배열을 새로운 순서로 업데이트
    data.todos = newOrder
    
    // 저장
    saveData(dateKey, data)
    
    // draggedElement 초기화
    draggedElement = null
    
    // 즉시 다시 렌더링하여 우선순위 번호 업데이트
    renderApp(data)
  })
}

// 드래그 위치 계산
function getDragAfterElement(container, y) {
  const draggableElements = [...container.querySelectorAll('.todo-item:not(.dragging)')]
  
  return draggableElements.reduce((closest, child) => {
    const box = child.getBoundingClientRect()
    const offset = y - box.top - box.height / 2
    
    if (offset < 0 && offset > closest.offset) {
      return { offset: offset, element: child }
    } else {
      return closest
    }
  }, { offset: Number.NEGATIVE_INFINITY }).element
}

// 앱 시작
initApp()
