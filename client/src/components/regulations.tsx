import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollText, AlertTriangle, Award, CreditCard, FileText, Shirt, Scale } from "lucide-react";

export default function Regulations() {
  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex flex-col gap-2">
        <h2 className="text-xl sm:text-2xl font-bold flex items-center gap-2" data-testid="text-regulations-title">
          <ScrollText className="h-6 w-6 text-primary" />
          Reglamentos y Modalidad del Torneo 2025
        </h2>
        <p className="text-sm text-muted-foreground">Liga de Campeones Eternos</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Scale className="h-5 w-5 text-primary" />
            Modalidad del Torneo
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          <div className="space-y-3">
            <div className="rounded-md border p-3 space-y-2">
              <p className="font-medium">1) Calendario</p>
              <p className="text-muted-foreground">El torneo de la Liga de Campeones Eternos se llevará a cabo en el mes de Noviembre, donde cada equipo participante jugará una vez a la semana, fecha y día estarán en nuestras Redes Sociales (@laligadecampeones_100)</p>
            </div>

            <div className="rounded-md border p-3 space-y-3">
              <p className="font-medium">2) Duración de los partidos</p>
              <p className="text-muted-foreground">Cada encuentro deportivo tendrá una duración de 40 minutos más los minutos adicionales según considere el Árbitro.</p>
              <ul className="ml-4 space-y-2 text-muted-foreground">
                <li className="flex gap-2">
                  <span className="font-medium text-foreground shrink-0">a)</span>
                  <span>Se disputarán en 2 (Dos) tiempos de 20 minutos con un tiempo de descanso de 5 minutos.</span>
                </li>
                <li className="flex gap-2">
                  <span className="font-medium text-foreground shrink-0">b)</span>
                  <span>Las sustituciones podrán ser efectuadas en 3 (Tres) ventanas en estilo libre (Sin contar el tiempo de descanso) y 4 (Cuatro) ventanas en +30 (Empresarial)</span>
                </li>
                <li className="flex gap-2">
                  <span className="font-medium text-foreground shrink-0">c)</span>
                  <span>Los equipos deberán presentarse en el lugar del compromiso 15 minutos antes del inicio del mismo.</span>
                </li>
              </ul>
            </div>

            <div className="rounded-md border p-3 space-y-3">
              <p className="font-medium">3) Fichas y documentación</p>
              <p className="text-muted-foreground">Cada Delegado de equipo deberá hacer entrega de las fichas correspondientes 15 minutos antes del inicio del compromiso deportivo (Cantidad permitida hasta 14 Jugadores, 1 DT y el Ayudante Técnico) y éstas serán verificadas durante el encuentro deportivo asimismo deberá abonar la suma establecida.</p>
              <ul className="ml-4 space-y-2 text-muted-foreground">
                <li className="flex gap-2">
                  <span className="font-medium text-foreground shrink-0">a)</span>
                  <span>El tiempo de tolerancia para ello será no más de 10 minutos, el NO cumplimiento de la misma tendrá una sanción de PÉRDIDA DE PUNTOS.</span>
                </li>
                <li className="flex gap-2">
                  <span className="font-medium text-foreground shrink-0">b)</span>
                  <span>Cada equipo deberá presentar en mesa la ficha de cada jugador. (No se aceptará documentación)</span>
                </li>
                <li className="flex gap-2">
                  <span className="font-medium text-foreground shrink-0">c)</span>
                  <span>El costo de ficha será de 2.50 por cada jugador (Ficha + foto) tiempo máximo para la entrega, hasta la 3ra fecha.</span>
                </li>
                <li className="flex gap-2">
                  <span className="font-medium text-foreground shrink-0">d)</span>
                  <span>En la categoría +30 la edad mínima es de 30 años (1995) (solo se permitirá 1 Federado por categoría)</span>
                </li>
                <li className="flex gap-2">
                  <span className="font-medium text-foreground shrink-0">e)</span>
                  <span>En el torneo estilo libre no habrá límite de edad (+18) (solo se permitirá 1 federado por categoría)</span>
                </li>
                <li className="flex gap-2">
                  <span className="font-medium text-foreground shrink-0">f)</span>
                  <span>En instancias finales los compromisos deportivos serán de ida y vuelta.</span>
                </li>
                <li className="flex gap-2">
                  <span className="font-medium text-foreground shrink-0">g)</span>
                  <span>En caso de empate se ejecutarán 3 tiro libre penal por cada equipo.</span>
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Shirt className="h-5 w-5 text-primary" />
            Indumentarias
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="rounded-md border p-3 space-y-2">
            <p className="text-muted-foreground">
              <span className="font-medium text-foreground">1)</span> Todos los jugadores deberán ser identificados con las respectivas numeraciones bien visibles para el Árbitro (Enumeración obligatoria especialmente en la camiseta)
            </p>
          </div>
          <div className="rounded-md border p-3 space-y-2">
            <p className="text-muted-foreground">
              <span className="font-medium text-foreground">2)</span> No se permitirá el intercambio de camisetas entre compañeros dentro del campo de juego.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <FileText className="h-5 w-5 text-primary" />
            Reglamento de Categoría
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          {[
            "La PFJ (Posición Fuera de Juego) no será tenido en cuenta.",
            "La buena ejecución de Saque la banda (Lateral) será obligatoria.",
            "Todas las sustituciones de los jugadores deberán ser únicamente con la previa autorización del Árbitro.",
            "El Delegado no deberá actuar como jugador en ningún encuentro deportivo.",
            "Solamente el DT, Ayudante Técnico y el Capitán de equipo deberán acercarse a la línea mesa.",
          ].map((rule, i) => (
            <div key={i} className="rounded-md border p-3">
              <p className="text-muted-foreground">
                <span className="font-medium text-foreground">{i + 1})</span> {rule}
              </p>
            </div>
          ))}
          <div className="rounded-md border p-3 space-y-2">
            <p className="text-muted-foreground">
              <span className="font-medium text-foreground">6)</span> Todo jugador inscrito deberá haber disputado al menos tres (3) partidos oficiales durante la fase regular del torneo para poder participar en la liguilla, cuartos de final o fases eliminatorias.
            </p>
            <p className="text-muted-foreground ml-4">En caso de no cumplir con este requisito, el jugador no podrá ser alineado en las etapas finales, independientemente de su inscripción previa en el equipo.</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            Faltas y Sanciones
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="rounded-md border p-3 space-y-3">
            <div className="font-medium flex items-center gap-2">
              <Badge variant="destructive">Tarjeta Roja Directa</Badge>
            </div>
            <p className="text-muted-foreground">Por dar golpe intencionado directo al rostro de un adversario.</p>
            <ul className="ml-4 space-y-2 text-muted-foreground">
              <li className="flex gap-2">
                <span className="font-medium text-foreground shrink-0">a)</span>
                <span>Discriminación de todo tipo, escupitajo, palabras irreproducibles, por falta excesiva de respeto al Árbitro, a la organización o acciones agresivas el jugador deberá ser expulsado de inmediato y quedará fuera del torneo sin la posibilidad a multa.</span>
              </li>
              <li className="flex gap-2">
                <span className="font-medium text-foreground shrink-0">b)</span>
                <span>Aquel jugador o miembro del Cuerpo Técnico que cometa una infracción sancionable con amonestación o expulsión ya sea dentro o fuera del terreno de juego o atentando contra otra persona cualquiera o contra las propias reglas del espíritu de juego, será sancionado conforme a la infracción cometida.</span>
              </li>
              <li className="flex gap-2">
                <span className="font-medium text-foreground shrink-0">c)</span>
                <span>Se amonestará con tarjeta amarilla a aquel jugador sustituto que realice alguna de estas acciones siguientes: Mostrar desaprobación con palabras o acciones desde la banca técnica.</span>
              </li>
            </ul>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Scale className="h-5 w-5 text-primary" />
            Medidas y Sanciones Externas
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="rounded-md border p-3">
            <p className="text-muted-foreground">
              <span className="font-medium text-foreground">1)</span> Ante un suceso que altere el espíritu del juego por parte de un público o la hinchada el Árbitro detendrá el juego y ordenará al Capitán de equipo afectado para su intervención de manera verbal para con los mismos. En caso de reincidir el Árbitro deberá suspender el compromiso y será causal de pérdida de puntos para el equipo afectado.
            </p>
          </div>
          <div className="rounded-md border p-3">
            <p className="text-muted-foreground">
              <span className="font-medium text-foreground">2)</span> En caso de que el Árbitro identifique al hincha, detendrá el juego y expulsará de manera verbal al mismo, éste deberá abandonar por completo el predio deportivo para la reanudación del encuentro en caso contrario el Árbitro deberá suspender el compromiso y será causal de pérdida de puntos para el equipo afectado.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Award className="h-5 w-5 text-primary" />
            Premiación
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <p className="text-muted-foreground">El equipo campeón del torneo recibirá un premio de 1.500, además de:</p>
          <ul className="ml-4 space-y-2 text-muted-foreground">
            <li className="flex gap-2">
              <span className="text-primary shrink-0">-</span>
              <span>Inscripción gratuita para la próxima edición del torneo.</span>
            </li>
            <li className="flex gap-2">
              <span className="text-primary shrink-0">-</span>
              <span>Medallas para los jugadores.</span>
            </li>
            <li className="flex gap-2">
              <span className="text-primary shrink-0">-</span>
              <span>Trofeo de campeón.</span>
            </li>
            <li className="flex gap-2">
              <span className="text-primary shrink-0">-</span>
              <span>Viaje a Madrid (ida y vuelta) con transporte incluido, donde el equipo campeón disputará un partido amistoso contra un equipo de Madrid.</span>
            </li>
            <li className="flex gap-2">
              <span className="text-primary shrink-0">-</span>
              <span>Posteriormente, el equipo de Madrid realizará la visita de vuelta a Málaga para disputar un nuevo encuentro de confraternidad.</span>
            </li>
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <CreditCard className="h-5 w-5 text-primary" />
            Derecho de Partido y Reclamos
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          <div className="rounded-md border p-3 space-y-2">
            <p className="font-medium">Derecho de Partido</p>
            <p className="text-muted-foreground">Cada equipo deberá abonar un derecho de partido de 35 por encuentro.</p>
            <ul className="ml-4 space-y-1 text-muted-foreground">
              <li className="flex gap-2">
                <span className="text-primary shrink-0">-</span>
                <span>Este importe cubrirá los gastos arbitrales y la entrega de 2 botellas de agua por equipo.</span>
              </li>
              <li className="flex gap-2">
                <span className="text-primary shrink-0">-</span>
                <span>El pago deberá realizarse antes del inicio de cada partido.</span>
              </li>
            </ul>
          </div>
          <div className="rounded-md border p-3 space-y-2">
            <p className="font-medium">Reclamos</p>
            <p className="text-muted-foreground">Cualquier equipo que desee presentar un reclamo deberá abonar una tasa de 20.</p>
            <ul className="ml-4 space-y-1 text-muted-foreground">
              <li className="flex gap-2">
                <span className="text-primary shrink-0">-</span>
                <span>Una vez realizado el pago, el reclamo será atendido en mesa por la organización.</span>
              </li>
              <li className="flex gap-2">
                <span className="text-primary shrink-0">-</span>
                <span>El importe del reclamo no será reembolsable, independientemente del resultado de la revisión.</span>
              </li>
            </ul>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <FileText className="h-5 w-5 text-primary" />
            Modificación de Normativas
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm">
          <p className="text-muted-foreground">
            Las normativas del torneo podrán ser modificadas o ampliadas conforme avance la competencia. Cualquier cambio o nueva disposición será debidamente informada y aclarada a todos los delegados de los equipos, quienes deberán firmar en señal de conformidad y conocimiento.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
