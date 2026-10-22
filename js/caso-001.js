/* JUDIX · Caso 001, «La casa en disputa»: contenido jurídico, personajes, rúbrica y guion. NO MODIFICAR sin aprobación del titular del proyecto. */
/* Script clásico: comparte el ámbito global con los demás archivos de js/. Orden de carga en index.html: caso-001 → motor3d → audio → juego. */
const PI = Math.PI;
const IA_SVG = '<svg viewBox="0 0 32 32" fill="none" stroke="#9CC6FF" stroke-width="1.6" stroke-linecap="round"><path d="M16 5v20M9 25h14M6 10h20"/><path d="M6 10l-3.5 8h7zM26 10l-3.5 8h7z"/><circle cx="16" cy="5" r="1.6" fill="#9CC6FF"/></svg>';
const P = {
  juez:{n:"Juez Woc", r:"Juzgado Civil", img:"img/juez.jpg"},
  ia:{n:"IA Jurídica", r:"Asistente del despacho", ia:true},
  laura:{n:"Laura Méndez", r:"Técnica judicial", ini:"LM"},
  vega:{n:"Lic. Andrés Vega", r:"Abogado de la parte actora", img:"img/cara-actor.jpg"},
  mora:{n:"Licda. Sofía Mora", r:"Abogada de la parte demandada", img:"img/cara-demandada.jpg"},
  carlos:{n:"Carlos Rojas Solano", r:"Parte actora", ini:"CR"},
  javier:{n:"Javier Rojas Solano", r:"Parte demandada", ini:"JR"},
  testigo:{n:"Eliécer Campos", r:"Testigo · maestro de obras", ini:"EC"}
};
const CAT = { val:"Valoración probatoria", fund:"Fundamentación jurídica", dp:"Debido proceso", imp:"Imparcialidad", ia:"Uso crítico de la IA" };
const MAX = { val:30, fund:30, dp:20, imp:10, ia:10 };
const FACTURAS = [
  {id:"F-0412", f:"14/03/2025", d:"Sustitución del techo y de vigas dañadas", m:4200000, ok:"cons", nota:"La perita constató filtraciones activas y vigas con humedad: hay riesgo para la estructura. Es un gasto de conservación."},
  {id:"F-0457", f:"02/04/2025", d:"Reparación de tubería colapsada de aguas negras", m:1800000, ok:"cons", nota:"Sin esa reparación la casa era insalubre. Conservación pura."},
  {id:"F-0503", f:"21/04/2025", d:"Recableado eléctrico completo", m:2000000, ok:"cons", nota:"El cableado anterior carecía de protecciones y había riesgo de incendio. Conservación."},
  {id:"F-0561", f:"30/05/2025", d:"Remodelación de cocina con granito y muebles nuevos", m:3500000, ok:"mej", nota:"La cocina anterior funcionaba. Es una mejora estética que el otro condueño no consintió."},
  {id:"F-0618", f:"18/07/2025", d:"Instalación de jacuzzi en la terraza", m:2900000, ok:"mej", nota:"Obra de uso recreativo, ajena a la conservación del inmueble y no consentida."},
  {id:"F-0733", f:"15/01/2026", d:"Pintura exterior de toda la fachada", m:1600000, ok:"noac", nota:"Factura posterior a la demanda (10/11/2025) y la perita no observó pintura reciente: el gasto no está acreditado."}
];
const CLASES = { cons:"Conservación exigible", mej:"Mejora no consentida", noac:"No acreditado" };
const colones = n => "₡" + n.toLocaleString("es-CR");

/* Rutas en la sala (x, z) */
const R = {
  lauraIda:[[4.6,-4.85],[4.6,-3.4],[2.2,-3.45],[1.25,-4.3]], lauraVuelta:[[2.2,-3.45],[4.6,-3.4],[4.6,-4.85],[3.4,-4.85]],
  vegaIda:[[-0.75,0.95],[-0.6,-4.25]], vegaVuelta:[[-0.75,0.95],[-1.9,0.95]],
  testigoIn:[[5.6,-3.0],[2.0,-3.3],[-2.1,-3.8],[-2.7,-5.0],[-3.6,-4.6]],
  testigoOut:[[-2.7,-5.0],[-2.1,-3.8],[2.0,-3.3],[5.6,-3.0],[7.4,-3.0]]
};

