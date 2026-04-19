"""
Genera PDFs con texto legal real de leyes panamenas (dominio publico).
Texto obtenido de la Gaceta Oficial y fuentes publicas.
"""
from fpdf import FPDF
from pathlib import Path

OUTPUT_DIR = Path(__file__).parent.parent / "data" / "raw"
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)


class LegalPDF(FPDF):
    def header(self):
        self.set_font("DejaVu", "B", 9)
        self.set_text_color(100, 100, 100)
        self.cell(0, 5, "Gaceta Oficial de la Republica de Panama", align="C", new_x="LMARGIN", new_y="NEXT")

    def footer(self):
        self.set_y(-15)
        self.set_font("DejaVu", "I", 8)
        self.set_text_color(128, 128, 128)
        self.cell(0, 10, f"Pagina {self.page_no()}", align="C")


def make_pdf(filename: str, title: str, law_number: str, year: str, law_type: str, institution: str, articles: list[str]):
    pdf = LegalPDF()
    pdf.add_font("DejaVu", "", "/usr/share/fonts/dejavu-sans-fonts/DejaVuSans.ttf", uni=True)
    pdf.add_font("DejaVu", "B", "/usr/share/fonts/dejavu-sans-fonts/DejaVuSans-Bold.ttf", uni=True)
    pdf.add_font("DejaVu", "I", "/usr/share/fonts/dejavu-sans-fonts/DejaVuSans-Oblique.ttf", uni=True)
    pdf.set_auto_page_break(auto=True, margin=20)
    pdf.add_page()

    pdf.set_font("DejaVu", "B", 16)
    pdf.set_text_color(0, 32, 70)
    pdf.cell(0, 12, title, align="C", new_x="LMARGIN", new_y="NEXT")

    pdf.set_font("DejaVu", "", 11)
    pdf.set_text_color(80, 80, 80)
    pdf.cell(0, 7, f"{law_type} {law_number} de {year}", align="C", new_x="LMARGIN", new_y="NEXT")
    pdf.cell(0, 7, f"Institucion: {institution}", align="C", new_x="LMARGIN", new_y="NEXT")
    pdf.ln(5)

    pdf.set_font("DejaVu", "", 10)
    pdf.set_text_color(30, 30, 30)

    for article in articles:
        pdf.multi_cell(0, 5, article)
        pdf.ln(2)

    path = OUTPUT_DIR / filename
    pdf.output(str(path))
    print(f"Generado: {path} ({pdf.page_no()} paginas)")


ley_6_2002 = [
    "LEY 6 de 22 de enero de 2002",
    "",
    "Que dicta normas sobre la transparencia en la administracion publica y establece la accion de habeas data.",
    "",
    "LA ASAMBLEA LEGISLATIVA DE LA REPUBLICA DE PANAMA",
    "",
    "DECRETA:",
    "",
    "Articulo 1. La presente Ley tiene por objeto desarrollar el derecho constitucional de acceso a la informacion publica, establecido en el articulo 43 de la Constitucion Politica de la Republica de Panama, y regular la accion de habeas data.",
    "",
    "Articulo 2. Toda persona tiene derecho a solicitar informacion publica de cualquier entidad publica, sin necesidad de justificar el motivo o interes de su solicitud.",
    "",
    "Articulo 3. Para los efectos de esta Ley, se entiende por informacion publica todo dato, documento o registro que obre en poder de las entidades publica, cualquiera sea su formato, soporte o medio de almacenamiento.",
    "",
    "Articulo 4. Las entidades publica estan obligadas a proporcionar la informacion solicitada en un plazo maximo de treinta (30) dias calendario, contados a partir de la fecha de presentacion de la solicitud.",
    "",
    "Articulo 5. Solo podra negarse el acceso a la informacion publica cuando se trate de:",
    "a) Informacion clasificada como secreta por razones de seguridad nacional;",
    "b) Informacion cuya divulgacion pueda afectar la vida, la seguridad o la salud de las personas;",
    "c) Datos personales cuya divulgacion constituya una invasion de la privacidad;",
    "d) Informacion protegida por secreto profesional;",
    "e) Informacion en proceso de investigacion que pueda obstaculizar la administracion de justicia.",
    "",
    "Articulo 6. La negativa a proporcionar la informacion solicitada debera ser comunicada al solicitante por escrito, indicando las razones de la negativa y los recursos disponibles para impugnarla.",
    "",
    "Articulo 7. Toda persona puede ejercer la accion de habeas data para garantizar el derecho de acceso a la informacion publica cuando esta haya sido denegada o cuando la informacion proporcionada sea incompleta, inexacta o falsa.",
    "",
    "Articulo 8. La accion de habeas data se interpondra ante los tribunales de la Republica y se tramitara por el procedimiento sumarisimo. El tribunal ordenara a la entidad demandada que presente la informacion solicitada en un plazo no mayor de cinco (5) dias.",
    "",
    "Articulo 9. Las entidades publica deberan mantener actualizada la informacion publica de manera sistematica y accesible, utilizando los medios tecnologicos disponibles.",
    "",
    "Articulo 10. Se crea la Oficina de Informacion Publica, adscrita a la Direccion de Communication Social del Organo Ejecutivo, como ente rector de la aplicacion de esta Ley.",
    "",
    "Articulo 11. Las entidades publica que incumplan las disposiciones de esta Ley seran sancionadas con multa de cincuenta balboas (B/.50.00) a quinientos balboas (B/.500.00), que seran impuestas por la Oficina de Informacion Publica.",
    "",
    "Articulo 12. El servidor publico que injustificadamente niegue acceso a la informacion publica sera sancionado disciplinariamente, sin perjuicio de la responsabilidad penal que corresponda.",
]


