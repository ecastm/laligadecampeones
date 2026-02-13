const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'http://localhost:5000';
const SCREENSHOT_DIR = path.join(__dirname, '..', 'manual_screenshots');
const OUTPUT_DIR = path.join(__dirname, '..', 'manuales_pdf');

const logoPath = path.join(__dirname, '..', 'attached_assets', 'logo_circular_transparente_1770735565551.webp');
const logoBase64 = fs.readFileSync(logoPath).toString('base64');
const logoDataUri = `data:image/webp;base64,${logoBase64}`;

async function takeScreenshots(browser) {
  if (!fs.existsSync(SCREENSHOT_DIR)) fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });

  // Home
  await page.goto(BASE_URL, { waitUntil: 'networkidle2', timeout: 30000 });
  await new Promise(r => setTimeout(r, 2000));
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'home_hero.png'), fullPage: false });

  // Scroll to divisions
  await page.evaluate(() => {
    const el = document.getElementById('torneos');
    if (el) el.scrollIntoView({ behavior: 'instant' });
  });
  await new Promise(r => setTimeout(r, 1500));
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'home_divisiones.png'), fullPage: false });

  // Login
  await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'login.png'), fullPage: false });

  // Register
  await page.goto(`${BASE_URL}/register`, { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'registro.png'), fullPage: false });

  // ADMIN login
  await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle2' });
  await page.type('[data-testid="input-email"]', 'admin@liga.com');
  await page.type('[data-testid="input-password"]', 'admin123');
  await page.click('[data-testid="button-login"]');
  await new Promise(r => setTimeout(r, 3000));
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'admin_panel.png'), fullPage: false });

  // Helper: click sidebar button by text
  async function clickSidebarItem(pg, text) {
    const clicked = await pg.evaluate((t) => {
      const buttons = document.querySelectorAll('button, a, [role="button"]');
      for (const b of buttons) {
        if (b.textContent && b.textContent.trim() === t) {
          b.click();
          return true;
        }
      }
      const spans = document.querySelectorAll('span');
      for (const s of spans) {
        if (s.textContent && s.textContent.trim() === t) {
          const parent = s.closest('button, a, [role="button"], li');
          if (parent) { parent.click(); return true; }
        }
      }
      return false;
    }, text);
    if (clicked) await new Promise(r => setTimeout(r, 2000));
    return clicked;
  }

  // Admin sections
  const adminSections = [
    { label: 'Equipos', name: 'admin_equipos' },
    { label: 'Jugadores', name: 'admin_jugadores' },
    { label: 'Partidos', name: 'admin_partidos' },
    { label: 'Torneo', name: 'admin_torneo' },
    { label: 'Árbitros', name: 'admin_arbitros' },
    { label: 'Estadísticas', name: 'admin_estadisticas' },
    { label: 'Finanzas', name: 'admin_finanzas' },
    { label: 'Noticias', name: 'admin_noticias' },
    { label: 'Mensajería', name: 'admin_mensajeria' },
  ];
  for (const section of adminSections) {
    try {
      const ok = await clickSidebarItem(page, section.label);
      if (ok) {
        await page.screenshot({ path: path.join(SCREENSHOT_DIR, `${section.name}.png`), fullPage: false });
        console.log(`  ✓ Screenshot: ${section.name}`);
      } else {
        console.log(`  ✗ Could not find sidebar: ${section.label}`);
      }
    } catch (e) {
      console.log(`  ✗ Error capturing ${section.name}: ${e.message}`);
    }
  }

  // Logout & Captain
  await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 500));
  await page.type('[data-testid="input-email"]', 'capitan1@liga.com');
  await page.type('[data-testid="input-password"]', 'capitan123');
  await page.click('[data-testid="button-login"]');
  await new Promise(r => setTimeout(r, 3000));
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'capitan_panel.png'), fullPage: false });

  const captainSections = [
    { label: 'Jugadores', name: 'capitan_jugadores' },
    { label: 'Calendario', name: 'capitan_calendario' },
    { label: 'Mi Perfil', name: 'capitan_perfil' },
  ];
  for (const section of captainSections) {
    try {
      const ok = await clickSidebarItem(page, section.label);
      if (ok) {
        await page.screenshot({ path: path.join(SCREENSHOT_DIR, `${section.name}.png`), fullPage: false });
        console.log(`  ✓ Screenshot: ${section.name}`);
      } else {
        console.log(`  ✗ Could not find sidebar: ${section.label}`);
      }
    } catch (e) {
      console.log(`  ✗ Error capturing ${section.name}: ${e.message}`);
    }
  }

  // Logout & Referee
  await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 500));
  await page.type('[data-testid="input-email"]', 'arbitro1@liga.com');
  await page.type('[data-testid="input-password"]', 'arbitro123');
  await page.click('[data-testid="button-login"]');
  await new Promise(r => setTimeout(r, 3000));
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'arbitro_panel.png'), fullPage: false });

  const refSections = [
    { label: 'Completados', name: 'arbitro_completados' },
    { label: 'Posiciones', name: 'arbitro_posiciones' },
    { label: 'Mi Perfil', name: 'arbitro_perfil' },
  ];
  for (const section of refSections) {
    try {
      const ok = await clickSidebarItem(page, section.label);
      if (ok) {
        await page.screenshot({ path: path.join(SCREENSHOT_DIR, `${section.name}.png`), fullPage: false });
        console.log(`  ✓ Screenshot: ${section.name}`);
      } else {
        console.log(`  ✗ Could not find sidebar: ${section.label}`);
      }
    } catch (e) {
      console.log(`  ✗ Error capturing ${section.name}: ${e.message}`);
    }
  }

  await page.close();
  console.log('Screenshots captured!');
}

