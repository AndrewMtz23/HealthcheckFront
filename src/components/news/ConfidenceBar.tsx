import { BarChart2 } from 'lucide-react';
import { Clasificacion } from '@/types/news';

interface ConfidenceBarProps {
  classification: Clasificacion;
}

const ConfidenceBar = ({ classification }: ConfidenceBarProps) => {
  // Obtener el valor de confianza
  let confidenceValue = classification.confianza;
  
  // Verificar si el valor existe y es un número
  if (confidenceValue === null || confidenceValue === undefined) {
    confidenceValue = 0;
  }
  
  // Convertir a número si es un string
  let confidence = typeof confidenceValue === 'string' 
    ? parseFloat(confidenceValue) 
    : confidenceValue;
  
  // Si no es un número válido, usar 0
  if (isNaN(confidence)) confidence = 0;
  
  // Mostrar el valor tal cual aparece en la BD
  const displayPercentage = confidence;
  
  // Limitar el porcentaje para la barra entre 0 y 100
  const barPercentage = Math.min(Math.max(displayPercentage, 0), 100);
  
  // Formato con un decimal
  const formattedPercentage = displayPercentage.toFixed(1);
  
  // Determinar el color de la barra según la clasificación
  let barColor = 'bg-gray-400';
  
  if (classification.resultado === 'verdadera') {
    barColor = 'bg-green-500';
  } else if (classification.resultado === 'falsa') {
    barColor = 'bg-red-500';
  } else if (classification.resultado === 'dudosa') {
    barColor = 'bg-yellow-500';
  }
  
  return (
    <div className="mt-2">
      <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
        <span className="flex items-center">
          <BarChart2 className="h-3 w-3 mr-1" />
          Confianza
        </span>
        <span>{formattedPercentage}%</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
        <div 
          className={`h-full ${barColor} rounded-full`}
          style={{ width: `${barPercentage}%` }}
        />
      </div>
    </div>
  );
};

export default ConfidenceBar;