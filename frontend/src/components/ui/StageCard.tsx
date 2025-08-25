import {
  CreditCardIcon,
  DocumentTextIcon,
  LockClosedIcon,
  ShoppingBagIcon,
  UserIcon,
} from '@heroicons/react/24/outline';
import { CheckIcon as CheckIconSolid } from '@heroicons/react/24/solid';

interface StageCardProps {
  stage: 'client' | 'items' | 'payment' | 'summary';
  title: string;
  description: string;
  isCompleted: boolean;
  isActive: boolean;
  onClick?: () => void;
  className?: string;
}

const StageCard = ({
  stage,
  title,
  description,
  isCompleted,
  isActive,
  onClick,
  className = '',
}: StageCardProps) => {
  const getStageIcon = () => {
    const iconClass = 'w-6 h-6';

    // Sempre retorna o ícone específico da etapa, independente do status
    switch (stage) {
      case 'client':
        return <UserIcon className={`${iconClass} text-white`} />;
      case 'items':
        return <ShoppingBagIcon className={`${iconClass} text-white`} />;
      case 'payment':
        return <CreditCardIcon className={`${iconClass} text-white`} />;
      case 'summary':
        return <DocumentTextIcon className={`${iconClass} text-white`} />;
      default:
        return <UserIcon className={`${iconClass} text-white`} />;
    }
  };

  const getCardClasses = () => {
    let baseClasses = 'relative p-4 rounded-xl border transition-all duration-200';

    if (isCompleted) {
      baseClasses +=
        ' bg-gradient-to-r from-success-600 to-success-700 border-success-500 shadow-lg';
    } else if (isActive) {
      baseClasses +=
        ' bg-gradient-to-r from-primary-600 to-primary-700 border-primary-500 shadow-lg cursor-pointer hover:shadow-xl hover:scale-105';
    } else {
      baseClasses += ' bg-gradient-to-r from-gray-600 to-gray-700 border-gray-500 shadow-md';
    }

    return `${baseClasses} ${className}`;
  };

  const getIconContainerClasses = () => {
    if (isCompleted) {
      return 'w-10 h-10 rounded-lg bg-success-500 flex items-center justify-center shadow-inner';
    } else if (isActive) {
      return 'w-10 h-10 rounded-lg bg-primary-500 flex items-center justify-center shadow-inner';
    }
    return 'w-10 h-10 rounded-lg bg-gray-500 flex items-center justify-center shadow-inner';
  };

  const getTitleClasses = () => {
    if (isCompleted) {
      return 'text-white font-bold text-base';
    } else if (isActive) {
      return 'text-white font-bold text-base';
    }
    return 'text-white font-medium text-base';
  };

  const getDescriptionClasses = () => {
    if (isCompleted) {
      return 'text-success-100 text-xs leading-tight';
    } else if (isActive) {
      return 'text-primary-100 text-xs leading-tight';
    }
    return 'text-gray-200 text-xs leading-tight';
  };

  const getStatusIndicator = () => {
    if (isCompleted) {
      return (
        <div className="absolute -top-1 -right-1 w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-md">
          <CheckIconSolid className="w-3 h-3 text-success-600" />
        </div>
      );
    } else if (isActive) {
      return (
        <div className="absolute -top-1 -right-1 w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-md">
          <div className="w-2 h-2 bg-primary-500 rounded-full animate-pulse"></div>
        </div>
      );
    }
    // Estágio bloqueado - mostra ícone de cadeado
    return (
      <div className="absolute -top-1 -right-1 w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-md">
        <LockClosedIcon className="w-3 h-3 text-gray-500" />
      </div>
    );
  };

  return (
    <div className={getCardClasses()} onClick={isActive ? onClick : undefined}>
      {/* Indicador de status */}
      {getStatusIndicator()}

      {/* Conteúdo do card */}
      <div className="flex items-start space-x-3">
        {/* Ícone do estágio */}
        <div className={getIconContainerClasses()}>{getStageIcon()}</div>

        {/* Texto do estágio */}
        <div className="flex-1 min-w-0">
          <h3 className={`${getTitleClasses()} mb-1`}>{title}</h3>
          <p className={`${getDescriptionClasses()}`}>{description}</p>
        </div>
      </div>
    </div>
  );
};

export default StageCard;