function imgTag(name) {
  const p = path.join(SCREENSHOT_DIR, `${name}.png`);
  if (fs.existsSync(p)) {
    const b64 = fs.readFileSync(p).toString('base64');
    return `<div class="screenshot"><img src="data:image/png;base64,${b64}" /></div>`;
  }
  return '';
}

const CSS = `
  @page { margin: 20mm 15mm; }
  * { box-sizing: border-box; }
  body {
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    color: #1a1a1a;
    line-height: 1.6;
    margin: 0; padding: 0;
  }
  .cover {
    page-break-after: always;
    display: flex; flex-direction: column;
    align-items: center; justify-content: center;
    min-height: 90vh; text-align: center;
    background: linear-gradient(135deg, #063A13 0%, #0B5D1E 50%, #063A13 100%);
    color: white; padding: 40px; border-radius: 8px;
    margin-bottom: 20px;
  }
  .cover img.logo { width: 160px; height: 160px; margin-bottom: 30px; }
  .cover h1 { font-size: 32px; color: #E6C75A; margin: 10px 0; text-transform: uppercase; letter-spacing: 2px; }
  .cover h2 { font-size: 20px; color: #C9A227; margin: 5px 0; font-weight: 400; }
  .cover .subtitle { font-size: 16px; color: #ccc; margin-top: 20px; }
  .cover .divider { width: 100px; height: 3px; background: #C9A227; margin: 20px auto; border-radius: 2px; }

  h1 { color: #0B5D1E; font-size: 24px; border-bottom: 3px solid #C9A227; padding-bottom: 8px; margin-top: 30px; }
  h2 { color: #0B5D1E; font-size: 20px; margin-top: 25px; }
  h3 { color: #063A13; font-size: 17px; margin-top: 20px; }
  h4 { color: #0B5D1E; font-size: 15px; margin-top: 18px; }

  .section-header {
    background: linear-gradient(90deg, #0B5D1E, #0a7a2a);
    color: white; padding: 12px 20px; border-radius: 6px;
    margin: 30px 0 15px; font-size: 18px; font-weight: 700;
    text-transform: uppercase; letter-spacing: 1px;
    border-left: 5px solid #C9A227;
  }
  .gold-bar {
    background: linear-gradient(90deg, #C9A227, #E6C75A);
    color: #063A13; padding: 10px 18px; border-radius: 6px;
    margin: 20px 0 10px; font-weight: 700; font-size: 15px;
  }

  ol, ul { margin: 8px 0; padding-left: 24px; }
  li { margin-bottom: 5px; }

  .tip {
    background: #f0f9f0; border-left: 4px solid #0B5D1E;
    padding: 10px 15px; margin: 12px 0; border-radius: 0 6px 6px 0;
    font-size: 13px; color: #333;
  }
  .tip strong { color: #0B5D1E; }
  .warning {
    background: #fef9e7; border-left: 4px solid #C9A227;
    padding: 10px 15px; margin: 12px 0; border-radius: 0 6px 6px 0;
    font-size: 13px; color: #333;
  }
  .warning strong { color: #C9A227; }

  .screenshot {
    margin: 15px 0; text-align: center;
    border: 2px solid #e0e0e0; border-radius: 8px; overflow: hidden;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  }
  .screenshot img { width: 100%; display: block; }

  table {
    width: 100%; border-collapse: collapse; margin: 15px 0;
    font-size: 13px;
  }
  table th {
    background: #0B5D1E; color: white; padding: 10px 12px;
    text-align: left; font-weight: 600;
  }
  table td { padding: 8px 12px; border-bottom: 1px solid #e0e0e0; }
  table tr:nth-child(even) { background: #f8f8f8; }
  table tr:hover { background: #f0f9f0; }

  .field-list { margin: 8px 0; }
  .field-list li { margin-bottom: 3px; }
  .field-list strong { color: #0B5D1E; }

  .page-break { page-break-before: always; }

  .footer {
    margin-top: 40px; padding-top: 15px;
    border-top: 2px solid #C9A227;
    text-align: center; font-size: 11px; color: #888;
  }
  .badge {
    display: inline-block; background: #C9A227; color: #063A13;
    padding: 3px 10px; border-radius: 4px; font-size: 12px;
    font-weight: 700; margin-right: 5px;
  }
`;

