import React, { useState, useEffect, useRef, useCallback } from 'react';
import { toast } from 'react-toastify';
import CustomModal from './CustomModal';
import Button from './custom/Button';
import InputField from './custom/InputField';
import Dropdown from './custom/Dropdown';
import CustomCheckbox from './CustomCheckbox';
import StatusToggle from './StatusToggle';
import { Hospital, Provider } from '../../types/index';
import { fetchHospitals, fetchAuthorizedProviders } from '../../helpers/index';
import ToggleButton from './custom/ToggleButton';
import { Tooltip } from '@mui/material';
import {
  formatDisplayDate,
  formatISODate,
  isDateValid,
  calculateAge,
} from '../../helpers/dateUtils';
import { TOAST_CONFIG } from '../../constants';
import ConfirmationModal from './ConfirmationModal.tsx';

interface AddConsultModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave?: (consultData: Record<string, string | number | boolean>) => Promise<void>;
  mode?: 'add' | 'view' | 'edit';
  initialData?: Partial<ConsultFormData>;
  onEdit?: () => void;
}

export interface ConsultFormData {
  id?: string | number;
  firstName: string;
  lastName: string;
  room: string;
  visitDate?: string;
  followupDate?: string;
  dateOfBirth: string;
  insuranceCarrier: string;
  rehabDiagnosis: string;
  rehabRecs: string;
  dateRequested: string;
  timeRequested: string;
  notes: string;
  hospitalFacilityName: string;
  owningProvider: string;
  status: 'open' | 'resolved';
  smsAlert: boolean;
}