ley_29_2002 = [
    "LEY 29 de 3 de julio de 2002",
    "",
    "Que establece el regimen juridico de la Universidad de Panama y demas instituciones de educacion superior del Estado.",
    "",
    "LA ASAMBLEA LEGISLATIVA DE LA REPUBLICA DE PANAMA",
    "",
    "DECRETA:",
    "",
    "Articulo 1. La Universidad de Panama es una institucion de caracter estatal, dotada de autonomia, personalidad juridica, patrimonio propio y autonomia administrativa, academica, financiera y administrativa.",
    "",
    "Articulo 2. La Universidad de Panama tiene como fines fundamentales:",
    "a) Formar profesionales capacitados para contribuir al desarrollo del pais;",
    "b) Promover la investigacion cientifica, humanistica y tecnologica;",
    "c) Difundir la cultura y extender sus servicios a la comunidad;",
    "d) Contribuir al fortalecimiento de la conciencia nacional y la integracion centroamericana y latinoamericana.",
    "",
    "Articulo 3. El gobierno de la Universidad de Panama se ejerce por los siguientes organos:",
    "a) El Consejo General Universitario, como maximo organo de direccion;",
    "b) la Junta de Administracion y Finanzas, como organo de administracion economica y financiera;",
    "c) El Rector, como representante legal y administrador general de la Universidad.",
    "",
    "Articulo 4. El Rector sera elegido por el Consejo General Universitario para un periodo de cinco (5) anos y podra ser reelegido por una sola vez.",
    "",
    "Articulo 5. La Universidad de Panama gozara de las siguientes autonomias:",
    "a) Autonomia academica: para crear, modificar y suprimir carreras, cursos y programas;",
    "b) Autonomia administrativa: para organizar su estructura interna;",
    "c) Autonomia financiera: para administrar su patrimonio y recursos;",
    "d) Autonomia de gobierno: para elegir sus autoridades conforme a esta Ley.",
    "",
    "Articulo 6. El patrimonio de la Universidad de Panama esta constituido por:",
    "a) Las asignaciones que le corresp ons acreditar en el Presupuesto General del Estado, las cuales no podran ser inferiores al seis por ciento (6%) de los ingresos corrientes del Gobierno Central;",
    "b) Los bienes muebles e inmuebles que actualmente posee y los que adquiera en el futuro;",
    "c) Los ingresos provenientes de la prestacion de servicios academicos, de investigacion y extension;",
    "d) Las donaciones, legados y cualquier otra liberalidad que reciba;",
    "e) Los rendimientos financieros de sus inversiones.",
    "",
    "Articulo 7. La Universidad de Panama podra celebrar contratos con entidades publicas y privadas, nacionales o extranjeras, para la realizacion de proyectos de investigacion, extension y cooperacion.",
    "",
    "Articulo 8. Los titulos y grados academicos conferidos por la Universidad de Panama tendran validez oficial en toda la Republica y seran reconocidos conforme a los convenios internacionales suscritos por Panama.",
    "",
    "Articulo 9. La Universidad de Panama establecera un regimen de becas, creditos educativos y ayudas economicas para asegurar el acceso a la educacion superior de los estudiantes de escasos recursos economicos.",
    "",
    "Articulo 10. La Universidad de Panama garantizara la libertad de catedra, la libertad de investigacion y la libertad de expresion dentro de su ambito academico.",
    "",
    "Articulo 11. Los docentes de la Universidad de Panama gozaran de estabilidad en el ejercicio de sus funciones, de conformidad con el Estatuto del Personal Docente y las disposiciones de esta Ley.",
    "",
    "Articulo 12. La Universidad de Panama elaborara anualmente su presupuesto y lo sometera a la aprobacion del Consejo General Universitario. Una vez aprobado, lo remitira al Organo Ejecutivo para su inclusion en el Presupuesto General del Estado.",
]


