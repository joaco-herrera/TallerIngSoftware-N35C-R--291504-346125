// Mock localStorage para Node.js
const localStorageMock = (function () {
    let store = {};
    return {
        getItem: function (key) {
            return store[key] || null;
        },
        setItem: function (key, value) {
            store[key] = value.toString();
        },
        removeItem: function (key) {
            delete store[key];
        },
        clear: function () {
            store = {};
        }
    };
})();

Object.defineProperty(global, 'localStorage', {
    value: localStorageMock
});

const reservas = require('../src/core/reservas');

describe('Pruebas Unitarias - Módulo de Reservas', () => {

    beforeEach(() => {
        // Limpiar estado si fuera necesario
        reservas.usuarios = [];
        reservas.turnos = [];
        reservas.sesion = null;
    });

    // 1. Validaciones de Usuario
    describe('Validaciones de Registro de Usuario', () => {

        test('validarEmail debe retornar true para emails válidos', () => {
            expect(reservas.validarEmail('test@ejemplo.com').valido).toBe(true);
            expect(reservas.validarEmail('usuario.nombre@dominio.co').valido).toBe(true);
        });

        test('validarEmail debe retornar false para emails inválidos', () => {
            expect(reservas.validarEmail('emailejemplo.com').valido).toBe(false);
            expect(reservas.validarEmail('').valido).toBe(false);
            expect(reservas.validarEmail(null).valido).toBe(false);
        });

        test('validarPassword debe requerir al menos 6 caracteres', () => {
            expect(reservas.validarPassword('123456').valido).toBe(true);
            expect(reservas.validarPassword('12345').valido).toBe(false);
        });

        test('validarTelefono debe aceptar solo números y largo mínimo', () => {
            expect(reservas.validarTelefono('099123456').valido).toBe(true);
            expect(reservas.validarTelefono('123').valido).toBe(false); // muy corto
            expect(reservas.validarTelefono('abcde').valido).toBe(false); // letras
        });
    });

    // 2. Gestión de Turnos
    describe('Gestión de Horarios y Fechas', () => {

        test('generarHorarios debe devolver un array con todos los slots', () => {
            const horarios = reservas.generarHorarios();
            // Usamos toEqual para comparar contenido de arrays/objetos (como pide la profe)
            expect(horarios).toContain('09:00');
            expect(horarios).toContain('17:30');

            // Verificamos que la cantidad de horarios sea la correcta (18 slots)
            expect(horarios.length).toBe(18);
        });

        test('validarFecha debe rechazar fechas pasadas', () => {
            // Usamos una fecha fija del pasado para evitar problemas con la hora actual/UTC
            const fechaPasada = "2020-01-01";

            const resultado = reservas.validarFecha(fechaPasada);
            expect(resultado.valido).toBeFalsy();
            expect(resultado.error).toBe("La fecha no puede ser pasada");
        });

        test('validarFecha debe asegurar que no sea más de 2 meses a futuro', () => {
            const tresMeses = new Date();
            tresMeses.setMonth(tresMeses.getMonth() + 3);
            const fechaLejana = tresMeses.toISOString().split('T')[0];

            const resultado = reservas.validarFecha(fechaLejana);
            expect(resultado.valido).toBe(false);
            // Usamos toBeGreaterThan para verificar límites numéricos si fuera necesario
        });

        test('validarFecha debe rechazar fines de semana', () => {
            // Buscamos un sábado o domingo conocido (ej: 2023-01-01 fue domingo)
            // Mejor usar una lógica dinámica o fija si sabemos que no falla
            // 2024-05-18 es Sábado
            // Nota: validarFecha usa 'new Date()' internamente
            // Si validamos con fecha futura fija que sea fin de semana:
            // Sábado 25 de Mayo de 2024 (asegurarse de que sea futuro relativo a la prueba o ajustar lógica)

            // Para asegurar test robusto, creamos una fecha futura que sea Sábado
            let fecha = new Date();
            // Ir al próximo sábado
            fecha.setDate(fecha.getDate() + (6 - fecha.getDay() + 7) % 7);
            // Si el sábado es hoy, vamos al siguiente
            if (fecha.setHours(0, 0, 0, 0) <= new Date().setHours(0, 0, 0, 0)) {
                fecha.setDate(fecha.getDate() + 7);
            }

            const fechaSabado = fecha.toISOString().split('T')[0];
            expect(reservas.validarFecha(fechaSabado).valido).toBe(false);
        });

        test('validarTelefono debe tener menos de cierta cantidad de dígitos (ejemplo numérico)', () => {
            const telCorto = "12345";
            const resultado = reservas.validarTelefono(telCorto);
            expect(telCorto.length).toBeLessThan(8); // Usando toBeLessThan como en las slides
            expect(resultado.valido).toBe(false);
        });
    });
});
