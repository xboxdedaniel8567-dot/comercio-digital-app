import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";
import { LEGAL_RESPONSIBLE, LEGAL_VERSION } from "@/lib/legal";

export const metadata: Metadata = { title: "Politica de privacidad | Comercio Digital" };

export default function PrivacyPage() {
  return (
    <LegalPage
      eyebrow={`Version piloto ${LEGAL_VERSION}`}
      title="Politica de privacidad"
      intro="Esta politica resume que informacion utiliza Comercio Digital, para que la utiliza y como pueden ejercer sus derechos los titulares."
      sections={[
        {
          title: "1. Responsable",
          paragraphs: [
            `${LEGAL_RESPONSIBLE.name}, titular de ${LEGAL_RESPONSIBLE.brand}. Contacto: ${LEGAL_RESPONSIBLE.email}, telefono ${LEGAL_RESPONSIBLE.phone}, ${LEGAL_RESPONSIBLE.location}.`,
          ],
        },
        {
          title: "2. Datos tratados",
          paragraphs: [
            "Podemos tratar nombre, correo, telefono, datos de autenticacion, preferencias, favoritos, historial de busqueda, reservas, reportes y registros de contacto. Para comerciantes tambien tratamos informacion del negocio, ubicacion, horarios, catalogo, imagenes y actividad administrativa.",
            "Podemos recibir datos tecnicos necesarios para seguridad y funcionamiento, como fecha de acceso, identificadores de sesion, dispositivo y registros de errores. No solicitamos datos sensibles para el uso ordinario de la plataforma.",
          ],
        },
        {
          title: "3. Finalidades",
          paragraphs: [
            "Usamos los datos para crear y proteger cuentas, publicar tiendas y productos, ofrecer busqueda, favoritos y reservas, facilitar contactos, atender reportes, moderar contenido, medir funcionamiento, prevenir fraude y cumplir obligaciones legales.",
            "No venderemos bases de datos personales. Las comunicaciones promocionales requeriran la autorizacion aplicable y ofreceran un mecanismo para dejar de recibirlas.",
          ],
        },
        {
          title: "4. Proveedores y circulacion",
          paragraphs: [
            "Podemos utilizar proveedores de infraestructura, autenticacion, almacenamiento, analitica y comunicaciones que actuan como encargados del tratamiento. Solo se comparte la informacion necesaria para prestar y proteger el servicio o atender una obligacion legal.",
            "Al contactar un comercio, el usuario decide compartir informacion mediante WhatsApp u otro canal externo, sujeto tambien a las politicas de ese proveedor y del comercio destinatario.",
          ],
        },
        {
          title: "5. Conservacion y seguridad",
          paragraphs: [
            "Conservamos la informacion durante el tiempo necesario para las finalidades informadas, la relacion con el usuario, la atencion de reclamos y los plazos legales. Aplicamos controles de acceso, reglas por rol, conexiones seguras, registros de auditoria y copias de respaldo razonables.",
            "Ningun sistema es infalible. Los incidentes se evaluaran y gestionaran conforme a su riesgo y a las obligaciones aplicables.",
          ],
        },
        {
          title: "6. Derechos",
          paragraphs: [
            `El titular puede conocer, actualizar, rectificar o solicitar prueba de la autorizacion; conocer el uso dado a sus datos; presentar quejas; revocar la autorizacion o solicitar supresion cuando proceda; y acceder gratuitamente a sus datos. Las solicitudes se reciben en ${LEGAL_RESPONSIBLE.email}.`,
          ],
        },
        {
          title: "7. Menores y cambios",
          paragraphs: [
            "Las cuentas deben ser creadas por personas con capacidad legal o con intervencion de su representante. El tratamiento de datos de menores se realizara solo cuando sea legal, respete su interes superior y cuente con la autorizacion necesaria.",
            "Publicaremos nuevas versiones con su fecha y comunicaremos cambios sustanciales cuando corresponda.",
          ],
        },
      ]}
    />
  );
}
