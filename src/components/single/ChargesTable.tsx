import { useState, useEffect } from 'react';
import { setPatientOrder } from '../../helpers/Charges/charges-table/index.js';
import { Patient } from '../../types/Patient.types.ts';
import { ChargesTableProps } from '../../types/ChargesTable.types.ts';
import Table, { TableColumn } from '../reusable/custom/Table.tsx';
import {
  capitalizeNames,
  capitalizeVisitType,
  ViewFacesheet,
  updatePatientCharges,
  attachSharedVisitsToAdmission,
  updateAdmitDate,
} from '../../helpers/index.ts';
import Open from '../../assets/icons/open.svg?react';
import Cross from '../../assets/icons/facesheet_cross.svg?react';
import HoverContent from '../reusable/HoverContent.tsx';
import DiagnosisSummary from '../reusable/DiagnosisSummary.tsx';
import { useNavigate } from 'react-router-dom';
import { formatDisplayDate, isDateValid, formatISODate } from '../../helpers/dateUtils.ts';
import Dropdown from '../reusable/custom/Dropdown.tsx';
import InputField from '../reusable/custom/InputField.tsx';
import ConfirmationModal from '../reusable/ConfirmationModal.tsx';
import { toast } from 'react-toastify';
import { TOAST_CONFIG } from '../../constants/index.ts';
import { VisitCode, PatientChargeUpdate, AttachSharedVisitPayload } from '../../types/index.ts';
import { MultiValue, SingleValue } from 'react-select';

