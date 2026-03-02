// ===== FUNCIONES DE INTERFAZ DE USUARIO =====

// ===== CONFIGURAR FORMULARIO DE RESERVAS =====

function inicializarFormularioReservas() {
  renderizarProfesionales();
  let formReserva = document.getElementById('form-reserva');
  if (!formReserva) return;

  let selectServicio = document.getElementById('servicio');
  let selectTipoServicio = document.getElementById('tipoServicio');
  let selectProfesional = document.getElementById('profesional');
  let inputFecha = document.getElementById('fecha');
  let selectHora = document.getElementById('hora');

  selectServicio.addEventListener('change', function () {
    let servicio = this.value;

    selectTipoServicio.innerHTML = '<option value="">Seleccione tipo</option>';
    selectTipoServicio.disabled = false;

    if (servicio === 'veterinaria') {
      selectTipoServicio.innerHTML += '<option value="consulta">Consulta</option>';
      selectTipoServicio.innerHTML += '<option value="control">Control</option>';
    } else if (servicio === 'estetica') {
      selectTipoServicio.innerHTML += '<option value="baño">Baño</option>';
      selectTipoServicio.innerHTML += '<option value="corte">Corte de pelo</option>';
    }

    cargarProfesionales(servicio);

    if (inputFecha.value) {
      cargarHorarios(inputFecha.value, selectProfesional.value);
    }
  });

  selectProfesional.addEventListener('change', function () {
    if (inputFecha.value) {
      cargarHorarios(inputFecha.value, this.value);
    }
  });

  let inputCedula = document.getElementById('cedula');
  if (inputCedula) {
    inputCedula.addEventListener('input', function () {
      this.value = this.value.replace(/[^\d]/g, '');
    });

    inputCedula.addEventListener('blur', function () {
      let validacion = reservas.validarCedula(this.value);
      if (!validacion.valido && this.value.trim() !== '') {
        mostrarMensaje('mensaje', validacion.error, 'error');
      }
    });
  }

  inputFecha.addEventListener('change', function () {
    let validacion = reservas.validarFecha(this.value);

    if (!validacion.valido) {
      mostrarMensaje('mensaje', validacion.error, 'error');
      selectHora.disabled = true;
      selectHora.innerHTML = '<option value="">Seleccione horario</option>';
      return;
    }

    cargarHorarios(this.value, selectProfesional.value);
  });

  formReserva.addEventListener('submit', function (e) {
    e.preventDefault();
    procesarReserva();
  });
}

function cargarProfesionales(servicio) {
  let selectProfesional = document.getElementById('profesional');
  selectProfesional.innerHTML = '<option value="">Profesional (opcional)</option>';

  if (!servicio) {
    selectProfesional.disabled = true;
    return;
  }

  selectProfesional.disabled = false;
  let tipo = servicio === 'veterinaria' ? 'veterinario' : 'estilista';
  let profesionales = reservas.obtenerProfesionalesPorTipo(tipo);

  for (let i = 0; i < profesionales.length; i++) {
    selectProfesional.innerHTML += '<option value="' + profesionales[i].id + '">' + profesionales[i].nombre + '</option>';
  }
}

function cargarHorarios(fecha, profesionalId) {
  let selectHora = document.getElementById('hora');
  selectHora.innerHTML = '<option value="">Seleccione horario</option>';

  let horariosDisponibles = reservas.obtenerHorariosDisponibles(fecha, profesionalId || null);

  if (horariosDisponibles.length === 0) {
    selectHora.innerHTML += '<option value="" disabled>No hay horarios disponibles</option>';
    selectHora.disabled = true;
    mostrarMensaje('mensaje', 'No hay horarios disponibles para esta fecha', 'error');
    return;
  }

  for (let i = 0; i < horariosDisponibles.length; i++) {
    selectHora.innerHTML += '<option value="' + horariosDisponibles[i] + '">' + horariosDisponibles[i] + '</option>';
  }

  selectHora.disabled = false;
}

