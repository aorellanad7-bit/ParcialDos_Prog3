const API_URL = "https://parcialdosjuanpablo.azurewebsites.net/api/Paciente";

// --- NAVEGACIÓN ENTRE PESTAÑAS ---
function cambiarPestana(pestana) {
    // Ocultar ambas secciones
    document.getElementById('tab-dashboard').classList.add('hidden');
    document.getElementById('tab-registro').classList.add('hidden');
    
    // Quitar estilos activos de los botones
    document.getElementById('btn-dashboard').classList.replace('bg-blue-800', 'text-blue-200');
    document.getElementById('btn-registro').classList.replace('bg-blue-800', 'text-blue-200');

    // Activar la sección y botón seleccionados
    document.getElementById(`tab-${pestana}`).classList.remove('hidden');
    document.getElementById(`btn-${pestana}`).classList.replace('text-blue-200', 'bg-blue-800');

    // Si abrimos el dashboard, recargamos la tabla
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

    try {
        const respuesta = await fetch(API_URL);
        const pacientes = await respuesta.json();
        
        loader.classList.add('hidden');

        if(pacientes.length === 0) {
            tbody.innerHTML = `<tr><td colspan="5" class="text-center py-4">No hay pacientes registrados.</td></tr>`;
            return;
        }

        pacientes.forEach(p => {
            const esCritico = p.gravedad === 5;
            const filaClases = esCritico ? "bg-red-100 hover:bg-red-200" : "bg-white hover:bg-gray-50";
            const badgeGravedad = esCritico ? `<span class="bg-red-500 text-white px-2 py-1 rounded text-xs font-bold">5 - CRÍTICO</span>` : p.gravedad;
            
            // Formatear Fecha
            let fecha = "N/A";
            if(p.fechaIngreso) {
                fecha = new Date(p.fechaIngreso).toLocaleString();
            }

            const tr = document.createElement('tr');
            tr.className = `border-b ${filaClases}`;
            tr.innerHTML = `
                <td class="px-5 py-4 font-medium">${p.id}</td>
                <td class="px-5 py-4 font-bold text-gray-700">${p.nombre || 'Sin nombre'}</td> <td class="px-5 py-4">${badgeGravedad}</td>
                <td class="px-5 py-4"><span class="bg-yellow-200 text-yellow-800 px-2 py-1 rounded text-xs font-bold">${p.estado}</span></td>
                <td class="px-5 py-4">${p.medicoResponsable}</td>
                <td class="px-5 py-4 text-sm text-gray-500">${fecha}</td>
            `;
            tbody.appendChild(tr);
        });

    } catch (error) {
        loader.innerHTML = `<span class="text-red-500 font-bold">Error al conectar con el servidor.</span>`;
    }
}

// --- ENDPOINT POST: NUEVO REGISTRO ---
async function enviarRegistro(evento) {
    evento.preventDefault(); // Evita que la página recargue
    
    const alerta = document.getElementById('alerta-form');
    alerta.classList.add('hidden'); // Ocultar alertas previas

    // Nota: Nombre y Síntomas se piden visualmente por rúbrica, 
    // pero mandamos a la API lo que nuestro modelo en C# acepta.
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
            document.getElementById('form-registro').reset(); // Limpiar el formulario
            
            // Retraso ligero y enviar al usuario a ver el paciente en la tabla
            setTimeout(() => {
                cambiarPestana('dashboard');
            }, 1500);
        }

    } catch (error) {
        mostrarAlerta("Error de red: No se pudo conectar a la API.", "red");
    }
}

// Función auxiliar para mostrar alertas en el formulario
function mostrarAlerta(mensaje, color) {
    const alerta = document.getElementById('alerta-form');
    alerta.textContent = mensaje;
    alerta.className = `mb-6 p-4 rounded text-sm font-bold bg-${color}-100 text-${color}-800 border-l-4 border-${color}-500 block`;
}

// Cargar la tabla inicial
obtenerPacientes();