import CustomCheckbox from './CustomCheckbox';
import { careGroups } from '../../constants/careGroups';
import { downloadPDF, GenerateSummary } from '../../helpers/dispo-consult';
import { DispoConsultFormData } from '../../types/DispoConsult.types';
import { useState } from 'react';
import LoaderInput from './LoaderInput';
import Button from './custom/Button';

interface SpecializedCareNeedsProps {
  setSummary: React.Dispatch<React.SetStateAction<string>>;
  formData: DispoConsultFormData | undefined;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setIsNext: React.Dispatch<React.SetStateAction<boolean>>;
  selectedItems: Record<string, boolean>;
  setSelectedItems: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
}

const SpecializedCareNeeds: React.FC<SpecializedCareNeedsProps> = ({
  setSummary,
  formData,
  setIsOpen,
  setIsNext,
  selectedItems,
  setSelectedItems,
}) => {
  const handleCheckboxChange =
    (itemKey: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
      setSelectedItems((prev) => ({
        ...prev,
        [itemKey]: event.target.checked,
      }));
    };
  const [loading, setLoading] = useState<boolean>(false);

  return (
    <div className="mx-auto w-full flex flex-col h-full justify-between max-w-[1600px]">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 md:grid-cols-3 lg:grid-cols-3  2xl:grid-cols-5">
        <div className="col-span-1">
          <div className="flex h-full flex-col rounded-2xl border border-input p-4 figma-card-shadow">
            <h3 className="pb-3 text-base font-bold text-secondary">
              {careGroups.respiratory.title}
            </h3>
            <div className="flex flex-col gap-2">
              {careGroups.respiratory.items.map((item, index) => (
                <CustomCheckbox
                  key={`respiratory-${index}`}
                  checked={selectedItems[item.name] || false}
                  onChange={handleCheckboxChange(item.name)}
                  label={item.name}
                  name={`respiratory-${index}`}
                />
              ))}
            </div>
          </div>
        </div>
        <div className="col-span-1">
          <div className="flex h-full flex-col rounded-2xl border border-input p-4 figma-card-shadow">
            <h3 className="pb-3 text-base font-bold text-secondary">{careGroups.oncology.title}</h3>
            <div className="flex flex-col gap-2">
              {careGroups.oncology.items.map((item, index) => (
                <CustomCheckbox
                  key={`oncology-${index}`}
                  checked={selectedItems[item.name] || false}
                  onChange={handleCheckboxChange(item.name)}
                  label={item.name}
                  name={`oncology-${index}`}
                />
              ))}
            </div>
          </div>
        </div>
        <div className="col-span-1">
          <div className="flex h-full flex-col rounded-2xl border border-input p-4 figma-card-shadow">
            <h3 className="pb-3 text-base font-bold text-secondary">
              {careGroups.surgicalWound.title}
            </h3>
            <div className="flex flex-col gap-2">
              {careGroups.surgicalWound.items.map((item, index) => (
                <CustomCheckbox
                  key={`surgicalWound-${index}`}
                  checked={selectedItems[item.name] || false}
                  onChange={handleCheckboxChange(item.name)}
                  label={item.name}
                  name={`surgicalWound-${index}`}
                />
              ))}
            </div>
          </div>
        </div>
        <div className="col-span-1">
          <div className="flex h-full flex-col rounded-2xl border border-input p-4 figma-card-shadow">
            <h3 className="pb-3 text-base font-bold text-secondary">
              {careGroups.urologicalGI.title}
            </h3>
            <div className="flex flex-col gap-2">
              {careGroups.urologicalGI.items.map((item, index) => (
                <CustomCheckbox
                  key={`urologicalGI-${index}`}
                  checked={selectedItems[item.name] || false}
                  onChange={handleCheckboxChange(item.name)}
                  label={item.name}
                  name={`urologicalGI-${index}`}
                />
              ))}
            </div>
          </div>
        </div>
        <div className="col-span-1">
          <div className="flex h-full flex-col rounded-2xl border border-input p-4 figma-card-shadow">
            <h3 className="pb-3 text-base font-bold text-secondary">
              {careGroups.behavioralNeuro.title}
            </h3>
            <div className="flex flex-col gap-2">
              {careGroups.behavioralNeuro.items.map((item, index) => (
                <CustomCheckbox
                  key={`behavioralNeuro-${index}`}
                  checked={selectedItems[item.name] || false}
                  onChange={handleCheckboxChange(item.name)}
                  label={item.name}
                  name={`behavioralNeuro-${index}`}
                />
              ))}
            </div>
          </div>
        </div>
        <div className="col-span-1">
          <div className="flex h-full flex-col rounded-2xl border border-input p-4 figma-card-shadow">
            <h3 className="pb-3 text-base font-bold text-secondary">{careGroups.other.title}</h3>
            <div className="flex flex-col gap-2">
              {careGroups.other.items.map((item, index) => (
                <CustomCheckbox
                  key={`other-${index}`}
                  checked={selectedItems[item.name] || false}
                  onChange={handleCheckboxChange(item.name)}
                  label={item.name}
                  name={`other-${index}`}
                />
              ))}
            </div>
          </div>
        </div>
        <div className="col-span-1">
          <div className="flex h-full flex-col rounded-2xl border border-input p-4 figma-card-shadow">
            <h3 className="pb-3 text-base font-bold text-secondary">
              {careGroups.nutrition.title}
            </h3>
            <div className="flex flex-col gap-2">
              {careGroups.nutrition.items.map((item, index) => (
                <CustomCheckbox
                  key={`nutrition-${index}`}
                  checked={selectedItems[item.name] || false}
                  onChange={handleCheckboxChange(item.name)}
                  label={item.name}
                  name={`nutrition-${index}`}
                />
              ))}
            </div>
          </div>
        </div>
        <div className="col-span-1 sm:col-span-2">
          <div className="flex h-full flex-col rounded-2xl border border-input p-4 figma-card-shadow">
            <h3 className="pb-3 text-base font-bold text-secondary">
              {careGroups.ivMedications.title}
            </h3>
            <div className="grid gap-2 sm:grid-cols-2">
              {careGroups.ivMedications.items.map((item, index) => (
                <CustomCheckbox
                  key={`ivMedications-${index}`}
                  checked={selectedItems[item.name] || false}
                  onChange={handleCheckboxChange(item.name)}
                  label={item.name}
                  name={`ivMedications-${index}`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-8 flex flex-col gap-3  sm:flex-row sm:items-center">
        <Button
          variant="dark"
          paddingLevel={4}
          onClick={() => setIsNext(false)}
          className="w-full sm:w-auto"
          childrenClassName="text-sm 2xl:text-xl"
        >
          Prev
        </Button>

        <div className="flex flex-col gap-3 sm:flex-row sm:ml-auto">
          <Button
            variant="secondary"
            paddingLevel={4}
            onClick={async () => {
              try {
                setLoading(true);
                const data = await GenerateSummary(formData);
                setSummary(data?.clinicalSummary);
                setIsOpen(true);
                setLoading(false);
              } catch (error) {
                console.error(error);
                setLoading(false);
              }
            }}
            className="w-full sm:w-auto"
            disabled={loading}
            childrenClassName="text-sm 2xl:text-xl"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <LoaderInput />
                Loading...
              </div>
            ) : (
              'Generate Scorecard'
            )}
          </Button>
          <Button
            variant="primary"
            paddingLevel={4}
            className="w-full sm:w-auto"
            onClick={downloadPDF}
            childrenClassName="text-sm 2xl:text-xl"
          >
            View Full Report + Scorecard
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SpecializedCareNeeds;
