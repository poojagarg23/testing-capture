import { useState } from 'react';
import { DiagnosisCodeSuggestionsProps } from '../../types/DiagnosisCodeSuggestions.types';
import { Diagnosis as BestGuessCode, Diagnosis } from '../../types';
import TickPending from '../../assets/icons/tick_pending.svg?react';
import { handleSearch } from '../../helpers/diagnosis-code-suggestions';
import { toast } from 'react-toastify';
import SearchBar from '../reusable/custom/SearchBar';
import SearchIcon from '../../assets/icons/search.svg?react';
import Button from '../reusable/custom/Button';
import { TOAST_CONFIG } from '../../constants';

const DiagnosisCodeSuggestions = ({
  diagnosisLabel,
  suggestions,
  onSelect,
  setSuggestedDiagnosis,
}: DiagnosisCodeSuggestionsProps) => {
  const [selectedCode, setSelected] = useState<BestGuessCode>({
    code: '',
    description: '',
    id: 0,
    is_primary: false,
  });
  const [searchedDiagnoses, setSearchedDiagnoses] = useState<Diagnosis[]>([]);
  const [searchText, setSearchText] = useState<string>('');

  const handleHandleSearch = async (query: string) => {
    if (query === '') {
      setSearchedDiagnoses([]);
      return;
    }
    const response = await handleSearch(query);
    if (response) {
      setSearchedDiagnoses(response);
    }
  };

  const handleAddSearchCode = (item: BestGuessCode) => {
    setSuggestedDiagnosis((prevDiagnoses: Diagnosis[]) => {
      const exists = prevDiagnoses.some((diag) => diag.id === item.id);
      if (exists) {
        toast.info('Diagnosis removed from suggestions.', TOAST_CONFIG.INFO);
        return prevDiagnoses.filter((diag) => diag.id !== item.id);
      }

      toast.success('Diagnosis successfully added to suggestions.', TOAST_CONFIG.SUCCESS);
      return [
        ...prevDiagnoses,
        {
          id: item.id,
          code: item.code,
          description: item.description,
          is_primary: item.is_primary,
        },
      ];
    });
  };

  return (
    <div className="w-full mx-auto my-5 px-3 py-4 sm:p-4 bg-white rounded-[10px] border border-[var(--table-header)]">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        {/* Left Column – Search & Results */}
        <div>
          {/* Search Bar */}
          <div className="bg-white border border-[var(--table-header)] rounded-[10px] p-4 w-full">
            <SearchBar
              placeholder="Search manually by name or ICD code"
              value={searchText}
              onChange={(val) => {
                setSearchText(val);
                handleHandleSearch(val);
              }}
              icon={<SearchIcon className="w-5 h-5 opacity-30" />}
              className="w-full"
            />
          </div>

          {/* Search Results */}
          {searchedDiagnoses.length > 0 ? (
            <>
              <div className="space-y-2 mt-4 max-h-60 sm:max-h-64 lg:max-h-[250px] overflow-y-auto pr-1">
                {searchedDiagnoses.map((item, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-center p-3 border border-[var(--table-header)] rounded-md bg-subtle hover:bg-[var(--table-hover)] text-sm text-secondary font-gotham-medium cursor-pointer"
                    onClick={() => handleAddSearchCode(item)}
                  >
                    <div className="font-medium flex-1">
                      {item.code}: {item.description}
                    </div>
                    <div className="ml-3 flex items-center">
                      <TickPending
                        width={20}
                        height={20}
                        fill={
                          suggestions.some((diagnosis) => diagnosis.code === item.code)
                            ? 'var(--status-success)'
                            : 'var(--text-muted-semi)'
                        }
                      />
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="mt-6 text-sm flex items-center justify-center  text-secondary font-gotham-normal opacity-60">
              {searchText.trim() === ''
                ? 'Start typing to search diagnoses.'
                : `No results found for "${searchText}".`}
            </div>
          )}
        </div>

        {/* Right Column – Suggestions */}
        <div>
          <div className="bg-subtle text-[10px] sm:text-xs font-medium text-secondary p-4 rounded-[10px] border border-[var(--table-header)] w-full flex items-center min-h-[80px]">
            {suggestions.length === 0 ? (
              <span>
                Please search manually to add a diagnosis for:{' '}
                <em className="2xl:text-sm">{diagnosisLabel}</em>
              </span>
            ) : (
              <span className="text-base">
                Suggestions for: <em className="2xl:text-base">{diagnosisLabel}</em>
              </span>
            )}
          </div>

          {suggestions.length > 0 && (
            <>
              <ul className="list-none mt-4 p-0 m-0 max-h-60 sm:max-h-64 lg:max-h-[250px] overflow-y-auto space-y-2">
                {suggestions.map((item, index) => {
                  const isSelected = selectedCode.code === item.code;
                  return (
                    <li
                      key={index}
                      className={`flex justify-between items-center p-3 border border-[var(--table-header)] rounded-md cursor-pointer bg-subtle hover:bg-[var(--table-hover)]`}
                    >
                      <label className="flex items-center gap-2 w-full cursor-pointer text-secondary font-gotham-medium">
                        <input
                          type="radio"
                          name="icdSuggestion"
                          value={item.code}
                          checked={isSelected}
                          onChange={() => setSelected(item)}
                          className="accent-[var(--primary-blue)]"
                        />
                        <span>
                          <strong>{item.code}</strong>: {item.description}
                        </span>
                      </label>
                    </li>
                  );
                })}
              </ul>
            </>
          )}
        </div>
      </div>

      {/* Confirm Button */}
      {suggestions.length > 0 && (
        <div className="mt-6">
          <Button
            variant="primary"
            paddingLevel={3}
            disabled={!selectedCode.code}
            onClick={() => onSelect(selectedCode.code, selectedCode.description, selectedCode.id)}
          >
            Confirm Selection
          </Button>
        </div>
      )}
    </div>
  );
};

export default DiagnosisCodeSuggestions;
