import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import GetMultiplePatientsData from '../single/GetMultiplePatientsData.tsx';
import AddSinglePatient from '../single/AddSinglePatient';
import ToggleButton from '../reusable/custom/ToggleButton.tsx';
import { getTokenFromLocalStorage } from '../../helpers';
import { PatientSubMode } from '../../types/Patient.types.ts';
import PageHeader from '../reusable/custom/PageHeader.tsx';
import type { Patient } from '../../types/Patient.types.ts';
import { formatDisplayDate, isDateValid } from '../../helpers/dateUtils.ts';

const capitalize = (str: string | undefined): string =>
  str ? str.charAt(0).toUpperCase() + str.slice(1).toLowerCase() : '';

const Patient: React.FC = () => {
  const location = useLocation();
  const mode = location?.state?.mode;
  const patient: Patient | undefined = location?.state?.patient;
  const [subMode, setSubMode] = useState<PatientSubMode>('view');
  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  const navigate = useNavigate();

  useEffect(() => {
    const accessToken = getTokenFromLocalStorage();
    if (!accessToken) {
      navigate('/signin');
    }
  }, [navigate]);

  const handleToggleEditMode = () => {
    const newEditMode = !isEditMode;
    setIsEditMode(newEditMode);
    setSubMode(newEditMode ? 'edit' : 'view');
  };

  return (
    <div className="w-full h-full bg-white rounded-2xl shadow-lg px-4 sm:px-6  py-2 md:py-6 flex flex-col">
      <div className="flex note-list-text flex-col gap-4  lg:flex-row lg:items-center lg:justify-between mb-6">
        <PageHeader
          title={mode === 'add' ? 'Add Patients' : 'Patient Details'}
          showBackButton={true}
          titleClassName="text-2xl"
        />
        {patient && (
          <div className="flex flex-col landscape-row lg:flex-row lg:items-center gap-4 lg:gap-10 p-4 bg-white rounded-md shadow-sm border border-input">
            <div className="flex flex-row items-center  lg:flex-col gap-4 lg:gap-1">
              <span className="text-xs text-muted font-gotham tracking-wide uppercase">
                Patient Name
              </span>
              <span className="font-gotham-bold text-sm 2xl:text-base text-secondary">
                {capitalize(patient.lastname)}, {capitalize(patient.firstname)}
              </span>
            </div>

            <div className="flex  flex-row items-center gap-4 lg:flex-col lg:gap-1">
              <span className="text-xs text-muted  font-gotham tracking-wide uppercase">
                Date of Birth
              </span>
              <span className="font-gotham-medium text-base text-secondary">
                {patient.dateofbirth && isDateValid(patient.dateofbirth)
                  ? formatDisplayDate(patient.dateofbirth)
                  : '-'}
              </span>
            </div>
          </div>
        )}

        {mode !== 'add' && (
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-8">
            <div className="flex items-center gap-3">
              <ToggleButton
                checked={isEditMode}
                onChange={handleToggleEditMode}
                title="Toggle Edit Mode"
              />
              <span className="text-sm text-muted font-gotham hidden sm:inline">
                Turn on to make changes to patient information.
              </span>
            </div>
          </div>
        )}
      </div>

      <div className="flex-1 min-h-0 overflow-hidden">
        {mode === 'add' ? (
          <GetMultiplePatientsData />
        ) : (
          <AddSinglePatient subMode={subMode} location={location} />
        )}
      </div>
    </div>
  );
};

export default Patient;
