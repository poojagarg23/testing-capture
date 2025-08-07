import React, { useState, useEffect } from 'react';
import { ViewFacesheet } from '../../helpers/index.ts';
import Table, { TableColumn } from './custom/Table.tsx';
import { SubmittedChargesHistoryData } from '../../types/index.ts';
import { SubmittedChargesHistoryTableProps } from '../../types/SubmittedChargesHistoryTable.type.ts';
import HoverContent from './HoverContent.tsx';
import DiagnosisSummary from './DiagnosisSummary.tsx';
import Cross from '../../assets/icons/facesheet_cross.svg?react';
import { formatDisplayDate, isDateValid } from '../../helpers/dateUtils.ts';
import { capitalizeVisitType, capitalizeNames } from '../../helpers/index.ts';

const SubmittedChargesHistoryTable: React.FC<SubmittedChargesHistoryTableProps> = ({
  patients,
}) => {
  const [loadingFacesheetId, setLoadingFacesheetId] = useState<number | null>(null);
  const [rows, setRows] = useState<SubmittedChargesHistoryData[]>(patients);
  const [sortOrder, setSortOrder] = useState<{
    column: string | null;
    order: 'asc' | 'desc' | null;
  }>({ column: null, order: null });

  useEffect(() => {
    setRows(patients);
  }, [patients]);
  const handleViewFacesheet = async (patient: SubmittedChargesHistoryData) => {
    const patientIndex = patients.findIndex(
      (p) => p.id === patient.id && p.timestamp === patient.timestamp,
    );
    setLoadingFacesheetId(patientIndex);

    try {
      const url = await ViewFacesheet(patient?.id, patient?.facesheetalias);
      if (url) {
        window.open(url, '_blank');
      }
    } catch (error) {
      console.error('Error viewing facesheet:', error);
    } finally {
      setLoadingFacesheetId(null);
    }
  };

  const handleSort = (column: string) => {
    // Skip non-sortable columns
    if (column === 'diagnosis' || column === 'facesheet') return;

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
        case 'id':
          return compareWithEmptyLast(a.id, b.id, order);
        case 'name': {
          const nameA = `${a.lastname ?? ''} ${a.firstname ?? ''}`;
          const nameB = `${b.lastname ?? ''} ${b.firstname ?? ''}`;
          return compareWithEmptyLast(nameA, nameB, order);
        }
        case 'visit_code': {
          const codeA = a.visit_codes?.[0]?.visit_code ?? '';
          const codeB = b.visit_codes?.[0]?.visit_code ?? '';
          return compareWithEmptyLast(codeA, codeB, order);
        }
        case 'shared_visit': {
          const svA = a.shared_visits?.map((sv) => sv.name).join(',') ?? '';
          const svB = b.shared_visits?.map((sv) => sv.name).join(',') ?? '';
          return compareWithEmptyLast(svA, svB, order);
        }
        case 'admit_date': {
          const getTime = (d: string | null | undefined) =>
            d && isDateValid(d) ? new Date(d).getTime() : NaN;
          const timeA = getTime(a.admitdate);
          const timeB = getTime(b.admitdate);
          return compareWithEmptyLast(timeA, timeB, order);
        }
        case 'date_of_service': {
          const getTime = (d: string | null | undefined) =>
            d && isDateValid(d) ? new Date(d).getTime() : NaN;
          const timeA = getTime(a.date_of_service);
          const timeB = getTime(b.date_of_service);
          return compareWithEmptyLast(timeA, timeB, order);
        }
        case 'visit_type':
          return compareWithEmptyLast(a.visittype ?? '', b.visittype ?? '', order);
        case 'location':
          return compareWithEmptyLast(
            a.hospital_abbreviation ?? '',
            b.hospital_abbreviation ?? '',
            order,
          );
        case 'status':
          return compareWithEmptyLast(a.status ?? '', b.status ?? '', order);
        case 'provider':
          return compareWithEmptyLast(
            a.charges_provider_full_name ?? '',
            b.charges_provider_full_name ?? '',
            order,
          );
        default:
          return 0;
      }
    });

    setRows(sortedRows);
  };

  const columns: TableColumn<SubmittedChargesHistoryData>[] = [
    {
      key: 'id',
      label: 'ID',
      width: '6%',
      render: (patient) => patient.id?.toString() || '-',
    },
    {
      key: 'name',
      label: 'Name',
      width: '12%',
      render: (patient) => (
        <span
          className="truncate min-w-0"
          title={capitalizeNames(patient.firstname, patient.lastname)}
        >
          {capitalizeNames(patient.firstname, patient.lastname)}
        </span>
      ),
    },
    {
      key: 'visit_code',
      label: 'Visit Code',
      width: '8%',
      priority: 'medium',
      render: (patient) => (
        <HoverContent
          hoverContent={
            patient.visit_codes && (
              <div className="space-y-1">
                {patient.visit_codes.map((c, index) => (
                  <div key={index} className="text-xs">
                    <span className="font-medium">{c.visit_code}</span>
                    {c.description && (
                      <span className="text-[var(--text-secondary)]"> - {c.description}</span>
                    )}
                  </div>
                ))}
              </div>
            )
          }
          position="top"
          maxHeight="200px"
        >
          {patient.visit_codes &&
            patient.visit_codes.map((c, index) => (
              <span key={index}>
                {c.visit_code}
                {patient.visit_codes && patient.visit_codes.length - 1 !== index && ', '}
              </span>
            ))}
        </HoverContent>
      ),
    },
    {
      key: 'shared_visit',
      label: 'Shared Visit',
      width: '10%',
      priority: 'medium',
      render: (patient) =>
        patient.shared_visits && patient.shared_visits.length > 0
          ? patient.shared_visits.map((sv) => sv.name).join(', ')
          : '-',
    },
    {
      key: 'admit_date',
      label: 'Admit Date',
      width: '10%',
      render: (patient) =>
        patient.admitdate && isDateValid(patient.admitdate)
          ? formatDisplayDate(patient.admitdate)
          : '-',
    },
    {
      key: 'date_of_service',
      label: 'Date of Service',
      width: '12%',
      render: (patient) =>
        patient.date_of_service && isDateValid(patient.date_of_service)
          ? formatDisplayDate(patient.date_of_service)
          : '-',
    },
    {
      key: 'visit_type',
      label: 'Visit Type',
      width: '10%',
      priority: 'low',
      render: (patient) => (patient.visittype ? capitalizeVisitType(patient.visittype) : '-'),
    },
    {
      key: 'location',
      label: 'Location',
      width: '8%',
      priority: 'low',
      render: (patient) => patient.hospital_abbreviation || '-',
    },
    {
      key: 'diagnosis',
      sortable: false,
      label: 'Diagnosis',
      width: '10%',
      render: (patient) => <DiagnosisSummary diagnoses={patient.diagnoses} />,
    },
    {
      key: 'status',
      label: 'Status',
      width: '8%',

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
      sortable: false,
      label: 'Face Sheet',
      width: '8%',
      render: (patient) => {
        const patientIndex = patients.findIndex(
          (p) => p.id === patient.id && p.timestamp === patient.timestamp,
        );

        if (!patient.facesheetalias) {
          return (
            <div className="flex items-center justify-center">
              <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center">
                <span className="text-red-600 text-xs font-bold">
                  <Cross fill="var(--fill-error)" width={10} height={10} />
                </span>
              </div>
            </div>
          );
        }

        return (
          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center justify-center bg-primary-gradient hover:opacity-90 text-white text-xs font-medium px-2 py-1 rounded-md cursor-pointer transition-all min-w-[40px] h-6 ${
                loadingFacesheetId === patientIndex ? 'opacity-50 cursor-wait' : ''
              }`}
              onClick={(e) => {
                e.stopPropagation();
                handleViewFacesheet(patient);
              }}
            >
              {loadingFacesheetId === patientIndex ? 'Loading...' : 'View'}
            </span>
          </div>
        );
      },
    },
    {
      key: 'provider',
      label: 'Provider',
      width: '12%',
      render: (patient) => patient.charges_provider_full_name || '-',
    },
  ];

  return (
    <Table
      columns={columns}
      data={rows}
      onSort={handleSort}
      sortOrder={sortOrder}
      activeRecordsCount={rows.length}
      activeRecordsText="Active Patients In The System"
      draggable={false}
      showSelectAll={false}
      getRowId={(patient) => `${patient.id}-${patient.timestamp}`}
    />
  );
};

export default SubmittedChargesHistoryTable;
