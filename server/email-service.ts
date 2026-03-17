const SMTP2GO_API_URL = "https://api.smtp2go.com/v3/email/send";
const SMTP2GO_API_KEY = process.env.SMTP2GO_API_KEY;
const SENDER_EMAIL = process.env.SMTP2GO_SENDER_EMAIL || "info@laligadecampeones.es";
const SENDER_NAME = "La Liga de Campeones";

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  toName?: string;
}

async function sendEmail(options: EmailOptions): Promise<boolean> {
  if (!SMTP2GO_API_KEY) {
    console.error("[email] SMTP2GO_API_KEY no configurada");
    return false;
  }

  try {
    const payload = {
      api_key: SMTP2GO_API_KEY,
      to: [options.toName ? `${options.toName} <${options.to}>` : options.to],
      sender: `${SENDER_NAME} <${SENDER_EMAIL}>`,
      subject: options.subject,
      html_body: options.html,
    };

    console.log(`[email] Enviando a ${options.to} desde ${SENDER_EMAIL} - Asunto: ${options.subject}`);

    const response = await fetch(SMTP2GO_API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const result = await response.json();

    if (result.data?.succeeded > 0) {
      console.log(`[email] SMTP2GO aceptó envío a ${options.to} - email_id: ${result.data?.email_id || "N/A"}`);
      return true;
    } else {
      console.error(`[email] SMTP2GO rechazó envío a ${options.to}:`, JSON.stringify(result));
      return false;
    }
  } catch (error) {
    console.error(`[email] Error de red al enviar a ${options.to}:`, error);
    return false;
  }
}

function getBaseStyles(): string {
  return `
    body { margin: 0; padding: 0; background-color: #0D0D0D; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; }
    .container { max-width: 600px; margin: 0 auto; background-color: #1a1a1a; border: 1px solid #333; border-radius: 8px; overflow: hidden; }
    .header { background: linear-gradient(135deg, #0D0D0D 0%, #1a1a1a 100%); padding: 32px 24px; text-align: center; border-bottom: 3px solid #C6A052; }
    .header h1 { color: #C6A052; font-size: 28px; margin: 0; letter-spacing: 1px; }
    .header p { color: #C0C0C0; font-size: 14px; margin: 8px 0 0; }
    .body { padding: 32px 24px; }
    .body h2 { color: #C6A052; font-size: 22px; margin: 0 0 16px; }
    .body p { color: #e0e0e0; font-size: 15px; line-height: 1.6; margin: 0 0 12px; }
    .info-box { background-color: #0D0D0D; border: 1px solid #333; border-left: 4px solid #C6A052; border-radius: 6px; padding: 16px 20px; margin: 20px 0; }
    .info-box .label { color: #C0C0C0; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 4px; }
    .info-box .value { color: #ffffff; font-size: 16px; font-weight: 600; margin: 0 0 12px; }
    .info-box .value:last-child { margin-bottom: 0; }
    .badge { display: inline-block; background-color: #0B6B3A; color: #ffffff; padding: 4px 12px; border-radius: 4px; font-size: 13px; font-weight: 600; }
    .cta { display: inline-block; background-color: #C6A052; color: #0D0D0D; padding: 12px 32px; border-radius: 6px; font-size: 16px; font-weight: 700; text-decoration: none; margin: 16px 0; }
    .footer { background-color: #0D0D0D; padding: 24px; text-align: center; border-top: 1px solid #333; }
    .footer p { color: #666; font-size: 12px; margin: 0 0 4px; }
    .divider { border: 0; border-top: 1px solid #333; margin: 24px 0; }
  `;
}

export async function sendWelcomeCaptainEmail(params: {
  captainName: string;
  captainEmail: string;
  teamName: string;
}): Promise<boolean> {
  const html = `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"><style>${getBaseStyles()}</style></head>
    <body>
      <div class="container">
        <div class="header">
          <h1>LA LIGA DE CAMPEONES</h1>
          <p>Sistema de Gestión de Torneos</p>
        </div>
        <div class="body">
          <h2>¡Bienvenido, Capitán!</h2>
          <p>Hola <strong>${params.captainName}</strong>,</p>
          <p>Tu perfil de capitán ha sido completado exitosamente. Ya puedes gestionar tu equipo desde el panel de capitán.</p>
          
          <div class="info-box">
            <p class="label">Tu equipo</p>
            <p class="value">${params.teamName}</p>
            <p class="label">Email registrado</p>
            <p class="value">${params.captainEmail}</p>
            <p class="label">Estado</p>
            <p class="value"><span class="badge">ACTIVO</span></p>
          </div>

          <p>Desde tu panel de capitán puedes:</p>
          <p>&#9917; Gestionar la plantilla de jugadores<br>
             &#128197; Consultar el calendario de partidos<br>
             &#128203; Ver resultados y clasificación<br>
             &#128100; Actualizar tu perfil</p>

          <hr class="divider">
          <p style="color: #C0C0C0; font-size: 13px;">Si tienes alguna duda, contacta con la organización respondiendo a este correo.</p>
        </div>
        <div class="footer">
          <p>La Liga de Campeones &copy; ${new Date().getFullYear()}</p>
          <p>Fuengirola, España</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({
    to: params.captainEmail,
    toName: params.captainName,
    subject: `¡Bienvenido a La Liga de Campeones, ${params.captainName}!`,
    html,
  });
}

export function sendFineNotificationEmail(params: {
  captainName: string;
  captainEmail: string;
  teamName: string;
  fineType: string;
  amount: number;
  playerName?: string;
  matchDetails?: string;
}): void {
  const reasonText = params.playerName
    ? `${params.fineType} - Jugador: ${params.playerName}`
    : `${params.fineType} - Equipo: ${params.teamName}`;

  const html = `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"><style>${getBaseStyles()}</style></head>
    <body>
      <div class="container">
        <div class="header">
          <h1>LA LIGA DE CAMPEONES</h1>
          <p>Notificación de Multa</p>
        </div>
        <div class="body">
          <h2>Multa Registrada</h2>
          <p>Hola <strong>${params.captainName}</strong>,</p>
          <p>Se ha registrado una multa para tu equipo <strong>${params.teamName}</strong>.</p>
          
          <div class="info-box">
            <p class="label">Motivo</p>
            <p class="value">${reasonText}</p>
            <p class="label">Monto</p>
            <p class="value" style="color: #e74c3c; font-size: 24px;">${params.amount.toFixed(2)}€</p>
            ${params.matchDetails ? `<p class="label">Partido</p><p class="value">${params.matchDetails}</p>` : ""}
            <p class="label">Estado</p>
            <p class="value"><span class="badge" style="background-color: #e74c3c;">PENDIENTE</span></p>
          </div>

          <p>Ponte en contacto con la organización para realizar el pago de esta multa.</p>

          <hr class="divider">
          <p style="color: #C0C0C0; font-size: 13px;">Este es un correo automático. Para más información, contacta con la organización.</p>
        </div>
        <div class="footer">
          <p>La Liga de Campeones &copy; ${new Date().getFullYear()}</p>
          <p>Fuengirola, España</p>
        </div>
      </div>
    </body>
    </html>
  `;

  sendEmail({
    to: params.captainEmail,
    toName: params.captainName,
    subject: `Multa registrada - ${params.teamName} (${params.amount.toFixed(2)}€)`,
    html,
  });
}

export function sendMatchResultEmail(params: {
  captainName: string;
  captainEmail: string;
  teamName: string;
  homeTeam: string;
  awayTeam: string;
  homeScore: number;
  awayScore: number;
  matchDate?: string;
  isHome: boolean;
}): void {
  const myScore = params.isHome ? params.homeScore : params.awayScore;
  const theirScore = params.isHome ? params.awayScore : params.homeScore;
  const resultText = myScore > theirScore ? "VICTORIA" : myScore < theirScore ? "DERROTA" : "EMPATE";

  const resultColor = resultText === "VICTORIA" ? "#0B6B3A" : resultText === "DERROTA" ? "#e74c3c" : "#C6A052";

  const html = `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"><style>${getBaseStyles()}</style></head>
    <body>
      <div class="container">
        <div class="header">
          <h1>LA LIGA DE CAMPEONES</h1>
          <p>Resultado de Partido</p>
        </div>
        <div class="body">
          <h2>Resultado Final</h2>
          <p>Hola <strong>${params.captainName}</strong>,</p>
          <p>Se ha registrado el resultado del partido de tu equipo.</p>
          
          <div class="info-box" style="text-align: center;">
            <p style="color: #C0C0C0; font-size: 14px; margin-bottom: 12px;">${params.matchDate || ""}</p>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="text-align: right; padding: 8px; width: 40%;">
                  <span style="color: #ffffff; font-size: 18px; font-weight: 600;">${params.homeTeam}</span>
                </td>
                <td style="text-align: center; padding: 8px; width: 20%;">
                  <span style="color: #C6A052; font-size: 32px; font-weight: 700;">${params.homeScore} - ${params.awayScore}</span>
                </td>
                <td style="text-align: left; padding: 8px; width: 40%;">
                  <span style="color: #ffffff; font-size: 18px; font-weight: 600;">${params.awayTeam}</span>
                </td>
              </tr>
            </table>
            <p style="margin-top: 12px;"><span class="badge" style="background-color: ${resultColor}; font-size: 16px; padding: 6px 20px;">${resultText}</span></p>
          </div>

          <p>Puedes ver los detalles completos del partido en tu panel de capitán.</p>

          <hr class="divider">
          <p style="color: #C0C0C0; font-size: 13px;">Este es un correo automático del sistema de gestión de torneos.</p>
        </div>
        <div class="footer">
          <p>La Liga de Campeones &copy; ${new Date().getFullYear()}</p>
          <p>Fuengirola, España</p>
        </div>
      </div>
    </body>
    </html>
  `;

  sendEmail({
    to: params.captainEmail,
    toName: params.captainName,
    subject: `Resultado: ${params.homeTeam} ${params.homeScore} - ${params.awayScore} ${params.awayTeam}`,
    html,
  });
}
