'use strict';

const listsContainer = document.querySelector('[data-lists]');
const newListForm = document.querySelector('[data-new-list-form]');
const newListInput = document.querySelector('[data-new-list-input]');
const listDisplayContainer = document.querySelector(
  '[data-list-display-container]'
);
const listTitleElement = document.querySelector('[data-list-title]');
const listCountElement = document.querySelector('[data-list-count]');
const tasksContainer = document.querySelector('[data-tasks]');
const newTaskForm = document.querySelector('[data-new-task-form]');
const newTaskInput = document.querySelector('[data-new-task-input]');
const btnCreateList = document.querySelector('[data-create-new-list-button]');
const btnCreateTask = document.querySelector('[data-create-new-task-button]');
const btnClearCompleteTasks = document.querySelector(
  '[data-clear-complete-tasks-button]'
);

const btnDeleteList = document.querySelector('[data-delete-list-button]');
const alertError = document.querySelector('.alertError');

class ToDoList {
  constructor() {
    this.loadData();

    // Проверяем, существует ли список задач

    if (this.lists.length) {
      this.toggleActiveList(
        document.getElementById(this.lists[this.activeListIndex].listId)
      );

      this.showActiveListTasks();
    }
  }

  loadData() {
    /* Получаем сохраненные ранее данные из локального хранилища 
    или создаем значения по умолчанию */

    this.lists = JSON.parse(localStorage.getItem('taskLists')) || [];
    this.activeListIndex = localStorage.getItem('activeListIndex') || null;

    if (this.lists.length === 0) return;

    // Перебираем массив списков и формируем для них разметку

    this.lists.forEach(elem => {
      const listHTML = `

       <li id="${elem.listId}" class="list-name">${elem.listName}</li>
      
       `;

      listsContainer.insertAdjacentHTML('beforeend', listHTML);
    });

    // Перебираем массив задач и формируем разметку для списка задач

    const allTodos = this.lists.flatMap(list => list.todos);
    allTodos.forEach(todo => {
      const todoHTML = `<div class="task">
      <input 
        type="checkbox"
        id="task-${todo.taskId}"
      />
      <label for="task-${todo.taskId}">
        <span class="custom-checkbox"></span>
        ${todo.taskContent}
      </label>
    </div>`;

      tasksContainer.insertAdjacentHTML('beforeend', todoHTML);

      // Проверяем, выполнена ли задача для её стилизованного  отображения

      if (todo.taskComplited === true) {
        tasksContainer.querySelector(`#task-${todo.taskId}`).checked = true;
      }
    });
  }

  saveData() {
    /* Сериализуем данные списков задач и индекса активного списка в JSON-строку
   для сохранения в локальном хранилище */
    localStorage.setItem('taskLists', JSON.stringify(this.lists));
    localStorage.setItem('activeListIndex', this.activeListIndex);
  }

  createList(event) {
    event.preventDefault();

    // Получаем данные из инпута

    this.listName = newListInput.value.trim();
    if (!this.listName) return; // проверить

    // Генерируем уникальный идентификатор

    this.listId = 'list' + Date.now().toString();

    // Создаем объект списка задач и добавляем в массив lists

    this.lists.push({
      listId: this.listId,
      listName: this.listName,
      todos: [],
    });

    // Создаем разметку элемента списка

    this.listHTML = `

    <li id="${this.listId}" class="list-name">${this.listName}</li>

    `;

    listsContainer.insertAdjacentHTML('beforeend', this.listHTML);
    newListInput.value = '';

    this.saveData();

    this.toggleActiveList(document.getElementById(`${this.listId}`)); // Делаем новый список активным
    this.showActiveListTasks();
  }

  toggleActiveList(event) {
    // обработка переключения активного списка

    // Проверяем, что клик был по элементу списка
    if (!event.classList.contains('list-name')) return;

    // Удаляем класс "active" у всех списков

    document.querySelectorAll('.list-name')?.forEach(el => {
      el.classList.remove('active-list');
    });

    // Добавляем класс "active" кликнутому списку
    event.classList.add('active-list');

    // Находим объект кликнутого списка в массиве

    const currentActiveList = this.lists.find(list => list.listId === event.id);

    // Находим кликнутый список в массиве lists
    this.activeListIndex = this.lists.findIndex(
      list => list.listId === currentActiveList.listId
    );

    // Обновление заголовка

    listTitleElement.innerText = this.lists[this.activeListIndex].listName;

    this.saveData();

    this.showActiveListTasks();
  }