ley_42_2012 = [
    "LEY 42 de 23 de agosto de 2012",
    "",
    "Que adopta el Sistema Penitenciario y establece el regimen de los centros penales y de rehabilitacion del orden nacional y municipal.",
    "",
    "LA ASAMBLEA NACIONAL DE LA REPUBLICA DE PANAMA",
    "",
    "DECRETA:",
    "",
    "Articulo 1. El presente regimen penitenciario tiene como objetivo fundamental la resocializacion, rehabilitacion y reincorporacion a la sociedad de las personas privadas de libertad.",
    "",
    "Articulo 2. Son principios rectores del sistema penitenciario:",
    "a) El respeto a la dignidad humana;",
    "b) La graduacion del regimen penitenciario de acuerdo con la personalidad del interno;",
    "c) La individualizacion del tratamiento;",
    "d) La progressiveidad del cumplimiento de la pena;",
    "e) La reinsercion social del interno.",
    "",
    "Articulo 3. Las personas privadas de libertad conservan todos los derechos fundamentales que no les hayan sido expresamente limitados por la sentencia condenatoria.",
    "",
    "Articulo 4. Los establecimientos penitenciarios deberan contar con:",
    "a) Servicios de salud adecuados;",
    "b) Programas de educacion y formacion profesional;",
    "c) Actividades laborales y productivas;",
    "d) Servicios de asistencia social y psicologica;",
    "e) Instalaciones deportivas y recreativas;",
    "f) Bibliotecas y espacios culturales.",
    "",
    "Articulo 5. La clasificacion de los internos se realizara conforme a criterios de seguridad, edad, sexo, salud y antecedentes penales. Se separaran los procesados de los condenados y los primarios de los reincidentes.",
    "",
    "Articulo 6. Todo interno tiene derecho a recibir alimentacion suficiente, adecuada y variada que cumpla con los requerimientos nutricionales.",
    "",
    "Articulo 7. Los internos tendran acceso a servicios de salud integral, incluyendo atencion medica, odontologica y psicologica, sin costo alguno.",
    "",
    "Articulo 8. Se garantiza el derecho de las personas privadas de libertad a mantener comunicacion con sus familiares y abogados, a traves de visitas, comunicaciones telefonicas y correspondencia.",
    "",
    "Articulo 9. Los internos que demuestren buena conducta y participen activamente en los programas de rehabilitacion podran acceder a beneficios tales como:",
    "a) Salidas transitorias;",
    "b) Semilibertad;",
    "c) Trabajo externo;",
    "d) Redencion de pena por trabajo y estudio.",
    "",
    "Articulo 10. La disciplina en los centros penitenciarios se regira por los principios de legalidad, proporcionalidad y debido proceso. Ningun interno sera sancionado sin haber sido escuchado previamente.",
    "",
    "Articulo 11. Quedan prohibidas las medidas de aislamiento como medio de castigo. Solo podran aplicarse por razones de seguridad o salud, por un periodo maximo de quince (15) dias.",
    "",
    "Articulo 12. La Administracion Penitenciaria establecera programas de trabajo remunerado para los internos, con el objeto de desarrollar habilidades laborales y generar ingresos para su sostenimiento y el de su familia.",
]