function renderizarProfesionales() {
  const grid = document.getElementById('equipo-grid');
  if (!grid) return;

  const profesionales = reservas.profesionales;
  grid.innerHTML = '';

  profesionales.forEach(p => {
    const card = document.createElement('div');
    card.className = 'profesional-card';

    const typeLabel = p.tipo === 'veterinario' ? 'Veterinario' : 'Estilista';
    const badgeClass = p.tipo === 'veterinario' ? 'badge-vet' : 'badge-est';

    card.innerHTML = `
      <div class="profesional-img-container">
        <img src="${p.imagen}" alt="${p.nombre}" onerror="this.src='https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?auto=format&fit=crop&q=80&w=400'">
        <span class="profesional-badge ${badgeClass}">${typeLabel}</span>
      </div>
      <div class="profesional-body">
        <h3>${p.nombre}</h3>
        <p class="profesional-role">${p.especialidad}</p>
      </div>
    `;
    grid.appendChild(card);
  });
}

function procesarReserva() {
  let sesion = reservas.obtenerSesion();
  if (!sesion) {
    mostrarMensaje('mensaje', 'Debe iniciar sesión para reservar un turno', 'error');
    let seccionLogin = document.getElementById('login');
    if (seccionLogin) {
      seccionLogin.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    return;
  }

  let cedula = document.getElementById('cedula').value.trim();
  let validacionCedula = reservas.validarCedula(cedula);
  if (!validacionCedula.valido) {
    mostrarMensaje('mensaje', validacionCedula.error, 'error');
    return;
  }

  let datos = {
    usuarioId: sesion.usuarioId,
    cedula: cedula,
    nombreMascota: document.getElementById('nombreMascota').value.trim(),
    tipoMascota: document.getElementById('tipoMascota').value,
    servicio: document.getElementById('servicio').value,
    tipoServicio: document.getElementById('tipoServicio').value,
    profesionalId: document.getElementById('profesional').value || null,
    fecha: document.getElementById('fecha').value,
    hora: document.getElementById('hora').value
  };

  let validacionFecha = reservas.validarFecha(datos.fecha);
  if (!validacionFecha.valido) {
    mostrarMensaje('mensaje', validacionFecha.error, 'error');
    return;
  }

  let validacionHora = reservas.validarHora(datos.hora);
  if (!validacionHora.valido) {
    mostrarMensaje('mensaje', validacionHora.error, 'error');
    return;
  }

  let horariosDisponibles = reservas.obtenerHorariosDisponibles(datos.fecha, datos.profesionalId);
  let horarioDisponible = false;
  for (let i = 0; i < horariosDisponibles.length; i++) {
    if (horariosDisponibles[i] === datos.hora) {
      horarioDisponible = true;
      break;
    }
  }

  if (!horarioDisponible) {
    mostrarMensaje('mensaje', 'El horario seleccionado ya no está disponible', 'error');
    cargarHorarios(datos.fecha, datos.profesionalId);
    return;
  }

  let resultado = reservas.crearTurno(datos);

  if (!resultado || !resultado.exito) {
    let mensajeError = resultado && resultado.error ? resultado.error : 'Error al crear el turno';
    mostrarMensaje('mensaje', mensajeError, 'error');
    return;
  }

  let turno = resultado.turno;

  let nombreProfesional = turno.profesionalNombre || 'No asignado';
  let mensajeExito = '✅ Turno confirmado para ' + datos.nombreMascota + ' el ' + formatearFecha(datos.fecha) + ' a las ' + datos.hora + ' con ' + nombreProfesional;

  mostrarMensaje('mensaje', mensajeExito, 'exito');

  document.getElementById('form-reserva').reset();
  document.getElementById('tipoServicio').disabled = true;
  document.getElementById('profesional').disabled = true;
  document.getElementById('hora').disabled = true;

  cargarMisTurnos();
}

function mostrarMensaje(elementoId, texto, tipo) {
  let divMensaje = document.getElementById(elementoId);
  if (!divMensaje) return;

  divMensaje.textContent = texto;
  divMensaje.className = tipo;
  divMensaje.style.display = 'block';

  setTimeout(function () {
    divMensaje.style.display = 'none';
  }, 5000);
}

function formatearFecha(fechaString) {
  let fecha = new Date(fechaString + 'T00:00:00');
  if (isNaN(fecha.getTime())) {
    return fechaString;
  }
  let opciones = { year: 'numeric', month: 'long', day: 'numeric' };
  return fecha.toLocaleDateString('es-ES', opciones);
}

// ===== PANEL ADMINISTRATIVO =====

function inicializarPanelAdmin() {
  let panelAdmin = document.getElementById('panel-admin');
  if (!panelAdmin) return;

  let inputFecha = document.getElementById('filtro-fecha');
  let btnHoy = document.getElementById('btn-hoy');

  let hoy = new Date().toISOString().split('T')[0];
  inputFecha.value = hoy;
  cargarTurnosDelDia(hoy);

  inputFecha.addEventListener('change', function () {
    cargarTurnosDelDia(this.value);
  });

  btnHoy.addEventListener('click', function () {
    inputFecha.value = hoy;
    cargarTurnosDelDia(hoy);
  });
}

function cargarTurnosDelDia(fecha) {
  let turnos = reservas.obtenerTurnosPorFecha(fecha);
  let tbody = document.getElementById('tbody-turnos');
  let mensajeSinTurnos = document.getElementById('mensaje-sin-turnos');
  let tablaTurnos = document.getElementById('tabla-turnos');

  tbody.innerHTML = '';

  if (turnos.length === 0) {
    tablaTurnos.style.display = 'none';
    mensajeSinTurnos.style.display = 'block';
    mensajeSinTurnos.textContent = 'No hay turnos para el ' + formatearFecha(fecha);
    return;
  }

  tablaTurnos.style.display = 'table';
  mensajeSinTurnos.style.display = 'none';

  let usuarios = reservas.obtenerUsuarios();

  let usuariosMap = {};
  for (let i = 0; i < usuarios.length; i++) {
    usuariosMap[usuarios[i].id] = usuarios[i];
  }

  for (let i = 0; i < turnos.length; i++) {
    let turno = turnos[i];
    let tr = document.createElement('tr');

    let usuario = usuariosMap[turno.usuarioId];
    let nombreCliente = usuario ? usuario.nombreCompleto : 'Cliente ' + turno.usuarioId;
    let telefonoCliente = usuario ? usuario.telefono : '099123456';

    tr.innerHTML = '<td data-label="Hora">' + turno.hora + '</td>' +
      '<td data-label="Cédula">' + (turno.cedula || 'N/A') + '</td>' +
      '<td data-label="Cliente">' + nombreCliente + '</td>' +
      '<td data-label="Mascota">' + turno.nombreMascota + '</td>' +
      '<td data-label="Teléfono">' + telefonoCliente + '</td>' +
      '<td data-label="Servicio">' + capitalizarPrimeraLetra(turno.tipoServicio) + '</td>' +
      '<td data-label="Profesional">' + (turno.profesionalNombre || 'No asignado') + '</td>';
    tbody.appendChild(tr);
  }
}

// ===== SECCIÓN MIS TURNOS =====

function inicializarMisTurnos() {
  let navMisTurnos = document.getElementById('nav-mis-turnos');
  if (navMisTurnos) {
    navMisTurnos.addEventListener('click', function (e) {
      e.preventDefault();
      mostrarVista('vista-app');
      let seccionMisTurnos = document.getElementById('seccion-mis-turnos');
      if (seccionMisTurnos) {
        seccionMisTurnos.scrollIntoView({ behavior: 'smooth', block: 'start' });
        cargarMisTurnos();
      }
    });
  }
}

function cargarMisTurnos() {
  let sesion = reservas.obtenerSesion();
  if (!sesion) return;

  let turnos = reservas.obtenerTurnosDeUsuario(sesion.usuarioId);
  let tbody = document.getElementById('tbody-mis-turnos');
  let mensajeSinTurnos = document.getElementById('mensaje-sin-mis-turnos');
  let tablaTurnos = document.getElementById('tabla-mis-turnos');

  tbody.innerHTML = '';

  if (turnos.length === 0) {
    if (tablaTurnos) tablaTurnos.style.display = 'none';
    if (mensajeSinTurnos) mensajeSinTurnos.style.display = 'block';
    return;
  }

  if (tablaTurnos) tablaTurnos.style.display = 'table';
  if (mensajeSinTurnos) mensajeSinTurnos.style.display = 'none';

  turnos.forEach(turno => {
    let tr = document.createElement('tr');
    tr.innerHTML = `
      <td data-label="Fecha">${formatearFecha(turno.fecha)}</td>
      <td data-label="Hora">${turno.hora}</td>
      <td data-label="Mascota">${turno.nombreMascota}</td>
      <td data-label="Servicio">${capitalizarPrimeraLetra(turno.tipoServicio)}</td>
      <td data-label="Profesional">${turno.profesionalNombre || 'No asignado'}</td>
      <td data-label="Acción">
        <button class="btn-cancelar" onclick="procesarCancelacion('${turno.id}')">Cancelar</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

window.procesarCancelacion = function (turnoId) {
  if (confirm('¿Estás seguro de que deseas cancelar este turno? Esta acción no se puede deshacer.')) {
    let resultado = reservas.cancelarTurno(turnoId);
    if (resultado.exito) {
      mostrarMensaje('mensaje-cancelacion', '✅ Turno cancelado correctamente.', 'exito');
      cargarMisTurnos();

      let inputFecha = document.getElementById('fecha');
      let selectProfesional = document.getElementById('profesional');
      if (inputFecha && inputFecha.value) {
        cargarHorarios(inputFecha.value, selectProfesional ? selectProfesional.value : null);
      }

      let filtroFechaAdmin = document.getElementById('filtro-fecha');
      if (filtroFechaAdmin && filtroFechaAdmin.value) {
        cargarTurnosDelDia(filtroFechaAdmin.value);
      }
    } else {
      mostrarMensaje('mensaje-cancelacion', '❌ Error al cancelar el turno: ' + resultado.error, 'error');
    }
  }
};

function capitalizarPrimeraLetra(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// ===== NAVEGACIÓN FLUIDA =====

function configurarNavegacion() {
  let links = document.querySelectorAll('a[href^="#"]');
  for (let i = 0; i < links.length; i++) {
    links[i].addEventListener('click', function (e) {
      let targetId = this.getAttribute('href');

      if (targetId === '#') {
        e.preventDefault();
        return;
      }

      e.preventDefault();
      try {
        let targetSection = document.querySelector(targetId);
        if (targetSection) {
          targetSection.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });
        }
      } catch (error) {
        console.warn('Error al intentar hacer scroll a:', targetId, error);
      }
    });
  }

  let btnVolverArriba = document.createElement('button');
  btnVolverArriba.innerHTML = '↑';
  btnVolverArriba.className = 'volver-arriba';
  btnVolverArriba.setAttribute('aria-label', 'Volver arriba');
  document.body.appendChild(btnVolverArriba);

  window.addEventListener('scroll', function () {
    if (window.scrollY > 300) {
      btnVolverArriba.classList.add('visible');
    } else {
      btnVolverArriba.classList.remove('visible');
    }
  });

  btnVolverArriba.addEventListener('click', function () {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  });

  let linkIrRegistro = document.getElementById('link-ir-registro');
  let linkIrLogin = document.getElementById('link-ir-login');
  let navRegistro = document.getElementById('nav-registro');
  let btnReservarHero = document.getElementById('btn-reservar-hero');
  let navLogin = document.getElementById('nav-login');

  if (navRegistro) {
    navRegistro.addEventListener('click', function (e) {
      e.preventDefault();
      mostrarVista('vista-auth');
      document.getElementById('login').style.display = 'none';
      document.getElementById('registro').style.display = 'block';
    });
  }

  if (navLogin) {
    navLogin.addEventListener('click', function (e) {
      e.preventDefault();
      mostrarVista('vista-auth');
      document.getElementById('registro').style.display = 'none';
      document.getElementById('login').style.display = 'block';
    });
  }

  let navAdmin = document.getElementById('nav-admin');
  if (navAdmin) {
    navAdmin.addEventListener('click', function (e) {
      e.preventDefault();
      mostrarVista('vista-app');
    });
  }

  let navEquipo = document.getElementById('nav-equipo');
  if (navEquipo) {
    navEquipo.addEventListener('click', function (e) {
      e.preventDefault();
      mostrarVista('vista-publica');
      const seccionEquipo = document.getElementById('equipo');
      if (seccionEquipo) {
        seccionEquipo.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  }

  let navServicios = document.getElementById('nav-servicios');
  if (navServicios) {
    navServicios.addEventListener('click', function (e) {
      e.preventDefault();
      mostrarVista('vista-publica');
      const seccionServicios = document.getElementById('servicios');
      if (seccionServicios) {
        seccionServicios.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  }

  let navInformacion = document.getElementById('nav-informacion');
  if (navInformacion) {
    navInformacion.addEventListener('click', function (e) {
      e.preventDefault();
      mostrarVista('vista-publica');
      const seccionInformacion = document.getElementById('informacion');
      if (seccionInformacion) {
        seccionInformacion.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  }

  if (linkIrRegistro) {
    linkIrRegistro.addEventListener('click', function (e) {
      e.preventDefault();
      document.getElementById('login').style.display = 'none';
      document.getElementById('registro').style.display = 'block';
    });
  }

  if (linkIrLogin) {
    linkIrLogin.addEventListener('click', function (e) {
      e.preventDefault();
      document.getElementById('registro').style.display = 'none';
      document.getElementById('login').style.display = 'block';
    });
  }

  const manejarIntentoReserva = (e) => {
    e.preventDefault();
    let sesion = reservas.obtenerSesion();
    if (sesion && sesion.esAdmin) {
      alert('El administrador no puede realizar reservas.');
      return;
    }

    if (reservas.estaLogueado()) {
      mostrarVista('vista-app');
    } else {
      mostrarVista('vista-auth');
      document.getElementById('login').style.display = 'none';
      document.getElementById('registro').style.display = 'block';
    }
  };

  if (btnReservarHero) btnReservarHero.addEventListener('click', manejarIntentoReserva);
}

// ===== FORMULARIO DE REGISTRO =====

function inicializarFormularioRegistro() {
  let formRegistro = document.getElementById('form-registro');
  if (!formRegistro) return;

  let inputEmail = document.getElementById('email');
  if (inputEmail) {
    inputEmail.addEventListener('blur', function () {
      let validacion = reservas.validarEmail(this.value);
      if (!validacion.valido && this.value.trim() !== '') {
        mostrarMensaje('mensaje-registro', validacion.error, 'error');
      }
    });
  }

  let inputTelefono = document.getElementById('telefono');
  if (inputTelefono) {
    inputTelefono.addEventListener('input', function () {
      this.value = this.value.replace(/[^0-9]/g, '');
    });

    inputTelefono.addEventListener('blur', function () {
      let validacion = reservas.validarTelefono(this.value);
      if (!validacion.valido && this.value.trim() !== '') {
        mostrarMensaje('mensaje-registro', validacion.error, 'error');
      }
    });
  }

  let inputPassword = document.getElementById('password');
  let inputPasswordConfirm = document.getElementById('password-confirm');

  if (inputPasswordConfirm && inputPassword) {
    inputPasswordConfirm.addEventListener('blur', function () {
      if (this.value !== inputPassword.value && this.value !== '') {
        mostrarMensaje('mensaje-registro', 'Las contraseñas no coinciden', 'error');
        this.setCustomValidity('Las contraseñas no coinciden');
      } else {
        this.setCustomValidity('');
      }
    });
  }

  formRegistro.addEventListener('submit', function (e) {
    e.preventDefault();
    procesarRegistro();
  });
}

function procesarRegistro() {
  const nombre = document.getElementById('nombre').value;
  const email = document.getElementById('email').value;
  const telefono = document.getElementById('telefono').value;
  const password = document.getElementById('password').value;
  const passwordConfirm = document.getElementById('password-confirm').value;

  if (password !== passwordConfirm) {
    mostrarMensaje('mensaje-registro', 'Las contraseñas no coinciden', 'error');
    return;
  }

  let datos = {
    nombreCompleto: nombre.trim(),
    email: email.trim(),
    telefono: telefono.trim(),
    password: password
  };

  let validacionEmail = reservas.validarEmail(datos.email);
  if (!validacionEmail.valido) {
    mostrarMensaje('mensaje-registro', validacionEmail.error, 'error');
    return;
  }

  let validacionTelefono = reservas.validarTelefono(datos.telefono);
  if (!validacionTelefono.valido) {
    mostrarMensaje('mensaje-registro', validacionTelefono.error, 'error');
    return;
  }

  if (!datos.nombreCompleto) {
    mostrarMensaje('mensaje-registro', 'El nombre completo es requerido', 'error');
    return;
  }

  if (reservas.validarPassword) {
    let validacionPassword = reservas.validarPassword(datos.password);
    if (!validacionPassword.valido) {
      mostrarMensaje('mensaje-registro', validacionPassword.error, 'error');
      return;
    }
  } else if (!datos.password || datos.password.length < 6) {
    mostrarMensaje('mensaje-registro', 'La contraseña debe tener al menos 6 caracteres', 'error');
    return;
  }

  try {
    let resultado = reservas.registrarUsuario(datos);

    if (resultado.exito) {
      mostrarMensaje(
        'mensaje-registro',
        '✅ Registro exitoso. Bienvenido/a ' + datos.nombreCompleto + '!',
        'exito'
      );

      document.getElementById('form-registro').reset();

      setTimeout(function () {
        let loginAuto = reservas.iniciarSesion(datos.email, datos.password);
        if (loginAuto.exito) {
          actualizarUIporSesion(true);
        } else {
          actualizarUIporSesion(false);
          mostrarVista('vista-auth');
        }
      }, 2000);
    } else {
      mostrarMensaje('mensaje-registro', resultado.error, 'error');
    }
  } catch (e) {
    mostrarMensaje('mensaje-registro', e.message, 'error');
  }
}

// ===== FORMULARIO DE LOGIN =====

function inicializarFormularioLogin() {
  let formLogin = document.getElementById('form-login');
  if (!formLogin) return;

  formLogin.addEventListener('submit', function (e) {
    e.preventDefault();
    procesarLogin();
  });
}

function procesarLogin() {
  let email = document.getElementById('email-login').value.trim();
  let password = document.getElementById('password-login').value;

  let validacionEmail = reservas.validarEmail(email);
  if (!validacionEmail.valido) {
    mostrarMensaje('mensaje-login', validacionEmail.error, 'error');
    return;
  }

  if (!password || password.trim() === '') {
    mostrarMensaje('mensaje-login', 'La contraseña es requerida', 'error');
    return;
  }

  let resultado = reservas.iniciarSesion(email, password);

  if (resultado.exito) {
    mostrarMensaje('mensaje-login', '✅ Bienvenido/a ' + resultado.usuario.nombreCompleto + '!', 'exito');

    actualizarUIporSesion(true);

    setTimeout(function () {
      let seccionReservas = document.getElementById('formulario-reserva');
      if (seccionReservas) {
        seccionReservas.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 1000);
  } else {
    mostrarMensaje('mensaje-login', resultado.error, 'error');
  }
}

// ===== GESTOR DE VISTAS (Router simple) =====

function mostrarVista(vistaId) {
  const vistas = ['vista-publica', 'vista-auth', 'vista-app'];

  vistas.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.style.display = 'none';
  });

  const vistaActual = document.getElementById(vistaId);
  if (vistaActual) {
    vistaActual.style.display = 'block';
    window.scrollTo(0, 0);
  }
}

// ===== MENÚ RESPONSIVE =====
function activarMenuMobile() {
  const menuToggle = document.getElementById('menu-toggle');
  const nav = document.getElementById('nav-principal');

  if (menuToggle && nav) {
    menuToggle.addEventListener('click', function () {
      nav.classList.toggle('active');
    });
  }
}

window.cerrarMenu = function () {
  const nav = document.getElementById('nav-principal');
  if (nav) {
    nav.classList.remove('active');
  }
};

function actualizarUIporSesion(logueado) {
  let navRegistro = document.getElementById('nav-registro');
  let btnCerrarSesion = document.getElementById('btn-cerrar-sesion');
  let btnLogin = document.getElementById('nav-login');

  if (logueado) {
    mostrarVista('vista-publica');

    if (navRegistro) navRegistro.style.display = 'none';
    if (btnLogin) btnLogin.style.display = 'none';
    if (btnCerrarSesion) btnCerrarSesion.style.display = 'inline-block';

    const navEquipo = document.getElementById('nav-equipo');
    const navServicios = document.getElementById('nav-servicios');
    const navInformacion = document.getElementById('nav-informacion');

    if (navEquipo) navEquipo.style.display = 'inline-block';
    if (navServicios) navServicios.style.display = 'inline-block';
    if (navInformacion) navInformacion.style.display = 'inline-block';

    const infoExtra = document.getElementById('contenido-restringido-home');
    if (infoExtra) infoExtra.style.display = 'block';

    let sesion = reservas.obtenerSesion();
    let esAdmin = sesion && sesion.esAdmin;

    let seccionAdmin = document.getElementById('panel-admin');
    if (seccionAdmin) {
      if (esAdmin) {
        seccionAdmin.style.display = 'block';
        let navAdmin = document.getElementById('nav-admin');
        if (navAdmin) navAdmin.style.display = 'inline-block';
        inicializarPanelAdmin();
      } else {
        seccionAdmin.style.display = 'none';
        let navAdmin = document.getElementById('nav-admin');
        if (navAdmin) navAdmin.style.display = 'none';
      }
    }

    let userEmailHeader = document.getElementById('user-email-display');
    if (userEmailHeader) {
      userEmailHeader.textContent = sesion.email;
      userEmailHeader.style.display = 'inline-block';
    }

    let seccionMisTurnos = document.getElementById('seccion-mis-turnos');
    let navMisTurnos = document.getElementById('nav-mis-turnos');
    let seccionReserva = document.getElementById('formulario-reserva');
    let navReservar = document.getElementById('nav-reservar');

    if (esAdmin) {
      if (seccionMisTurnos) seccionMisTurnos.style.display = 'none';
      if (navMisTurnos) navMisTurnos.style.display = 'none';
      if (seccionReserva) seccionReserva.style.display = 'none';
      if (navReservar) navReservar.style.display = 'none';
    } else {
      if (seccionMisTurnos) seccionMisTurnos.style.display = 'block';
      if (navMisTurnos) navMisTurnos.style.display = 'inline-block';
      if (seccionReserva) seccionReserva.style.display = 'block';
      if (navReservar) navReservar.style.display = 'inline-block';
      inicializarMisTurnos();
    }
  } else {
    if (navRegistro) navRegistro.style.display = 'inline-block';
    if (btnLogin) btnLogin.style.display = 'inline-block';
    if (btnCerrarSesion) btnCerrarSesion.style.display = 'none';

    const navEquipo = document.getElementById('nav-equipo');
    const navServicios = document.getElementById('nav-servicios');
    const navInformacion = document.getElementById('nav-informacion');
    const navMisTurnos = document.getElementById('nav-mis-turnos');
    const navAdmin = document.getElementById('nav-admin');

    if (navEquipo) navEquipo.style.display = 'inline-block';
    if (navServicios) navServicios.style.display = 'inline-block';
    if (navInformacion) navInformacion.style.display = 'none';
    const navReservar = document.getElementById('nav-reservar');
    if (navReservar) navReservar.style.display = 'none';
    if (navMisTurnos) navMisTurnos.style.display = 'none';
    if (navAdmin) navAdmin.style.display = 'none';

    const infoExtra = document.getElementById('contenido-restringido-home');
    if (infoExtra) infoExtra.style.display = 'none';

    let userEmailHeader = document.getElementById('user-email-display');
    if (userEmailHeader) userEmailHeader.style.display = 'none';

    let seccionAdmin = document.getElementById('panel-admin');
    if (seccionAdmin) seccionAdmin.style.display = 'none';

    let seccionMisTurnos = document.getElementById('seccion-mis-turnos');
    if (seccionMisTurnos) seccionMisTurnos.style.display = 'none';
  }
}

window.logout = function () {
  reservas.cerrarSesion();
  actualizarUIporSesion(false);
  mostrarVista('vista-publica');
};

document.addEventListener('DOMContentLoaded', function () {
  if (typeof reservas !== 'undefined') {
    reservas.cargarDesdeStorage();
    let sesionActual = reservas.estaLogueado();
    actualizarUIporSesion(sesionActual);
  }

  inicializarFormularioReservas();
  inicializarFormularioRegistro();
  inicializarFormularioLogin();
  inicializarMisTurnos();
  configurarNavegacion();
  activarMenuMobile();

  let btnCerrarSesion = document.getElementById('btn-cerrar-sesion');
  if (btnCerrarSesion) {
    btnCerrarSesion.addEventListener('click', function () {
      logout();
    });
  }
});