const AddConsultModal: React.FC<AddConsultModalProps> = ({
  isOpen,
  onClose,
  onSave,
  mode = 'add',
  initialData,
  onEdit,
}) => {
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [providers, setProviders] = useState<Provider[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isEditMode, setIsEditMode] = useState(mode === 'add' || mode === 'edit');

  // Reset edit mode when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setIsEditMode(mode === 'add' || mode === 'edit');
    }
  }, [isOpen, mode]);

  // Helper functions for default values
  const getCurrentTime = () => {
    const now = new Date();
    return now.toTimeString().slice(0, 5); // Format: HH:MM
  };

  const getTodayDate = () => {
    return formatISODate(new Date());
  };
  const [formData, setFormData] = useState<ConsultFormData>({
    id: initialData?.id || undefined,
    firstName: '',
    lastName: '',
    room: '',
    // visitDate and followupDate are optional, so they're undefined by default
    dateOfBirth: '',
    insuranceCarrier: '',
    rehabDiagnosis: '',
    rehabRecs: '',
    dateRequested: getTodayDate(),
    timeRequested: getCurrentTime(),
    notes: '',
    hospitalFacilityName: '',
    owningProvider: '',
    status: 'open',
    smsAlert: true,
  });

  useEffect(() => {
    const loadData = async () => {
      const [hospitalsData, providersData] = await Promise.all([
        fetchHospitals(),
        fetchAuthorizedProviders(),
      ]);
      setHospitals(hospitalsData);
      setProviders(providersData);
    };

    if (isOpen) {
      loadData();

      if (mode === 'add') {
        // Refresh time when modal opens for add mode
        setFormData((prev) => ({
          ...prev,
          id: undefined,
          timeRequested: getCurrentTime(),
          dateRequested: getTodayDate(),
        }));
      } else if (initialData) {
        // Load initial data for view/edit mode and ensure id is preserved
        const updatedData = {
          ...formData,
          ...initialData,
          id: initialData.id,
          // Keep the dates as is since they're already formatted in transformConsultToFormData
          visitDate: formatISODate(initialData.visitDate) || '',
          followupDate: formatISODate(initialData.followupDate) || '',
          dateOfBirth: formatISODate(initialData.dateOfBirth) || '',
          dateRequested: formatISODate(initialData.dateRequested) || getTodayDate(),
          timeRequested: initialData.timeRequested || getCurrentTime(),
          status: initialData.status || 'open',
          smsAlert: initialData.smsAlert ?? true,
        };
        setFormData(updatedData);
      }
    }
  }, [isOpen, mode, initialData]);

  /* ---------------------------------------------------------------
   * DOB validation helpers & modal state
   * ------------------------------------------------------------- */

  const validateDOB = useCallback((dobStr: string): 'ok' | 'under' | 'over' | 'future' => {
    if (!dobStr || !isDateValid(dobStr)) return 'ok';

    const dobDate = new Date(dobStr);

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    dobDate.setHours(0, 0, 0, 0);

    if (dobDate >= today) return 'future';

    const ageVal = calculateAge(dobStr);
    if (ageVal !== null) {
      if (ageVal < 18) return 'under';
      if (ageVal > 130) return 'over';
    }
    return 'ok';
  }, []);

  const [dobWarningType, setDobWarningType] = useState<'under' | 'over' | 'future' | null>(null);
  const pendingSaveRef = useRef<() => void>(() => {});

  const handleInputChange = (field: keyof ConsultFormData, value: string | boolean) => {
    if (!isEditMode && mode !== 'add') return; // Prevent changes if not in edit mode

    setFormData((prev) => {
      // Create a new object with all previous values
      const newData = { ...prev };

      // Update only the specific field
      if (
        typeof value === 'string' &&
        (field === 'visitDate' ||
          field === 'followupDate' ||
          field === 'dateOfBirth' ||
          field === 'dateRequested')
      ) {
        // For date fields, ensure we're using the correct format
        (newData[field] as string) = value.split('T')[0];
      } else {
        (newData[field] as typeof value) = value;
      }

      return newData;
    });
  };

  const handleSave = async (skipDobCheck = false) => {
    if (!onSave) return;

    // Validate DOB unless skipped (after user confirmation)
    if (!skipDobCheck) {
      const dobResult = validateDOB(formData.dateOfBirth);
      if (dobResult !== 'ok') {
        setDobWarningType(dobResult);
        pendingSaveRef.current = () => handleSave(true);
        return;
      }
    }

    // Basic validation
    const requiredFields = [
      { field: 'firstName', label: 'First Name' },
      { field: 'lastName', label: 'Last Name' },
      { field: 'dateOfBirth', label: 'Date of Birth' },
      { field: 'hospitalFacilityName', label: 'Hospital Facility Name' },
      { field: 'owningProvider', label: 'Owning Provider' },
      { field: 'dateRequested', label: 'Date Requested' },
      { field: 'timeRequested', label: 'Time Requested' },
    ];

    const missingFields = requiredFields.filter(
      ({ field }) => !formData[field as keyof ConsultFormData],
    );

    if (missingFields.length > 0) {
      const missingFieldNames = missingFields.map(({ label }) => label).join(', ');
      toast.error(
        `Please fill in the following required fields: ${missingFieldNames}`,
        TOAST_CONFIG.ERROR,
      );
      return;
    }

    // Clean up the form data before sending to backend - only include fields with values
    const cleanedFormData: Record<string, string | number | boolean> = {};

    // Always include required fields
    const requiredFieldsData = {
      id: formData.id,
      firstName: formData.firstName,
      lastName: formData.lastName,
      dateOfBirth: formData.dateOfBirth,
      hospitalFacilityName: formData.hospitalFacilityName,
      owningProvider: formData.owningProvider,
      dateRequested: formData.dateRequested,
      timeRequested: formData.timeRequested,
      status: formData.status,
      smsAlert: formData.smsAlert,
    };

    // Add all required fields
    Object.entries(requiredFieldsData).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        cleanedFormData[key] = value;
      }
    });

    // Add optional fields (excluding rehabRecs) only if they have non-empty values
    const optionalFields = {
      room: formData.room,
      visitDate: formData.visitDate,
      followupDate: formData.followupDate,
      insuranceCarrier: formData.insuranceCarrier,
      rehabDiagnosis: formData.rehabDiagnosis,
      notes: formData.notes,
    };

    Object.entries(optionalFields).forEach(([key, value]) => {
      if (
        value !== null &&
        value !== undefined &&
        value !== '' &&
        String(value).trim() !== '' &&
        String(value) !== 'undefined'
      ) {
        cleanedFormData[key] = value;
      }
    });

    // Always include rehabRecs so that selecting "Select an option" sends a blank string to clear it
    cleanedFormData.rehabRecs = formData.rehabRecs;

    setIsLoading(true);
    try {
      await onSave(cleanedFormData);
      onClose();
      // Reset form with default values only in add mode
      if (mode === 'add') {
        setFormData({
          id: undefined,
          firstName: '',
          lastName: '',
          room: '',
          visitDate: '',
          followupDate: '',
          dateOfBirth: '',
          insuranceCarrier: '',
          rehabDiagnosis: '',
          rehabRecs: '',
          dateRequested: getTodayDate(),
          timeRequested: getCurrentTime(),
          notes: '',
          hospitalFacilityName: '',
          owningProvider: '',
          status: 'open',
          smsAlert: true,
        });
      }
    } catch (error) {
      console.error('Error saving consult:', error);
      // Error handling is done in the parent component
    } finally {
      setIsLoading(false);
    }
  };

  const rehabRecsOptions = [
    { label: 'Select Rehab Rec', value: '' },
    { label: 'IRF', value: 'IRF' },
    { label: 'SNF', value: 'SNF' },
    { label: 'HH', value: 'HH' },
    { label: 'Other', value: 'Other' },
  ];

  const getModalTitle = () => {
    if (mode === 'view') return isEditMode ? 'Edit Consult' : 'View Consult';
    if (mode === 'edit') return 'Edit Consult';
    return 'Consult Details';
  };
  const handleToggleEditMode = () => {
    const newEditMode = !isEditMode;
    setIsEditMode(newEditMode);
    if (newEditMode && onEdit) {
      onEdit();
    }
  };

  /* ---------------------------- DOB Modal ---------------------------- */

  const renderDobModal = () => (
    <ConfirmationModal
      open={dobWarningType !== null}
      onClose={() => setDobWarningType(null)}
      onConfirm={() => {
        if (dobWarningType === 'future') {
          setDobWarningType(null);
          return;
        }
        const fn = pendingSaveRef.current;
        setDobWarningType(null);
        fn();
      }}
      title="Date of Birth Warning"
      message={
        dobWarningType === 'under'
          ? 'Patient is under 18 years old. Do you want to continue?'
          : dobWarningType === 'over'
            ? 'Patient age appears to be greater than 130 years. Do you want to continue?'
            : 'Date of Birth cannot be in the future. Please review and update the date.'
      }
      confirmText={dobWarningType === 'future' ? 'Close' : 'Continue'}
      cancelText={dobWarningType === 'future' ? 'Back' : 'Back'}
    />
  );

  return (
    <CustomModal
      isOpen={isOpen}
      onClose={isLoading ? () => {} : onClose}
      title={getModalTitle()}
      className="max-w-4xl"
    >
      <div className="p-6">
        {/* Edit Mode Toggle - Only show in view mode */}
        {mode === 'view' && (
          <div className="flex items-center gap-3 mb-10">
            <ToggleButton
              checked={isEditMode}
              title="Toggle Edit Mode"
              onChange={handleToggleEditMode} // Add this line
            />
            <span className="text-xs lg:text-sm font-gotham-medium text-secondary">
              Turn on to make changes to consult information.
            </span>
          </div>
        )}

        {/* Form Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-8">
          {/* Row 1 */}
          <div className="w-full">
            <label className="block text-sm font-gotham-normal text-secondary mb-2">
              Last Name {isEditMode && <span className="text-error">*</span>}
            </label>
            {isEditMode ? (
              <InputField
                placeholder="Last Name"
                alphaOnly
                value={formData.lastName}
                onChange={(e) => handleInputChange('lastName', e.target.value)}
                required
              />
            ) : (
              <div className="text-base 2xl:text-lg text-secondary font-gotham-medium">
                {formData.lastName || '-'}
              </div>
            )}
          </div>
          <div className="w-full">
            <label className="block text-sm font-gotham-medium text-secondary mb-2">
              First Name {isEditMode && <span className="text-error">*</span>}
            </label>
            {isEditMode ? (
              <InputField
                placeholder="First Name"
                alphaOnly
                value={formData.firstName}
                onChange={(e) => handleInputChange('firstName', e.target.value)}
                required
              />
            ) : (
              <div className="text-base 2xl:text-lg text-secondary font-gotham-medium">
                {formData.firstName || '-'}
              </div>
            )}
          </div>

          <div className="w-full">
            <label className="block text-sm font-gotham-normal text-secondary mb-2">Room</label>
            {isEditMode ? (
              <InputField
                placeholder="Room Number"
                value={formData.room}
                onChange={(e) => handleInputChange('room', e.target.value)}
              />
            ) : (
              <div className="text-base 2xl:text-lg text-secondary font-gotham-medium">
                {formData.room || '-'}
              </div>
            )}
          </div>

          {/* Row 2 */}
          <div className="w-full">
            <label className="block text-sm font-gotham-normal text-secondary mb-2">
              Visit Date
            </label>
            {isEditMode ? (
              <InputField
                type="date"
                value={
                  formData.visitDate && isDateValid(formData.visitDate)
                    ? formatISODate(formData.visitDate)
                    : ''
                }
                onChange={(e) => handleInputChange('visitDate', e.target.value)}
              />
            ) : (
              <div className="text-base 2xl:text-lg text-secondary font-gotham-medium">
                {formData.visitDate && isDateValid(formData.visitDate)
                  ? formatDisplayDate(formData.visitDate)
                  : '-'}
              </div>
            )}
          </div>
          <div className="w-full">
            <label className="block text-sm font-gotham-normal text-secondary mb-2">
              Follow up Date
            </label>
            {isEditMode ? (
              <InputField
                type="date"
                value={
                  formData.followupDate && isDateValid(formData.followupDate)
                    ? formatISODate(formData.followupDate)
                    : ''
                }
                onChange={(e) => handleInputChange('followupDate', e.target.value)}
              />
            ) : (
              <div className="text-base 2xl:text-lg text-secondary font-gotham-medium">
                {formData.followupDate && isDateValid(formData.followupDate)
                  ? formatDisplayDate(formData.followupDate)
                  : '-'}
              </div>
            )}
          </div>
          <div className="w-full">
            <label className="block text-sm font-gotham-normal text-secondary mb-2">
              Date of Birth {isEditMode && <span className="text-error">*</span>}
            </label>
            {isEditMode ? (
              <InputField
                type="date"
                value={
                  formData.dateOfBirth && isDateValid(formData.dateOfBirth)
                    ? formatISODate(formData.dateOfBirth)
                    : ''
                }
                onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                required
              />
            ) : (
              <div className="text-base 2xl:text-lg text-secondary font-gotham-medium">
                {formData.dateOfBirth && isDateValid(formData.dateOfBirth)
                  ? formatDisplayDate(formData.dateOfBirth)
                  : '-'}
              </div>
            )}
          </div>

          {/* Row 3 */}
          <div className="w-full">
            <label className="block text-sm font-gotham-normal text-secondary mb-2">
              Insurance Carrier
            </label>
            {isEditMode ? (
              <InputField
                placeholder="Insurance Carrier"
                value={formData.insuranceCarrier}
                onChange={(e) => handleInputChange('insuranceCarrier', e.target.value)}
              />
            ) : (
              <div className="text-base 2xl:text-lg text-secondary font-gotham-medium">
                {formData.insuranceCarrier || '-'}
              </div>
            )}
          </div>
          <div className="w-full">
            <label className="block text-sm font-gotham-normal text-secondary mb-2">
              Rehab Diagnosis
            </label>
            {isEditMode ? (
              <InputField
                placeholder="Rehab Diagnosis"
                value={formData.rehabDiagnosis}
                onChange={(e) => handleInputChange('rehabDiagnosis', e.target.value)}
              />
            ) : (
              <Tooltip
                title={formData.rehabDiagnosis ? formData.rehabDiagnosis : 'No data available'}
                placement="top"
              >
                <div className="text-base 2xl:text-lg text-secondary truncate font-gotham-medium">
                  {formData.rehabDiagnosis || '-'}
                </div>
              </Tooltip>
            )}
          </div>
          <div className="w-full">
            <label className="block text-sm font-gotham-normal text-secondary mb-2">
              Rehab Recs
            </label>
            {isEditMode ? (
              <Dropdown
                options={rehabRecsOptions}
                value={formData.rehabRecs}
                onChange={(val) => handleInputChange('rehabRecs', val as string)}
                placeholder="Select Rehab Recs"
                className="w-full"
              />
            ) : (
              <div className="text-base 2xl:text-lg text-secondary font-gotham-medium">
                {formData.rehabRecs || '-'}
              </div>
            )}
          </div>

          {/* Row 4 */}
          <div className="w-full">
            <label className="block text-sm font-gotham-normal text-secondary mb-2">
              Date Requested {isEditMode && <span className="text-error">*</span>}
            </label>
            {isEditMode ? (
              <InputField
                type="date"
                value={
                  formData.dateRequested && isDateValid(formData.dateRequested)
                    ? formatISODate(formData.dateRequested)
                    : ''
                }
                onChange={(e) => handleInputChange('dateRequested', e.target.value)}
                required
              />
            ) : (
              <div className="text-base 2xl:text-lg text-secondary font-gotham-medium">
                {formData.dateRequested && isDateValid(formData.dateRequested)
                  ? formatDisplayDate(formData.dateRequested)
                  : '-'}
              </div>
            )}
          </div>
          <div className="w-full">
            <label className="block text-sm font-gotham-normal text-secondary mb-2">
              Time Requested {isEditMode && <span className="text-error">*</span>}
            </label>
            {isEditMode ? (
              <InputField
                type="time"
                placeholder="17:25"
                value={formData.timeRequested}
                onChange={(e) => handleInputChange('timeRequested', e.target.value)}
                required
              />
            ) : (
              <div className="text-base 2xl:text-lg text-secondary font-gotham-medium">
                {formData.timeRequested || '-'}
              </div>
            )}
          </div>
          <div className="w-full">
            <label className="block text-sm font-gotham-normal text-secondary mb-2">Notes</label>
            {isEditMode ? (
              <InputField
                placeholder="Notes"
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
              />
            ) : (
              <div className="text-base 2xl:text-lg text-secondary font-gotham-medium">
                {formData.notes || '-'}
              </div>
            )}
          </div>

          {/* Row 5 */}
          <div className="w-full">
            <label className="block text-sm font-gotham-normal text-secondary mb-2">
              Hospital Facility Name {isEditMode && <span className="text-error">*</span>}
            </label>
            {isEditMode ? (
              <Dropdown
                options={hospitals.map((h) => ({
                  label: `${h.abbreviation} (${h.hospital})`,
                  value: h.id.toString(),
                }))}
                value={formData.hospitalFacilityName}
                onChange={(val) => handleInputChange('hospitalFacilityName', val as string)}
                placeholder="Select Place of Service"
                className="w-full"
              />
            ) : (
              <div className="text-base 2xl:text-lg text-secondary font-gotham-medium">
                {hospitals.find((h) => h.id.toString() === formData.hospitalFacilityName)
                  ?.abbreviation || '-'}
              </div>
            )}
          </div>
          <div className="w-full">
            <label className="block text-sm font-gotham-normal text-secondary mb-2">
              Owning Provider {isEditMode && <span className="text-error">*</span>}
            </label>
            {isEditMode ? (
              <Dropdown
                options={providers.map((p) => ({
                  label: `${p.title} ${p.firstname} ${p.lastname}`,
                  value: p.id.toString(),
                }))}
                value={formData.owningProvider}
                onChange={(val) => handleInputChange('owningProvider', val as string)}
                placeholder="Select Owning Provider"
                className="w-full"
              />
            ) : (
              <div className="text-base 2xl:text-lg text-secondary font-gotham-medium">
                {providers.find((p) => p.id.toString() === formData.owningProvider)?.firstname
                  ? `${providers.find((p) => p.id.toString() === formData.owningProvider)?.title} ${providers.find((p) => p.id.toString() === formData.owningProvider)?.firstname} ${providers.find((p) => p.id.toString() === formData.owningProvider)?.lastname}`
                  : '-'}
              </div>
            )}
          </div>

          {/* Status Toggle */}
          <div className="w-full">
            {isEditMode ? (
              <StatusToggle
                label="Status"
                value={formData.status}
                onChange={(value) => handleInputChange('status', value)}
                required
              />
            ) : (
              <div className="w-full">
                <label className="block text-sm font-gotham-normal text-secondary mb-2">
                  Status
                </label>
                <div className="text-base 2xl:text-lg text-secondary font-gotham-medium">
                  {formData.status === 'open' ? 'Open' : 'Resolved'}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* SMS Alert Checkbox and Save Button - Only show in add/edit mode */}
        {mode === 'add' && (
          <div className="mb-6 border-t border-subtle pt-6">
            <CustomCheckbox
              checked={formData.smsAlert}
              onChange={(e) => handleInputChange('smsAlert', e.target.checked)}
              label="Send SMS Alert"
              className="text-secondary text-sm"
            />
          </div>
        )}
        {(mode === 'add' || isEditMode) && (
          <div className={`flex justify-center ${mode !== 'add' ? 'mt-6' : ''}`}>
            <Button
              onClick={() => handleSave()}
              disabled={isLoading}
              className={`w-full font-gotham-medium rounded-lg px-8 py-3 text-base transition-colors duration-200 ${
                isLoading ? 'bg-disabled cursor-not-allowed' : 'bg-primary-gradient text-white'
              }`}
            >
              {isLoading ? 'Saving...' : mode === 'add' ? 'Save' : 'Update'}
            </Button>
          </div>
        )}

        {/* DOB confirmation modal */}
        {renderDobModal()}
      </div>
    </CustomModal>
  );
};

export default AddConsultModal;
