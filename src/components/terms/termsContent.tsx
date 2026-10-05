import { FiCompass, FiAlertCircle, FiHeart, FiUserCheck, FiBookOpen } from 'react-icons/fi';
import InfoSections from '@/components/info/infoSections';

const sections = [
  { icon: FiCompass, id: 'alcance', title: 'Qué ofrece HealthCheck', text: 'HealthCheck permite consultar noticias sobre salud y analizar información mediante herramientas automatizadas. Los resultados sirven como apoyo para revisar una afirmación y contrastarla con sus fuentes.' },
  { icon: FiAlertCircle, id: 'limites', title: 'Límites del análisis', text: 'Los modelos pueden equivocarse, omitir contexto o trabajar con información incompleta. Una puntuación de confianza no garantiza que una noticia sea verdadera o falsa. Revisa la fuente original y la fecha de publicación antes de compartirla.' },
  { icon: FiHeart, id: 'salud', title: 'Información, no atención médica', text: 'Las noticias, los análisis y las respuestas del asistente no constituyen un diagnóstico ni sustituyen la consulta con un profesional de salud. No modifiques un tratamiento a partir de un resultado de la plataforma.' },
  { icon: FiUserCheck, id: 'cuenta', title: 'Uso responsable de tu cuenta', text: 'Protege tus credenciales y cierra sesión cuando utilices un dispositivo compartido. Evita introducir datos clínicos personales o información privada de terceros en los análisis, comentarios o conversaciones.' },
  { icon: FiBookOpen, id: 'contenido', title: 'Contenido y fuentes externas', text: 'Comparte únicamente contenido que tengas permiso para utilizar. Los enlaces a noticias conservan su autoría y pueden llevar a sitios con sus propias condiciones de uso. Utiliza la opción de reportar una fuente cuando detectes información que requiera revisión.' },
];

export default function TermsContent() {
  return <InfoSections sections={sections} notice="Versión informativa preliminar. Las condiciones definitivas están pendientes de la identificación del responsable del servicio y de su revisión antes de publicarse como documento contractual." />;
}
