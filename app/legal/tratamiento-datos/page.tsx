import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";
import { LEGAL_RESPONSIBLE, LEGAL_VERSION } from "@/lib/legal";

export const metadata: Metadata = { title: "Tratamiento de datos | Comercio Digital" };

export default function DataPolicyPage() {
  return (
    <LegalPage
      eyebrow={`Vigente desde ${LEGAL_VERSION}`}
      title="Politica de tratamiento de datos personales"
      intro="Documento adoptado para el piloto de Comercio Digital conforme a los principios de legalidad, finalidad, libertad, veracidad, transparencia, acceso restringido, seguridad y confidencialidad."
      sections={[
        {
          title: "1. Identificacion",
          paragraphs: [
            `Responsable: ${LEGAL_RESPONSIBLE.name}, titular de ${LEGAL_RESPONSIBLE.brand}. Domicilio de operacion: ${LEGAL_RESPONSIBLE.location}. Correo: ${LEGAL_RESPONSIBLE.email}. Telefono: ${LEGAL_RESPONSIBLE.phone}.`,
          ],
        },
        {
          title: "2. Tratamientos y finalidades",
          paragraphs: [
            "La recoleccion, almacenamiento, consulta, uso, actualizacion, transmision, supresion y demas operaciones necesarias se realizan para administrar usuarios y comercios, operar el marketplace, facilitar contactos, atender reservas y reportes, mantener seguridad, generar estadisticas y cumplir obligaciones legales.",
          ],
        },
        {
          title: "3. Autorizacion",
          paragraphs: [
            "La autorizacion se solicita de manera previa e informada mediante los formularios de registro u otros mecanismos comprobables. El sistema conserva la version aceptada, la fecha, el usuario y el origen de la aceptacion.",
            "Cuando la ley permita tratar informacion sin autorizacion, se mantendran los demas deberes y principios aplicables.",
          ],
        },
        {
          title: "4. Consultas y reclamos",
          paragraphs: [
            `El titular o quien este legitimado puede enviar su solicitud a ${LEGAL_RESPONSIBLE.email}, indicando nombre, identificacion suficiente, datos de contacto, descripcion clara y documentos de soporte.`,
            "Las consultas y reclamos se atenderan dentro de los terminos previstos por la legislacion colombiana. Si la solicitud esta incompleta, se pedira la informacion necesaria. Cuando no seamos competentes, se informara o trasladara segun corresponda.",
          ],
        },
        {
          title: "5. Deberes del responsable",
          paragraphs: [
            "Se garantizara el ejercicio de los derechos del titular, se conservara prueba de la autorizacion cuando sea exigible, se informara la finalidad, se mantendran medidas de seguridad, se rectificara informacion incorrecta, se atenderan consultas y reclamos y se exigira a los encargados el respeto de esta politica.",
          ],
        },
        {
          title: "6. Vigencia",
          paragraphs: [
            "Esta politica rige desde la fecha indicada. Las bases de datos tendran la vigencia necesaria para cumplir las finalidades autorizadas y las obligaciones legales, tras lo cual los datos se eliminaran o anonimizaran cuando proceda.",
          ],
        },
      ]}
    />
  );
}
