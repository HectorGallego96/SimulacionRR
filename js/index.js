// programa JavaScript para la implementación de la programación de RR

// Función para encontrar el tiempo de espera para todos
// procesos


// declaracion de variables
let btnAgregar = document.querySelector("#btnAgregar");
let btnEjecucion = document.querySelector("#ejecucion");
let filaIngresados = document.querySelector(".pedidos-ingresados");
let combo = document.querySelector("#comidas");
let filaProcesamiento = document.querySelector("#filaProcesamiento");
let filaEntregado = document.querySelector("#filaEntregado");
let tabla = document.querySelector(".table")
let tBody = tabla.querySelector(".t-body")
let mediaRespuesta = document.querySelector(".media-respuesta")
let mediaEspera = document.querySelector(".media-espera")
let divQuantum = document.querySelector(".quantum");


// contador de numero de orden
let contNumOrden = 0;

let tiemposEspera
let tiemposRespuesta


// arrays para guardar el orden en que se preparan y el oreden en que quedan preparados
let listaPreparacion = [];
let listaPreparados = [];

let procesos = [];
let numeroProceso;
let rafagas = [];
let quantum = 2;

// contadores de  procesos de ejecucion
let cont = 0;
let cont2 = 0;


// clase pedido

let tiempoPreparacionComidas = {
    Salchipapa: 10,
    Hamburguesa: 5,
    PerroCaliente: 8,
    Pizza: 7
}

// clase Pedido
class Pedido {

    constructor(numeroOrden, pedido) {
        this.numeroOrden = numeroOrden;
        this.pedido = pedido;
        this.tiempoPreparacion = tiempoPreparacionComidas[pedido];
    }

}

// algoritmo Fila
class FilaPedidos {

    constructor() {
        this.items = {};
        this.front = 0;
        this.end = 0;
    }

    // metodo insertar
    push(pedido) {
        this.items[this.end] = pedido;
        this.end++;
    }

    // metodo eliminar
    pop() {
        if (this.front === this.end) {
            return null;
        }
        const pedido = this.items[this.front];
        this.front++;
        return pedido;
    }

    // metodo obtener tamaño
    getSize() {
        return this.end - this.front;
    }

    // metodo si esta vacia
    isEmpty() {
        if (this.getSize() === 0) {
            return true;
        } else {
            return false;
        }
    }

    // ver primer valor
    peek() {
        if (this.getSize() === 0) {
            return null;
        }
        ;
        return this.items[this.front];
    }

};
const filaPedidos = new FilaPedidos();


// algoritmo RR
const calcularTiempoDeEspera = (procesos, numeroProcesos, rafagas, tiemposEspera, quantum) => {
    // Hacer una copia de los tiempos de ráfaga rafagas[] para almacenar los tiempos de ráfaga restantes.
    let copiaRafagas = new Array(numeroProcesos).fill(0)
    for (let i = 0; i < numeroProcesos; i++)
        copiaRafagas[i] = rafagas[i];

    let tiempoActual = 0; // tiempo Actual

    // Continúe recorriendo los procesos en forma de turno rotativo hasta que no terminen todos.
    while (1) {

        let terminado = true;

        // Atravesar todos los procesos uno por uno repetidamente
        for (let i = 0; i < numeroProcesos; i++) {
            // Si el tiempo de ráfaga de un proceso es mayor que 0, solo es necesario seguir procesando
            if (copiaRafagas[i] > 0) {
                terminado = false; // Hay un proceso pendiente

                if (copiaRafagas[i] > quantum) {
                    // Aumenta el valor de tiempoActual, es decir, muestra cuánto tiempo se ha procesado un proceso
                    tiempoActual += quantum;

                    // Disminuir el rafagas del proceso actual por cantidad
                    copiaRafagas[i] -= quantum;

                    listaPreparacion.push(procesos[i]);



                }

                // Si el tiempo de ráfaga es menor o igual que el cuanto. Último ciclo para este proceso
                else {
                    // Aumentar el valor de tiempoActual, es decir, muestra cuánto tiempo se ha procesado un proceso
                    tiempoActual = tiempoActual + copiaRafagas[i];

                    // El tiempo de espera es el tiempo actual menos el tiempo utilizado por este proceso
                    tiemposEspera[i] = tiempoActual - rafagas[i];

                    // A medida que el proceso se ejecuta por completo, haga que su tiempo de ráfaga restante sea = 0
                    copiaRafagas[i] = 0;
                    listaPreparados.push(procesos[i]);


                }
            }
        }

        // si todos los procesos han terminado
        if (terminado == true)
            break;
    }
}

// Función para calcular el tiempo de vuelta
const calcularTiempoDeRespuesta = (procesos, n, rafagas, tiemposEspera, tiempoRespuesta) => {
    // calcular el tiempo de respuesta sumando rafagas[i] + tiemposEspera[i]
    for (let i = 0; i < n; i++)
        tiempoRespuesta[i] = rafagas[i] + tiemposEspera[i];
}

// Función para calcular el tiempo promedio
const calcularTiempoPromedio = (procesos, numeroProcesos, rafagas, quantum) => {

    tiemposEspera = new Array(numeroProcesos).fill(0);
    tiemposRespuesta = new Array(numeroProcesos).fill(0);


    calcularTiempoDeEspera(procesos, numeroProcesos, rafagas, tiemposEspera, quantum);
    calcularTiempoDeRespuesta(procesos, numeroProcesos, rafagas, tiemposEspera, tiemposRespuesta);


}


// simulacion algoritmo RR mediante funciones asincronas
const delay = millis =>
    new Promise((resolve, reject) => {
        setTimeout(resolve, millis);
    });