function generateAdminHTML() {
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><style>${CSS}</style></head><body>
  <div class="cover">
    <img src="${logoDataUri}" class="logo" />
    <h1>La Liga de Campeones Eternos</h1>
    <div class="divider"></div>
    <h2>Manual del Administrador</h2>
    <p class="subtitle">Guía completa para la gestión del torneo</p>
  </div>

  <h1>1. Acceso a la Plataforma</h1>

  <div class="section-header">1.1 Iniciar Sesión</div>
  <ol>
    <li>Abre tu navegador web e ingresa la dirección de la plataforma.</li>
    <li>Haz clic en <strong>"Iniciar Sesión"</strong> en la esquina superior derecha.</li>
    <li>Ingresa tu <strong>correo electrónico</strong> y <strong>contraseña</strong>.</li>
    <li>Haz clic en el botón <strong>"Iniciar Sesión"</strong>.</li>
    <li>Serás redirigido al <strong>Panel de Administrador</strong>.</li>
  </ol>
  ${imgTag('login')}

  <div class="section-header">1.2 Cerrar Sesión</div>
  <ol>
    <li>En el menú lateral izquierdo, haz clic en <strong>"Cerrar Sesión"</strong> (parte inferior).</li>
    <li>Serás redirigido a la página principal.</li>
  </ol>

  <div class="page-break"></div>
  <h1>2. Panel de Administrador — Vista General</h1>
  <p>Al iniciar sesión verás un panel con menú lateral que incluye las siguientes secciones:</p>
  <table>
    <tr><th>Sección</th><th>Función</th></tr>
    <tr><td><strong>Panel</strong></td><td>Vista general con accesos rápidos</td></tr>
    <tr><td><strong>Equipos</strong></td><td>Crear, editar y eliminar equipos</td></tr>
    <tr><td><strong>Jugadores</strong></td><td>Gestionar jugadores de todos los equipos</td></tr>
    <tr><td><strong>Árbitros</strong></td><td>Ver y gestionar perfiles de árbitros</td></tr>
    <tr><td><strong>Partidos</strong></td><td>Programar, editar y eliminar partidos</td></tr>
    <tr><td><strong>Torneo</strong></td><td>Crear torneos, generar calendario, finalizar</td></tr>
    <tr><td><strong>Estadísticas</strong></td><td>Tabla de goleadores y rendimiento</td></tr>
    <tr><td><strong>Finanzas</strong></td><td>Pagos, multas y gastos del torneo</td></tr>
    <tr><td><strong>Noticias</strong></td><td>Publicar reseñas y notas informativas</td></tr>
    <tr><td><strong>Marketing</strong></td><td>Contenido multimedia del torneo</td></tr>
    <tr><td><strong>Mensajería</strong></td><td>Mensajes recibidos del formulario público</td></tr>
    <tr><td><strong>Reglamento</strong></td><td>Reglas y normativas del torneo</td></tr>
    <tr><td><strong>Usuarios</strong></td><td>Crear y gestionar cuentas de usuarios</td></tr>
    <tr><td><strong>Divisiones</strong></td><td>Configurar divisiones del torneo</td></tr>
  </table>
  ${imgTag('admin_panel')}

  <div class="page-break"></div>
  <h1>3. Gestión de Torneos</h1>

  <div class="section-header">3.1 Crear un Torneo</div>
  <ol>
    <li>En el menú lateral, haz clic en <strong>"Torneo"</strong>.</li>
    <li>Haz clic en <strong>"Nuevo Torneo"</strong>.</li>
    <li>Completa el formulario:
      <ul class="field-list">
        <li><strong>Nombre del Torneo:</strong> Ej. "Liga Primavera 2026"</li>
        <li><strong>Temporada:</strong> Ej. "Primavera 2026"</li>
        <li><strong>Lugar:</strong> Ej. "Complejo Deportivo Norte"</li>
        <li><strong>Fecha de inicio:</strong> Selecciona la fecha</li>
        <li><strong>División:</strong> Selecciona Primera o Segunda División</li>
      </ul>
    </li>
    <li>Haz clic en <strong>"Crear Torneo"</strong>.</li>
  </ol>
  <div class="tip"><strong>Recomendación:</strong> Configura las divisiones primero en la sección "Divisiones" antes de crear torneos.</div>
  ${imgTag('admin_torneo')}

  <div class="section-header">3.2 Generar Calendario Automático</div>
  <ol>
    <li>En <strong>"Torneo"</strong>, localiza el torneo activo.</li>
    <li>Haz clic en <strong>"Generar Calendario"</strong>.</li>
    <li>Verás la cantidad de equipos, jornadas y partidos por jornada.</li>
    <li>Activa <strong>"Ida y Vuelta"</strong> si deseas dos vueltas.</li>
    <li>Haz clic en <strong>"Generar Calendario"</strong>.</li>
  </ol>
  <div class="warning"><strong>Nota:</strong> Si ya existían partidos previos para ese torneo, serán reemplazados.</div>

  <div class="section-header">3.3 Finalizar un Torneo</div>
  <ol>
    <li>En <strong>"Torneo"</strong>, haz clic en <strong>"Finalizar"</strong> en el torneo activo.</li>
    <li>Selecciona el <strong>equipo campeón</strong> de la lista desplegable.</li>
    <li>Haz clic en <strong>"Finalizar Torneo"</strong>.</li>
  </ol>
  <div class="warning"><strong>Nota:</strong> Esta acción no se puede deshacer. Asegúrate de que todos los partidos estén registrados.</div>

  <div class="page-break"></div>
  <h1>4. Gestión de Equipos</h1>

  <div class="section-header">4.1 Crear un Equipo</div>
  <ol>
    <li>En el menú lateral, haz clic en <strong>"Equipos"</strong>.</li>
    <li>Haz clic en <strong>"Nuevo Equipo"</strong>.</li>
    <li>Completa el formulario:
      <ul class="field-list">
        <li><strong>División:</strong> Selecciona la división</li>
        <li><strong>Nombre:</strong> Ej. "Águilas FC"</li>
        <li><strong>Colores:</strong> Ej. "Azul y blanco"</li>
        <li><strong>Sede:</strong> Ej. "Cancha Municipal"</li>
        <li><strong>Entrenador:</strong> Nombre del entrenador</li>
        <li><strong>Logo:</strong> Haz clic en "Subir logo" para cargar imagen</li>
      </ul>
    </li>
    <li>Haz clic en <strong>"Crear Equipo"</strong>.</li>
  </ol>
  ${imgTag('admin_equipos')}

  <div class="section-header">4.2 Editar un Equipo</div>
  <ol>
    <li>Localiza el equipo en la lista.</li>
    <li>Haz clic en el icono de <strong>lápiz</strong> (editar).</li>
    <li>Modifica los datos necesarios.</li>
    <li>Haz clic en <strong>"Guardar"</strong>.</li>
  </ol>

  <div class="page-break"></div>
  <h1>5. Gestión de Jugadores</h1>

  <div class="section-header">5.1 Agregar Jugador a un Equipo</div>
  <ol>
    <li>En <strong>"Equipos"</strong>, haz clic en <strong>"Jugadores"</strong> del equipo.</li>
    <li>Haz clic en <strong>"Agregar Jugador"</strong>.</li>
    <li>Completa el formulario:
      <ul class="field-list">
        <li><strong>Fotografía:</strong> Haz clic para subir foto desde tu dispositivo</li>
        <li><strong>Nombre</strong> y <strong>Apellido</strong></li>
        <li><strong>Número de camiseta</strong></li>
        <li><strong>Posición:</strong> Ej. "Delantero"</li>
        <li><strong>DNI:</strong> Número de identificación</li>
        <li><strong>Federado:</strong> Activa si aplica e ingresa ID de federación</li>
      </ul>
    </li>
    <li>Haz clic en <strong>"Agregar Jugador"</strong>.</li>
  </ol>
  ${imgTag('admin_jugadores')}

  <div class="section-header">5.2 Editar un Jugador</div>
  <ol>
    <li>Haz clic en el icono de <strong>lápiz</strong> junto al jugador.</li>
    <li>Modifica los datos. Puedes cambiar su estado <strong>Activo/Inactivo</strong>.</li>
    <li>Haz clic en <strong>"Guardar Cambios"</strong>.</li>
  </ol>

  <div class="page-break"></div>
  <h1>6. Gestión de Partidos</h1>

  <div class="section-header">6.1 Programar un Partido</div>
  <ol>
    <li>En el menú lateral, haz clic en <strong>"Partidos"</strong>.</li>
    <li>Haz clic en <strong>"Nuevo Partido"</strong>.</li>
    <li>Completa:
      <ul class="field-list">
        <li><strong>Jornada:</strong> Número de jornada</li>
        <li><strong>Fecha y hora:</strong> Selecciona fecha y hora</li>
        <li><strong>Cancha:</strong> Nombre de la sede</li>
        <li><strong>Equipo local:</strong> Selecciona de la lista</li>
        <li><strong>Equipo visitante:</strong> Selecciona de la lista</li>
        <li><strong>Árbitro:</strong> Selecciona un árbitro</li>
      </ul>
    </li>
    <li>Haz clic en <strong>"Crear Partido"</strong>.</li>
  </ol>
  ${imgTag('admin_partidos')}

  <div class="section-header">6.2 Asignar Árbitro</div>
  <ol>
    <li>Localiza el partido y haz clic en el icono de <strong>lápiz</strong>.</li>
    <li>En el campo <strong>"Árbitro"</strong>, selecciona de la lista.</li>
    <li>Haz clic en <strong>"Guardar"</strong>.</li>
  </ol>

  <div class="section-header">6.3 Corregir Resultados</div>
  <ol>
    <li>Localiza el partido y haz clic en el icono de <strong>lápiz</strong>.</li>
    <li>Modifica el marcador o datos necesarios.</li>
    <li>Haz clic en <strong>"Guardar"</strong>.</li>
  </ol>
  <div class="tip"><strong>Nota:</strong> Los cambios actualizarán automáticamente la tabla de posiciones.</div>

  <div class="page-break"></div>
  <h1>7. Gestión de Árbitros</h1>
  <div class="section-header">7.1 Ver y Gestionar Árbitros</div>
  <ol>
    <li>En el menú lateral, haz clic en <strong>"Árbitros"</strong>.</li>
    <li>Verás la lista de árbitros con sus datos de perfil.</li>
    <li>Puedes <strong>editar</strong> o <strong>eliminar</strong> perfiles.</li>
  </ol>
  ${imgTag('admin_arbitros')}

  <h1>8. Estadísticas</h1>
  <ol>
    <li>En el menú lateral, haz clic en <strong>"Estadísticas"</strong>.</li>
    <li>Consulta la tabla de goleadores y rendimiento de equipos.</li>
  </ol>
  ${imgTag('admin_estadisticas')}

  <h1>9. Finanzas</h1>
  <div class="section-header">Gestión Financiera</div>
  <p>En la sección <strong>"Finanzas"</strong> puedes gestionar:</p>
  <ul>
    <li><strong>Pagos de equipos:</strong> Inscripciones y cuotas.</li>
    <li><strong>Pagos de multas:</strong> Pagos de sanciones por tarjetas.</li>
    <li><strong>Gastos del torneo:</strong> Arbitraje, canchas, etc.</li>
  </ul>
  ${imgTag('admin_finanzas')}

  <div class="page-break"></div>
  <h1>10. Noticias y Marketing</h1>
  <div class="section-header">10.1 Publicar Noticias</div>
  <ol>
    <li>En el menú lateral, haz clic en <strong>"Noticias"</strong>.</li>
    <li>Haz clic en <strong>"Nueva Noticia"</strong>.</li>
    <li>Completa título y contenido.</li>
    <li>Haz clic en <strong>"Guardar"</strong>.</li>
  </ol>
  ${imgTag('admin_noticias')}

  <div class="section-header">10.2 Marketing</div>
  <p>En <strong>"Marketing"</strong> puedes subir fotos y videos del torneo.</p>

  <h1>11. Mensajería</h1>
  <ol>
    <li>En el menú lateral, haz clic en <strong>"Mensajería"</strong>.</li>
    <li>Verás los mensajes enviados desde el formulario de contacto de la página principal.</li>
    <li>Puedes actualizar el estado o eliminar mensajes.</li>
  </ol>
  ${imgTag('admin_mensajeria')}

  <h1>12. Usuarios y Divisiones</h1>
  <div class="section-header">12.1 Gestionar Usuarios</div>
  <ol>
    <li>En <strong>"Configuración" → "Usuarios"</strong>.</li>
    <li>Crea nuevos usuarios, edita datos o cambia roles.</li>
    <li>Puedes crear cuentas para capitanes y árbitros y compartirles las credenciales.</li>
  </ol>
  <div class="section-header">12.2 Configurar Divisiones</div>
  <ol>
    <li>En <strong>"Configuración" → "Divisiones"</strong>.</li>
    <li>Crea, edita o elimina divisiones (Primera, Segunda, etc.).</li>
  </ol>

  <div class="footer">
    <p>La Liga de Campeones Eternos — Manual del Administrador</p>
  </div>
  </body></html>`;
}

function generateCaptainHTML() {
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><style>${CSS}</style></head><body>
  <div class="cover">
    <img src="${logoDataUri}" class="logo" />
    <h1>La Liga de Campeones Eternos</h1>
    <div class="divider"></div>
    <h2>Manual del Capitán</h2>
    <p class="subtitle">Guía para la gestión de tu equipo</p>
  </div>

  <h1>1. Acceso a la Plataforma</h1>

  <div class="section-header">1.1 Cómo Obtener tu Cuenta</div>
  <p>Existen dos formas de obtener acceso como Capitán:</p>

  <div class="gold-bar">Opción 1 — Autoregistro</div>
  <ol>
    <li>Ingresa a la plataforma y haz clic en <strong>"Iniciar Sesión"</strong>.</li>
    <li>Haz clic en <strong>"Crear cuenta"</strong>.</li>
    <li>Completa el formulario:
      <ul class="field-list">
        <li><strong>Nombre completo:</strong> Tu nombre y apellido</li>
        <li><strong>Correo electrónico:</strong> Un correo válido</li>
        <li><strong>Rol:</strong> Selecciona <strong>"Capitán"</strong></li>
        <li><strong>Contraseña:</strong> Crea una contraseña segura</li>
        <li><strong>Confirmar contraseña:</strong> Repite la contraseña</li>
      </ul>
    </li>
    <li>Haz clic en <strong>"Crear Cuenta"</strong>.</li>
  </ol>
  <div class="tip"><strong>Recomendación:</strong> Si te autoregistras, comunícale al Administrador para que asocie tu cuenta con tu equipo.</div>
  ${imgTag('registro')}

  <div class="gold-bar">Opción 2 — Cuenta creada por el Administrador</div>
  <ol>
    <li>El Administrador crea tu cuenta desde su panel en la sección <strong>"Usuarios"</strong>.</li>
    <li>Te compartirá tus credenciales (correo y contraseña).</li>
    <li>Ingresa a la plataforma con esas credenciales.</li>
  </ol>

  <div class="section-header">1.2 Iniciar Sesión</div>
  <ol>
    <li>Haz clic en <strong>"Iniciar Sesión"</strong> en la página principal.</li>
    <li>Ingresa tu <strong>correo electrónico</strong> y <strong>contraseña</strong>.</li>
    <li>Haz clic en <strong>"Iniciar Sesión"</strong>.</li>
    <li>Serás redirigido al <strong>Panel de Capitán</strong>.</li>
  </ol>
  ${imgTag('login')}

  <div class="page-break"></div>
  <h1>2. Tu Panel de Capitán</h1>
  <p>El menú lateral incluye las siguientes secciones:</p>
  <table>
    <tr><th>Sección</th><th>Función</th></tr>
    <tr><td><strong>Mi Equipo</strong></td><td>Ver y editar datos de tu equipo</td></tr>
    <tr><td><strong>Jugadores</strong></td><td>Agregar y eliminar jugadores</td></tr>
    <tr><td><strong>Calendario</strong></td><td>Consultar partidos programados y resultados</td></tr>
    <tr><td><strong>Reglamento</strong></td><td>Consultar reglas del torneo</td></tr>
    <tr><td><strong>Mi Perfil</strong></td><td>Gestionar tus datos personales</td></tr>
  </table>
  ${imgTag('capitan_panel')}

  <div class="warning"><strong>Importante:</strong> La primera vez que ingreses, deberás completar tu perfil de capitán antes de poder acceder a las demás secciones.</div>

  <div class="page-break"></div>
  <h1>3. Completar Perfil (Obligatorio)</h1>

  <div class="section-header">Primer ingreso</div>
  <ol>
    <li>Al ingresar por primera vez, aparecerá un aviso pidiendo completar tu perfil.</li>
    <li>Se abrirá automáticamente la sección <strong>"Mi Perfil"</strong>.</li>
    <li>Completa los campos obligatorios:
      <ul class="field-list">
        <li><strong>Nombre completo</strong></li>
        <li><strong>Número de identificación</strong></li>
        <li><strong>Teléfono</strong></li>
        <li><strong>Correo electrónico</strong></li>
      </ul>
    </li>
    <li>Opcionalmente completa: dirección, contacto de emergencia, teléfono de emergencia, observaciones.</li>
    <li>Haz clic en <strong>"Guardar Perfil"</strong>.</li>
  </ol>
  ${imgTag('capitan_perfil')}

  <div class="page-break"></div>
  <h1>4. Gestión de Mi Equipo</h1>

  <div class="section-header">Ver y Editar Equipo</div>
  <ol>
    <li>En el menú lateral, haz clic en <strong>"Mi Equipo"</strong>.</li>
    <li>Verás la información actual: nombre, colores, sede y logo.</li>
    <li>Para editar, haz clic en <strong>"Editar"</strong>.</li>
    <li>Modifica los campos:
      <ul class="field-list">
        <li><strong>Nombre del equipo</strong></li>
        <li><strong>Colores</strong></li>
        <li><strong>Sede</strong></li>
        <li><strong>Logo:</strong> Puedes subir una nueva imagen</li>
      </ul>
    </li>
    <li>Haz clic en <strong>"Guardar"</strong>.</li>
  </ol>

  <h1>5. Gestión de Jugadores</h1>

  <div class="section-header">5.1 Agregar Jugador</div>
  <ol>
    <li>En el menú lateral, haz clic en <strong>"Jugadores"</strong>.</li>
    <li>Haz clic en <strong>"Agregar Jugador"</strong>.</li>
    <li>Completa el formulario:
      <ul class="field-list">
        <li><strong>Fotografía:</strong> Haz clic en el área circular para subir foto (en celular se abre la cámara)</li>
        <li><strong>Nombre</strong> y <strong>Apellido</strong></li>
        <li><strong>Número de camiseta</strong></li>
        <li><strong>Posición</strong></li>
        <li><strong>DNI:</strong> Número de identificación</li>
        <li><strong>Federado:</strong> Activa si aplica e ingresa ID</li>
      </ul>
    </li>
    <li>Haz clic en <strong>"Agregar Jugador"</strong>.</li>
  </ol>
  ${imgTag('capitan_jugadores')}

  <div class="section-header">5.2 Eliminar Jugador</div>
  <ol>
    <li>Localiza al jugador en la lista.</li>
    <li>Haz clic en el icono de <strong>basura</strong> (eliminar).</li>
    <li>Confirma la eliminación.</li>
  </ol>
  <div class="warning"><strong>Nota:</strong> Esta acción no se puede deshacer.</div>

  <div class="page-break"></div>
  <h1>6. Consultar Calendario</h1>
  <ol>
    <li>En el menú lateral, haz clic en <strong>"Calendario"</strong>.</li>
    <li>Verás los partidos de tu equipo con:
      <ul>
        <li>Jornada y rival</li>
        <li>Fecha y hora</li>
        <li>Cancha</li>
        <li>Estado (Programado, En Curso o Jugado)</li>
        <li>Resultado (si ya se jugó)</li>
      </ul>
    </li>
  </ol>
  ${imgTag('capitan_calendario')}

  <h1>7. Consultar Reglamento</h1>
  <ol>
    <li>En el menú lateral, haz clic en <strong>"Reglamento"</strong>.</li>
    <li>Consulta las reglas y normativas del torneo.</li>
  </ol>

  <h1>8. Editar Mi Perfil</h1>
  <ol>
    <li>En el menú lateral, haz clic en <strong>"Mi Perfil"</strong>.</li>
    <li>Haz clic en <strong>"Editar"</strong>.</li>
    <li>Actualiza los datos que necesites.</li>
    <li>Haz clic en <strong>"Guardar"</strong>.</li>
  </ol>

  <div class="footer">
    <p>La Liga de Campeones Eternos — Manual del Capitán</p>
  </div>
  </body></html>`;
}