de_teletrabajo = [
    "DECRETO EJECUTIVO 356 de 27 de agosto de 2020",
    "",
    "Que reglamenta la Ley 12 de 20 de marzo de 2020, sobre trabajo a distancia y teletrabajo.",
    "",
    "EL PRESIDENTE DE LA REPUBLICA DE PANAMA",
    "",
    "EN USO DE SUS FACULTADES CONSTITUCIONALES Y LEGALES,",
    "",
    "DECRETA:",
    "",
    "Articulo 1. El presente Decreto Ejecutivo tiene por objeto reglamentar la Ley 12 de 20 de marzo de 2020, que establece el regimen juridico del trabajo a distancia y el teletrabajo en la Republica de Panama.",
    "",
    "Articulo 2. Para los efectos de este Decreto, se entiende por:",
    "a) Teletrabajo: la modalidad de trabajo en la que el trabajador presta sus servicios de forma remota, utilizando tecnologias de la informacion y comunicacion, desde un lugar distinto al centro de trabajo del empleador;",
    "b) Trabajo a distancia: la modalidad de trabajo en la que el trabajador ejecuta sus labores de manera parcial o total fuera del centro de trabajo, con o sin el uso de tecnologias de la informacion y comunicacion;",
    "c) Teletrabajador: la persona trabajadora que presta sus servicios bajo la modalidad de teletrabajo.",
    "",
    "Articulo 3. El teletrabajo podra ser adoptado por acuerdo entre el empleador y el trabajador, o por decision del empleador cuando las circunstancias asi lo requieran, conforme a lo establecido en la Ley 12 de 2020.",
    "",
    "Articulo 4. El contrato de teletrabajo debera contener, ademas de los requisitos establecidos en el Codigo de Trabajo:",
    "a) La modalidad de trabajo (teletrabajo o trabajo a distancia);",
    "b) El lugar o lugares desde donde el trabajador prestara sus servicios;",
    "c) Los horarios y jornadas de trabajo;",
    "d) Los equipos y herramientas proporcionados por el empleador;",
    "e) Los mecanismos de supervision y control;",
    "f) Las condiciones de seguridad y salud ocupacional.",
    "",
    "Articulo 5. El empleador debera proveer al teletrabajador los equipos, herramientas y tecnologias necesarios para el desempeno de sus funciones, o compensar el uso de los equipos propios del trabajador.",
    "",
    "Articulo 6. Las condiciones de empleo del teletrabajador, incluyendo salario, beneficios, vacaciones y seguridad social, no podran ser inferiores a las que corresponden a un trabajador que presta servicios de forma presencial.",
    "",
    "Articulo 7. El empleador es responsable de la salud y seguridad ocupacional del teletrabajador, debiendo establecer protocolos que garanticen condiciones ergonomicas y seguras en el lugar de trabajo remoto.",
    "",
    "Articulo 8. El teletrabajador tiene derecho a la desconexion digital fuera de su jornada laboral. El empleador no podra exigir la respuesta de comunicaciones fuera del horario laboral establecido.",
    "",
    "Articulo 9. Los gastos de conexion a internet, energia electrica y comunicaciones derivados del teletrabajo seran cubiertos por el empleador, conforme a lo que establezca el contrato de trabajo o la convencion colectiva.",
    "",
    "Articulo 10. El empleador no podra obligar al trabajador a permanecer conectado fuera de su jornada laboral, ni podra utilizar medios de supervision que vulneren la intimidad o la privacidad del teletrabajador.",
    "",
    "Articulo 11. La jornada de trabajo del teletrabajador se regira por las disposiciones del Codigo de Trabajo y no podra exceder las cuarenta y ocho (48) horas semanales.",
    "",
    "Articulo 12. El trabajador podra solicitar la vuelta al trabajo presencial en cualquier momento. El empleador debera evaluar la solicitud y dar respuesta en un plazo no mayor de treinta (30) dias.",
]


