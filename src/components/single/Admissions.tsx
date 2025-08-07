import { useEffect, useState, useRef, forwardRef, useImperativeHandle } from 'react';
import Open from '../../assets/icons/open.svg?react';
import Cross from '../../assets/icons/facesheet_cross.svg?react';
import { ViewFacesheet, capitalizeVisitType } from '../../helpers/index.js';
import { fetchAdmissions } from '../../helpers/admissions/index.js';
import Loader from '../reusable/Loader.tsx';
import AdmissionDetails from './AdmissionDetails';
import Table, { TableColumn } from '../reusable/custom/Table';
import Button from '../reusable/custom/Button';
import type { Patient } from '../../types/Patient.types';
import type { AdmissionsProps } from '../../types/Admissions.types';
import { toast } from 'react-toastify';
import { formatDisplayDate, isDateValid } from '../../helpers/dateUtils.ts';
import { AdmissionDetailsHandle } from './AdmissionDetails';
import { TOAST_CONFIG } from '../../constants/index.ts';
import DiagnosisSummary from '../reusable/DiagnosisSummary.tsx';

interface SortState {
  column: string | null;
  order: 'asc' | 'desc' | null;
}

export type AdmissionsHandle = {
  hasUnsavedChanges: () => boolean;
  discardChanges: () => void;
};