const GUION = [
  {t:"fase", n:1, tit:"El conflicto", sub:"Se presenta la demanda. Identifique los hechos, las pretensiones y el problema jurídico."},
  {t:"dlg", who:"laura", cam:"laura", act:{laura:[["stand"],["pick"],["walk",R.lauraIda],["face",PI],["give"],["walk",R.lauraVuelta],["sit",-0.4]]},
    txt:"Buenos días, Juez Woc. Le traigo el expediente nuevo: un proceso ordinario entre dos hermanos. En el despacho ya le dicen «la casa en disputa»."},
  {t:"dlg", who:"juez", cam:"juez", txt:"Dos hermanos, una casa y ocho millones de colones. Veamos primero qué pide exactamente la parte actora."},
  {t:"doc", cam:"mesa", html:`
    <div class="doc">
      <div class="cab"><h3>Demanda ordinaria</h3><span>Exp. 26-001107-0000-CI · presentada el 10/11/2025</span></div>
      <p><span class="k">Actor</span> Carlos Rojas Solano · <span class="k">Demandado</span> Javier Rojas Solano</p>
      <div><span class="k">Hechos</span><ol>
        <li>Ambos hermanos son copropietarios, por partes iguales, de una casa en San Rafael Arriba de Desamparados.</li>
        <li>Entre marzo y agosto de 2025, el actor pagó obras en la vivienda por un total de ₡16.000.000.</li>
        <li>Requirió al demandado su contribución y este se negó a pagar.</li></ol></div>
      <div><span class="k">Pretensión</span><p>Que se condene al demandado a pagar ₡8.000.000, la mitad de lo invertido, más intereses legales y costas.</p></div>
      <div><span class="k">Prueba ofrecida</span><p>Seis facturas, dictamen pericial de ingeniería y el testimonio del maestro de obras.</p></div>
    </div>`},
  {t:"dec", cat:"fund", q:"¿Cuál es la pretensión principal de la demanda?", ops:[
    {t:"Que se condene al demandado a pagar ₡8.000.000, la mitad de lo invertido en obras sobre la casa común.", p:5, fb:"Exacto. Identificar con precisión lo pedido delimita lo que usted puede conceder: no más, ni algo distinto."},
    {t:"Que se ordene la división de la casa entre los hermanos.", p:0, fb:"Nadie pidió la división. Resolver sobre ello sería fallar fuera de lo pedido."},
    {t:"Que se declare al actor dueño exclusivo de la vivienda.", p:0, fb:"La titularidad no está en discusión: ambos admiten ser copropietarios por partes iguales."}]},
  {t:"dec", cat:"fund", q:"¿Cuál es el problema jurídico que deberá resolver?", ops:[
    {t:"Determinar qué gastos son de conservación de la cosa común, exigibles a ambos condueños según su cuota, y cuáles no lo son.", p:10, fb:"Ese es el núcleo. El deber de contribuir a la conservación nace de la ley; la discusión real es qué obras caben en esa categoría y cuáles están probadas."},
    {t:"Determinar si el demandado autorizó los gastos: sin autorización, nada se debe.", p:3, fb:"Adopta de entrada la tesis de una de las partes. La autorización importa para las mejoras, pero el deber de contribuir a la conservación no depende de ella."},
    {t:"Determinar cuál de los dos hermanos tiene más recursos económicos.", p:0, fb:"La capacidad económica de las partes no define quién debe pagar los gastos de la cosa común."}]},

  {t:"fase", n:2, tit:"La contradicción", sub:"La parte demandada contesta, niega hechos, formula excepciones y aporta su propia versión."},
  {t:"dlg", who:"mora", cam:"mora", act:{mora:[["stand"]]}, txt:"Señor juez: mi representado nunca autorizó esos gastos. Muchas obras fueron de lujo, no necesarias. Así consta en nuestra contestación."},
  {t:"doc", cam:"mesa", act:{mora:[["sit",PI]]}, html:`
    <div class="doc">
      <div class="cab"><h3>Contestación negativa</h3><span>Javier Rojas Solano</span></div>
      <p>«Nunca autoricé esos gastos. Muchas obras fueron de lujo, no necesarias. Mi hermano decidió remodelar a su gusto y ahora pretende que yo pague la mitad.»</p>
      <div><span class="k">Excepciones</span><ul>
        <li>Como <b>excepción procesal previa</b>: falta de legitimación activa, porque, según dice, el dinero era de la esposa del actor.</li>
        <li>Falta de derecho.</li></ul></div>
      <div><span class="k">Prueba ofrecida</span><p>Testimonio de la vecina Rosa Villalobos, «para que declare sobre el carácter conflictivo del actor».</p></div>
    </div>`},
  {t:"dec", cat:"dp", q:"¿Qué dispone sobre la «excepción procesal» de falta de legitimación activa?", ops:[
    {t:"No es excepción procesal admisible; como defensa de fondo, se resolverá en sentencia.", p:7, fb:"Correcto. El artículo 37.3 del CPC enumera de forma taxativa las excepciones procesales, y la legitimación no está entre ellas."},
    {t:"Tramitarla como incidente y resolverla antes de continuar.", p:0, fb:"Otorga a una defensa de fondo un trámite que el Código reserva a las excepciones procesales taxativas, y retrasa el proceso."},
    {t:"Acogerla de una vez, porque el dinero no salió del patrimonio del actor.", p:0, fb:"Se anticipa a la prueba: nada se ha demostrado sobre el origen del dinero, y lo resolvería sin contradictorio."}]},
  {t:"dec", cat:"dp", q:"¿Qué prueba admite?", ops:[
    {t:"Admitir las facturas, el dictamen pericial y al maestro de obras; rechazar a la vecina por impertinente.", p:7, fb:"Correcto. El «carácter conflictivo» del actor no guarda relación con los hechos controvertidos (art. 41.3 CPC). El tribunal indica en una misma resolución la prueba admitida y la rechazada."},
    {t:"Admitir toda la prueba ofrecida por ambas partes, para no causar indefensión.", p:2, fb:"Admitir prueba impertinente no protege la defensa: alarga el proceso y desvía el debate. El artículo 41.3 ordena rechazarla."},
    {t:"Rechazar el dictamen pericial, porque fue pagado por la parte actora.", p:0, fb:"Las partes pueden aportar dictámenes con la demanda (art. 44.1 CPC). Su origen se pondera al valorarlo; no impide admitirlo."}]},
  {t:"dlg", who:"vega", cam:"vega", act:{vega:[["stand"],["walk",R.vegaIda],["face",PI]]}, txt:"Juez Woc, buenas tardes. ¿Podríamos conversar un momento a solas? Es sobre el caso de los hermanos Rojas. Serán solo cinco minutos."},
  {t:"dec", cat:"imp", q:"¿Cómo responde al abogado?", after:{vega:[["walk",R.vegaVuelta],["sit",PI]]}, ops:[
    {t:"Declinar con cortesía: lo relativo al caso se trata en audiencia o por escrito, con la otra parte presente.", p:5, fb:"Correcto. La igualdad procesal exige que ambas partes conozcan lo que se le plantea al tribunal (art. 2.1 CPC)."},
    {t:"Escucharlo brevemente y luego contarle lo conversado a la otra parte.", p:1, fb:"La comunicación posterior no repara la apariencia de parcialidad que crea la reunión a solas."},
    {t:"Recibirlo: escuchar no compromete la decisión.", p:0, fb:"Para la parte contraria sí la compromete. La imparcialidad también debe ser visible."}]},

  {t:"fase", n:3, tit:"La investigación judicial", sub:"Analice las pruebas, detecte contradicciones y use a su asistente de IA, que también puede equivocarse."},
  {t:"doc", cam:"mesa", html:`
    <div class="doc">
      <div class="cab"><h3>Facturas aportadas</h3><span>Total: ₡16.000.000</span></div>
      <div class="tabla"><table><thead><tr><th>N.°</th><th>Fecha</th><th>Concepto</th><th>Monto</th></tr></thead><tbody>
      ${FACTURAS.map(f => `<tr><td class="m">${f.id}</td><td class="m">${f.f}</td><td>${f.d}</td><td class="m">${colones(f.m)}</td></tr>`).join("")}
      </tbody></table></div>
    </div>
    <div class="doc">
      <div class="cab"><h3>Dictamen pericial</h3><span>Ing. Marcela Quirós · inspección del 03/12/2025</span></div>
      <ul>
        <li><b>Techo:</b> había filtraciones activas en tres dormitorios y vigas con humedad. La sustitución era necesaria para evitar daño estructural.</li>
        <li><b>Tubería:</b> la tubería de aguas negras estaba colapsada y causaba insalubridad. Reparación necesaria.</li>
        <li><b>Sistema eléctrico:</b> el cableado carecía de protecciones y había riesgo de incendio. Sustitución necesaria.</li>
        <li><b>Cocina:</b> la remodelación es reciente, con granito y muebles nuevos. La cocina anterior era funcional; se trata de una mejora estética.</li>
        <li><b>Jacuzzi:</b> está instalado en la terraza y es de uso recreativo.</li>
        <li><b>Fachada:</b> la pintura exterior muestra desgaste y desprendimientos. No se observa pintura reciente.</li>
      </ul>
      <p><b>Conclusión:</b> existen todas las obras facturadas, salvo la pintura exterior.</p>
    </div>`},
  {t:"ia", cat:"ia", cam:"ia", msg:"Análisis completado. La perita confirmó la existencia de las obras facturadas. Recomiendo declarar con lugar la demanda en su totalidad: ₡8.000.000.", ops:[
    {t:"Aceptar la recomendación.", p:0, fb:"Esta vez la IA se equivocó. Que una obra exista no la convierte en gasto de conservación. El dictamen distingue entre reparaciones necesarias y mejoras."},
    {t:"Pedirle a la IA que fundamente su recomendación y contrastarla con el dictamen.", p:5, fb:"Bien hecho. La IA rectifica: «Corrijo. El dictamen califica como necesarias solo tres obras; la cocina y el jacuzzi son mejoras, y la pintura no existe.» Usted descubrió el error verificando, no por intuición."},
    {t:"Descartarla sin revisarla: las máquinas no deben opinar sobre justicia.", p:2, fb:"La recomendación era errónea, pero usted no lo comprobó. Rechazar sin verificar es tan acrítico como obedecer sin verificar."}]},
  {t:"ia", cat:"ia", cam:"ia", msg:"Alerta: la factura F-0733 (pintura, ₡1.600.000) tiene fecha 15/01/2026, posterior a la presentación de la demanda (10/11/2025). Además, la perita no observó pintura reciente. ¿Desea revisarla?", ops:[
    {t:"Revisarla y contrastar las fechas con el dictamen.", p:5, fb:"Esta vez la IA acertó. La factura es posterior a la demanda y la perita no encontró pintura reciente: hay una contradicción seria."},
    {t:"Ignorar la alerta: ya se equivocó una vez.", p:0, fb:"La desconfianza indiscriminada es tan errónea como la obediencia ciega. La habilidad está en verificar cada sugerencia por sus propios méritos."}]},
  {t:"clas", cam:"mesa"},

  {t:"dlg", who:"juez", cam:"general", mark:"testigoIn", act:{testigo:[["show"],["walk",R.testigoIn],["sit",0.9]]},
    txt:"Se abre la audiencia de prueba en el proceso de Carlos Rojas Solano contra Javier Rojas Solano. Ingrese el testigo ofrecido por la parte actora y tome asiento en el estrado. Recuerde que declara bajo juramento."},
  {t:"dlg", who:"testigo", cam:"testigo", txt:"Yo hice el techo, la cañería y la electricidad. El techo goteaba en tres cuartos, y cuando quitamos el cielorraso las vigas estaban podridas."},
  {t:"dlg", who:"vega", cam:"vega", act:{vega:[["stand"]]}, txt:"Don Eliécer, ¿verdad que el techo estaba a punto de caerse y que era urgentísimo repararlo?"},
  {t:"dlg", who:"mora", cam:"mora", act:{mora:[["stand"],["point",2.4]]}, txt:"¡Objeción, señor juez! La pregunta es sugestiva: le pone la respuesta en la boca al testigo."},
  {t:"dec", cat:"dp", q:"¿Cómo resuelve la objeción?", after:{mora:[["sit",PI]], vega:[["sit",PI]]}, ops:[
    {t:"Acogerla: la pregunta es sugestiva. Que el abogado la reformule de forma abierta.", p:6, fb:"Correcto. El artículo 41.4, inciso 5, del CPC ordena rechazar las preguntas sugestivas o insinuadoras de la respuesta."},
    {t:"Rechazarla: el testigo ya dijo algo similar, así que no hay perjuicio.", p:0, fb:"Que el testigo haya dicho algo parecido no convierte en admisible una pregunta que le sugiere la respuesta."},
    {t:"Dejar que responda y valorar luego su declaración con cautela.", p:2, fb:"La cautela posterior no sustituye el control oportuno del interrogatorio, que es deber del tribunal."}]},
  {t:"dlg", who:"testigo", cam:"testigo", txt:"Ah, y en enero pinté toda la fachada. Eso también lo cobré."},
  {t:"dec", cat:"val", q:"¿Cómo valora el testimonio en cuanto a la pintura?", ops:[
    {t:"No le da credibilidad en ese punto: lo contradicen el dictamen y la fecha de la factura. El resto de su relato coincide con la perita.", p:6, fb:"Exacto. La prueba se aprecia en conjunto, con lógica y experiencia (art. 41.5 CPC). Un testimonio puede ser creíble en una parte y no en otra."},
    {t:"Lo tiene por cierto: declaró bajo juramento.", p:0, fb:"El juramento no vuelve verdadero lo que la prueba técnica y documental desmiente."},
    {t:"Descarta toda su declaración, porque mintió sobre la pintura.", p:2, fb:"Es excesivo. Lo que dijo sobre el techo, la cañería y la electricidad coincide con la perita y conserva valor."}]},
  {t:"dlg", who:"carlos", cam:"carlos", act:{carlos:[["stand"]]}, txt:"Señor juez, perdí el trabajo este año. Ese dinero era todo lo que tenía. Mi hermano vive tranquilo mientras yo pago todo."},
  {t:"dec", cat:"imp", q:"¿Qué peso le da a esa manifestación?", after:{carlos:[["sit",PI]]}, ops:[
    {t:"Ninguno en la decisión: el monto depende de lo que la ley impone y de lo probado, no de la situación personal de las partes.", p:5, fb:"Correcto. La empatía es compatible con la función judicial; inclinar la decisión por ella no lo es."},
    {t:"Reconocer algo más de lo probado, por equidad.", p:0, fb:"Conceder lo no probado por compasión sería parcialidad, por bien intencionada que sea."}]},
  {t:"dlg", who:"javier", cam:"javier", act:{javier:[["stand"]]}, txt:"Yo no niego que el techo estaba mal; se mojaba todo. Pero ¿un jacuzzi? Yo nunca pedí eso. Ni la cocina nueva."},

  {t:"fase", n:4, tit:"La sentencia", sub:"Decida si acoge, rechaza o acoge parcialmente. Su sentencia irá a un tribunal de apelación virtual.", mark:"testigoOut",
    act:{javier:[["sit",PI]], testigo:[["stand"],["walk",R.testigoOut],["hide"]]}},
  {t:"dlg", who:"ia", cam:"ia", txt:"Juez Woc, ya cuenta con todos los elementos. La decisión y su fundamento le corresponden a usted."},
  {t:"dec", cat:"fund", id:"disp", q:"¿Cómo resuelve la demanda?", ops:[
    {t:"Con lugar en su totalidad.", p:0, fb:"Reconocería obras no exigibles y un gasto no acreditado."},
    {t:"Sin lugar en su totalidad.", p:0, fb:"Desconocería gastos de conservación plenamente acreditados, incluso admitidos por el propio demandado en cuanto al techo."},
    {t:"Parcialmente con lugar.", p:5, fb:"Correcto. Hay gastos exigibles y otros que no lo son."}]},
  {t:"dec", cat:"fund", id:"monto", q:"¿Qué monto condena a pagar al demandado?", ops:[
    {t:"₡8.000.000", p:0, fb:"Es la mitad de todo lo facturado, incluidas las mejoras y la pintura no acreditada."},
    {t:"₡5.750.000", p:0, fb:"Incluye la cocina, una mejora que el demandado no consintió."},
    {t:"₡4.800.000", p:0, fb:"Incluye la pintura, cuya existencia quedó desvirtuada."},
    {t:"₡4.000.000", p:5, fb:"Exacto. Techo, tubería y electricidad suman ₡8.000.000; la cuota del demandado es la mitad."}]},
  {t:"dec", cat:"fund", id:"fund", q:"¿Con qué fundamento motiva la sentencia?", ops:[
    {t:"Cada condueño debe contribuir a los gastos de conservación de la cosa común en proporción a su cuota (art. 271 del Código Civil). Se reconocen el techo, la tubería y la electricidad; la cocina y el jacuzzi son mejoras no consentidas, y la pintura no se acreditó.", p:5, fb:"Motivación completa: norma aplicable, calificación de cada gasto y valoración de la prueba."},
    {t:"El actor probó haber pagado ₡16.000.000; quien paga merece ser reembolsado.", p:0, fb:"Haber pagado no basta. Debe demostrarse que el gasto era de aquellos que la ley impone a ambos condueños."},
    {t:"Ningún condueño puede gastar sin autorización del otro; como no la hubo, solo se reconoce lo que el demandado admitió en audiencia.", p:1, fb:"Confunde conservación con mejora. El deber de contribuir a la conservación nace de la ley, no de la autorización."}]},
  {t:"apelacion", cam:"juez", act:{juez:[["stand"],["gavel"]]}},
  {t:"final", cam:"orbit", act:{juez:[["sit",0]]}}
];