function ChargesTable({
  setIsAllSelected,
  setSelectedPatients,
  patients,
  selectedPatients,
  isEditMode,
  visitCodes,
  sharedVisitUsers,
  setPatients,
}: ChargesTableProps) {
  const [rows, setRows] = useState<Patient[]>([]);
  const [loadingFacesheet, setLoadingFacesheet] = useState<number | null>(null);
  const [showFutureAdmitError, setShowFutureAdmitError] = useState<boolean>(false);
  const [sortOrder, setSortOrder] = useState<{
    column: string | null;
    order: 'asc' | 'desc' | null;
  }>({ column: null, order: null });
  const navigate = useNavigate();

  useEffect(() => {
    setRows(patients);
  }, [patients]);

  const handleDragEnd = async (newData: Patient[]) => {
    setRows(newData);
    try {
      await setPatientOrder(newData);
    } catch (error) {
      console.error('Error updating patient order:', error);
    }
  };

  const handleVisitCodeChange = async (
    selectedOptions: MultiValue<VisitCode>,
    patient: Patient,
  ) => {
    try {
      const ids_array: {
        patientId: number;
        chargesId: number | null;
        charges_page_id: number | null;
        admission_id: number;
      }[] = [];
      const visit_codes = selectedOptions.map((option) => ({
        id: option.id,
        visit_code: option.visit_code,
        description: option.description,
      }));

      if (selectedOptions.length > 0) {
        selectedOptions.forEach((visitCode) => {
          ids_array.push({
            patientId: patient.patient_id,
            chargesId: visitCode.id ?? null,
            charges_page_id: patient.charges_page_id ?? null,
            admission_id: patient.id,
          });
        });
      } else {
        ids_array.push({
          patientId: patient.patient_id,
          chargesId: null,
          charges_page_id: patient.charges_page_id ?? null,
          admission_id: patient.id,
        });
      }
      await updatePatientCharges(ids_array as PatientChargeUpdate[]);

      if (setPatients) {
        setPatients((prevPatients) =>
          prevPatients.map((p) =>
            p.patient_id === patient.patient_id ? { ...p, visit_codes } : p,
          ),
        );
      }
      toast.success('Visit codes updated successfully', TOAST_CONFIG.SUCCESS);
    } catch (error) {
      console.error('Failed to update visit codes:', error);
      toast.error('Failed to update visit codes', TOAST_CONFIG.ERROR);
    }
  };

  const handleSharedVisitChange = async (
    selectedOption: SingleValue<{ value: number | undefined; label: string }>,
    patient: Patient,
  ) => {
    try {
      const ids_array: {
        patientId: number;
        sharedVisitId: number[] | null;
        charges_page_id: number | null;
        admission_id: number;
      }[] = [];

      const shared_visits = selectedOption
        ? [
            {
              id: selectedOption.value,
              name: selectedOption.label,
            },
          ]
        : [];

      if (selectedOption?.value) {
        ids_array.push({
          patientId: patient.patient_id,
          sharedVisitId: [selectedOption?.value],
          charges_page_id: patient.charges_page_id ?? null,
          admission_id: patient.id,
        });
      } else {
        ids_array.push({
          patientId: patient.patient_id,
          sharedVisitId: null,
          charges_page_id: patient.charges_page_id ?? null,
          admission_id: patient.id,
        });
      }
      await attachSharedVisitsToAdmission(ids_array as AttachSharedVisitPayload[]);

      if (setPatients) {
        setPatients((prevPatients) =>
          prevPatients.map((p) => (p.id === patient.id ? { ...p, shared_visits } : p)),
        );
      }
      toast.success('Shared visit updated successfully', TOAST_CONFIG.SUCCESS);
    } catch (error) {
      console.error('Failed to update shared visits:', error);
      toast.error('Failed to update shared visit', TOAST_CONFIG.ERROR);
    }
  };

  const handleAdmitDateChange = async (date: string, patient: Patient) => {
    if (date && isDateValid(date)) {
      const admit = new Date(date);
      const today = new Date();
      admit.setHours(0, 0, 0, 0);
      today.setHours(0, 0, 0, 0);
      if (admit > today) {
        setShowFutureAdmitError(true);
        return;
      }
    }
    try {
      const isSuccess = await updateAdmitDate(patient.id, date);

      if (isSuccess && setPatients) {
        setPatients((prevPatients) =>
          prevPatients.map((p) => (p.id === patient.id ? { ...p, admitdate: date } : p)),
        );
      }
    } catch (error) {
      console.error('Failed to update admit date:', error);
    }
  };

  const handleViewFacesheet = async (e: React.MouseEvent<HTMLButtonElement>, patient: Patient) => {
    e.stopPropagation();
    setLoadingFacesheet(patient.id);

    try {
      const url = await ViewFacesheet(patient?.id, patient?.facesheetalias);
      window.open(url, '_blank');
    } catch (error) {
      console.error('Error viewing facesheet:', error);
    } finally {
      setLoadingFacesheet(null);
    }
  };

  const EditDetails = (patient: Partial<Patient>) => {
    navigate('/patient', {
      state: { patient, mode: 'view&edit', autoFillChoice: true, sourceContext: 'charges' },
    });
  };

  const handleSelection = (selectedItems: Patient[]) => {
    setSelectedPatients(selectedItems);
    setIsAllSelected(selectedItems.length === patients.length && patients.length > 0);
  };

  const getPatientId = (patient: Patient): string => {
    return patient.id?.toString() || '';
  };

  const handleSort = (column: string) => {
    // Skip sorting for diagnosis column as per requirement
    if (column === 'diagnoses') return;

    // Helper to keep empty / null / undefined values at the bottom irrespective of the order
    const compareWithEmptyLast = (
      a: string | number,
      b: string | number,
      sortDirection: 'asc' | 'desc',
    ) => {
      const isEmpty = (v: string | number) =>
        v === '' || v === null || v === undefined || (typeof v === 'number' && Number.isNaN(v));

      if (isEmpty(a) && isEmpty(b)) return 0;
      if (isEmpty(a)) return 1; // place empty at the bottom
      if (isEmpty(b)) return -1; // place empty at the bottom

      if (typeof a === 'number' && typeof b === 'number') {
        return sortDirection === 'asc'
          ? (a as number) - (b as number)
          : (b as number) - (a as number);
      }

      const strA = String(a).toLowerCase();
      const strB = String(b).toLowerCase();
      return sortDirection === 'asc' ? strA.localeCompare(strB) : strB.localeCompare(strA);
    };

    let order: 'asc' | 'desc' = 'asc';
    if (sortOrder.column === column && sortOrder.order === 'asc') {
      order = 'desc';
    }

    setSortOrder({ column, order });

    const sortedRows = [...rows].sort((a, b) => {
      switch (column) {
        case 'patient_name': {
          const nameA = `${a.lastname ?? ''} ${a.firstname ?? ''}`;
          const nameB = `${b.lastname ?? ''} ${b.firstname ?? ''}`;
          return compareWithEmptyLast(nameA, nameB, order);
        }
        case 'visit_codes': {
          const codeA = a.visit_codes?.[0]?.visit_code ?? '';
          const codeB = b.visit_codes?.[0]?.visit_code ?? '';
          return compareWithEmptyLast(codeA, codeB, order);
        }
        case 'shared_visits': {
          const svA = a.shared_visits?.map((sv) => sv.name).join(',') ?? '';
          const svB = b.shared_visits?.map((sv) => sv.name).join(',') ?? '';
          return compareWithEmptyLast(svA, svB, order);
        }
        case 'admitdate': {
          const getTime = (d: string | Date | null | undefined) =>
            d ? new Date(d instanceof Date ? d : (d as string)).getTime() : NaN;
          const timeA = getTime(a.admitdate);
          const timeB = getTime(b.admitdate);
          return compareWithEmptyLast(timeA, timeB, order);
        }
        case 'location': {
          const locA = a.hospital_abbreviation ?? '';
          const locB = b.hospital_abbreviation ?? '';
          return compareWithEmptyLast(locA, locB, order);
        }
        case 'visittype': {
          const typeA = a.visittype ?? '';
          const typeB = b.visittype ?? '';
          return compareWithEmptyLast(typeA, typeB, order);
        }
        case 'status': {
          const statusA = a.status ?? '';
          const statusB = b.status ?? '';
          return compareWithEmptyLast(statusA, statusB, order);
        }
        default:
          return 0;
      }
    });

    setRows(sortedRows);
  };

  const columns: TableColumn<Patient>[] = [
    {
      key: 'patient_name',
      label: 'Patient Name',
      width: '15%',
      render: (patient) => (
        <span className="flex items-center gap-2">
          <span
            onClick={(e) => {
              e.stopPropagation();
              EditDetails(patient);
            }}
            className="cursor-pointer"
          >
            <Open style={{ fill: 'var(--primary-blue)' }} className="icon-size-sm flex-shrink-0" />
          </span>
          <span
            className="truncate min-w-0"
            title={capitalizeNames(patient.firstname, patient.lastname)}
          >
            {capitalizeNames(patient.firstname, patient.lastname)}
          </span>
        </span>
      ),
    },
    {
      key: 'visit_codes',
      label: 'Visit Code',
      width: '10%',
      render: (patient) =>
        isEditMode ? (
          <Dropdown
            options={
              visitCodes?.map((code) => ({
                label: `${code.visit_code} - ${code.description}`,
                value: code.id || 0,
              })) || []
            }
            value={patient.visit_codes?.map((vc) => vc.id || 0) || []}
            onChange={(selectedValues) => {
              const selectedOptions = Array.isArray(selectedValues)
                ? (selectedValues
                    .map((id) => visitCodes?.find((code) => code.id === id))
                    .filter(Boolean) as VisitCode[])
                : [];
              handleVisitCodeChange(selectedOptions as MultiValue<VisitCode>, patient); //usered index instread of patienjt
            }}
            multiple
            placeholder="Select visit codes"
            className="min-w-[150px]"
            variant="variant_1"
          />
        ) : patient.visit_codes && patient.visit_codes.length > 0 ? (
          <HoverContent
            hoverContent={
              <div className="space-y-1">
                {patient.visit_codes!.map((c, index) => (
                  <div key={index} className="text-xs">
                    <span className="font-medium">{c.visit_code}</span>
                    {c.description && (
                      <span className="text-[var(--text-secondary)]"> - {c.description}</span>
                    )}
                  </div>
                ))}
              </div>
            }
            position="top"
            maxHeight="200px"
          >
            {patient.visit_codes!.map((c, index) => (
              <span key={index}>
                {c.visit_code}
                {patient.visit_codes!.length - 1 !== index && ', '}
              </span>
            ))}
          </HoverContent>
        ) : (
          '-'
        ),
    },
    {
      key: 'shared_visits',
      label: 'Shared Visit',
      width: '10%',
      render: (patient) =>
        isEditMode ? (
          <Dropdown
            options={[
              { label: 'None', value: '' },
              ...sharedVisitUsers!.map((user) => ({
                label: user.name,
                value: user.id || 0,
              })),
            ]}
            value={patient.shared_visits?.[0]?.id || ''}
            onChange={(selectedValue) => {
              if (selectedValue === '') {
                handleSharedVisitChange(null, patient); //usered index instread of patienjt
                return;
              }

              const selectedOption = sharedVisitUsers?.find((user) => user.id === selectedValue);
              handleSharedVisitChange(
                selectedOption ? { value: selectedOption.id, label: selectedOption.name } : null,
                patient, //usered index instread of patienjt
              );
            }}
            placeholder="Select shared visit"
            className="min-w-[150px]"
            variant="variant_1"
          />
        ) : patient.shared_visits && patient.shared_visits.length > 0 ? (
          patient.shared_visits.map((sv) => sv.name).join(', ')
        ) : (
          '-'
        ),
    },
    {
      key: 'admitdate',
      label: 'Admit Date',
      width: '10%',
      priority: 'medium',
      render: (patient) =>
        isEditMode ? (
          <InputField
            type="date"
            value={
              patient.admitdate && isDateValid(patient.admitdate)
                ? formatISODate(patient.admitdate)
                : ''
            }
            onBlur={(e) => handleAdmitDateChange(e.target.value, patient)}
            className="min-w-[150px]  "
          />
        ) : patient.admitdate && isDateValid(patient.admitdate) ? (
          formatDisplayDate(patient.admitdate)
        ) : (
          '-'
        ),
    },
    {
      key: 'location',
      label: 'Location',
      width: '10%',
      priority: 'medium',
      render: (patient) => patient.hospital_abbreviation || '-',
    },
    {
      key: 'visittype',
      label: 'Visit Type',
      width: '10%',
      priority: 'medium',
      render: (patient) => (patient.visittype ? capitalizeVisitType(patient.visittype) : '-'),
    },
    {
      key: 'diagnoses',
      label: 'Diagnoses',
      width: '10%',
      sortable: false,
      render: (patient) => <DiagnosisSummary diagnoses={patient.diagnoses} />,
    },
    {
      key: 'status',
      label: 'Status',
      width: '10%',
      render: (patient) => (
        <span
          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
            patient.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}
        >
          {patient.status ? patient.status.charAt(0).toUpperCase() + patient.status.slice(1) : ''}
        </span>
      ),
    },
    {
      key: 'facesheet',
      label: 'Face Sheet',
      width: '5%',
      sortable: false,

      render: (patient) =>
        patient.facesheetalias ? (
          <span
            onClick={(e: React.MouseEvent<HTMLButtonElement>) => handleViewFacesheet(e, patient)}
            className={`inline-flex items-center justify-center bg-primary-gradient hover:opacity-90 text-white text-xs font-medium px-2 py-1 rounded-md cursor-pointer transition-all min-w-[40px] h-6 ${
              loadingFacesheet === patient.id ? 'opacity-50 cursor-wait' : ''
            }`}
          >
            {loadingFacesheet === patient.id ? 'Loading...' : 'View'}
          </span>
        ) : (
          <div className="flex items-center justify-center">
            <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center">
              <span className="text-red-600 text-xs font-bold">
                <Cross fill="red" width={10} height={10} />
              </span>
            </div>
          </div>
        ),
    },
  ];

  return (
    <>
      <Table
        columns={columns}
        data={rows}
        onSort={handleSort}
        sortOrder={sortOrder}
        activeRecordsCount={rows.length}
        activeRecordsText="Active Records Available"
        draggable={true}
        onDragEnd={handleDragEnd}
        onSelect={handleSelection}
        selectedItems={selectedPatients}
        getRowId={getPatientId}
        showSelectAll={true}
      />

      <ConfirmationModal
        open={showFutureAdmitError}
        onClose={() => setShowFutureAdmitError(false)}
        onConfirm={() => setShowFutureAdmitError(false)}
        title="Admit Date Error"
        message="Admit date cannot be in the future. Please review and update the date."
        confirmText="Close"
        cancelText="Back"
      />
    </>
  );
}

export default ChargesTable;