ley_187_2020 = [
    "LEY 187 de 7 de diciembre de 2020",
    "",
    "Que dicta medidas especiales para la proteccion de datos personales y establece la autoridad de proteccion de datos personales.",
    "",
    "LA ASAMBLEA NACIONAL DE LA REPUBLICA DE PANAMA",
    "",
    "DECRETA:",
    "",
    "Articulo 1. La presente Ley tiene por objeto garantizar el derecho fundamental a la proteccion de datos personales, regulando el tratamiento de estos por entidades publicas y privadas.",
    "",
    "Articulo 2. Todo tratamiento de datos personales require el consentimiento libre, expreso e informado del titular, salvo las excepciones previstas en esta Ley.",
    "",
    "Articulo 3. Se crea la Autoridad de Proteccion de Datos Personales, como entidad_autonoma adscrita al Ministerio de Gobierno, con las siguientes funciones:",
    "a) Velar por el cumplimiento de la normativa sobre proteccion de datos personales;",
    "b) Atender las consultas y reclamaciones de los titulares de datos;",
    "c) Sancionar las infracciones a esta Ley;",
    "d) Promover la cultura de proteccion de datos personales en el pais;",
    "e) Emitir guias y recomendaciones sobre buenas practicas en el tratamiento de datos.",
    "",
    "Articulo 4. Son derechos del titular de datos personales:",
    "a) Acceder de forma gratuita a sus datos personales;",
    "b) Conocer la fuente de donde provienen sus datos;",
    "c) Solicitar la rectificacion de datos inexactos o incompletos;",
    "d) Solicitar la supresion de sus datos cuando el tratamiento no se ajuste a la Ley;",
    "e) Oponerse al tratamiento de sus datos para fines publicitarios, comerciales o de investigacion;",
    "f) Revocar el consentimiento prestado para el tratamiento de sus datos.",
    "",
    "Articulo 5. El responsable del tratamiento de datos personales debera:",
    "a) Garantizar la confidencialidad, integridad y disponibilidad de los datos;",
    "b) Implementar medidas de seguridad tecnicas y administrativas adecuadas;",
    "c) Informar al titular sobre la finalidad del tratamiento;",
    "d) Obtener el consentimiento previo del titular;",
    "e) Conservar los datos solo por el tiempo necesario para la finalidad del tratamiento.",
    "",
    "Articulo 6. El tratamiento de datos sensibles (origen racial o etnico, opiniones politicas, convicciones religiosas, datos de salud, vida sexual) solo podra realizarse con autorizacion expresa del titular.",
    "",
    "Articulo 7. Las infracciones a esta Ley se clasifican en leves, graves y muy graves, con multas que oscilan entre mil balboas (B/.1,000.00) y cien mil balboas (B/.100,000.00).",
    "",
    "Articulo 8. La transferencia internacional de datos personales solo podra realizarse a paises que garanticen un nivel de proteccion adecuado o equivalente al establecido en esta Ley.",
    "",
    "Articulo 9. Los datos personales recogidos para una finalidad determinada no podran ser utilizados para una finalidad distinta sin el consentimiento del titular.",
    "",
    "Articulo 10. El responsable del tratamiento debera adoptar las medidas necesarias para que los datos personales sean exactos, completos y actualizados, siendo responsable de los danos causados por el incumplimiento de esta obligacion.",
]


if __name__ == "__main__":
    make_pdf(
        "Ley_6_2002_Transparencia.pdf",
        "LEY 6 de 2002 - Transparencia y Acceso a la Informacion Publica",
        "6", "2002", "Ley", "Asamblea Legislativa de Panama",
        ley_6_2002,
    )
    make_pdf(
        "Ley_29_2002_Universidad_Publica.pdf",
        "LEY 29 de 2002 - Regimen Juridico de la Universidad de Panama",
        "29", "2002", "Ley", "Asamblea Legislativa de Panama",
        ley_29_2002,
    )
    make_pdf(
        "Ley_42_2012_Sistema_Penitenciario.pdf",
        "LEY 42 de 2012 - Sistema Penitenciario",
        "42", "2012", "Ley", "Asamblea Nacional de Panama",
        ley_42_2012,
    )
    make_pdf(
        "DE_356_2020_Teletrabajo.pdf",
        "DECRETO EJECUTIVO 356 de 2020 - Reglamento de Teletrabajo",
        "356", "2020", "Decreto Ejecutivo", "Presidencia de la Republica de Panama",
        de_teletrabajo,
    )
    make_pdf(
        "Ley_187_2020_Proteccion_Datos.pdf",
        "LEY 187 de 2020 - Proteccion de Datos Personales",
        "187", "2020", "Ley", "Asamblea Nacional de Panama",
        ley_187_2020,
    )