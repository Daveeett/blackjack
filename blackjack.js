var saldo = 0;
var apuestaActual = 0;
var numJugadores = 1;
var jugadorActual = 0;
var cartasJugadores = [[], [], []];
var cartasCrupier = [];
var canvasJugadores = [];
var ctxJugadores = [];
var canvasCrupier;
var ctxCrupier;
var saldos = [10000];
var apuestas = [0]; 
var temporizador;

document.addEventListener('keydown', function(event) {
    if (event.key === 'Enter') {
        iniciarConfiguracion();
    }
});

document.getElementById('start-button').addEventListener('click', function() {
    iniciarConfiguracion();
});

function iniciarConfiguracion() {
    document.getElementById('inicio').style.display = 'none'; 
    document.getElementById('setup-container').style.display = 'block'; 
}

function depositarDinero() {
    var deposito = parseInt(document.getElementById("deposito").value);
    if (isNaN(deposito) || deposito <= 0) {
        alert("Por favor, ingrese un monto válido.");
        return;
    }
    saldo += deposito;
    actualizarSaldo();
    document.getElementById("apuesta").disabled = false;
    document.getElementById("botonApostar").disabled = false;
}

function apostar() {
    var apuesta = parseInt(document.getElementById("apuesta").value);
    if (isNaN(apuesta) || apuesta <= 0 || apuesta > saldo) {
        alert("Por favor, ingrese una apuesta válida.");
        return;
    }
    apuestaActual = apuesta;
    saldo -= apuesta;
    actualizarSaldo();
    document.getElementById("setup-container").style.display = "block";
    document.getElementById("apuestas-container").style.display = "none";
}

function actualizarSaldo() {
    document.getElementById("saldo").innerHTML = "Saldo: $" + saldo;
}

function iniciarJuego() {
    numJugadores = parseInt(document.getElementById("num-jugadores").value);
    if (numJugadores < 1 || numJugadores > 3) {
        alert("El número de jugadores debe ser entre 1 y 3.");
        return;
    }

    
    if (saldos.length === 1) { 
        for (let i = 0; i < numJugadores; i++) {
            saldos.push(0);
            apuestas.push(0);
        }
        generarCamposDeposito();
    } else {
        generarCamposApuesta();
    }

    actualizarSaldos();

    document.getElementById("setup-container").style.display = "none";
    document.getElementById("apuestas-container").style.display = "block";
}

function generarCamposDeposito() {
    let depositosContainer = document.getElementById("depositos-container");
    depositosContainer.innerHTML = "";
    for (let i = 1; i <= numJugadores; i++) {
        depositosContainer.innerHTML += `
            <div class="deposito-box">
                <label for="deposito-${i}">Depósito Jugador ${i}:</label>
                <input type="number" id="deposito-${i}" placeholder="Ingresa tu depósito">
                <button onclick="depositarDinero(${i})">Depositar</button>
            </div>
        `;
    }
}

function depositarDinero(jugador) {
    let deposito = parseInt(document.getElementById(`deposito-${jugador}`).value);
    if (isNaN(deposito) || deposito <= 0) {
        alert("Por favor, ingrese un monto válido.");
        return;
    }
    saldos[jugador] += deposito;
    actualizarSaldos();
    verificarDepositosCompletos();
}

function verificarDepositosCompletos() {
    let todosDepositaron = saldos.slice(1).every(saldo => saldo > 0);
    if (todosDepositaron) {
        generarCamposApuesta();
        document.getElementById("botonApostar").disabled = false;
    }
}

function generarCamposApuesta() {
    let apuestasContainer = document.getElementById("apuestas-jugadores-container");
    apuestasContainer.innerHTML = "";
    for (let i = 1; i <= numJugadores; i++) {
        apuestasContainer.innerHTML += `
            <div class="apuesta-box">
                <label for="apuesta-${i}">Apuesta Jugador ${i} (Saldo: $${saldos[i]}):</label>
                <input type="number" id="apuesta-${i}" placeholder="Ingresa tu apuesta" max="${saldos[i]}">
            </div>
        `;
    }
    document.getElementById("botonApostar").disabled = false;
}