const Admissions = forwardRef<AdmissionsHandle, AdmissionsProps>(({ patient, subMode }, ref) => {
  const [admissionsData, setAdmissionsData] = useState<Patient[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [showAdmissionDetails, setShowAdmissionDetails] = useState<boolean>(false);
  const [currentPatient, setCurrentPatient] = useState<Patient | null>(null);
  const [isNewAdmission, setIsNewAdmission] = useState<boolean>(false);
  const [loadingFacesheetId, setLoadingFacesheetId] = useState<number | null>(null);
  const [sortOrder, setSortOrder] = useState<SortState>({ column: null, order: null });
  const admissionDetailsRef = useRef<AdmissionDetailsHandle>(null);

  const handleFetchAdmissions = async (patient_id: number) => {
    setLoading(true);
    try {
      const data = await fetchAdmissions(patient_id);
      setAdmissionsData(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleFetchAdmissions(patient.patient_id);
  }, [patient.patient_id]);

  const onCellClick = (row: Patient) => {
    setIsNewAdmission(false);
    setShowAdmissionDetails(true);
    setCurrentPatient(row);
  };

  const handleBack = () => {
    setShowAdmissionDetails(false);
    setCurrentPatient(null);
    setIsNewAdmission(false);
    handleFetchAdmissions(patient.patient_id);
  };

  const handleNewAdmissionClick = () => {
    setIsNewAdmission(true);
    setShowAdmissionDetails(true);
    setCurrentPatient({
      patient_id: patient.patient_id,
      amd_patient_id: admissionsData[0]?.amd_patient_id,
      amd_hospital_id: null,
      admitdate: null,
      location: null,
      room: '',
      dischargedate: null,
      visittype: '',
      facesheetalias: null,
      owning_provider_id: null,
      id: 0,
      firstname: '',
      lastname: '',
      middlename: null,
      gender: null,
      dateofbirth: null,
      hospital_id: 0,
      hospital_name: '',
      hospital_abbreviation: '',
      diagnoses: [],
      hospital: {
        id: 0,
        abbreviation: '',
        hospital: '',
        amd_hospital_id: 0,
      },
      owning_provider_name: '',
      provider: {
        id: 0,
        firstname: '',
        lastname: '',
        title: '',
        amd_provider_id: 0,
      },
    });
  };

  const handleViewFacesheet = async (row: Patient) => {
    if (!row.id || !row.facesheetalias || row.facesheetalias === 'null') {
      toast.error('Face sheet not available for this patient', TOAST_CONFIG.ERROR);
      return;
    }

    setLoadingFacesheetId(row.id);
    try {
      const url = await ViewFacesheet(row.id, row.facesheetalias);
      if (!url) {
        toast.error('Error loading facesheet', TOAST_CONFIG.ERROR);
        return;
      }
      setTimeout(() => {
        window.open(url, '_blank');
      }, 100);
    } catch (error) {
      console.error('Error opening facesheet:', error);
      toast.error('Error loading facesheet', TOAST_CONFIG.ERROR);
    } finally {
      setLoadingFacesheetId(null);
    }
  };

  const handleSort = (column: string) => {
    // Determine sort order
    let order: 'asc' | 'desc' = 'asc';
    if (sortOrder.column === column && sortOrder.order === 'asc') {
      order = 'desc';
    }

    setSortOrder({ column, order });

    // Helper to keep empty / null / undefined values at the bottom irrespective of the order
    const compareWithEmptyLast = (
      a: string | number,
      b: string | number,
      sortDirection: 'asc' | 'desc',
    ): number => {
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

    const sortedAdmissions = [...admissionsData].sort((a: Patient, b: Patient) => {
      switch (column) {
        case 'admitdate': {
          const getTime = (d: string | Date | null | undefined): number =>
            d ? new Date(d instanceof Date ? d : (d as string)).getTime() : NaN;
          const timeA = getTime(a.admitdate);
          const timeB = getTime(b.admitdate);
          return compareWithEmptyLast(timeA, timeB, order);
        }
        case 'location': {
          return compareWithEmptyLast(
            a.hospital_abbreviation ?? '',
            b.hospital_abbreviation ?? '',
            order,
          );
        }
        case 'provider': {
          return compareWithEmptyLast(
            a.owning_provider_name ?? '',
            b.owning_provider_name ?? '',
            order,
          );
        }
        case 'visittype': {
          return compareWithEmptyLast(a.visittype ?? '', b.visittype ?? '', order);
        }
        case 'dischargedate': {
          const getTime = (d: string | Date | null | undefined): number =>
            d ? new Date(d instanceof Date ? d : (d as string)).getTime() : NaN;
          const timeA = getTime(a.dischargedate);
          const timeB = getTime(b.dischargedate);
          return compareWithEmptyLast(timeA, timeB, order);
        }
        default:
          return 0;
      }
    });

    setAdmissionsData(sortedAdmissions);
  };

  const columns: TableColumn<Patient>[] = [
    {
      key: 'admitdate',
      label: 'Admit Date',
      render: (p) => (
        <span className="flex items-center gap-2">
          <span
            onClick={(e) => {
              e.stopPropagation();
              onCellClick(p);
            }}
            className="cursor-pointer"
          >
            <Open style={{ fill: 'var(--primary-blue)' }} className="icon-size-sm flex-shrink-0" />
          </span>
          <span className="truncate min-w-0">
            {p.admitdate && isDateValid(p.admitdate) ? formatDisplayDate(p.admitdate) : '-'}
          </span>
        </span>
      ),
    },
    {
      key: 'location',
      label: 'Location',
      render: (row) => row.hospital_abbreviation || 'N/A',
    },
    {
      key: 'provider',
      label: 'Provider',
      render: (row) => row.owning_provider_name,
    },
    {
      key: 'diagnoses',
      label: 'Diagnosis or ICD10',
      render: (row) => <DiagnosisSummary diagnoses={row.diagnoses} />,
    },
    {
      key: 'visittype',
      label: 'Visit Type',
      render: (row) => (row.visittype ? capitalizeVisitType(row.visittype) : '-'),
    },
    {
      key: 'dischargedate',
      label: 'Discharge Date',
      render: (row) =>
        row.dischargedate && isDateValid(row.dischargedate)
          ? formatDisplayDate(row.dischargedate)
          : '-',
    },
    {
      key: 'facesheet',
      label: 'Face Sheet',
      sortable: false,
      render: (p) =>
        p.facesheetalias && p.facesheetalias !== 'null' ? (
          <div className="flex justify-center">
            <span
              onClick={(e) => {
                e.stopPropagation();
                handleViewFacesheet(p);
              }}
              className={`inline-flex items-center justify-center bg-primary-gradient hover:opacity-90 text-white text-xs font-medium px-4 py-4 2xl:px-6 2xl:py-5 rounded-full cursor-pointer transition-all min-w-[50px] h-6 ${
                loadingFacesheetId === p.id ? 'opacity-50 cursor-wait' : ''
              }`}
            >
              {loadingFacesheetId === p.id ? 'Loading...' : 'View'}
            </span>
          </div>
        ) : (
          <div className="flex justify-center">
            <div className="w-6 h-6 2xl:w-8 2xl:h-8 bg-red-100 rounded-full flex items-center justify-center">
              <span className="text-red-600 text-xs font-bold">
                <Cross fill="red" width={10} height={10} />
              </span>
            </div>
          </div>
        ),
      priority: 'medium',
    },
  ];

  useImperativeHandle(
    ref,
    () => ({
      hasUnsavedChanges: () => admissionDetailsRef.current?.hasUnsavedChanges?.() || false,
      discardChanges: () => admissionDetailsRef.current?.discardChanges?.(),
    }),
    [],
  );

  return (
    <div className="w-full h-full flex flex-col px-4 sm:px-6 py-2  2xl:py-6">
      {showAdmissionDetails ? (
        currentPatient && (
          <AdmissionDetails
            ref={admissionDetailsRef}
            mode={isNewAdmission ? 'add' : 'view&edit'}
            subMode={isNewAdmission ? 'edit' : subMode}
            patient={currentPatient}
            onBack={handleBack}
          />
        )
      ) : (
        <>
          {/* Header Section */}
          <div className="flex justify-between items-center mb-3 2xl:mb-8">
            <div>
              <h2 className="font-gotham-bold text-sm 2xl:text-lg text-secondary mb-2">
                Admission
              </h2>
              {/* <p className="font-gotham text-sm text-muted">
                Add a new patient to the system and begin their care journey.
              </p> */}
            </div>
            <Button
              variant="success"
              size="small"
              className="!h-[20px] !2xl:h-[36px]"
              childrenClassName="text-xs 2xl:text-sm"
              onClick={handleNewAdmissionClick}
            >
              <span className="text-xs 2xl:text-sm font-gotham">+ New Admission</span>
            </Button>
          </div>

          {/* Table Section */}
          {loading ? (
            <div className="flex-1 flex items-center justify-center">
              <Loader size="lg" />
            </div>
          ) : (
            <Table<Patient>
              columns={columns}
              data={admissionsData}
              onRowClick={onCellClick}
              onSort={handleSort}
              sortOrder={sortOrder}
              activeRecordsCount={admissionsData.length}
            />
          )}
        </>
      )}
    </div>
  );
});

export default Admissions;
