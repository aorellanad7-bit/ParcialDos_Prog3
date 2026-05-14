const API_URL = "https://parcialdosjuanpablo.azurewebsites.net/pacientes";

function cambiarSeccion(seccion) {
    document.getElementById('sec-ver').classList.toggle('hidden', seccion !== 'ver');
    document.getElementById('sec-registro').classList.toggle('hidden', seccion !== 'registro');
    document.getElementById('btn-ver').classList.toggle('bg-blue-800', seccion === 'ver');
    document.getElementById('btn-registro').classList.toggle('bg-blue-800', seccion === 'registro');
    if(seccion === 'ver') obtenerPacientes();
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