function realizarApuestas() {
    console.log("Función realizarApuestas() llamada");

    for (let i = 1; i <= numJugadores; i++) {
        let apuestaInput = document.getElementById(`apuesta-${i}`);
        if (!apuestaInput || apuestaInput.value === "") {
            alert(`Por favor, ingrese una apuesta para el Jugador ${i}`);
            return;
        }
        let apuesta = parseInt(apuestaInput.value);
        if (isNaN(apuesta) || apuesta <= 0 || apuesta > saldos[i]) {
            alert(`Apuesta inválida para el Jugador ${i}. Debe ser un número positivo no mayor a su saldo actual.`);
            return;
        }
        apuestas[i] = apuesta;
    }

    let minApuesta = Math.min(...apuestas.slice(1));
    let maxApuesta = Math.max(...apuestas.slice(1));
    apuestas[0] = Math.floor(Math.random() * (maxApuesta - minApuesta + 1)) + minApuesta;

    console.log("Apuestas realizadas:", apuestas);
    console.log("Saldos actualizados:", saldos);

    mostrarSaldosYApuestas();

    iniciarPartida();
    document.getElementById("turno-container").style.display = "block"; 
}

function actualizarSaldos() {
    let saldosContainer = document.getElementById("saldos-container");
    saldosContainer.innerHTML = `<p>Saldo Crupier: $${saldos[0]}</p>`;
    for (let i = 1; i <= numJugadores; i++) {
        saldosContainer.innerHTML += `<p>Saldo Jugador ${i}: $${saldos[i]}</p>`;
    }
}

function iniciarPartida() {
    console.log("Iniciando partida"); 

    document.getElementById("title").style.display = "none";

    document.getElementById("apuestas-container").style.display = "none";
    document.getElementById("game-container").style.display = "block";
    
    for (let i = 1; i <= 3; i++) {
        let playerZone = document.getElementById(`player${i}`);
        if (i <= numJugadores) {
            playerZone.style.display = "block";
        } else {
            playerZone.style.display = "none";
        }
    }
    
    inicializarCanvas();
    barajarCartas();
    mostrarSaldosYApuestas();
    repartirCartasIniciales();
    iniciarTemporizador();
    jugadorActual = 0;
    document.getElementById("turno-jugador").innerText = `Turno del Jugador 1`; 
    document.querySelector(".text").innerText = `Turno del Jugador 1`;
    document.getElementById("turno-container").style.display = "block"; 
}

function inicializarCanvas() {
    canvasJugadores = [];
    ctxJugadores = [];
    for (let i = 1; i <= numJugadores; i++) {
        let canvas = document.getElementById("canvas" + i);
        canvas.width = canvas.offsetWidth;
        canvas.height = 250;
        canvasJugadores.push(canvas);
        ctxJugadores.push(canvas.getContext("2d"));
        
        let puntosElement = document.createElement("p");
        puntosElement.id = "puntos-jugador-" + i;
        puntosElement.className = "puntos-jugador";
        document.getElementById("player" + i).appendChild(puntosElement);
    }

    canvasCrupier = document.getElementById("canvasDealer");
    canvasCrupier.width = canvasCrupier.offsetWidth;
    canvasCrupier.height = 250;
    ctxCrupier = canvasCrupier.getContext("2d");

    let puntosCrupierElement = document.createElement("p");
    puntosCrupierElement.id = "puntos-crupier";
    puntosCrupierElement.className = "puntos-jugador";
    document.getElementById("dealer-container").appendChild(puntosCrupierElement);
}

class Carta {
    constructor(valor, palo) {
        this.img = new Image();
        this.valor = valor;
        this.palo = palo;
    }
}

var cartas = [];
var indiceCarta = 0;
var palos = ["S", "H", "D", "C"];