  addTask(event) {
    event.preventDefault();

    // ошибка если нет заголовка

    alertError.style.display = this.lists.length === 0 ? 'block' : 'none';

    // // Получаем данные из инпута

    this.taskContent = newTaskInput.value.trim();

    if (!this.taskContent) return; // проверить

    // Генерируем уникальный идентификатор задачи

    this.taskId = Date.now().toString();

    // Создаём и добавляем задачу в активный список
    this.lists[this.activeListIndex].todos.push({
      taskId: this.taskId,
      taskContent: this.taskContent,
      taskComplited: false,
    });

    // Формируем разметку задачи и добавляем её в DOM

    this.taskHTML = `<div class="task" >
    <input 
      type="checkbox"
      id="task-${this.taskId}"
    />
    <label for="task-${this.taskId}">
      <span class="custom-checkbox"></span>
      ${this.taskContent}
    </label>
  </div>`;

    tasksContainer.insertAdjacentHTML('beforeend', this.taskHTML);

    newTaskInput.value = '';

    this.saveData();

    this.showActiveListTasks();
  }

  showActiveListTasks() {
    // Проверяем, существует ли активный список

    if (this.activeListIndex === -1 || this.activeListIndex === null) {
      tasksContainer.innerHTML = '';
      return;
    }
    // Получаем активный список
    const activeList = this.lists[this.activeListIndex];
    // Создаем массив id задач активного списка
    const activeTaskIds = activeList.todos.map(task => task.taskId);
    // Получаем все имеющиеся задачи
    const tasks = tasksContainer.children;

    for (let i = 0; i < tasks.length; i++) {
      const task = tasks[i];
      // Извлекаем из разметки id задачи
      const taskIdWithoutPrefix = task
        .querySelector('input[type="checkbox"]')
        .id.slice(5);

      // Проверяем, есть ли задача в активном списке. Если да - отобразим

      if (activeTaskIds.includes(taskIdWithoutPrefix)) {
        task.style.display = 'block';
      } else {
        task.style.display = 'none';
      }
    }
  }

  savesCompletedTask(event) {
    // Сохраняем данные о завершённых задачах

    // Проверяем клик по чекбоксу, отмеченный как выполненный
    if (event.target.matches('input[type="checkbox"]:checked')) {
      this.checkedTasks = event.target.id.slice(5); // Запоминаем id выполненной задачи

      // Если id задачи совпадает с запомненной, отмечаем задачу как выполненную
      this.lists[this.activeListIndex].todos.forEach(task => {
        if (task.taskId === this.checkedTasks) {
          task.taskComplited = true;
        }
      });
    } else if (event.target.matches('input[type="checkbox"]')) {
      /* Задача была отмечена выполненной ранее, но теперь отметка снята.
       Устанавливаем свойство обратно в false */
      this.unCheckedTasks = event.target.id.slice(5);
      this.lists[this.activeListIndex].todos.forEach(task => {
        if (task.taskId === this.unCheckedTasks) {
          task.taskComplited = false;
        }
      });
    }
    this.saveData();
  }

  deleteCompletedTask() {
    // Удаляем все завершённые задачи

    // Фильтруем массив задач активного списка
    if (!this.lists.length) return; // проверить
    this.lists[this.activeListIndex].todos = this.lists[
      this.activeListIndex
    ].todos.filter(task => {
      // Если задача помечена выполненной, удаляем её разметку из DOM
      if (task.taskComplited === true) {
        tasksContainer
          .querySelector(`#task-${task.taskId}`)
          .parentElement.remove();
        return false; // Exclude completed tasks from the filtered array Исключаем завершённые задачи из отфильтрованного массива
      }
      return true; // Оставляем незавершенную задачу в массиве
    });
    this.saveData();
  }

  deleteList() {
    // Удаляем текущий активный список по индексу
    this.lists.splice(this.activeListIndex, 1);

    // Находим индекс ближайшего соседнего списка
    const nextListIndex = Math.min(this.activeListIndex, this.lists.length - 1);

    // Устанавливаем этот список новым активным

    this.activeListIndex = nextListIndex;

    // Удаляем разметку удаленного списка из DOM
    const activeListElement = document.querySelector('.list-name.active-list');
    activeListElement && activeListElement.remove();

    // Если остались списки, делаем первый список активным

    if (this.activeListIndex !== null && this.lists.length !== 0) {
      const newActiveListId = this.lists[this.activeListIndex].listId;
      document.getElementById(newActiveListId).classList.add('active-list');
    }

    // Обновляем заголовок на название нового активного списка

    if (!this.activeListIndex && !this.lists.length) {
      //проверить
      listTitleElement.innerText = this.lists[this.activeListIndex].listName;
    } else {
      listTitleElement.innerText = '';
    }

    this.saveData();

    this.showActiveListTasks();
  }
}

const todoList = new ToDoList();

newTaskForm.addEventListener('submit', e => {
  todoList.addTask(e);
});

newListForm.addEventListener('submit', e => {
  todoList.createList(e);
});

btnClearCompleteTasks.addEventListener('click', () => {
  todoList.deleteCompletedTask();
});

btnDeleteList.addEventListener('click', () => {
  todoList.deleteList();
});

listsContainer.addEventListener('click', e => {
  todoList.toggleActiveList(e.target);
});

tasksContainer.addEventListener('click', event => {
  todoList.savesCompletedTask(event);
});