/* funcion asincrona para simular pausa en proceso de ejecución
 fn = recive una funcion;
 repet = las veces que se quiere repetir esa funcion
 millis = tiempo de espera entre la llamada de cada funcion
 ...args = lista de argumentos para ejecutar la funcion (opcional)
*/
const interLock = async (fn, repeat, millis, ...args) => {
    for (let i = 0; i < repeat - 1; ++i) {
        fn(...args);
        await delay(millis);
    }
    fn(...args);
}

// objeto
const funcionesProcesamiento = {

    // funcion para simular el orden en que se ejecutan los procesos
    // y representarlos graficamente
    simulacionProcesamiento: function () {

        let div = document.createElement("div");
        div.textContent = "Numero Orden: " + listaPreparacion[cont] + "- Pedido: " + filaPedidos.items[listaPreparacion[cont]].pedido + " - Ejecutandose...";
        div.classList.add("item-proce");
        filaProcesamiento.appendChild(div);
        cont++

        if (cont === listaPreparacion.length) {
            interLock(() => funcionesProcesamiento.simulacionProcesados(), listaPreparados.length, 2000);
        }

    },
    // funcion para simular el orden en que terminan de ejecutarse los procesos
    // y representarlos graficamente
    simulacionProcesados: function () {

        let div = document.createElement("div");
        div.textContent = listaPreparados[cont2];
        div.textContent = "Numero Orden: " + listaPreparados[cont2] + "- Pedido: " + filaPedidos.items[listaPreparados[cont2]].pedido + " - Ejecutado ";
        div.classList.add("item-ent");
        filaEntregado.appendChild(div);
        cont2++;

        if (listaPreparados.length === cont2) {
            interLock(() => funcionesProcesamiento.imprimiTabla(), 1, 2000);
        }

    },

    imprimiTabla: function () {
        let contTiempoEspera = 0
        let contTiempoRespuesta = 0

        for (let i = 0; i < tiemposEspera.length; i++) {

            let tr = document.createElement("tr");
            let tdProceso = document.createElement("td");
            let tdRafagas = document.createElement("td");
            let tdTiempoespera = document.createElement("td");
            let tdTiempoRespuesta = document.createElement("td");

            console.log(i)
            tdProceso.textContent = i;
            tdRafagas.textContent = filaPedidos.items[i].tiempoPreparacion;
            tdTiempoespera.textContent = tiemposEspera[i];
            tdTiempoRespuesta.textContent = tiemposRespuesta[i];


            tr.appendChild(tdProceso)
            tr.appendChild(tdRafagas)
            tr.appendChild(tdTiempoespera)
            tr.appendChild(tdTiempoRespuesta)

            tBody.appendChild(tr)
            console.log(tBody)

            contTiempoEspera += tiemposEspera[i];
            contTiempoRespuesta += tiemposRespuesta[i];

        }



        mediaRespuesta.style.padding= "0.5em";
        mediaEspera.style.padding= "0.5em";
        divQuantum.style.padding = "0.5em";

        divQuantum.textContent = "Quantum: "+quantum;
        mediaRespuesta.textContent = ("Tiempo medio de Respuesta: " + (contTiempoRespuesta / tiemposRespuesta.length).toFixed(2));
        mediaEspera.textContent = ("Tiempo medio de Espera: " + (contTiempoEspera / tiemposEspera.length).toFixed(2));
    }

}


// funcion simulacion procesamiento RR
function iniciarProcesamientoRR() {


    numeroProceso = filaPedidos.getSize();

    if(numeroProceso <= 0){
        alert("La Cola de Pedidos no puede estar vacia")
        return
    }
    for (let i = 0; i < numeroProceso; i++) {

        procesos.push(filaPedidos.items[i].numeroOrden);
        rafagas.push(filaPedidos.items[i].tiempoPreparacion);
    }

    calcularTiempoPromedio(procesos, numeroProceso, rafagas, quantum);
    // promesa para encadenar los algoritmos
    interLock(() => funcionesProcesamiento.simulacionProcesamiento(), listaPreparacion.length, 2000);

}


// evento para iniciar simulacion de operacion RR
btnEjecucion.addEventListener("click", iniciarProcesamientoRR);

// evento para agregar elementos a la cola
btnAgregar.addEventListener("click", function (event) {
    event.preventDefault();

    const comida = combo.options[combo.selectedIndex].text;
    const pedido = new Pedido(contNumOrden++, comida, 5);

    filaPedidos.push(pedido);

    let rutaImagen = `img/${comida}.jpg`;


    let card = document.createElement("div");
    let img = document.createElement("img");
    let cardBody = document.createElement("div");
    let h5 = document.createElement("h5");
    let p = document.createElement("p");
    let ul = document.createElement("ul");
    let li = document.createElement("li");
    let li2 = document.createElement("li");


    for (let i = 0; i < filaPedidos.getSize(); i++){

        img.classList.add("card-img-top");
        cardBody.classList.add("card-body");
        card.classList.add("tarjeta");
        card.classList.add("card");
        h5.classList.add("card-title");
        p.classList.add("card-text");
        ul.classList.add("list-group");
        ul.classList.add("list-group-flush");
        li.classList.add("list-group-item");

        li2.classList.add("list-group-item");

        img.src = rutaImagen;
        h5.textContent = comida;
        p.textContent = "Número de Orden: "+filaPedidos.items[i].numeroOrden;
        li.textContent = "Tiempo de preparación: "+filaPedidos.items[i].tiempoPreparacion;
        li2.textContent = "Estado: Pendiente";

        ul.appendChild(li);
        ul.appendChild(li2);

        cardBody.appendChild(h5);
        cardBody.appendChild(p);

        card.appendChild(img);
        card.appendChild(cardBody);
        card.appendChild(ul);

        filaIngresados.appendChild(card);
    }

});