for (let i = 0; i < 4; i++) {
    for (let j = 1; j <= 13; j++) {
        cartas.push(new Carta(j, palos[i]));
    }
}

function barajarCartas() {

    cartas = [];
    for (let i = 0; i < 4; i++) {
        for (let j = 1; j <= 13; j++) {
            cartas.push(new Carta(j, palos[i]));
        }
    }

    // Barajar las cartas
    for (let i = 0; i < 100; i++) {
        cartas.splice(Math.random() * 52, 0, cartas[0]);
        cartas.shift();
    }
}

function dibujarCarta(carta, ctx, x, y) {
    return new Promise((resolve) => {
        carta.img.onload = () => {
            let canvasWidth = ctx.canvas.width;
            let canvasHeight = ctx.canvas.height;
            let cardWidth = canvasHeight * 0.5;
            let cardHeight = cardWidth * 1.5; 
            ctx.drawImage(carta.img, x, y, cardWidth, cardHeight);
            resolve();
        };
        carta.img.onerror = () => {
            console.error(`Error al cargar la imagen: ${carta.img.src}`);
            resolve();
        };
        carta.img.src = "imagenes/cartas/" + carta.valor.toString() + carta.palo + ".svg";
    });
}

async function repartirCartasIniciales() {
    cartasJugadores = [[], [], []]; // Reiniciar las cartas de los jugadores
    cartasCrupier = []; // Reiniciar las cartas del crupier

    for (let i = 0; i < numJugadores; i++) {
        await dibujarCarta(cartas[indiceCarta++], ctxJugadores[i], 10, 10);
        await dibujarCarta(cartas[indiceCarta++], ctxJugadores[i], 100, 10);
        cartasJugadores[i].push(cartas[indiceCarta - 2], cartas[indiceCarta - 1]);
    }


    let cartaAlta = cartas.find(carta => carta.valor >= 10);
    if (cartaAlta) {
        cartasCrupier.push(cartaAlta);
        cartas.splice(cartas.indexOf(cartaAlta), 1);
    } else {
        cartasCrupier.push(cartas[indiceCarta++]);
    }
    await dibujarCarta(cartasCrupier[0], ctxCrupier, 10, 10);

    await dibujarCarta(cartas[indiceCarta++], ctxCrupier, 100, 10);
    cartasCrupier.push(cartas[indiceCarta - 1]);
    actualizarPuntos();
}

async function pedirCarta() {
    if (jugadorActual < numJugadores) {
        let carta = cartas[indiceCarta++];
        cartasJugadores[jugadorActual].push(carta);
        dibujarCartasJugador(jugadorActual);

        actualizarPuntos();

        let puntos = calcularPuntos(cartasJugadores[jugadorActual]);
        if (puntos > 21) {
            siguienteJugador();
        }
    }
}

function iniciarTemporizador() {
    clearTimeout(temporizador);
    temporizador = setTimeout(() => {
        if (jugadorActual < numJugadores) {
            document.getElementById("info").innerHTML += `<br>Jugador ${jugadorActual + 1} se planta automáticamente.`;
            plantarme();
        }
    }, 8000); 
}

async function turnoCrupier() {
    ctxCrupier.clearRect(0, 0, canvasCrupier.width, canvasCrupier.height);
    let spacing = canvasCrupier.width / 7; 
    let startX = (canvasCrupier.width - (cartasCrupier.length * spacing)) / 2; 

    for (let i = 0; i < cartasCrupier.length; i++) {
        await dibujarCarta(cartasCrupier[i], ctxCrupier, startX + i * spacing, 20);
    }
    

    while (calcularPuntos(cartasCrupier) < 19 && cartasCrupier.length < 6) {
        let carta = cartas[indiceCarta++];
        cartasCrupier.push(carta);

        startX = (canvasCrupier.width - (cartasCrupier.length * spacing)) / 2;
        
        ctxCrupier.clearRect(0, 0, canvasCrupier.width, canvasCrupier.height);
        for (let i = 0; i < cartasCrupier.length; i++) {
            await dibujarCarta(cartasCrupier[i], ctxCrupier, startX + i * spacing, 20);
        }
        actualizarPuntos();
    }
    determinarGanador();
}

