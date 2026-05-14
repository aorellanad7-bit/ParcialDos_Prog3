const API_URL = "https://parcialdosjuanpablo.azurewebsites.net/Paciente";

async function cargar() {
    const lista = document.getElementById('lista-pacientes');
    const status = document.getElementById('status');
    lista.innerHTML = "";
    status.innerText = "Conectando...";

    try {
        const res = await fetch(API_URL);
        const datos = await res.json();
        status.innerText = "Datos recibidos ✅";
        
        datos.forEach(p => {
            const li = document.createElement('li');
            li.className = "p-2 border-b";
            li.innerText = `${p.nombre} - Gravedad: ${p.gravedad}`;
            lista.appendChild(li);
        });
    } catch (e) {
        status.innerText = "Error: No se pudo conectar con el servidor.";
    }
}
cargar();