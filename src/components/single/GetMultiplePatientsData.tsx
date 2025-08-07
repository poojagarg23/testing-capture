import { useState, useEffect, useCallback } from 'react';
import {
  fetchAuthorizedProviders,
  formatProviderName,
  authorizedTitles,
  fetchUserDetails,
  uploadFacesheetApi,
} from '../../helpers';
import { toast } from 'react-toastify';
import AddMultiplePatients from './AddMultiplePatients';
import PatientDetails from './PatientDetails';
import CircularProgress from '@mui/material/CircularProgress';
import Button from '../reusable/custom/Button';
import Dropdown from '../reusable/custom/Dropdown';
import { Provider } from '../../types';
import { Patient } from '../../types/Patient.types';
import { FacesheetFile } from '../../types/Facesheet.types';
import FileUploadArea from '../reusable/FileUploadArea';
import FileAttachment from '../reusable/FileAttachment';
import { TOAST_CONFIG } from '../../constants';

interface GetMultiplePatientsDataProps {
  onContentChange?: (contentType: 'upload' | 'details' | 'multiple') => void;
  onClose?: () => void;
  onRefetch?: () => void;
}

const GetMultiplePatientsData: React.FC<GetMultiplePatientsDataProps> = ({
  onContentChange,
  onClose,
  onRefetch,
}) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [facesheets, setFacesheets] = useState<FacesheetFile[]>([]);
  const [visittype, setVisitType] = useState<'inpatient' | 'consult' | ''>('inpatient');
  const [patients, setPatients] = useState<Patient[]>([]);
  const [owningProvider, setOwningProvider] = useState<string>('');
  const [authorizedProviders, setAuthorizedProviders] = useState<Provider[]>([]);
  const [showPatientDetails, setShowPatientDetails] = useState<boolean>(false);
  const [singlePatient, setSinglePatient] = useState<Patient | null>(null);
  const [dragActive, setDragActive] = useState<boolean>(false);

  const fetchData = useCallback(async () => {
    try {
      const [userData, providers] = await Promise.all([
        fetchUserDetails(),
        fetchAuthorizedProviders(),
      ]);

      if (userData && providers) {
        setAuthorizedProviders(providers);
        if (authorizedTitles.includes(userData.title)) {
          setOwningProvider(userData.id.toString());
        }
      }
    } catch (error) {
      console.warn(error);
    }
  }, []);

  const handleSkipFacesheet = async () => {
    const formData = new FormData();
    formData.append('owning_provider_id', owningProvider);

    try {
      setLoading(true);
      const response = await uploadFacesheetApi(formData);
      setSinglePatient(response);
      setShowPatientDetails(true);
      onContentChange?.('details');
    } catch (error) {
      console.error('Error initializing patient data:', error);
      toast.error('Error initializing patient data', TOAST_CONFIG.ERROR);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const uploadFacesheet = async () => {
    if (facesheets.length === 0) {
      toast.error('Please select face sheet files', TOAST_CONFIG.ERROR);
      return;
    }

    if (visittype === '') {
      toast.error('Please select a visit type', TOAST_CONFIG.ERROR);
      return;
    }

    if (owningProvider === '') {
      toast.error('Please select owning provider', TOAST_CONFIG.ERROR);
      return;
    }

    try {
      setLoading(true);

      const uploadPromises = facesheets.map((file) => {
        const formData = new FormData();
        formData.append('facesheet', file);
        formData.append('visittype', visittype);
        formData.append('owning_provider_id', owningProvider);
        return uploadFacesheetApi(formData);
      });

      const results = await Promise.all(uploadPromises);
      const patientsArray: Patient[] = [];
      results.forEach((result) => {
        const patient = result;
        patientsArray.push(patient);
      });
      setPatients(patientsArray);
      toast.success('All facesheets uploaded successfully', TOAST_CONFIG.SUCCESS);
      setFacesheets([]);
      onContentChange?.('multiple');
    } catch (error) {
      toast.error('Error uploading some facesheets', TOAST_CONFIG.ERROR);
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Handle single file selection from FileUploadArea
  const handleFileSelect = (file: File) => {
    const allowedExtensions = /(\.jpg|\.jpeg|\.png|\.pdf)$/i;
    if (!allowedExtensions.exec(file.name)) {
      toast.error(`${file.name} is not a valid file type`, TOAST_CONFIG.ERROR);
      return;
    }

    // Check if file already exists in facesheets array
    const isDuplicate = facesheets.some(
      (existingFile) =>
        existingFile.name === file.name &&
        existingFile.size === file.size &&
        existingFile.lastModified === file.lastModified,
    );

    if (isDuplicate) {
      toast.error(
        `${file.name} has already been selected. Please choose a different file.`,
        TOAST_CONFIG.ERROR,
      );
      return;
    }

    setFacesheets((prev) => [...prev, file as FacesheetFile]);
  };

  return (
    <div className="w-full">
      {showPatientDetails ? (
        <PatientDetails
          patient={singlePatient as Patient}
          mode="add"
          subMode="edit"
          onClose={onClose}
          onRefetch={onRefetch}
        />
      ) : patients.length > 0 ? (
        <AddMultiplePatients
          patients={patients}
          owningProvider={Number(owningProvider)}
          onClose={onClose}
          onRefetch={onRefetch}
        />
      ) : (
        <div className="flex flex-col gap-6">
          {/* Provider */}
          <div>
            <label className="block text-sm font-gotham-medium text-secondary mb-2">
              Provider <span className="text-red-500">*</span>
            </label>
            <Dropdown
              options={authorizedProviders.map((provider) => ({
                label: formatProviderName(provider),
                value: provider.id.toString(),
              }))}
              value={owningProvider}
              onChange={(val) => setOwningProvider(val as string)}
              placeholder="Select Provider"
              multiple={false}
              className="rounded-full"
              fullWidth={true}
            />
          </div>

          {/* Visit Type */}
          <div>
            <label className="block text-sm font-gotham-bold text-secondary mb-2">Visit Type</label>
            <div className="flex gap-4">
              <Button
                variant={visittype === 'inpatient' ? 'primary' : 'white'}
                className="px-6 py-2 text-xs"
                onClick={() => setVisitType('inpatient')}
                paddingLevel={4}
              >
                Inpatient
              </Button>
              <Button
                variant={visittype === 'consult' ? 'primary' : 'white'}
                className="px-6 py-2 text-xs"
                onClick={() => setVisitType('consult')}
                paddingLevel={4}
              >
                Consult
              </Button>
            </div>
          </div>

          {/* Upload Area */}
          <FileUploadArea
            onFileSelect={handleFileSelect}
            dragActive={dragActive}
            onDragStateChange={setDragActive}
            multiple={true}
          />

          {/* Selected Files Display */}
          {facesheets.length > 0 && (
            <div className="flex flex-col gap-2">
              {facesheets.map((file, idx) => (
                <FileAttachment
                  key={idx}
                  file={file}
                  onRemove={() => setFacesheets((prev) => prev.filter((_, i) => i !== idx))}
                />
              ))}
            </div>
          )}

          {/* Upload Button */}
          {loading ? (
            <div className="w-full bg-primary-gradient text-white rounded-[50px] py-3 font-gotham-bold text-sm shadow flex items-center justify-center gap-2">
              <CircularProgress size={20} color="inherit" />
              <span>Processing...</span>
            </div>
          ) : (
            <Button
              variant="primary"
              className="w-full py-3 text-sm font-gotham-bold"
              onClick={uploadFacesheet}
            >
              Upload Face Sheets
            </Button>
          )}

          {/* Skip Link */}
          <div
            onClick={handleSkipFacesheet}
            className="text-xs underline text-center text-secondary font-gotham-medium cursor-pointer hover:text-blue-600"
            style={{ lineHeight: '18px' }}
          >
            Skip Uploading
          </div>
        </div>
      )}
    </div>
  );
};

export default GetMultiplePatientsData;
