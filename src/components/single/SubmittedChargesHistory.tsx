import React, { useEffect, useState } from 'react';
import { isValidDate, convertToCustomDate } from '../../helpers';
import {
  fetchSubmittedChargesHistory,
  fetchPatientChargesHistory,
} from '../../helpers/Charges/submitted-charges-history/index.ts';
import Table, { TableColumn } from '../reusable/custom/Table.tsx';
import SubmittedChargesHistoryTable from '../reusable/SubmittedChargesHistoryTable.tsx';
import Loader from '../reusable/Loader.tsx';
import PageHeader from '../reusable/custom/PageHeader.tsx';
import Open from '../../assets/icons/open.svg?react';
import { SubmittedChargesHistoryData } from '../../types/index.ts';
import { GroupedChargesHistory } from '../../types/GroupedChargesHistory.types.ts';
import { formatDisplayDate } from '../../helpers/dateUtils.ts';

interface ChargesHistoryRow {
  index: number;
  dateOfService: string;
  totalCharges: number;
  dateSubmitted: string;
  timestamp: string;
  patients: SubmittedChargesHistoryData[];
}

const SubmittedChargesHistory: React.FC = () => {
  const [tableData, setTableData] = useState<ChargesHistoryRow[]>([]);
  const [patients, setPatients] = useState<SubmittedChargesHistoryData[]>([]);
  const [showDetailView, setShowDetailView] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  // Sorting state
  const [sortOrder, setSortOrder] = useState<{
    column: string | null;
    order: 'asc' | 'desc' | null;
  }>({ column: null, order: null });

  useEffect(() => {
    handleFetchSubmittedChargesHistory();
  }, []);

  const handleFetchSubmittedChargesHistory = async () => {
    try {
      setLoading(true);
      const data = await fetchSubmittedChargesHistory();
      const groupedByTimestamp = data.reduce(
        (acc: GroupedChargesHistory, obj: SubmittedChargesHistoryData) => {
          const timestamp = obj.timestamp;
          if (!acc[timestamp]) {
            acc[timestamp] = [];
          }
          acc[timestamp].push(obj);
          return acc;
        },
        {},
      );

      // Convert grouped data to table rows
      const rows: ChargesHistoryRow[] = Object.entries(groupedByTimestamp).map(
        ([timestamp, group], index) => {
          const groupData = group as SubmittedChargesHistoryData[];
          return {
            index,
            dateOfService: isValidDate(groupData[0].date_of_service)
              ? convertToCustomDate(groupData[0].date_of_service)
              : groupData[0].date_of_service,
            totalCharges: groupData.length,
            dateSubmitted: new Date(groupData[0].timestamp).toLocaleString('en-US', {
              month: '2-digit',
              day: '2-digit',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
              hour12: true,
            }),
            timestamp,
            patients: groupData,
          };
        },
      );

      setTableData(rows);
    } catch (error) {
      if (error instanceof Error) {
        console.error('Error', error.message);
      } else {
        console.error('An unknown error occurred');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleFetchPatientChargesHistory = async (patientsData: SubmittedChargesHistoryData[]) => {
    try {
      setLoading(true);
      const uniqueData = await fetchPatientChargesHistory(patientsData);
      setPatients(uniqueData);
    } catch (error) {
      if (error instanceof Error) {
        console.error(error.message);
      } else {
        console.error('An unknown error occurred');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRowClick = (row: ChargesHistoryRow) => {
    setPatients(row.patients);
    setShowDetailView(true);
    handleFetchPatientChargesHistory(row.patients);
  };

  const handleBackClick = () => {
    setShowDetailView(false);
    setPatients([]);
  };

  // Sorting handler with blanks always at the bottom
  const handleSort = (column: string) => {
    // determine direction
    let order: 'asc' | 'desc' = 'asc';
    if (sortOrder.column === column && sortOrder.order === 'asc') {
      order = 'desc';
    }

    setSortOrder({ column, order });

    // helper to keep empty / invalid values last
    const compareWithEmptyLast = (a: string | number, b: string | number): number => {
      const isEmpty = (v: string | number) =>
        v === '' || v === null || v === undefined || (typeof v === 'number' && Number.isNaN(v));

      if (isEmpty(a) && isEmpty(b)) return 0;
      if (isEmpty(a)) return 1; // a is empty → place after b
      if (isEmpty(b)) return -1; // b is empty → b after a

      if (typeof a === 'number' && typeof b === 'number') {
        return order === 'asc' ? a - b : b - a;
      }

      const strA = String(a).toLowerCase();
      const strB = String(b).toLowerCase();
      return order === 'asc' ? strA.localeCompare(strB) : strB.localeCompare(strA);
    };

    const sorted = [...tableData].sort((a, b) => {
      switch (column) {
        case 'index':
          return compareWithEmptyLast(a.index, b.index);
        case 'totalCharges':
          return compareWithEmptyLast(a.totalCharges, b.totalCharges);
        case 'dateOfService': {
          const timeA = new Date(a.dateOfService).getTime();
          const timeB = new Date(b.dateOfService).getTime();
          return compareWithEmptyLast(timeA, timeB);
        }
        case 'dateSubmitted': {
          const timeA = new Date(a.dateSubmitted).getTime();
          const timeB = new Date(b.dateSubmitted).getTime();
          return compareWithEmptyLast(timeA, timeB);
        }
        default:
          return 0;
      }
    });

    setTableData(sorted);
  };

  const columns: TableColumn<ChargesHistoryRow>[] = [
    {
      key: 'index',
      label: 'Index',
      width: '15%',
      render: (row) => (
        <div className="flex items-center gap-2">
          <Open className="w-4 h-4 cursor-pointer" fill="var(--primary-blue)" />
          {String(row.index).padStart(2, '0')}
        </div>
      ),
    },
    {
      key: 'dateOfService',
      label: 'Date of Services',
      width: '25%',
      render: (row) => formatDisplayDate(row.dateOfService) || '-',
    },
    {
      key: 'totalCharges',
      label: 'Total Charges',
      width: '20%',
      render: (row) =>
        row.totalCharges || row.totalCharges === 0 ? row.totalCharges.toString() : '-',
    },
    {
      key: 'dateSubmitted',
      label: 'Date submitted',
      width: '40%',
      render: (row) => row.dateSubmitted || '-',
    },
  ];

  if (loading) {
    return (
      <div className="w-full h-full px-4 sm:px-6 py-6 flex flex-col">
        <div className="flex-1 flex justify-center items-center">
          <Loader />
        </div>
      </div>
    );
  }

  if (showDetailView) {
    return (
      <div className="w-full h-full px-3 sm:px-2 py-1 sm:py-2 flex flex-col">
        {/* Header Section */}
        <PageHeader
          title="Charges History"
          subtitle="View a complete list of all previously billed charges, payment statuses, and service dates."
          showBackButton={true}
          onBack={handleBackClick}
          className="mb-8"
        />

        {/* Table Section */}
        <div className="mb-8">
          <SubmittedChargesHistoryTable patients={patients} />
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full px-3 sm:px-2 py-1 sm:py-2 flex flex-col">
      {/* Header Section */}
      <div className="flex-shrink-0">
        <PageHeader
          title="Charges History"
          subtitle="View a complete list of all previously billed charges, payment statuses, and service dates."
          className="mb-6 sm:mb-8"
        />
      </div>

      {/* Scrollable Table Section */}
      <div className="flex-1 min-h-0 overflow-hidden">
        <Table
          columns={columns}
          data={tableData}
          onSort={handleSort}
          sortOrder={sortOrder}
          activeRecordsCount={tableData.length}
          activeRecordsText="Forms Or Entries Submitted"
          draggable={false}
          showSelectAll={false}
          onRowClick={handleRowClick}
        />
      </div>
    </div>
  );
};

export default SubmittedChargesHistory;
