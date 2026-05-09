const API_URL = "https://parcialdosjuanpablo.azurewebsites.net/api/Paciente";

// --- NAVEGACIÓN ENTRE PESTAÑAS ---
function cambiarPestana(pestana) {
    document.getElementById('tab-dashboard').classList.add('hidden');
    document.getElementById('tab-registro').classList.add('hidden');
    
    document.getElementById('btn-dashboard').classList.replace('bg-blue-800', 'text-blue-200');
    document.getElementById('btn-registro').classList.replace('bg-blue-800', 'text-blue-200');

    document.getElementById(`tab-${pestana}`).classList.remove('hidden');
    document.getElementById(`btn-${pestana}`).classList.replace('text-blue-200', 'bg-blue-800');

    if(pestana === 'dashboard') {
        obtenerPacientes();
    }
}

// --- ENDPOINT GET: MOSTRAR TABLERO ---
async function obtenerPacientes() {
    const tbody = document.getElementById('tabla-pacientes');
    const loader = document.getElementById('loading-state');
    
    tbody.innerHTML = '';
    loader.classList.remove('hidden');
    loader.innerHTML = 'Conectando con la base de datos...';

    try {
        const respuesta = await fetch(API_URL);
        
        // Si el servidor responde pero con error (ej. 404 o 500)
        if (!respuesta.ok) {
            throw new Error(`El servidor rechazó la conexión (Código: ${respuesta.status})`);
        }

        const texto = await respuesta.text();
        if (!texto) throw new Error("El servidor no envió datos (Respuesta vacía).");

        let pacientes;
        try {
            pacientes = JSON.parse(texto);
        } catch(e) {
            throw new Error("La ruta es incorrecta, el servidor devolvió una página web en lugar de datos JSON.");
        }
        
        loader.classList.add('hidden');

        if(pacientes.length === 0) {
            tbody.innerHTML = `<tr><td colspan="6" class="text-center py-4">No hay pacientes registrados. Ve a "Nuevo Registro".</td></tr>`;
            return;
        }

        pacientes.forEach(p => {
            const esCritico = p.gravedad === 5;
            const filaClases = esCritico ? "bg-red-100 hover:bg-red-200" : "bg-white hover:bg-gray-50";
            const badgeGravedad = esCritico ? `<span class="bg-red-500 text-white px-2 py-1 rounded text-xs font-bold">5 - CRÍTICO</span>` : p.gravedad;
            
            let fecha = p.fechaIngreso ? new Date(p.fechaIngreso).toLocaleString() : "N/A";

            const tr = document.createElement('tr');
            tr.className = `border-b ${filaClases}`;
            tr.innerHTML = `
                <td class="px-5 py-4 font-medium">${p.id}</td>
                <td class="px-5 py-4 font-bold text-gray-700">${p.nombre || 'Sin nombre'}</td> 
                <td class="px-5 py-4">${badgeGravedad}</td>
                <td class="px-5 py-4"><span class="bg-yellow-200 text-yellow-800 px-2 py-1 rounded text-xs font-bold">${p.estado}</span></td>
                <td class="px-5 py-4">${p.medicoResponsable || 'N/A'}</td>
                <td class="px-5 py-4 text-sm text-gray-500">${fecha}</td>
            `;
            tbody.appendChild(tr);
        });

    } catch (error) {
        // Aquí imprimimos el error exacto en la pantalla
        loader.innerHTML = `<span class="text-red-600 font-bold bg-red-100 px-4 py-2 rounded shadow">
        🚨 ERROR DETECTADO: ${error.message} <br><br>
        Si dice "Failed to fetch" o "NetworkError", sigue siendo problema de CORS en Azure.
        </span>`;
    }
}

// --- ENDPOINT POST: NUEVO REGISTRO ---
async function enviarRegistro(evento) {
    evento.preventDefault();
    const alerta = document.getElementById('alerta-form');
    alerta.classList.add('hidden'); 

    const nombrePaciente = document.getElementById('nombre').value;
    const gravedad = parseInt(document.getElementById('gravedad').value);
    const medico = document.getElementById('medico').value.toUpperCase();

    const nuevoPaciente = {
        nombre: nombrePaciente,
        gravedad: gravedad,
        estado: "En espera",
        medicoResponsable: medico
    };

    try {
        const respuesta = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(nuevoPaciente)
        });

        if (respuesta.status === 401) {
            mostrarAlerta("Acceso Denegado: El carnet del médico no está autorizado.", "red");
            return;
        }
        if (respuesta.status === 400) {
            mostrarAlerta("Capacidad máxima de pacientes críticos (Gravedad 5) alcanzada.", "red");
            return;
        }
        if (respuesta.ok) {
            mostrarAlerta("¡Paciente registrado con éxito!", "green");
            document.getElementById('form-registro').reset(); 
            setTimeout(() => { cambiarPestana('dashboard'); }, 1500);
        } else {
             throw new Error(`Rechazado (Código: ${respuesta.status})`);
        }
    } catch (error) {
        mostrarAlerta(`🚨 Fallo en el envío: ${error.message}`, "red");
    }
}

function mostrarAlerta(mensaje, color) {
    const alerta = document.getElementById('alerta-form');
    alerta.innerHTML = mensaje;
    alerta.className = `mb-6 p-4 rounded text-sm font-bold bg-${color}-100 text-${color}-800 border-l-4 border-${color}-500 block`;
    alerta.classList.remove('hidden');
}

// Iniciar cargando la tabla
obtenerPacientes();