function calcularPuntos(mano) {
    let puntos = 0;
    let ases = 0;
    for (let carta of mano) {
        if (carta.valor > 10) {
            puntos += 10;
        } else if (carta.valor === 1) {
            ases++;
            puntos += 11;
        } else {
            puntos += carta.valor;
        }
    }
    while (puntos > 21 && ases > 0) {
        puntos -= 10;
        ases--;
    }
    return puntos;
}

function determinarGanador() {
    console.log("Saldos antes de determinar ganador:", JSON.parse(JSON.stringify(saldos)));
    console.log("Apuestas:", JSON.parse(JSON.stringify(apuestas)));
    
    let puntosCrupier = calcularPuntos(cartasCrupier);
    let info = document.getElementById("info");
    
    let ganadores = [];
    let empate = false;

    for (let i = 1; i <= numJugadores; i++) {
        let puntosJugador = calcularPuntos(cartasJugadores[i-1]);
        
        // Manejar el caso de empate cuando hay un solo jugador
        if (numJugadores === 1 && puntosJugador === puntosCrupier) {
            empate = true; // Se marca el empate
            break; // Salir del bucle, ya que no hay ganadores
        }

        // Verificar si el jugador gana
        if (puntosJugador <= 21 && (puntosJugador > puntosCrupier || puntosCrupier > 21)) {
            ganadores.push(i);
        }
    }

    info.innerHTML = "";

    if (empate) {
        info.innerHTML += `<span style="font-size: 35px; font-weight: bold; color: orange;">Empate: Se devuelve el dinero a ambos</span>`;
        for (let i = 1; i <= numJugadores; i++) {
            saldos[i] += apuestas[i]; // Devolver el dinero al jugador
            saldos[0] -= apuestas[i]; // Devolver el dinero al crupier
        }
    } else if (ganadores.length === 0) {
        // Verificar si todos se pasaron de 21
        let todosPerdieron = true;
        for (let i = 1; i <= numJugadores; i++) {
            if (calcularPuntos(cartasJugadores[i-1]) <= 21) {
                todosPerdieron = false;
                break;
            }
        }
        if (todosPerdieron && puntosCrupier > 21) {
            info.innerHTML += `<span style="font-size: 35px; font-weight: bold; color: red;">Todos pierden</span>`;
            // No se ajustan los saldos ya que todos pierden
        } else {
            info.innerHTML += `<span style="font-size: 35px; font-weight: bold; color: red;">El Crupier gana</span>`;
            for (let i = 1; i <= numJugadores; i++) {
                saldos[0] += apuestas[i];
                saldos[i] -= apuestas[i];
            }
        }
    } else {
        info.innerHTML += `<span style="font-size: 35px; font-weight: bold; color: green;">${ganadores.length === 1 ? 'El Jugador ' + ganadores[0] + ' gana' : 'Ganan los jugadores: ' + ganadores.join(', ')}</span>`;
        for (let i of ganadores) {
            saldos[i] += apuestas[i];
            saldos[0] -= apuestas[i];
        }
        for (let i = 1; i <= numJugadores; i++) {
            if (!ganadores.includes(i)) {
                saldos[i] -= apuestas[i];
                saldos[0] += apuestas[i];
            }
        }
    }

    info.innerHTML += `<br><span style="font-size: 20px; font-weight: bold;">Puntos del Crupier: ${puntosCrupier}</span>`;
    for (let i = 1; i <= numJugadores; i++) {
        let puntosJugador = calcularPuntos(cartasJugadores[i-1]);
        info.innerHTML += `<br>Puntos del Jugador ${i}: ${puntosJugador}`;
    }

    console.log("Saldos después de determinar ganador:", JSON.parse(JSON.stringify(saldos)));

    mostrarSaldosYApuestas();
    actualizarSaldos();
    document.getElementById("pedir").disabled = true;
    document.getElementById("plantar").disabled = true;
    document.getElementById("reset").style.visibility = "visible";
}

