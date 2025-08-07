import React from 'react';
import { options } from '../../constants';
import { DispoConsultFormData } from '../../types/DispoConsult.types';
import { careGroups } from '../../constants/careGroups';
import { scoreDescription } from '../../constants/RehabDetailsContent';

type RehabDetailsContentProps = {
  summary: string | undefined;
  score: string | undefined;
  formData: DispoConsultFormData | undefined;
  selectedItems: Record<string, boolean>;
};

const RehabDetailsContent: React.FC<RehabDetailsContentProps> = ({
  summary,
  score,
  formData,
  selectedItems,
}) => {
  const getLabel = (category: keyof typeof options, value: string | undefined) => {
    return options[category]?.find((item) => item.value === value)?.label || value;
  };

  return (
    <div className="w-full h-full bg-white rounded-lg overflow-hidden">
      {/* Header Section */}
      <div className=" p-4 flex flex-col items-start bg-[var(--rehab-modal)] text-white">
        <h2 className="text-lg md:text-xl font-bold pr-5 leading-tight mb-1 tracking-tight">
          Rehabilitation Assessment Details
        </h2>
        <div className="p-2 rounded-lg">
          <span className="text-xs md:text-sm font-medium text-muted">Reference # : 123456</span>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-4">
        {/* Disposition Variables Section */}
        <div className="border border-subtle rounded-lg md:border-0 figma-card-shadow">
          <h3 className="text-base font-gotham-bold  tracking-tight text-secondary border-b border-subtle p-2">
            Disposition Variables
          </h3>
          <div className="flex flex-col gap-3 p-2 max-h-[46vh] overflow-y-auto">
            <div className="flex gap-1 items-center flex-wrap">
              <span className="text-sm font-medium opacity-80 text-secondary">
                Insurance Payer Type :
              </span>
              <p className="text-sm font-semibold text-success">
                {getLabel('insurancePayerType', formData?.insurance_payer)}
              </p>
            </div>
            <div className="flex gap-1 items-center flex-wrap">
              <span className="text-sm font-medium opacity-80 text-secondary">
                Prior Level of Function :
              </span>
              <p className="text-sm font-semibold text-success">
                {getLabel('priorLevelOfFunction', formData?.prior_level_of_function)}
              </p>
            </div>
            <div className="flex gap-1 items-center flex-wrap">
              <span className="text-sm font-medium opacity-80 text-secondary">
                Prior Living Arrangement :
              </span>
              <p className="text-sm font-semibold text-success">
                {getLabel('priorLivingArrangement', formData?.prior_living_arrangement)}
              </p>
            </div>
            <div className="flex gap-1 items-center flex-wrap">
              <span className="text-sm font-medium opacity-80 text-secondary">
                Available Support :
              </span>
              <p className="text-sm font-semibold text-success">
                {getLabel('availableSupport', formData?.available_social_support)}
              </p>
            </div>
            <div className="flex gap-1 items-center flex-wrap">
              <span className="text-sm font-medium opacity-80 text-secondary">
                Functional Level - Transfers :
              </span>
              <p className="text-sm font-semibold text-success">
                {getLabel('functionalLevelTransfers', formData?.transfer_functional_level)}
              </p>
            </div>
            <div className="flex gap-1 items-center flex-wrap">
              <span className="text-sm font-medium opacity-80 text-secondary">
                Functional Level - Ambulation :
              </span>
              <p className="text-sm font-semibold text-success">
                {getLabel('functionalLevelAmbulation', formData?.ambulation_functional_level)}
              </p>
            </div>
            <div className="flex gap-1 items-center flex-wrap">
              <span className="text-sm font-medium opacity-80 text-secondary">OT Needs :</span>
              <p className="text-sm font-semibold text-success">
                {formData?.ot_needs ? 'Yes' : 'No'}
              </p>
            </div>
            <div className="flex gap-1 items-center flex-wrap">
              <span className="text-sm font-medium opacity-80 text-secondary">
                Tolerates Therapies Standing :
              </span>
              <p className="text-sm font-semibold text-success">
                {formData?.tolerates_therapies_standing ? 'Yes' : 'No'}
              </p>
            </div>
            <div className="flex gap-1 items-center flex-wrap">
              <span className="text-sm font-medium opacity-80 text-secondary">
                Discharge Imminent (&lt;24 hr) :
              </span>
              <p className="text-sm font-semibold text-success mt-1">
                {formData?.selected_option === 'very-close' ? 'Yes' : 'No'}
              </p>
            </div>
          </div>
        </div>

        {/* Expected Rehab Recommendation Section */}
        <div className="border border-subtle rounded-lg md:border-0 figma-card-shadow">
          <h3 className="text-base font-gotham-bold tracking-tight text-secondary border-b border-subtle p-2">
            Expected Rehab Recommendation
          </h3>
          <div className="flex flex-col gap-3 p-2 max-h-[46vh] overflow-y-auto">
            <div className="bg-[var(--rehab-modal)] text-white text-center py-2 px-4 rounded-lg font-semibold">
              {score}
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex flex-col">
                <span className="text-base font-gotham-bold text-secondary tracking-tight mb-2">
                  Clinical Justification:
                </span>
                <p className="text-sm text-secondary bg-success-light p-3 rounded-lg border border-input">
                  {scoreDescription[score as keyof typeof scoreDescription]}
                </p>
              </div>
            </div>

            <div className="mt-4 md:mt-0">
              <h4 className="text-base font-gotham-bold text-secondary mb-2">
                Rehab Impairment Category
              </h4>
              <div className="bg-[var(--rehab-modal)] text-white text-center py-2 px-4 rounded-lg font-semibold">
                {formData?.diagnosis_category}
              </div>
            </div>
          </div>
        </div>

        {/* Transitions of Care Considerations Section */}
        <div className="border border-subtle rounded-lg md:border-0 figma-card-shadow">
          <h3 className="text-base font-gotham-bold tracking-tight text-secondary border-b border-subtle p-2">
            Transitions of Care Considerations
          </h3>
          <div className="flex flex-col gap-3 p-2 max-h-[46vh] overflow-y-auto scrollbar-thin">
            {Object.entries(selectedItems)
              .filter(([_, isSelected]) => isSelected)
              .map(([itemName]) => {
                let itemDescription = '';

                for (const group of Object.values(careGroups)) {
                  const found = group.items.find((item) => item.name === itemName);
                  if (found) {
                    itemDescription = found.description;
                    break;
                  }
                }

                return (
                  <div key={itemName} className="mb-4">
                    <h4 className="text-sm font-semibold text-secondary mb-1">{itemName}</h4>
                    <p className="text-sm text-secondary opacity-80 leading-relaxed">
                      {itemDescription || 'No Description'}
                    </p>
                  </div>
                );
              })}
            {Object.values(selectedItems).every((val) => !val) && (
              <span className="text-sm text-muted italic">No items selected</span>
            )}
          </div>
        </div>
      </div>
      <div className="p-4 pb-2 bg-[var(--rehab-modal)] text-white">
        <h3 className="text-base font-semibold tracking-tight  p-2">Clinical Summary</h3>
        <hr className="border-t border-input my-1" />
        <p className="text-sm leading-relaxed  max-h-[100px] scrollbar-thin font-gotham-normal overflow-y-auto p-2 bg-bg-subtle rounded-lg">
          {summary || 'No Summary Available'}
        </p>
      </div>
    </div>
  );
};

export default RehabDetailsContent;
