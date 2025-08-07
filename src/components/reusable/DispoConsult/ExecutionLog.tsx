import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { fetchExecutionLogs } from '../../../helpers/dispo-consult/index.js';
import { ExecutionLog as ExecutionLogType } from '../../../types/DispoConsult.types';
import Table, { TableColumn } from '../custom/Table';
import Loader from '../Loader';
import { formatDisplayDate } from '../../../helpers/dateUtils.js';
import { TOAST_CONFIG } from '../../../constants/index.js';

const ExecutionLog: React.FC = () => {
  const [executionLogs, setExecutionLogs] = useState<ExecutionLogType[]>([]);
  const [loadingLogs, setLoadingLogs] = useState<boolean>(false);

  // Sorting state
  const [sortOrder, setSortOrder] = useState<{
    column: keyof ExecutionLogType | null;
    order: 'asc' | 'desc' | null;
  }>({
    column: null,
    order: null,
  });

  // Define reusable table columns
  const columns: TableColumn<ExecutionLogType>[] = [
    { key: 'id', label: 'ID', width: '70px' },
    { key: 'diagnosis_category', label: 'Diagnosis' },
    { key: 'insurance_payer', label: 'Insurance Payer Type' },
    { key: 'prior_level_of_function', label: 'Prior Level Of Function' },
    { key: 'prior_living_arrangement', label: 'Prior Living Arrangement' },
    { key: 'available_social_support', label: 'Available Support' },
    { key: 'transfer_functional_level', label: 'Functional Level Transfers' },
    { key: 'ambulation_functional_level', label: 'Functional Level Ambulation' },
    { key: 'selected_option', label: 'Medical Readiness' },
    {
      key: 'ot_needs',
      label: 'OT Needs',
      render: (row) => (row.ot_needs ? 'Yes' : 'No'),
      width: '90px',
    },
    {
      key: 'tolerates_therapies_standing',
      label: 'Tolerates Therapies Standing',
      render: (row) => (row.tolerates_therapies_standing ? 'Yes' : 'No'),
      width: '90px',
    },
    { key: 'provider_recommended_disposition', label: 'Provider Recommended Disposition' },
    { key: 'disposition', label: 'Disposition' },
    { key: 'confidence', label: 'Confidence' },
    { key: 'provider', label: 'Provider' },
    {
      key: 'created_at',
      label: 'Created At',
      render: (row) => formatDisplayDate(row.created_at),
      width: '160px',
    },
  ];

  // Helper for generic comparison
  const compareValues = (a: unknown, b: unknown, order: 'asc' | 'desc') => {
    if (a === b) return 0;
    if (a === null || a === undefined) return -1;
    if (b === null || b === undefined) return 1;

    // numeric
    if (typeof a === 'number' && typeof b === 'number') {
      return order === 'asc' ? a - b : b - a;
    }
    // boolean
    if (typeof a === 'boolean' && typeof b === 'boolean') {
      return order === 'asc' ? (a === b ? 0 : a ? -1 : 1) : a === b ? 0 : a ? 1 : -1;
    }
    // date string (created_at) or other string
    const valA = String(a).toLowerCase();
    const valB = String(b).toLowerCase();
    return order === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
  };

  const handleSort = (columnKey: keyof ExecutionLogType) => {
    let order: 'asc' | 'desc' = 'asc';
    if (sortOrder.column === columnKey && sortOrder.order === 'asc') {
      order = 'desc';
    }

    setSortOrder({ column: columnKey, order });

    setExecutionLogs((prevLogs) => {
      const sorted = [...prevLogs].sort((a, b) => {
        const valA = a[columnKey];
        const valB = b[columnKey];
        return compareValues(valA as unknown, valB as unknown, order);
      });
      return sorted;
    });
  };

  const handleFetchExecutionLogs = async () => {
    try {
      setLoadingLogs(true);
      const result = await fetchExecutionLogs();
      setExecutionLogs(result.data);
    } catch (error) {
      if (error instanceof Error) {
        toast.error('Failed to fetch execution logs', TOAST_CONFIG.ERROR);
      }
    } finally {
      setLoadingLogs(false);
    }
  };

  useEffect(() => {
    handleFetchExecutionLogs();
  }, []);

  return (
    <div className="w-full h-full flex flex-col gap-2">
      {loadingLogs ? (
        <div className="h-full flex-1 flex flex-col items-center justify-center p-10">
          <div className="flex flex-col items-center gap-4">
            <Loader size="lg" color="var(--primary-blue)" />
            <p className="text-secondary font-gotham-medium">Loading execution logs...</p>
          </div>
        </div>
      ) : (
        <Table
          columns={columns}
          data={executionLogs}
          activeRecordsCount={executionLogs.length}
          activeRecordsText="Total Logs"
          onSort={(col) => handleSort(col as keyof ExecutionLogType)}
          sortOrder={sortOrder}
        />
      )}
    </div>
  );
};

export default ExecutionLog;
