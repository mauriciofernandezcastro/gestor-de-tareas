class Tarea {
    constructor(id, descripcion) {
        this.id = id;
        this.descripcion = descripcion;
        this.estado = "pendiente"; // Estado inicial
        this.fechaCreacion = new Date().toLocaleDateString();
    }

    
    cambiarEstado() {
        if (this.estado === "pendiente") {
            this.estado = "completada";
        } else {
            this.estado = "pendiente";
        }
    }
}


class GestorTareas {
    constructor() {
        
        const tareasGuardadas = JSON.parse(localStorage.getItem("mis_tareas")) || [];
        
        
        this.lista = tareasGuardadas.map(t => {
            const nueva = new Tarea(t.id, t.descripcion);
            nueva.estado = t.estado;
            return nueva;
        });
    }

    
    agregarTarea(tarea) {
        this.lista.push(tarea);
        this.guardarEnLocalStorage();
    }

    
    eliminarTarea(id) {
        this.lista = this.lista.filter(t => t.id !== id);
        this.guardarEnLocalStorage();
    }

    
    guardarEnLocalStorage() {
        localStorage.setItem("mis_tareas", JSON.stringify(this.lista));
    }
}


const gestor = new GestorTareas();



const formulario = document.getElementById("formulario-tarea");
const inputTarea = document.getElementById("nueva-tarea");
const listaUI = document.getElementById("lista-tareas");


const mostrarTareasUI = () => {
    listaUI.innerHTML = ""; // Limpiamos la lista visual primero

    
    const tareasParaMostrar = [...gestor.lista];

    tareasParaMostrar.forEach(tarea => {
        const li = document.createElement("li");
        
        
        if (tarea.estado === "completada") {
            li.classList.add("completada");
        }

        
        li.innerHTML = `
            <span>${tarea.descripcion} (${tarea.fechaCreacion})</span>
            <div>
                <button class="btn-estado" data-id="${tarea.id}">✔</button>
                <button class="btn-eliminar" data-id="${tarea.id}">❌</button>
            </div>
        `;

        
        li.addEventListener("mouseover", () => {
            li.style.backgroundColor = "#e0e0e0";
        });
        li.addEventListener("mouseout", () => {
            li.style.backgroundColor = "#eee";
        });

        listaUI.appendChild(li);
    });
};


formulario.addEventListener("submit", (e) => {
    e.preventDefault(); // Evita que la página se recargue

    const texto = inputTarea.value.trim();
    if (texto === "") return;

        
    setTimeout(() => {
        const nuevaTarea = new Tarea(Date.now(), texto);
        gestor.agregarTarea(nuevaTarea);
        
        mostrarTareasUI();
        inputTarea.value = ""; // Limpiar el input

        mostrarNotificacion("¡Tarea agregada con éxito!");
    }, 500);
});


listaUI.addEventListener("click", (e) => {
    const id = Number(e.target.dataset.id);
    if (!id) return;

    if (e.target.classList.contains("btn-estado")) {
        const tareaEncontrada = gestor.lista.find(t => t.id === id);
        if (tareaEncontrada) {
            tareaEncontrada.cambiarEstado();
            gestor.guardarEnLocalStorage();
            mostrarTareasUI();
        }
    }

    if (e.target.classList.contains("btn-eliminar")) {
        gestor.eliminarTarea(id);
        mostrarTareasUI();
        mostrarNotificacion("Tarea eliminada.");
    }
});


inputTarea.addEventListener("keyup", () => {
    const btn = document.getElementById("btn-guardar");
    if (inputTarea.value.length > 0) {
        btn.style.backgroundColor = "darkgreen";
    } else {
        btn.style.backgroundColor = "green";
    }
});



const mostrarNotificacion = (mensaje) => {
    const cajaNotificacion = document.getElementById("notificacion");
    cajaNotificacion.innerText = mensaje;
    cajaNotificacion.classList.remove("oculto");

    setTimeout(() => {
        cajaNotificacion.classList.add("oculto");
    }, 2000); // 2 segundos exactos
};


let tiempoSobrante = 10;
const cajaContador = document.getElementById("contador");

const intervalo = setInterval(() => {
    tiempoSobrante--;
    cajaContador.innerText = tiempoSobrante;

    if (tiempoSobrante <= 0) {
        clearInterval(intervalo);
        document.getElementById("contador-caja").innerText = "¡Tiempo de revisión terminado!";
    }
}, 1000);



const cargarTareasDeServidor = async () => {
    try {
        
        const respuesta = await fetch("https://jsonplaceholder.typicode.com/todos?_limit=3");
        
        
        if (!respuesta.ok) {
            throw new Error("No se pudo conectar a la API externa");
        }

        const datosExternos = await respuesta.json();

        
        if (gestor.lista.length === 0) {
            datosExternos.forEach(item => {
                // Destructuring elemental de propiedades de la API (Paso 2)
                const { title } = item; 
                const nueva = new Tarea(Date.now() + Math.random(), title);
                gestor.agregarTarea(nueva);
            });
            mostrarTareasUI();
        }
    } catch (error) {
        console.error("Hubo un problema con la API: ", error.message);
    }
};


mostrarTareasUI();
cargarTareasDeServidor();
