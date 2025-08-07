import React, { useCallback, useEffect, useState } from 'react';
import { fetchPatientChargesHistory } from '../../helpers/Charges/patient-charges-history/index.js';
import { PatientChargeHistoryProps } from '../../types/PatientChargesHistoryTableRow.types.ts';
import { PatientChargesHistoryProps } from '../../types/PatientChargesHistory.types.ts';
import { isDateValid, formatDisplayDate } from '../../helpers/dateUtils.ts';
import PageHeader from '../reusable/custom/PageHeader';
import Table, { TableColumn } from '../reusable/custom/Table';
import HoverContent from '../reusable/HoverContent';

const PatientChargesHistory: React.FC<PatientChargesHistoryProps> = ({ patient }) => {
  const [chargesHistory, setChargesHistory] = useState<PatientChargeHistoryProps[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortOrder, setSortOrder] = useState<{
    column: string | null;
    order: 'asc' | 'desc' | null;
  }>({ column: null, order: null });

  const handleSort = (column: string) => {
    let order: 'asc' | 'desc' = 'asc';
    if (sortOrder.column === column && sortOrder.order === 'asc') {
      order = 'desc';
    }

    setSortOrder({ column, order });

    const isEmpty = (v: unknown) =>
      v === '' || v === null || v === undefined || (typeof v === 'number' && Number.isNaN(v));

    const compareWithEmptyLast = (a: unknown, b: unknown): number => {
      if (isEmpty(a) && isEmpty(b)) return 0;
      if (isEmpty(a)) return 1;
      if (isEmpty(b)) return -1;

      // numbers / timestamps
      if (typeof a === 'number' && typeof b === 'number') {
        return order === 'asc' ? (a as number) - (b as number) : (b as number) - (a as number);
      }

      const strA = String(a).toLowerCase();
      const strB = String(b).toLowerCase();
      return order === 'asc' ? strA.localeCompare(strB) : strB.localeCompare(strA);
    };

    const sorted = [...chargesHistory].sort((a, b) => {
      switch (column) {
        case 'date_of_service': {
          const tA = a.date_of_service ? new Date(a.date_of_service).getTime() : NaN;
          const tB = b.date_of_service ? new Date(b.date_of_service).getTime() : NaN;
          return compareWithEmptyLast(tA, tB);
        }
        case 'admitdate': {
          const tA = a.admitdate ? new Date(a.admitdate).getTime() : NaN;
          const tB = b.admitdate ? new Date(b.admitdate).getTime() : NaN;
          return compareWithEmptyLast(tA, tB);
        }
        case 'timestamp': {
          const tA = a.timestamp ? new Date(a.timestamp).getTime() : NaN;
          const tB = b.timestamp ? new Date(b.timestamp).getTime() : NaN;
          return compareWithEmptyLast(tA, tB);
        }
        case 'hospital_abbreviation':
          return compareWithEmptyLast(a.hospital_abbreviation ?? '', b.hospital_abbreviation ?? '');
        case 'name_of_user':
          return compareWithEmptyLast(a.name_of_user ?? '', b.name_of_user ?? '');
        case 'visit_codes': {
          const vcA = a.visit_codes?.[0]?.visit_code ?? '';
          const vcB = b.visit_codes?.[0]?.visit_code ?? '';
          return compareWithEmptyLast(vcA, vcB);
        }
        case 'shared_visits': {
          const svA = a.shared_visits?.map((sv) => sv.name).join(',') ?? '';
          const svB = b.shared_visits?.map((sv) => sv.name).join(',') ?? '';
          return compareWithEmptyLast(svA, svB);
        }
        default:
          return 0;
      }
    });

    setChargesHistory(sorted);
  };

  const handleFetchPatientChargesHistory = useCallback(async () => {
    try {
      setLoading(true);
      const data = await fetchPatientChargesHistory(patient.patient_id);
      setChargesHistory(data);
    } catch (error) {
      if (error instanceof Error) {
        console.error('Error:', error.message);
      }
    } finally {
      setLoading(false);
    }
  }, [patient.patient_id]);

  useEffect(() => {
    handleFetchPatientChargesHistory();
  }, [handleFetchPatientChargesHistory]);

  const columns: TableColumn<PatientChargeHistoryProps>[] = [
    {
      key: 'date_of_service',
      label: 'Date of Service',
      render: (row) =>
        row.date_of_service && isDateValid(row.date_of_service)
          ? formatDisplayDate(row.date_of_service)
          : '-',
      width: '15%',
    },
    {
      key: 'admitdate',
      label: 'Admit Date',
      render: (row) =>
        row.admitdate && isDateValid(row.admitdate) ? formatDisplayDate(row.admitdate) : '-',
      width: '15%',
    },
    {
      key: 'hospital_abbreviation',
      label: 'Location',
      render: (row) => row.hospital_abbreviation || '-',
      width: '15%',
    },
    {
      key: 'visit_codes',
      label: 'Visit Codes',
      render: (row) => {
        if (!row.visit_codes || row.visit_codes.length === 0) {
          return <span className="text-[var(--text-secondary)]">-</span>;
        }

        return (
          <div className="text-sm">
            <HoverContent
              hoverContent={
                <div className="space-y-1">
                  {row.visit_codes.map((vc, vcIndex) => (
                    <div key={vcIndex} className="text-xs">
                      <span className="font-medium">{vc.visit_code}</span>
                      {vc.description && (
                        <span className="text-[var(--text-secondary)]"> - {vc.description}</span>
                      )}
                    </div>
                  ))}
                </div>
              }
              position="top"
              maxHeight="200px"
            >
              {row.visit_codes.map((vc, i) => (
                <span key={i}>
                  {vc.visit_code}
                  {row.visit_codes.length - 1 !== i ? ', ' : ''}
                </span>
              ))}
            </HoverContent>
          </div>
        );
      },
      width: '20%',
    },
    {
      key: 'shared_visits',
      label: 'Shared Visits',
      render: (row) =>
        row.shared_visits && row.shared_visits.length > 0
          ? row.shared_visits.map((sv) => sv.name).join(', ')
          : '-',
      width: '20%',
    },
    {
      key: 'name_of_user',
      label: 'Submitted by',
      render: (row) => row.name_of_user || '-',
      width: '15%',
    },
    {
      key: 'timestamp',
      label: 'Submission Date',
      render: (row) =>
        new Date(row.timestamp).toLocaleString('en-US', {
          month: '2-digit',
          day: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          hour12: true,
        }),
      width: '15%',
    },
  ];

  return (
    <div className="flex flex-col gap-4 p-6 shadow-sm">
      <PageHeader
        title="Patient Charges History"
        subtitle="Review what the patient has been billed for during their care."
        showBackButton={false}
        className="pb-2"
      />

      <div className="flex-1 min-h-0">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-blue"></div>
          </div>
        ) : (
          <Table
            columns={columns}
            data={chargesHistory}
            onSort={handleSort}
            sortOrder={sortOrder}
            activeRecordsCount={chargesHistory.length}
            activeRecordsText={`${chargesHistory.length === 1 ? 'Charge' : 'Charges'} Found`}
            getRowId={(row) => `${row.date_of_service}-${row.timestamp}`}
          />
        )}
      </div>
    </div>
  );
};

export default PatientChargesHistory;
