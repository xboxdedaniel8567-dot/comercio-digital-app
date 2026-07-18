import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";
import { LEGAL_RESPONSIBLE, LEGAL_VERSION } from "@/lib/legal";

export const metadata: Metadata = { title: "Terminos y condiciones | Comercio Digital" };

export default function TermsPage() {
  return (
    <LegalPage
      eyebrow={`Version piloto ${LEGAL_VERSION}`}
      title="Terminos y condiciones"
      intro="Estas reglas explican el funcionamiento de Comercio Digital y las responsabilidades de compradores, comerciantes y administradores."
      sections={[
        {
          title: "1. Responsable y aceptacion",
          paragraphs: [
            `${LEGAL_RESPONSIBLE.name}, titular de ${LEGAL_RESPONSIBLE.brand}, administra esta version piloto desde ${LEGAL_RESPONSIBLE.location}. Al crear una cuenta o utilizar funciones reservadas, el usuario acepta estos terminos.`,
            `Consultas: ${LEGAL_RESPONSIBLE.email} o ${LEGAL_RESPONSIBLE.phone}.`,
          ],
        },
        {
          title: "2. Naturaleza de la plataforma",
          paragraphs: [
            "Comercio Digital es un portal de contacto que permite descubrir productos de comercios fisicos y comunicarse con ellos. En la version actual no recibe pagos, no almacena dinero, no realiza entregas y no es el vendedor de los productos publicados por terceros.",
            "La compraventa se acuerda directamente entre el comprador y el comerciante. Cada comercio debe identificarse claramente y responder por la veracidad de su oferta, precios, disponibilidad, calidad, garantias y obligaciones frente al consumidor.",
          ],
        },
        {
          title: "3. Cuentas y uso permitido",
          paragraphs: [
            "La informacion suministrada debe ser cierta y mantenerse actualizada. Cada usuario protege su contrasena y responde por la actividad realizada desde su cuenta.",
            "No se permite fraude, suplantacion, contenido ilegal, publicidad enganosa, manipulacion de estadisticas, ataques al sistema ni uso de datos de otros usuarios sin autorizacion.",
          ],
        },
        {
          title: "4. Comerciantes y publicaciones",
          paragraphs: [
            "Los comerciantes deben publicar productos reales, informacion suficiente, precios claros y disponibilidad razonablemente actualizada. La aprobacion de una tienda o publicacion no equivale a una certificacion de calidad ni elimina la responsabilidad del comerciante.",
            "Comercio Digital puede revisar, ocultar, rechazar o suspender contenido y cuentas cuando existan reportes, incumplimientos, riesgos para usuarios o requerimientos de autoridad competente.",
          ],
        },
        {
          title: "5. Reservas, WhatsApp y reportes",
          paragraphs: [
            "Las reservas son solicitudes entre usuarios y comercios; no constituyen un pago ni garantizan por si solas la venta. Los mensajes enviados por WhatsApp se rigen tambien por las condiciones de ese servicio externo.",
            "Los reportes deben presentarse de buena fe. La plataforma puede solicitar informacion adicional y conservar evidencia necesaria para revisar el caso.",
          ],
        },
        {
          title: "6. Propiedad intelectual y disponibilidad",
          paragraphs: [
            "La marca, interfaz y software de Comercio Digital pertenecen a sus titulares. El comerciante conserva los derechos sobre su contenido y autoriza su exhibicion dentro de la plataforma mientras permanezca publicado.",
            "El servicio puede cambiar, suspenderse temporalmente o presentar fallas. Nada en estos terminos limita derechos irrenunciables reconocidos por la ley colombiana.",
          ],
        },
        {
          title: "7. Cambios y ley aplicable",
          paragraphs: [
            "Las nuevas versiones indicaran su fecha. Cuando un cambio sea sustancial, se solicitara una nueva aceptacion cuando corresponda. Estos terminos se interpretan conforme a la legislacion colombiana.",
          ],
        },
      ]}
    />
  );
}
