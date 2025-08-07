import React, { useEffect, useState, useMemo } from 'react';
import { capitalizeNames, capitalizeVisitType, fetchAuthorizedProviders } from '../../helpers';
import { fetchTransmittedCharges } from '../../helpers/Charges/transmitted-charges/index.ts';
import PageHeader from '../reusable/custom/PageHeader.tsx';
import Table, { TableColumn } from '../reusable/custom/Table.tsx';
import Loader from '../reusable/Loader.tsx';
import Dropdown from '../reusable/custom/Dropdown.tsx';
import DiagnosisSummary from '../reusable/DiagnosisSummary.tsx';
import Cross from '../../assets/icons/facesheet_cross.svg?react';
import { formatDisplayDate, isDateValid } from '../../helpers/dateUtils.ts';
import type { SubmittedChargePatient } from '../../types/ChargeReview.types.ts';
import type { VisitCode, Provider } from '../../types/index.ts';
import SearchBar from '../reusable/custom/SearchBar.tsx';
import SearchIcon from '../../assets/icons/search.svg?react';
const TransmittedCharges: React.FC = () => {
  const [charges, setCharges] = useState<SubmittedChargePatient[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [providers, setProviders] = useState<Provider[]>([]);

  // Filter states
  const [providerFilter, setProviderFilter] = useState<number | ''>('');

  const [nameFilter, setNameFilter] = useState<string>('');

  // Sorting state
  const [sortOrder, setSortOrder] = useState<{
    column: string | null;
    order: 'asc' | 'desc' | null;
  }>({ column: null, order: null });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [chargesData, providersData] = await Promise.all([
          fetchTransmittedCharges(),
          fetchAuthorizedProviders(),
        ]);
        setCharges(chargesData || []);
        setProviders(providersData || []);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredCharges = useMemo(() => {
    return charges.filter((charge) => {
      if (providerFilter !== '' && charge.charges_provider_id !== providerFilter) return false;

      const fullName = `${charge.lastname ?? ''} ${charge.firstname ?? ''}`.toLowerCase();
      if (nameFilter && !fullName.includes(nameFilter.toLowerCase())) return false;
      return true;
    });
  }, [charges, providerFilter, nameFilter]);

  // Handle column sorting
  const handleSort = (column: string) => {
    // Skip columns not required for sorting
    if (column === 'diagnoses' || column === 'facesheet') return;

    let order: 'asc' | 'desc' = 'asc';
    if (sortOrder.column === column && sortOrder.order === 'asc') {
      order = 'desc';
    }

    setSortOrder({ column, order });

    const isEmpty = (v: unknown) =>
      v === '' || v === null || v === undefined || (typeof v === 'number' && Number.isNaN(v));

    const compareWithEmptyLast = (aVal: unknown, bVal: unknown): number => {
      if (isEmpty(aVal) && isEmpty(bVal)) return 0;
      if (isEmpty(aVal)) return 1;
      if (isEmpty(bVal)) return -1;

      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return order === 'asc'
          ? (aVal as number) - (bVal as number)
          : (bVal as number) - (aVal as number);
      }

      const strA = String(aVal).toLowerCase();
      const strB = String(bVal).toLowerCase();
      return order === 'asc' ? strA.localeCompare(strB) : strB.localeCompare(strA);
    };

    const sorted = [...charges].sort((a, b): number => {
      switch (column) {
        case 'id':
          return compareWithEmptyLast(a.id, b.id);
        case 'name': {
          const nameA = `${a.lastname ?? ''} ${a.firstname ?? ''}`.toLowerCase();
          const nameB = `${b.lastname ?? ''} ${b.firstname ?? ''}`.toLowerCase();
          return compareWithEmptyLast(nameA, nameB);
        }
        case 'visit_codes': {
          const vcA = a.visit_codes?.[0]?.visit_code?.toLowerCase() || '';
          const vcB = b.visit_codes?.[0]?.visit_code?.toLowerCase() || '';
          return compareWithEmptyLast(vcA, vcB);
        }
        case 'shared_visits': {
          const svA =
            a.shared_visits
              ?.map((sv) => sv.name)
              .join(',')
              .toLowerCase() || '';
          const svB =
            b.shared_visits
              ?.map((sv) => sv.name)
              .join(',')
              .toLowerCase() || '';
          return compareWithEmptyLast(svA, svB);
        }
        case 'admitdate': {
          const getTime = (d: string | Date | null | undefined) =>
            d ? new Date(d instanceof Date ? d : (d as string)).getTime() : NaN;
          return compareWithEmptyLast(getTime(a.admitdate), getTime(b.admitdate));
        }
        case 'date_of_service': {
          const getTime = (d: string | Date | null | undefined) =>
            d ? new Date(d instanceof Date ? d : (d as string)).getTime() : NaN;
          return compareWithEmptyLast(getTime(a.date_of_service), getTime(b.date_of_service));
        }
        case 'timestamp': {
          const tA = a.timestamp ? new Date(a.timestamp).getTime() : NaN;
          const tB = b.timestamp ? new Date(b.timestamp).getTime() : NaN;
          return compareWithEmptyLast(tA, tB);
        }
        case 'visittype': {
          const vtA = (a.visittype || '').toLowerCase();
          const vtB = (b.visittype || '').toLowerCase();
          return compareWithEmptyLast(vtA, vtB);
        }
        case 'hospital_abbreviation': {
          const locA = (a.hospital_abbreviation || '').toLowerCase();
          const locB = (b.hospital_abbreviation || '').toLowerCase();
          return compareWithEmptyLast(locA, locB);
        }
        case 'status': {
          const stA = (a.status || '').toLowerCase();
          const stB = (b.status || '').toLowerCase();
          return compareWithEmptyLast(stA, stB);
        }
        case 'provider': {
          const provA = (a.charges_provider_full_name || '').toLowerCase();
          const provB = (b.charges_provider_full_name || '').toLowerCase();
          return compareWithEmptyLast(provA, provB);
        }
        default:
          return 0;
      }
    });

    setCharges(sorted);
  };

  const columns: TableColumn<SubmittedChargePatient>[] = [
    {
      key: 'id',
      label: 'ID',
      width: '60px',
      priority: 'high',
      render: (row) => row.id || '-',
    },
    {
      key: 'name',
      label: 'Name',
      priority: 'high',
      render: (row) => capitalizeNames(row.firstname, row.lastname).trim() || '-',
    },
    {
      key: 'visit_codes',
      label: 'Visit Code',
      priority: 'medium',
      render: (row) =>
        row.visit_codes && row.visit_codes.length > 0
          ? row.visit_codes.map((vc: VisitCode) => vc.visit_code).join(', ')
          : '-',
    },
    {
      key: 'shared_visits',
      label: 'Shared Visit',
      priority: 'medium',
      render: (row) =>
        row.shared_visits && row.shared_visits.length > 0
          ? row.shared_visits.map((sv) => sv.name).join(', ')
          : '-',
    },
    {
      key: 'admitdate',
      label: 'Admit Date',
      priority: 'medium',
      render: (row) =>
        row.admitdate && isDateValid(row.admitdate) ? formatDisplayDate(row.admitdate) : '-',
    },
    {
      key: 'hospital_abbreviation',
      label: 'Location',
      priority: 'medium',
      render: (row) => row.hospital_abbreviation || '-',
    },
    {
      key: 'date_of_service',
      label: 'Date of Service',
      priority: 'medium',
      render: (row) =>
        row.date_of_service && isDateValid(row.date_of_service)
          ? formatDisplayDate(row.date_of_service)
          : '-',
    },
    {
      key: 'timestamp',
      label: 'Transmitted On',
      priority: 'medium',
      render: (row) =>
        row.timestamp
          ? new Date(row.timestamp).toLocaleString('en-US', {
              month: '2-digit',
              day: '2-digit',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
              hour12: true,
            })
          : '-',
    },
    {
      key: 'visittype',
      label: 'Visit Type',
      priority: 'low',
      render: (row) => (row.visittype ? capitalizeVisitType(row.visittype) : '-'),
    },
    {
      key: 'diagnoses',
      label: 'Diagnosis',
      priority: 'high',
      sortable: false,
      render: (row) => <DiagnosisSummary diagnoses={row.diagnoses} />,
    },
    {
      key: 'status',
      label: 'Status',
      priority: 'high',

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
      priority: 'high',
      sortable: false,
      render: (row) => (
        <div className="flex items-center justify-center">
          {row.facesheetalias && row.facesheetalias !== 'null' ? (
            <span className="status-indicator status-success">✓</span>
          ) : (
            <div className="flex items-center justify-center">
              <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center">
                <span className="text-red-600 text-xs font-bold">
                  <Cross fill="var(--fill-error)" width={10} height={10} />
                </span>
              </div>
            </div>
          )}
        </div>
      ),
    },
    {
      key: 'provider',
      label: 'Submitter',
      priority: 'low',
      render: (row) => row.charges_provider_full_name ?? '-',
    },
  ];

  if (loading) {
    return (
      <div className="w-full h-full flex justify-center items-center">
        <Loader />
      </div>
    );
  }

  return (
    <div className="w-full h-full px-3 sm:px-2 py-1 sm:py-2 flex flex-col">
      {/* Header Section */}
      <PageHeader
        title="Transmitted Charges"
        subtitle="View all charges transmitted to AMD and generate reports."
        className="mb-6 sm:mb-8"
      />

      {/* Filter Section */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
        <SearchBar
          placeholder="Search Patient Name"
          value={nameFilter}
          icon={<SearchIcon className="w-5 h-5 opacity-30" />}
          onChange={(val) => setNameFilter(val)}
          className="sm:col-span-1"
        />
        <Dropdown
          options={[
            { label: 'All Providers', value: '' },
            ...providers.map((p) => ({
              label: capitalizeNames(p.firstname, p.lastname),
              value: p.id,
            })),
          ]}
          value={providerFilter}
          onChange={(val) => setProviderFilter(val as number | '')}
          placeholder="Filter by Provider"
          className="sm:col-span-1"
          variant="variant_1"
        />
      </div>

      {/* Table Section */}
      <div className="flex-1 min-h-0 overflow-hidden">
        <Table
          columns={columns}
          data={filteredCharges}
          onSort={handleSort}
          sortOrder={sortOrder}
          activeRecordsCount={filteredCharges.length}
          activeRecordsText="Charges"
          draggable={false}
          showSelectAll={false}
        />
      </div>
    </div>
  );
};

export default TransmittedCharges;
