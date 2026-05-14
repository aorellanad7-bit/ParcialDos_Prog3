const API_URL = "https://parcialdosjuanpablo.azurewebsites.net/pacientes";

function cambiarSeccion(seccion) {
   // Obtenemos las dos secciones
    const secVer = document.getElementById('sec-ver');
    const secRegistro = document.getElementById('sec-registro');
    
    // Obtenemos los botones para cambiarles el estilo
    const btnVer = document.getElementById('btn-ver');
    const btnRegistro = document.getElementById('btn-registro');

    if (seccion === 'ver') {
        secVer.classList.remove('hidden');
        secRegistro.classList.add('hidden');
        // Estilo activo para el botón Ver
        btnVer.classList.add('bg-blue-700', 'text-white', 'shadow-lg');
        btnRegistro.classList.remove('bg-blue-700', 'text-white', 'shadow-lg');
        btnRegistro.classList.add('text-slate-400');
        obtenerPacientes(); // Refresca la lista al volver
    } else {
        secVer.classList.add('hidden');
        secRegistro.classList.remove('hidden');
        // Estilo activo para el botón Registro
        btnRegistro.classList.add('bg-blue-700', 'text-white', 'shadow-lg');
        btnVer.classList.remove('bg-blue-700', 'text-white', 'shadow-lg');
        btnVer.classList.add('text-slate-400');
    }
}

async function obtenerPacientes() {
    const tbody = document.getElementById('tabla-pacientes');
    const loader = document.getElementById('loader');
    tbody.innerHTML = "";
    loader.classList.remove('hidden');

    try {
        const res = await fetch(API_URL);
        const datos = await res.json();
        loader.classList.add('hidden');

        datos.forEach(p => {
            const tr = document.createElement('tr');
            tr.className = "hover:bg-gray-50";
            tr.innerHTML = `
                <td class="px-6 py-4 font-bold text-gray-700">${p.nombre}</td>
                <td class="px-6 py-4"><span class="px-2 py-1 rounded text-xs font-bold ${p.gravedad >= 4 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}">${p.gravedad}</span></td>
                <td class="px-6 py-4"><span class="text-sm italic">${p.estado}</span></td>
                <td class="px-6 py-4 text-gray-500">${p.medicoResponsable}</td>
            `;
            tbody.appendChild(tr);
        });
    } catch (e) {
        loader.innerHTML = "❌ Error al cargar pacientes.";
    }
}

async function registrar(e) {
    e.preventDefault();
    const msg = document.getElementById('msg-registro');
    msg.className = "hidden mb-6 p-4 rounded-lg font-bold";

    const nuevo = {
        nombre: document.getElementById('nombre').value,
        gravedad: parseInt(document.getElementById('gravedad').value),
        estado: "En espera",
        medicoResponsable: document.getElementById('medico').value.toUpperCase()
    };

    try {
        const res = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(nuevo)
        });

        msg.classList.remove('hidden');

        // TAREA: Validaciones de errores específicos
        if (res.status === 401) {
            msg.innerText = "❌ Error 401: Médico no autorizado en el sistema.";
            msg.classList.add('bg-red-100', 'text-red-800');
        } else if (res.status === 400) {
            msg.innerText = "⚠️ Error 400: Capacidad llena para pacientes críticos.";
            msg.classList.add('bg-yellow-100', 'text-yellow-800');
        } else if (res.ok) {
            msg.innerText = "✅ Paciente registrado correctamente.";
            msg.classList.add('bg-green-100', 'text-green-800');
            e.target.reset();
        } else {
            msg.innerText = "🚨 Error desconocido en el servidor.";
            msg.classList.add('bg-gray-100', 'text-gray-800');
        }
    } catch (e) {
        alert("Fallo de conexión");
    }
}

obtenerPacientes();