function generateRefereeHTML() {
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><style>${CSS}</style></head><body>
  <div class="cover">
    <img src="${logoDataUri}" class="logo" />
    <h1>La Liga de Campeones Eternos</h1>
    <div class="divider"></div>
    <h2>Manual del Árbitro</h2>
    <p class="subtitle">Guía para el registro de resultados</p>
  </div>

  <h1>1. Acceso a la Plataforma</h1>

  <div class="section-header">1.1 Cómo Obtener tu Cuenta</div>
  <p>Existen dos formas de obtener acceso como Árbitro:</p>

  <div class="gold-bar">Opción 1 — Autoregistro</div>
  <ol>
    <li>Ingresa a la plataforma y haz clic en <strong>"Iniciar Sesión"</strong>.</li>
    <li>Haz clic en <strong>"Crear cuenta"</strong>.</li>
    <li>Completa el formulario:
      <ul class="field-list">
        <li><strong>Nombre completo:</strong> Tu nombre y apellido</li>
        <li><strong>Correo electrónico:</strong> Un correo válido</li>
        <li><strong>Rol:</strong> Selecciona <strong>"Árbitro"</strong></li>
        <li><strong>Contraseña:</strong> Crea una contraseña segura</li>
        <li><strong>Confirmar contraseña:</strong> Repite la contraseña</li>
      </ul>
    </li>
    <li>Haz clic en <strong>"Crear Cuenta"</strong>.</li>
  </ol>
  <div class="tip"><strong>Recomendación:</strong> Si te autoregistras, comunícale al Administrador para que pueda asignarte partidos.</div>
  ${imgTag('registro')}

  <div class="gold-bar">Opción 2 — Cuenta creada por el Administrador</div>
  <ol>
    <li>El Administrador crea tu cuenta desde su panel en la sección <strong>"Usuarios"</strong>.</li>
    <li>Te compartirá tus credenciales (correo y contraseña).</li>
    <li>Ingresa a la plataforma con esas credenciales.</li>
  </ol>

  <div class="section-header">1.2 Iniciar Sesión</div>
  <ol>
    <li>Haz clic en <strong>"Iniciar Sesión"</strong> en la página principal.</li>
    <li>Ingresa tu <strong>correo electrónico</strong> y <strong>contraseña</strong>.</li>
    <li>Haz clic en <strong>"Iniciar Sesión"</strong>.</li>
    <li>Serás redirigido al <strong>Panel de Árbitro</strong>.</li>
  </ol>
  ${imgTag('login')}

  <div class="page-break"></div>
  <h1>2. Tu Panel de Árbitro</h1>
  <p>El menú lateral incluye las siguientes secciones:</p>
  <table>
    <tr><th>Sección</th><th>Función</th></tr>
    <tr><td><strong>Pendientes</strong></td><td>Partidos asignados por jugar</td></tr>
    <tr><td><strong>Completados</strong></td><td>Partidos ya arbitrados</td></tr>
    <tr><td><strong>Posiciones</strong></td><td>Tabla de posiciones del torneo</td></tr>
    <tr><td><strong>Resultados</strong></td><td>Resultados de todos los partidos</td></tr>
    <tr><td><strong>Reglamento</strong></td><td>Reglas del torneo</td></tr>
    <tr><td><strong>Mi Perfil</strong></td><td>Tus datos personales</td></tr>
  </table>
  ${imgTag('arbitro_panel')}

  <div class="warning"><strong>Importante:</strong> La primera vez que ingreses, deberás completar tu perfil de árbitro antes de poder acceder a las demás secciones.</div>

  <div class="page-break"></div>
  <h1>3. Completar Perfil (Obligatorio)</h1>

  <div class="section-header">Primer ingreso</div>
  <ol>
    <li>Al ingresar por primera vez, aparecerá un aviso pidiendo completar tu perfil.</li>
    <li>Se abrirá automáticamente la sección <strong>"Mi Perfil"</strong>.</li>
    <li>Completa los campos obligatorios:
      <ul class="field-list">
        <li><strong>Nombre completo</strong></li>
        <li><strong>Número de identificación</strong></li>
        <li><strong>Teléfono</strong></li>
        <li><strong>Correo electrónico</strong></li>
      </ul>
    </li>
    <li>Opcionalmente completa: asociación/liga, años de experiencia, observaciones.</li>
    <li>Haz clic en <strong>"Guardar Perfil"</strong>.</li>
  </ol>
  ${imgTag('arbitro_perfil')}

  <div class="page-break"></div>
  <h1>4. Ver Partidos Pendientes</h1>

  <div class="section-header">Partidos Asignados</div>
  <ol>
    <li>En el menú lateral, haz clic en <strong>"Pendientes"</strong>.</li>
    <li>Verás la lista de partidos asignados que aún no se han jugado.</li>
    <li>Cada partido muestra:
      <ul>
        <li>Jornada</li>
        <li>Equipos (local vs. visitante)</li>
        <li>Fecha y hora</li>
        <li>Cancha</li>
      </ul>
    </li>
  </ol>

  <div class="page-break"></div>
  <h1>5. Registrar Resultado de un Partido</h1>
  <p>Este es el proceso principal de tu rol como árbitro. Sigue estos pasos cuidadosamente:</p>

  <div class="section-header">Paso 1 — Seleccionar el Partido</div>
  <ol>
    <li>En <strong>"Pendientes"</strong>, localiza el partido a registrar.</li>
    <li>Haz clic en <strong>"Cargar Resultado"</strong>.</li>
    <li>Se abrirá el formulario de registro.</li>
  </ol>

  <div class="section-header">Paso 2 — Registrar el Marcador</div>
  <ol>
    <li>Ingresa los <strong>goles del equipo local</strong>.</li>
    <li>Ingresa los <strong>goles del equipo visitante</strong>.</li>
  </ol>

  <div class="section-header">Paso 3 — Registrar Eventos del Partido</div>
  <p>Para cada evento (gol, tarjeta amarilla o tarjeta roja):</p>
  <ol>
    <li>Haz clic en <strong>"Agregar Evento"</strong>.</li>
    <li>Selecciona el <strong>tipo de evento</strong>:
      <ul>
        <li><span class="badge">GOL</span> Gol anotado</li>
        <li><span class="badge" style="background:#f1c40f;color:#333;">AMARILLA</span> Tarjeta amarilla</li>
        <li><span class="badge" style="background:#e74c3c;color:white;">ROJA</span> Tarjeta roja</li>
      </ul>
    </li>
    <li>Ingresa el <strong>minuto</strong> del evento.</li>
    <li>Selecciona el <strong>equipo</strong> involucrado.</li>
    <li>Selecciona el <strong>jugador</strong> de la lista desplegable.</li>
    <li>Repite para cada evento adicional.</li>
  </ol>
  <div class="tip"><strong>Recomendación:</strong> Si necesitas eliminar un evento, haz clic en el icono de basura junto al evento.</div>

  <div class="section-header">Paso 4 — Guardar el Resultado</div>
  <ol>
    <li>Revisa que el marcador y todos los eventos sean correctos.</li>
    <li>Haz clic en <strong>"Guardar Resultado"</strong>.</li>
    <li>El partido pasará a la sección <strong>"Completados"</strong>.</li>
  </ol>

  <div class="warning"><strong>Nota:</strong> Las tarjetas registradas pueden generar multas automáticamente según la configuración del torneo. Verifica cuidadosamente antes de guardar.</div>

  <div class="page-break"></div>
  <h1>6. Ver Partidos Completados</h1>
  <ol>
    <li>En el menú lateral, haz clic en <strong>"Completados"</strong>.</li>
    <li>Verás la lista de partidos que ya arbitraste.</li>
    <li>Haz clic en <strong>"Ver Detalles"</strong> en cualquier partido para consultar:
      <ul>
        <li>Marcador final</li>
        <li>Goles (jugador y minuto)</li>
        <li>Tarjetas amarillas (jugador y minuto)</li>
        <li>Tarjetas rojas (jugador y minuto)</li>
      </ul>
    </li>
  </ol>
  ${imgTag('arbitro_completados')}

  <h1>7. Consultar Posiciones y Resultados</h1>

  <div class="section-header">Tabla de Posiciones</div>
  <ol>
    <li>En el menú lateral, haz clic en <strong>"Posiciones"</strong>.</li>
    <li>Consulta la clasificación actualizada (PJ, PG, PE, PP, GF, GC, DG, PTS).</li>
  </ol>
  ${imgTag('arbitro_posiciones')}

  <div class="section-header">Resultados</div>
  <ol>
    <li>En el menú lateral, haz clic en <strong>"Resultados"</strong>.</li>
    <li>Consulta los resultados de todos los partidos del torneo.</li>
  </ol>

  <h1>8. Consultar Reglamento</h1>
  <ol>
    <li>En el menú lateral, haz clic en <strong>"Reglamento"</strong>.</li>
    <li>Consulta las reglas y normativas del torneo.</li>
  </ol>

  <h1>9. Editar Mi Perfil</h1>
  <ol>
    <li>En el menú lateral, haz clic en <strong>"Mi Perfil"</strong>.</li>
    <li>Haz clic en <strong>"Editar"</strong>.</li>
    <li>Actualiza tus datos.</li>
    <li>Haz clic en <strong>"Guardar"</strong>.</li>
  </ol>

  <div class="footer">
    <p>La Liga de Campeones Eternos — Manual del Árbitro</p>
  </div>
  </body></html>`;
}

async function main() {
  if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  console.log('Launching browser...');
  const browser = await puppeteer.launch({
    headless: 'new',
    executablePath: '/nix/store/zi4f80l169xlmivz8vja8wlphq74qqk0-chromium-125.0.6422.141/bin/chromium',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-gpu'],
  });

  // Step 1: Take screenshots
  console.log('Taking screenshots...');
  try {
    await takeScreenshots(browser);
  } catch (e) {
    console.log('Some screenshots failed, continuing with available ones:', e.message);
  }

  // Step 2: Generate PDFs
  const manuals = [
    { name: 'Manual_Administrador', html: generateAdminHTML() },
    { name: 'Manual_Capitan', html: generateCaptainHTML() },
    { name: 'Manual_Arbitro', html: generateRefereeHTML() },
  ];

  for (const manual of manuals) {
    console.log(`Generating ${manual.name}.pdf...`);
    const page = await browser.newPage();
    await page.setContent(manual.html, { waitUntil: 'networkidle0' });
    await page.pdf({
      path: path.join(OUTPUT_DIR, `${manual.name}.pdf`),
      format: 'A4',
      printBackground: true,
      margin: { top: '15mm', right: '12mm', bottom: '15mm', left: '12mm' },
    });
    await page.close();
    console.log(`  ✓ ${manual.name}.pdf generated`);
  }

  await browser.close();
  console.log('\nAll manuals generated in:', OUTPUT_DIR);
}

main().catch(console.error);
