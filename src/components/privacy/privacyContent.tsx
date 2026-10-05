import { FiUser, FiActivity, FiMonitor, FiSliders, FiExternalLink, FiLock } from 'react-icons/fi';
import InfoSections from '@/components/info/infoSections';

const sections = [
  { icon: FiUser, id: 'cuenta', title: 'Datos de tu cuenta', text: 'El registro y el perfil utilizan los datos que proporcionas para identificar tu cuenta y permitir el inicio de sesión. Desde tu perfil puedes consultar y actualizar la información disponible.' },
  { icon: FiActivity, id: 'actividad', title: 'Consultas e interacciones', text: 'Los textos y enlaces que envías se procesan para realizar el análisis solicitado. Las funciones de historial, preferencias e interacciones con noticias utilizan información de tu actividad para mostrar tus consultas y mantener tus opciones.' },
  { icon: FiMonitor, id: 'dispositivo', title: 'Almacenamiento en tu navegador', text: 'La aplicación guarda el identificador de sesión y datos de tu usuario en el almacenamiento local del navegador para mantener tu sesión. Al cerrar sesión se eliminan esas entradas locales; esto no equivale a eliminar tu cuenta ni los datos guardados en el servidor.' },
  { icon: FiSliders, id: 'opciones', title: 'Opciones disponibles', text: 'Puedes editar los campos habilitados en tu perfil, gestionar tus preferencias y limpiar el historial desde su vista. Limpiar el historial de consultas no implica eliminar otros registros asociados a la cuenta.' },
  { icon: FiExternalLink, id: 'externos', title: 'Enlaces y servicios externos', text: 'Cuando abres una fuente externa, sales de HealthCheck y se aplican las prácticas del sitio de destino. Antes de compartir información allí, consulta su aviso de privacidad.' },
  { icon: FiLock, id: 'cuidado', title: 'Qué evitar al compartir información', text: 'No incluyas contraseñas, expedientes médicos, datos de pacientes ni información sensible de terceros en los textos que envías. Para revisar una noticia suele bastar con su contenido público o su enlace.' },
];

export default function PrivacyContent() {
  return <InfoSections sections={sections} notice="Aviso preliminar basado en las funciones actuales. Antes de su publicación definitiva deben completarse los datos del responsable, los plazos de conservación, los proveedores que procesan información y el canal para solicitudes de privacidad." />;
}
