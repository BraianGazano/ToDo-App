const todoApp = document.querySelector(".todo-app");
const imagenCabecera = document.querySelectorAll("header img");
const input = document.querySelector(".nuevaTarea input");
const todoListUl = document.querySelector(".todo-list ul");
const botones = document.querySelector(".botones");
const botonesFiltro = document.querySelectorAll(".botones .botonesFiltro li");
const contadorItemsRestantes = document.querySelector(".itemsRestantes .number");
const botonLimpiarCompletos = document.querySelector(".botones .botonLimpiarCompletados");


// Si hay tareas almacenadas en el localStorage las recupero
if (localStorage.length !== 0) {
  let cantidadItemsAlmacenados = 0;
  let datosAlmacenados = [];
  for (let [key, val] of Object.entries(localStorage)) {
    if (key.startsWith("todo-")) {
      cantidadItemsAlmacenados += 1;
      datosAlmacenados.push(key);
    }
  }
  if (cantidadItemsAlmacenados > 0) {
    // Los recupero en orden
    for (let i = 1; i <= datosAlmacenados.length; i++) {
      let data = JSON.parse(localStorage.getItem(`todo-${i}`));
      if(data != null){
        agregarTarea(data.text, data.class);
      }
    }
  }
}

//Recupero el tema que este almacenado
if (localStorage.getItem("data-theme")) { 
  if (todoApp.classList.item(1) !== localStorage.getItem("data-theme")) { 
    let temaAlmacenado = localStorage.getItem("data-theme");
    aplicarTema(temaAlmacenado);
  }
}

// Intercambio entre tema claro/oscuro
imagenCabecera.forEach(img => {
  img.onclick = function () {
    localStorage.setItem("data-theme", this.dataset.theme); 
    aplicarTema(this.dataset.theme);
  };
});


// Intercambio el placeholder si está onfocus
input.onfocus = function () {
  this.placeholder = "";
};
//Añado una nueva tarea
input.onblur = function () {
  if (this.value.trim() !== "") {
    agregarTarea(this.value);
    actualizarLocalStorage();
  }
  this.value = "";
  this.placeholder = this.dataset.placeholder;
};


// 
todoListUl.addEventListener("click", function (e) {
  if (e.target.className === "icon" || e.target.tagName === "P") {
    e.target.parentElement.classList.toggle("active");
    e.target.parentElement.classList.toggle("completed");
    actualizarContadorItemsRestantes();
    actualizarFiltro();
    actualizarLocalStorage();
  }
  // Elimina la tarea si se clickea en la cruz
  if (e.target.className === "delete") {
    e.target.parentElement.remove();
    localStorage.removeItem(`${e.target.parentElement.id}`);
    actualizarContadorItemsRestantes();
    actualizarFiltro();
    contarItems();
    actualizarLocalStorage();
  }
});


//Filtrado segun corresponda
botonesFiltro.forEach(boton => {
  boton.onclick = function () {
    botonesFiltro.forEach(boton => {
      boton.classList.remove("seleccionado");
    });
    this.classList.add("seleccionado");
    filtrarLista(this.dataset.filter);
  };
});


// Remueve las tareas completadas
botonLimpiarCompletos.onclick = function () {
  document.querySelectorAll(".todo-list .todo").forEach(todo => {
    if (todo.classList.contains("completed")) {
      todo.remove();
      localStorage.removeItem(`${todo.id}`);
      contarItems();
      actualizarLocalStorage();
    }
  });
};


function aplicarTema(temaNuevo) {
  let temaViejo = todoApp.classList.item(1);
  todoApp.classList.remove(temaViejo); 
  todoApp.classList.add(temaNuevo);
  document.querySelector(`[data-theme="${temaNuevo}"]`).classList.remove("disponible"); 
  document.querySelector(`[data-theme="${temaViejo}"]`).classList.add("disponible"); 
}


// Se crea y añade el elemento a la lista
function agregarTarea(textParam, classParam) {
  const li = document.createElement("li"); 
  li.id = `todo-${document.querySelectorAll(".todo").length + 1}`;
  li.className = classParam || "todo active";
  li.innerHTML = `
    <span class="icon"><img class="check" src="images/icon-check.svg" alt="icon-check"></span>
    <p>${textParam}</p>
    <img class="delete" src="images/icon-cross.svg" alt="icon-cross">
  `;
  // Add Drag and Drop Events
  li.setAttribute("draggable", true);
  li.lastElementChild.setAttribute("draggable", false); // Make delete button not draggable
  // Add Event "dragstart" to each todo
  li.ondragstart = dragStart;
  // Add Event "dragover" to each todo to allow drop
  li.ondragover = dragOver;
  // Add Event "drop" to each todo
  li.ondrop = drop;

  todoListUl.appendChild(li);
  actualizarContadorItemsRestantes();
  contarItems();
}

function actualizarContadorItemsRestantes() {
  contadorItemsRestantes.innerHTML = document.querySelectorAll(".todo.active").length;
}

actualizarContadorItemsRestantes();


// Filtra las tareas correspondientes al filtro seleccionado
function filtrarLista(filtro) {
  document.querySelectorAll(".todo-list .todo").forEach(todo => {
    if (!todo.classList.contains(filtro)) {
      todo.classList.add("hidden"); 
    } else {
      todo.classList.remove("hidden");
    }
  });
}

function actualizarFiltro() {
  for (boton of botonesFiltro) {
    if(boton.classList.contains("seleccionado")) { 
      filtrarLista(boton.dataset.filter);
    }
  }
}

// Drag and Drop handler Functions
function dragStart(e) {
  e.dataTransfer.setData("number", e.target.dataset.number);
  e.dataTransfer.setData("text", e.target.id);
  e.dataTransfer.effectAllowed = "move";
}
function dragOver(e) {
  e.preventDefault();
  e.dataTransfer.dropEffect = "move";
}
function drop(e) {
  e.preventDefault();
  const number = e.dataTransfer.getData("number");
  const data = e.dataTransfer.getData("text");
  if (number > e.currentTarget.dataset.number) { 
    e.currentTarget.before(document.getElementById(data)); 
  } else {
    e.currentTarget.after(document.getElementById(data));
  }
  contarItems();
  actualizarLocalStorage();
}

function contarItems() {
  document.querySelectorAll(".todo-list .todo").forEach((todo, i) => {
    todo.setAttribute("data-number", i + 1);
    todo.id = `todo-${i + 1}`;
  });
}
contarItems();

function actualizarLocalStorage() {
  for (let [key, val] of Object.entries(localStorage)) {
    if (key.startsWith("todo-")) {
      localStorage.removeItem(key);
    }
  }

  // Almaceno las tareas 
  document.querySelectorAll(".todo-list .todo").forEach(todo => {
    let data = {
      "class": todo.className,
      "text": todo.textContent.trim()
    }
    localStorage.setItem(todo.id, JSON.stringify(data));
  });
}
