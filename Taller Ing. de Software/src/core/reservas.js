// ===== OBJETO RESERVAS PARA GESTIÓN DE TURNOS Y USUARIOS =====

(function (global) {
  'use strict';

  let reservas = {
    turnos: [],

    usuarios: [],

    profesionales: [
      { id: "vet-001", nombre: "Dra. María González", tipo: "veterinario", especialidad: "Cirugía General", imagen: "img/dra.jpg" },
      { id: "vet-002", nombre: "Dr. Carlos Rodríguez", tipo: "veterinario", especialidad: "Cardiología Felina", imagen: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=400&v=2" },
      { id: "vet-003", nombre: "Dra. Ana Martínez", tipo: "veterinario", especialidad: "Dermatología", imagen: "https://images.unsplash.com/photo-1594824476967-48c8b964273f?auto=format&fit=crop&q=80&w=400&v=2" },
      { id: "vet-004", nombre: "Dr. Luis Fernández", tipo: "veterinario", especialidad: "Animales Exóticos", imagen: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=400&v=2" },
      { id: "vet-005", nombre: "Dra. Sofia López", tipo: "veterinario", especialidad: "Traumatología", imagen: "img/dra2.jpg" },
      { id: "vet-006", nombre: "Dr. Pablo García", tipo: "veterinario", especialidad: "Oftalmología", imagen: "img/dr.jpg" },
      { id: "vet-007", nombre: "Dra. Laura Pérez", tipo: "veterinario", especialidad: "Clínica Médica", imagen: "https://images.unsplash.com/photo-1527613426441-4da17471b66d?auto=format&fit=crop&q=80&w=400&v=2" },
      { id: "est-001", nombre: "Carla Benítez", tipo: "estilista", especialidad: "Corte de Raza", imagen: "img/estilista.jpg" },
      { id: "est-002", nombre: "Lucía Romero", tipo: "estilista", especialidad: "Estética Canina", imagen: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&q=80&w=400&v=2" },
      { id: "est-003", nombre: "Marcos Silva", tipo: "estilista", especialidad: "Baños Terapéuticos", imagen: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400&v=2" },
      { id: "est-004", nombre: "Valeria Castro", tipo: "estilista", especialidad: "Spa y Relajación", imagen: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=400&v=2" },
      { id: "est-005", nombre: "Diego Morales", tipo: "estilista", especialidad: "Peluquería Felina", imagen: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=400&v=2" }
    ],

    sesion: null,

    cargarDesdeStorage: function () {
      let turnosGuardados = localStorage.getItem('veterinaria_turnos');
      this.turnos = turnosGuardados ? JSON.parse(turnosGuardados) : [];

      let usuariosGuardados = localStorage.getItem('veterinaria_usuarios');
      this.usuarios = usuariosGuardados ? JSON.parse(usuariosGuardados) : [];

      let sesionGuardada = localStorage.getItem('veterinaria_sesion');
      this.sesion = sesionGuardada ? JSON.parse(sesionGuardada) : null;

      if (this.usuarios.length === 0) {
        this.inicializarUsuarioAdmin();
        let usuariosGuardadosNuevos = localStorage.getItem('veterinaria_usuarios');
        this.usuarios = usuariosGuardadosNuevos ? JSON.parse(usuariosGuardadosNuevos) : [];
      } else {
        let tieneAdmin = false;
        let tieneCliente = false;
        for (let i = 0; i < this.usuarios.length; i++) {
          if (this.usuarios[i].email === 'admin@veterinaria.com') {
            tieneAdmin = true;
          }
          if (this.usuarios[i].email === 'juan.perez@email.com') {
            tieneCliente = true;
          }
        }

        if (!tieneAdmin || !tieneCliente) {
          if (!tieneAdmin) {
            let adminUsuario = {
              id: 'admin-001',
              nombreCompleto: 'Administrador',
              email: 'admin@veterinaria.com',
              telefono: '099123456',
              password: 'admin123',
              fechaRegistro: new Date().toISOString(),
              rol: 'admin'
            };
            this.usuarios.push(adminUsuario);
          }

          if (!tieneCliente) {
            let clientePrueba = {
              id: 'cliente-001',
              nombreCompleto: 'Juan Pérez',
              email: 'juan.perez@email.com',
              telefono: '099876543',
              password: 'cliente123',
              fechaRegistro: new Date().toISOString(),
              rol: 'cliente'
            };
            this.usuarios.push(clientePrueba);
          }

          this.guardarEnStorage();
        }
      }
    },

    guardarEnStorage: function () {
      localStorage.setItem('veterinaria_turnos', JSON.stringify(this.turnos));
      localStorage.setItem('veterinaria_usuarios', JSON.stringify(this.usuarios));
      if (this.sesion) {
        localStorage.setItem('veterinaria_sesion', JSON.stringify(this.sesion));
      } else {
        localStorage.removeItem('veterinaria_sesion');
      }
    },

    inicializarUsuarioAdmin: function () {
      let adminUsuario = {
        id: 'admin-001',
        nombreCompleto: 'Administrador',
        email: 'admin@veterinaria.com',
        telefono: '099123456',
        password: 'admin123',
        fechaRegistro: new Date().toISOString(),
        rol: 'admin'
      };
      this.usuarios.push(adminUsuario);

      let clientePrueba = {
        id: 'cliente-001',
        nombreCompleto: 'Juan Pérez',
        email: 'juan.perez@email.com',
        telefono: '099876543',
        password: 'cliente123',
        fechaRegistro: new Date().toISOString(),
        rol: 'cliente'
      };
      this.usuarios.push(clientePrueba);

      this.guardarEnStorage();
    },

    generarHorarios: function () {
      let horarios = [];
      for (let h = 9; h <= 17; h++) {
        horarios.push(h.toString().padStart(2, '0') + ':00');
        if (h <= 17) {
          horarios.push(h.toString().padStart(2, '0') + ':30');
        }
      }
      return horarios;
    },

    validarFecha: function (fechaString) {
      const partes = fechaString.split('-');
      const fecha = new Date(parseInt(partes[0]), parseInt(partes[1]) - 1, parseInt(partes[2]));

      if (isNaN(fecha.getTime())) {
        return { valido: false, error: "Fecha inválida" };
      }

      let hoy = new Date();
      hoy.setHours(0, 0, 0, 0);

      let dosMeses = new Date();
      dosMeses.setMonth(dosMeses.getMonth() + 2);

      if (fecha < hoy) {
        return { valido: false, error: "La fecha no puede ser pasada" };
      }

      if (fecha > dosMeses) {
        return { valido: false, error: "No se puede reservar con más de 2 meses de anticipación" };
      }

      let diaSemana = fecha.getDay();
      if (diaSemana === 0 || diaSemana === 6) {
        return { valido: false, error: "Solo se atiende de lunes a viernes" };
      }

      return { valido: true };
    },

    validarHora: function (hora) {
      let horariosValidos = this.generarHorarios();
      if (horariosValidos.indexOf(hora) === -1) {
        return { valido: false, error: "Horario fuera del rango de atención" };
      }
      return { valido: true };
    },

    obtenerHorariosDisponibles: function (fecha, profesionalId) {
      let todosLosHorarios = this.generarHorarios();

      let turnosDelDia = [];
      for (let i = 0; i < this.turnos.length; i++) {
        let turno = this.turnos[i];
        if (turno.fecha === fecha &&
          turno.estado === 'confirmado' &&
          (!profesionalId || turno.profesionalId === profesionalId)) {
          turnosDelDia.push(turno);
        }
      }

      let horariosOcupados = [];
      for (let i = 0; i < turnosDelDia.length; i++) {
        horariosOcupados.push(turnosDelDia[i].hora);
      }

      let disponibles = [];
      for (let i = 0; i < todosLosHorarios.length; i++) {
        if (horariosOcupados.indexOf(todosLosHorarios[i]) === -1) {
          disponibles.push(todosLosHorarios[i]);
        }
      }

      return disponibles;
    },

    crearTurno: function (datosTurno) {
      let validacionCedula = this.validarCedula(datosTurno.cedula);
      if (!validacionCedula.valido) {
        return { exito: false, error: validacionCedula.error };
      }

      let turno = {
        id: 'turno-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9),
        usuarioId: datosTurno.usuarioId,
        cedula: datosTurno.cedula.trim(),
        nombreMascota: datosTurno.nombreMascota,
        tipoMascota: datosTurno.tipoMascota,
        servicio: datosTurno.servicio,
        tipoServicio: datosTurno.tipoServicio,
        profesionalId: datosTurno.profesionalId || null,
        profesionalNombre: null,
        fecha: datosTurno.fecha,
        hora: datosTurno.hora,
        estado: 'confirmado',
        fechaCreacion: new Date().toISOString()
      };

      if (turno.profesionalId) {
        for (let i = 0; i < this.profesionales.length; i++) {
          if (this.profesionales[i].id === turno.profesionalId) {
            turno.profesionalNombre = this.profesionales[i].nombre;
            break;
          }
        }
      }

      this.turnos.push(turno);
      this.guardarEnStorage();

      return { exito: true, turno: turno };
    },

    cancelarTurno: function (turnoId) {
      for (let i = 0; i < this.turnos.length; i++) {
        if (this.turnos[i].id === turnoId) {
          this.turnos[i].estado = 'cancelado';
          this.guardarEnStorage();
          return { exito: true };
        }
      }
      return { exito: false, error: "Turno no encontrado" };
    },

    obtenerTurnosDeUsuario: function (usuarioId) {
      let turnosUsuario = [];
      let hoy = new Date();
      hoy.setHours(0, 0, 0, 0);

      for (let i = 0; i < this.turnos.length; i++) {
        let turno = this.turnos[i];
        if (turno.usuarioId === usuarioId && turno.estado === 'confirmado') {
          const partes = turno.fecha.split('-');
          const fechaTurno = new Date(parseInt(partes[0]), parseInt(partes[1]) - 1, parseInt(partes[2]));

          if (fechaTurno >= hoy) {
            turnosUsuario.push(turno);
          }
        }
      }

      turnosUsuario.sort(function (a, b) {
        if (a.fecha !== b.fecha) {
          return a.fecha.localeCompare(b.fecha);
        }
        let horaA = a.hora.split(':').map(Number);
        let horaB = b.hora.split(':').map(Number);
        return (horaA[0] * 60 + horaA[1]) - (horaB[0] * 60 + horaB[1]);
      });

      return turnosUsuario;
    },

    obtenerTurnosPorFecha: function (fecha) {
      let turnosDelDia = [];
      let hoy = new Date();
      hoy.setHours(0, 0, 0, 0);

      const partes = fecha.split('-');
      const fechaSolicitada = new Date(parseInt(partes[0]), parseInt(partes[1]) - 1, parseInt(partes[2]));

      if (fechaSolicitada < hoy) {
        return [];
      }

      for (let i = 0; i < this.turnos.length; i++) {
        let turno = this.turnos[i];
        if (turno.fecha === fecha && turno.estado === 'confirmado') {
          turnosDelDia.push(turno);
        }
      }

      turnosDelDia.sort(function (a, b) {
        let horaA = a.hora.split(':').map(Number);
        let horaB = b.hora.split(':').map(Number);
        return (horaA[0] * 60 + horaA[1]) - (horaB[0] * 60 + horaB[1]);
      });

      return turnosDelDia;
    },

    obtenerProfesionalesPorTipo: function (tipo) {
      let profesionalesFiltrados = [];
      for (let i = 0; i < this.profesionales.length; i++) {
        if (this.profesionales[i].tipo === tipo) {
          profesionalesFiltrados.push(this.profesionales[i]);
        }
      }
      return profesionalesFiltrados;
    },

    validarEmail: function (email) {
      if (!email || email.trim() === '') {
        return { valido: false, error: "El email es requerido" };
      }

      let regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!regexEmail.test(email)) {
        return { valido: false, error: "El email debe tener formato válido (usuario@dominio.ext)" };
      }

      return { valido: true };
    },

    validarCedula: function (cedula) {
      let cedulaLimpia = cedula.trim();

      if (!cedulaLimpia || cedulaLimpia === '') {
        return { valido: false, error: "La cédula es requerida" };
      }

      if (!/^[0-9]+$/.test(cedulaLimpia)) {
        return { valido: false, error: "La cédula solo puede contener números" };
      }

      if (cedulaLimpia.length < 7 || cedulaLimpia.length > 8) {
        return { valido: false, error: "La cédula debe tener 7 u 8 dígitos" };
      }

      return { valido: true };
    },

    validarTelefono: function (telefono) {
      if (!telefono || telefono.trim() === '') {
        return { valido: false, error: "El teléfono es requerido" };
      }

      let telefonoLimpio = telefono.replace(/[\s\-\(\)]/g, '');

      if (!/^\d+$/.test(telefonoLimpio)) {
        return { valido: false, error: "El teléfono debe contener solo números" };
      }

      if (telefonoLimpio.length < 8) {
        return { valido: false, error: "El teléfono debe tener al menos 8 dígitos" };
      }

      return { valido: true };
    },

    validarPassword: function (password) {
      if (!password || password.length < 6) {
        return {
          valido: false,
          error: "La contraseña debe tener al menos 6 caracteres"
        };
      }
      return { valido: true };
    },

    registrarUsuario: function (datosUsuario) {
      let validacionEmail = this.validarEmail(datosUsuario.email);
      if (!validacionEmail.valido) {
        return { exito: false, error: validacionEmail.error };
      }

      let validacionTelefono = this.validarTelefono(datosUsuario.telefono);
      if (!validacionTelefono.valido) {
        return { exito: false, error: validacionTelefono.error };
      }

      if (!datosUsuario.nombreCompleto || datosUsuario.nombreCompleto.trim() === '') {
        return { exito: false, error: "El nombre completo es requerido" };
      }

      if (!datosUsuario.password || datosUsuario.password.length < 6) {
        return { exito: false, error: "La contraseña debe tener al menos 6 caracteres" };
      }

      for (let i = 0; i < this.usuarios.length; i++) {
        if (this.usuarios[i].email.toLowerCase() === datosUsuario.email.trim().toLowerCase()) {
          return { exito: false, error: "Este email ya está registrado" };
        }
      }

      let nuevoUsuario = {
        id: 'user-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9),
        nombreCompleto: datosUsuario.nombreCompleto.trim(),
        email: datosUsuario.email.trim().toLowerCase(),
        telefono: datosUsuario.telefono.replace(/[\s\-\(\)]/g, ''),
        password: datosUsuario.password,
        rol: 'cliente',
        fechaRegistro: new Date().toISOString()
      };

      this.usuarios.push(nuevoUsuario);
      this.guardarEnStorage();

      return { exito: true, usuario: nuevoUsuario };
    },

    obtenerUsuarios: function () {
      return this.usuarios;
    },

    guardarSesion: function (usuarioSesion) {
      this.sesion = {
        usuarioId: usuarioSesion.id,
        email: usuarioSesion.email,
        nombreCompleto: usuarioSesion.nombreCompleto,
        telefono: usuarioSesion.telefono || null,
        esAdmin: usuarioSesion.esAdmin || false,
        fechaInicio: new Date().toISOString()
      };
      this.guardarEnStorage();
    },

    iniciarSesion: function (email, password) {
      if (!email || !password) {
        return { exito: false, error: "Email y contraseña son requeridos" };
      }

      let usuario = null;
      for (let i = 0; i < this.usuarios.length; i++) {
        if (this.usuarios[i].email.toLowerCase() === email.trim().toLowerCase()) {
          usuario = this.usuarios[i];
          break;
        }
      }

      if (!usuario) {
        return { exito: false, error: "Email o contraseña incorrectos" };
      }

      if (usuario.password !== password) {
        return { exito: false, error: "Email o contraseña incorrectos" };
      }

      this.sesion = {
        usuarioId: usuario.id,
        email: usuario.email,
        nombreCompleto: usuario.nombreCompleto,
        telefono: usuario.telefono,
        esAdmin: usuario.rol === 'admin',
        fechaInicio: new Date().toISOString()
      };

      this.guardarEnStorage();

      return { exito: true, usuario: this.sesion };
    },

    cerrarSesion: function () {
      this.sesion = null;
      this.guardarEnStorage();
    },

    obtenerSesion: function () {
      return this.sesion;
    },

    estaLogueado: function () {
      return this.sesion !== null;
    }
  };

  if (typeof localStorage !== "undefined") {
    reservas.cargarDesdeStorage();
  }

  if (typeof module !== "undefined") {
    module.exports = reservas;
  }

  if (typeof window !== "undefined") {
    global.reservas = reservas;
  } else if (typeof globalThis !== "undefined") {
    globalThis.reservas = reservas;
  }

})(typeof window !== "undefined" ? window : globalThis);