function plantarme() {
    // document.getElementById("info").innerHTML += `<br>Jugador ${jugadorActual + 1} se planta.`; // Comentado para ocultar el mensaje
    siguienteJugador();
}

function siguienteJugador() {
    if (jugadorActual > 0) {
        document.getElementById(`player${jugadorActual}`).classList.remove('jugador-activo');
    }

    jugadorActual++;
    if (jugadorActual >= numJugadores) {
        turnoCrupier();
    } else {
        // document.getElementById("info").innerHTML += `<br>Turno del Jugador ${jugadorActual + 1}`; // Comentado para ocultar el mensaje

        const nuevoTurno = `Turno del Jugador ${jugadorActual + 1}`;
        document.getElementById("turno-jugador").innerText = nuevoTurno;
        document.querySelector(".text").innerText = nuevoTurno; 

        dibujarCartasJugador(jugadorActual);
        
        document.getElementById(`player${jugadorActual}`).classList.add('jugador-activo');

        iniciarTemporizador();
    }
}

function dibujarCartasJugador(jugador) {
    ctxJugadores[jugador].clearRect(0, 0, canvasJugadores[jugador].width, canvasJugadores[jugador].height);
    let spacing = canvasJugadores[jugador].width / 7;
    let startX = (canvasJugadores[jugador].width - (cartasJugadores[jugador].length * spacing)) / 2;

    for (let i = 0; i < cartasJugadores[jugador].length; i++) {
        dibujarCarta(cartasJugadores[jugador][i], ctxJugadores[jugador], startX + i * spacing, 20);
    }
}

function playagain() {
    cartasJugadores = [[], [], []];
    cartasCrupier = [];
    indiceCarta = 0; // Reiniciar el índice de cartas
    jugadorActual = 0;

    for (let ctx of ctxJugadores) {
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    }
    ctxCrupier.clearRect(0, 0, canvasCrupier.width, canvasCrupier.height);

    canvasJugadores = [];
    ctxJugadores = [];

    document.getElementById("info").innerHTML = "";
    document.getElementById("pedir").disabled = false;
    document.getElementById("plantar").disabled = false;
    document.getElementById("reset").style.visibility = "hidden";

    apuestas = [0];
    for (let i = 1; i <= numJugadores; i++) {
        apuestas.push(0);
    }

    document.getElementById("game-container").style.display = "none";
    document.getElementById("apuestas-container").style.display = "block";
    generarCamposApuesta();
    actualizarSaldos();
    mostrarSaldosYApuestas();

    barajarCartas(); 

    document.getElementById("turno-container").style.display = "none"; 
}


document.getElementById("apuesta").disabled = true;
document.getElementById("botonApostar").disabled = true;

function mostrarSaldosYApuestas() {
    let infoContainer = document.getElementById("info");

    infoContainer.innerHTML ;
}

function actualizarPuntos() {
    for (let i = 0; i < numJugadores; i++) {
        let puntos = calcularPuntos(cartasJugadores[i]);
        document.getElementById("puntos-jugador-" + (i + 1)).textContent = "Puntos: " + puntos;
    }
    let puntosCrupier = calcularPuntos(cartasCrupier);
    document.getElementById("puntos-crupier").textContent = "Puntos: " + puntosCrupier;
}

function iniciarNuevaPartida() {

    cartasCrupier = [];
    cartasJugadores = Array(numJugadores).fill().map(() => []); 


    puntosCrupier = 0;


    apuestas = Array(numJugadores + 1).fill(0); 
    repartirCartas();
    mostrarSaldosYApuestas();

}

function repartirCartas() {

    cartasCrupier.push(barajarCartas());
    cartasJugadores.forEach((_, i) => {
        cartasJugadores[i].push(barajarCartas());
    });

    puntosCrupier = calcularPuntos(cartasCrupier);
}
