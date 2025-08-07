import React from 'react';
import MacroMateClinicalIcon from '../../assets/icons/MacroMateClinical.svg?react';
import CalendarIcon from '../../assets/icons/calendar.svg?react';
import ConsultationIcon from '../../assets/icons/Consultation.svg?react';
import FeedbackIcon from '../../assets/icons/new-feedback.svg?react';
import TrainingIcon from '../../assets/icons/Training.svg?react';
import DirectoryIcon from '../../assets/icons/directory.svg?react';
import DispoConsultIcon from '../../assets/icons/dispo-consult.svg?react';
import { useNavigate } from 'react-router-dom';
import DirectoryCard from '../reusable/custom/DirectoryCard';
import utilityCardsData from '../../data/utilityCards.json';

const Utilities: React.FC = () => {
  const navigate = useNavigate();

  const iconMap: Record<string, React.ComponentType<Record<string, unknown>>> = {
    MacroMateClinicalIcon,
    CalendarIcon,
    ConsultationIcon,
    FeedbackIcon,
    TrainingIcon,
    DirectoryIcon,
    DispoConsultIcon,
  };

  const handleNavigation = (card: (typeof utilityCardsData)[0]) => {
    if (card.sessionStorage) {
      sessionStorage.setItem(card.sessionStorage.key, card.sessionStorage.value);
    }
    navigate(card.route);
  };

  return (
    <div className="w-full h-full bg-white rounded-2xl shadow-lg flex flex-col">
      <div className="flex-1 min-h-0 overflow-y-auto py-8 px-4 md:px-8 2xl:px-14">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6 auto-rows-fr">
          {utilityCardsData.map((card) => (
            <DirectoryCard
              key={card.id}
              title={card.title}
              description={card.description}
              icon={iconMap[card.icon]}
              onReadMoreClick={() => handleNavigation(card)}
              iconBackgroundGradient="var(--figma-icon-gradient)"
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Utilities;
