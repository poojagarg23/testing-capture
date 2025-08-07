import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  capitalizeNames,
  capitalizeVisitType,
  fetchAuthorizedProviders,
  fetchHospitals,
  getPatients,
  getTitlePrefix,
  getTokenFromLocalStorage,
  updatePatientStatus,
  ViewFacesheet,
} from '../../helpers/index';

import SearchIcon from '../../assets/icons/search.svg?react';
import ClearFiltersIcon from '../../assets/icons/clear-filters.svg?react';
import Cross from '../../assets/icons/facesheet_cross.svg?react';
import Open from '../../assets/icons/open.svg?react';
import { toast } from 'react-toastify';
import { Hospital, Provider } from '../../types/index.ts';
import { Patient } from '../../types/Patient.types.ts';
import { SortState, FilterState } from '../../types/PatientList.types.ts';
import Table, { TableColumn } from '../reusable/custom/Table';
import Button from '../reusable/custom/Button';
import Dropdown from '../reusable/custom/Dropdown';
import SearchBar from '../reusable/custom/SearchBar';
import SelectColumnsModal from '../reusable/SelectColumnsModal';
import ToggleButton from '../reusable/custom/ToggleButton';
import DiagnosisSummary from '../reusable/DiagnosisSummary.tsx';
import CustomModal from '../reusable/CustomModal';
import GetMultiplePatientsData from '../single/GetMultiplePatientsData';
import PlusIcon from '../../assets/icons/plus-icon.svg?react';
import { formatDisplayDate, isDateValid } from '../../helpers/dateUtils.ts';
import { TOAST_CONFIG } from '../../constants/index.ts';

const PatientList: React.FC = () => {
  const navigate = useNavigate();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [originalPatients, setOriginalPatients] = useState<Patient[]>([]);
  const [sortOrder, setSortOrder] = useState<SortState>({ column: null, order: null });
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState<string>('');
  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  const [filters, setFilters] = useState<FilterState>(() => {
    const savedFilters = localStorage.getItem('patientTableFilters');
    return savedFilters
      ? JSON.parse(savedFilters)
      : {
          facilityName: [],
          assignedProvider: [],
          status: 'active',
        };
  });
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [authorizedProviders, setAuthorizedProviders] = useState<Provider[]>([]);
  const [loadingFacesheet, setLoadingFacesheet] = useState<number | null>(null);
  const [showAddPatientsModal, setShowAddPatientsModal] = useState(false);
  const [useFixedWidth, setUseFixedWidth] = useState<boolean>(true);
  const [extraWideModal, setExtraWideModal] = useState<boolean>(false);
  const [modalTitle, setModalTitle] = useState<string>('Upload Patient Face Sheets');
  const [isSelectColumnsModalOpen, setIsSelectColumnsModalOpen] = useState<boolean>(false);
  const [visibleColumns, setVisibleColumns] = useState<string[]>(() => {
    const savedColumns = localStorage.getItem('patientTableVisibleColumns');

    return savedColumns
      ? JSON.parse(savedColumns)
      : [
          'name',
          'dateofbirth',
          'admitdate',
          'hospital_abbreviation',
          'owning_provider_name',
          'visittype',
          'diagnoses',
          'status',
          'facesheet',
          'note',
        ];
  });

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300); // 300ms delay

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Persist visible columns preference
  useEffect(() => {
    localStorage.setItem('patientTableVisibleColumns', JSON.stringify(visibleColumns));
  }, [visibleColumns]);

  useEffect(() => {
    const loadInitialData = async () => {
      const hospitalsData = await fetchHospitals();
      const providersData = await fetchAuthorizedProviders();

      setHospitals(hospitalsData);
      setAuthorizedProviders(providersData);
    };

    loadInitialData();
  }, []);

  // Load initial data once
  useEffect(() => {
    const accessToken = getTokenFromLocalStorage();
    if (!accessToken) {
      navigate('/signin');
      return;
    }

    getPatients().then((p: Patient[]) => {
      setOriginalPatients(p);
    });
  }, [navigate]);

  // Use useMemo to compute filtered patients - this ensures consistency and prevents race conditions
  const filteredPatients = useMemo(() => {
    if (originalPatients.length === 0) return [];

    return originalPatients.filter((patient) => {
      const matchesFacility =
        filters.facilityName.length === 0 || filters.facilityName.includes(patient.hospital_id);
      const matchesProvider =
        filters.assignedProvider.length === 0 ||
        filters.assignedProvider.some(
          (selectedProvider: string) => patient.owning_provider_name === selectedProvider,
        );
      const matchesStatus =
        !filters.status || patient.status?.toLowerCase() === filters.status.toLowerCase();
      const matchesSearch =
        !debouncedSearchQuery ||
        `${patient.firstname} ${patient.middlename} ${patient.lastname}`
          .toLowerCase()
          .includes(debouncedSearchQuery.toLowerCase());

      return matchesFacility && matchesProvider && matchesStatus && matchesSearch;
    });
  }, [
    originalPatients,
    filters.facilityName,
    filters.assignedProvider,
    filters.status,
    debouncedSearchQuery,
  ]);

  // Update patients state when filtered results change
  useEffect(() => {
    setPatients(filteredPatients);
  }, [filteredPatients]);

  const handleStatusToggle = async (patient: Patient) => {
    if (!isEditMode) return;

    const newStatus = patient.status === 'active' ? 'inactive' : 'active';
    try {
      const success = await updatePatientStatus(newStatus, patient, true);
      if (success) {
        // Update both patients and originalPatients arrays
        setPatients((prevPatients) =>
          prevPatients.map((p) => (p.id === patient.id ? { ...p, status: newStatus } : p)),
        );
        setOriginalPatients((prevPatients) =>
          prevPatients.map((p) => (p.id === patient.id ? { ...p, status: newStatus } : p)),
        );
        toast.success('Patient status updated successfully', TOAST_CONFIG.SUCCESS);
      }
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Error updating status', TOAST_CONFIG.ERROR);
    }
  };

  const handleViewFacesheet = async (patient: Patient) => {
    if (!patient.id || !patient.facesheetalias) {
      toast.error('Face Sheet not available for this patient', TOAST_CONFIG.ERROR);
      return;
    }

    setLoadingFacesheet(patient.id);
    try {
      const url = await ViewFacesheet(patient.id, patient.facesheetalias);
      // Small delay to show loading state
      setTimeout(() => {
        window.open(url, '_blank');
      }, 100);
    } catch (error) {
      console.error('Error viewing facesheet:', error);
      toast.error('Error loading facesheet', TOAST_CONFIG.ERROR);
    } finally {
      setLoadingFacesheet(null);
    }
  };

  const handleSort = (column: string) => {
    let order: 'asc' | 'desc' = 'asc';
    if (sortOrder.column === column && sortOrder.order === 'asc') {
      order = 'desc';
    }

    setSortOrder({ column, order });

    const sortedPatients = [...patients].sort((a: Patient, b: Patient) => {
      if (column === 'name') {
        const nameA = `${a.lastname || ''} ${a.firstname || ''}`.toLowerCase().trim();
        const nameB = `${b.lastname || ''} ${b.firstname || ''}`.toLowerCase().trim();

        return order === 'asc' ? nameA.localeCompare(nameB) : nameB.localeCompare(nameA);
      }

      if (column === 'facesheetalias') {
        if (a.facesheetalias === b.facesheetalias) {
          const nameA = `${a.lastname} ${a.firstname} ${a.middlename}`.toLowerCase().trim();
          const nameB = `${b.lastname} ${b.firstname} ${b.middlename}`.toLowerCase().trim();
          return nameA.localeCompare(nameB);
        }
        return order === 'asc' ? (a.facesheetalias ? -1 : 1) : a.facesheetalias ? 1 : -1;
      }

      if (column === 'hospitalfacilityname') {
        const facilityA = (a.hospital_abbreviation || '').toLowerCase();
        const facilityB = (b.hospital_abbreviation || '').toLowerCase();

        if (facilityA === facilityB) {
          const nameA = `${a.lastname} ${a.firstname}`.toLowerCase().trim();
          const nameB = `${b.lastname} ${b.firstname}`.toLowerCase().trim();
          return nameA.localeCompare(nameB);
        }

        return order === 'asc'
          ? facilityA.localeCompare(facilityB)
          : facilityB.localeCompare(facilityA);
      }

      if (column === 'provider') {
        const providerA = (a.owning_provider_name || '').toLowerCase();
        const providerB = (b.owning_provider_name || '').toLowerCase();

        if (providerA < providerB) return order === 'asc' ? -1 : 1;
        if (providerA > providerB) return order === 'asc' ? 1 : -1;
        return 0;
      }

      const valueA = a[column as keyof Patient];
      const valueB = b[column as keyof Patient];

      if (valueA === null) return -1;
      if (valueB === null) return -1;

      const locationA = String(valueA).toLowerCase();
      const locationB = String(valueB).toLowerCase();

      if (locationA < locationB) return order === 'asc' ? -1 : 1;
      if (locationA > locationB) return order === 'asc' ? 1 : -1;

      const nameA = `${a.lastname} ${a.firstname} ${a.middlename}`.toLowerCase().trim();
      const nameB = `${b.lastname} ${b.firstname} ${b.middlename}`.toLowerCase().trim();

      if (nameA < nameB) return -1;
      if (nameA > nameB) return 1;

      return 0;
    });
    setPatients(sortedPatients);
  };

  //create a function to handle the search input
  const handleSearch = (searchTerm: string) => {
    setSearchQuery(searchTerm);
    // No need to call filterPatients here - debouncing will handle it
  };

  const AddPatient = () => {
    setUseFixedWidth(true); // Start with fixed width for upload form
    setExtraWideModal(false);
    setModalTitle('Upload Patient Face Sheets'); // Reset to initial title
    setShowAddPatientsModal(true);
  };

  const handleContentChange = (contentType: 'upload' | 'details' | 'multiple') => {
    switch (contentType) {
      case 'upload':
        setUseFixedWidth(true); // Fixed 600px for upload
        setExtraWideModal(false);
        setModalTitle('Upload Patient Face Sheets');
        break;
      case 'details':
        setUseFixedWidth(false); // Auto width for other content
        setExtraWideModal(false);
        setModalTitle('Patient Details');
        break;
      case 'multiple':
        setUseFixedWidth(false); // Auto width for other content
        setExtraWideModal(true); // Wider for summary screen
        setModalTitle('Add Multiple Patients');
        break;
    }
  };

  const handleFilterChange = (field: string, value: string | number | (string | number)[]) => {
    const newFilters = { ...filters };
    if (field === 'facilityName') {
      // For facility dropdown, convert to number array
      newFilters[field] = Array.isArray(value) ? (value as number[]) : [value as number];
    } else if (field === 'assignedProvider') {
      // For provider dropdown, keep as string array
      newFilters[field] = Array.isArray(value) ? (value as string[]) : [value as string];
    } else if (field === 'status') {
      newFilters[field] = value as string;
    }

    setFilters(newFilters);
    localStorage.setItem('patientTableFilters', JSON.stringify(newFilters));
    // Filtering will be handled by the useEffect that watches for filter changes
  };

  const handleClearFilters = () => {
    const defaultFilters: FilterState = {
      facilityName: [],
      assignedProvider: [],
      status: '', // Empty string means "All Status"
    };
    setFilters(defaultFilters);
    setSearchQuery(''); // Also clear search query
    localStorage.setItem('patientTableFilters', JSON.stringify(defaultFilters));
    // Filtering will be handled by the useEffect that watches for filter changes
  };

  const handleEditModeToggle = () => {
    const newEditMode = !isEditMode;
    setIsEditMode(newEditMode);

    if (!newEditMode) {
      // Refresh data when exiting edit mode
      getPatients().then((p: Patient[]) => {
        setOriginalPatients(p);
        // Filtering will be handled by the useEffect that watches for originalPatients changes
      });
    }
  };

  const handleSelectColumns = () => {
    setIsSelectColumnsModalOpen(true);
  };

  const handleColumnsChange = (columns: string[]) => {
    setVisibleColumns(columns);
  };

  const EditDetails = (patient: Partial<Patient>) => {
    navigate('/patient', {
      state: { patient, mode: 'view&edit', autoFillChoice: true, sourceContext: 'patientList' },
    });
  };

  const columns: TableColumn<Patient>[] = [
    {
      key: 'name',
      label: 'Name',
      render: (p) => (
        <span className="flex items-center gap-2">
          <span
            onClick={(e) => {
              e.stopPropagation();
              EditDetails(p);
            }}
            className="cursor-pointer"
          >
            <Open style={{ fill: 'var(--primary-blue)' }} className="icon-size-sm flex-shrink-0" />
          </span>
          <span className="truncate min-w-0" title={capitalizeNames(p.firstname, p.lastname)}>
            {capitalizeNames(p.firstname, p.lastname)}
          </span>
        </span>
      ),
      priority: 'high',
    },
    {
      key: 'dateofbirth',
      label: 'DOB',
      render: (p) =>
        p.dateofbirth && isDateValid(p.dateofbirth) ? formatDisplayDate(p.dateofbirth) : '',
      priority: 'medium',
    },
    {
      key: 'admitdate',
      label: 'Admit Date',
      render: (p) =>
        p.admitdate && isDateValid(p.admitdate) ? formatDisplayDate(p.admitdate) : '',
      priority: 'low',
    },
    {
      key: 'hospital_abbreviation',
      label: 'Facility',
      render: (p) => p.hospital_abbreviation || '',
      priority: 'high',
    },
    {
      key: 'owning_provider_name',
      label: 'Provider',
      priority: 'medium',
    },
    {
      key: 'visittype',
      label: 'Visit Type',
      render: (p) => (p.visittype ? capitalizeVisitType(p.visittype) : '-'),
      priority: 'low',
    },
    {
      key: 'diagnoses',
      label: 'Diagnoses',
      sortable: false,
      render: (p) => (
        <DiagnosisSummary diagnoses={Array.isArray(p.diagnoses) ? p.diagnoses : undefined} />
      ),
      priority: 'low',
    },
    {
      key: 'status',
      label: 'Status',
      render: (p) =>
        isEditMode ? (
          <div className="flex items-center justify-center">
            <ToggleButton
              checked={p.status === 'active'}
              onChange={() => handleStatusToggle(p)}
              title={`Toggle status (${p.status === 'active' ? 'Active' : 'Inactive'})`}
              height="h-6"
              toggleIconName="tick"
              colorVariant="green"
            />
          </div>
        ) : (
          <span
            className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
              p.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}
          >
            {p.status ? p.status.charAt(0).toUpperCase() + p.status.slice(1) : ''}
          </span>
        ),
      priority: 'high',
    },
    {
      key: 'facesheet',
      label: 'Face Sheet',
      sortable: false,
      render: (p) =>
        p.facesheetalias ? (
          <span
            onClick={(e) => {
              e.stopPropagation();
              handleViewFacesheet(p);
            }}
            className={`inline-flex items-center justify-center bg-primary-gradient hover:opacity-90 text-white text-xs font-medium px-2 py-1 rounded-md cursor-pointer transition-all min-w-[40px] h-6 ${
              loadingFacesheet === p.id ? 'opacity-50 cursor-wait' : ''
            }`}
          >
            {loadingFacesheet === p.id ? 'Loading...' : 'View'}
          </span>
        ) : (
          <div className="flex items-center justify-center">
            <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center">
              <span className="text-red-600 text-xs font-bold">
                <Cross style={{ fill: 'var(--fill-error)' }} width={10} height={10} />
              </span>
            </div>
          </div>
        ),
      priority: 'medium',
    },
    {
      key: 'note',
      label: 'Note',
      sortable: false,
      render: (p) =>
        p.has_note ? (
          <span className="status-indicator status-success">✓</span>
        ) : (
          <div className="flex items-center justify-center">
            <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center">
              <span className="text-red-600 text-xs font-bold">
                <Cross style={{ fill: 'var(--fill-error)' }} width={10} height={10} />
              </span>
            </div>
          </div>
        ),
      priority: 'low',
      align: 'center',
    },
  ];

  // Promote any user-selected column to "high" priority so it’s visible even on the smallest
  // breakpoints. This overrides the static priority used for responsive hiding in the base
  // `Table` component.
  const displayedColumns = useMemo(() => {
    return columns
      .filter((col) => visibleColumns.includes(col.key))
      .map((col) => ({ ...col, priority: 'high' as const }));
  }, [columns, visibleColumns]);

  // If there is no saved preference (first load) make sure we persist the default high list so the
  // modal reflects the correct checked state.
  useEffect(() => {
    if (!localStorage.getItem('patientTableVisibleColumns')) {
      localStorage.setItem('patientTableVisibleColumns', JSON.stringify(visibleColumns));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="w-full h-full bg-white rounded-2xl shadow-lg px-4 sm:px-6  py-2 md:py-6 flex flex-col">
      {/* Search and Actions Section */}

      {/* Filters + Search Section */}
      <div
        className="flex flex-col 2xl:flex-row 2xl:items-center 2xl:justify-between"
        style={{ gap: 'var(--filter-gap)', marginBottom: 'var(--section-gap)' }}
      >
        <div className="flex flex-1 flex-wrap" style={{ gap: 'var(--filter-gap)' }}>
          <Dropdown
            options={hospitals.map((h) => ({
              label: `${h.abbreviation} (${h.hospital})`,
              value: h.id,
            }))}
            value={filters.facilityName}
            onChange={(val) => handleFilterChange('facilityName', val)}
            placeholder="All Facilities"
            multiple
            maxWidth="400px"
            className="rounded-full"
            variant="variant_1"
          />
          <Dropdown
            options={authorizedProviders.map((p) => ({
              label: `${getTitlePrefix(p.title)} ${p.firstname} ${p.lastname}`,
              value: `${getTitlePrefix(p.title)} ${p.firstname} ${p.lastname}`,
            }))}
            value={filters.assignedProvider}
            onChange={(val) => handleFilterChange('assignedProvider', val)}
            placeholder="All Providers"
            multiple
            maxWidth="300px"
            className="rounded-full"
            variant="variant_1"
          />
          <Dropdown
            options={[
              { label: 'All Status', value: '' },
              { label: 'Active', value: 'active' },
              { label: 'Inactive', value: 'inactive' },
            ]}
            value={filters.status}
            onChange={(val) => handleFilterChange('status', val)}
            placeholder="All Status"
            maxWidth="140px"
            className="rounded-full"
            variant="variant_1"
          />
          <div className="flex items-center justify-center h-9 lg:h-11">
            <ClearFiltersIcon
              onClick={handleClearFilters}
              className="w-7 h-7 lg:w-9 lg:h-9 text-[var(--text-secondary)] icon-interactive"
              title="Clear Filters"
            />
          </div>
          <ToggleButton
            checked={isEditMode}
            onChange={handleEditModeToggle}
            title="Toggle Edit Mode"
          />
        </div>
        <div
          className="flex flex-col sm:flex-row sm:items-center"
          style={{ gap: 'var(--filter-gap)' }}
        >
          <SearchBar
            value={searchQuery}
            onChange={handleSearch}
            placeholder="Search patients..."
            icon={<SearchIcon className="w-5 h-5 opacity-30" />}
            className="rounded-full w-full sm:w-72"
          />
          <Button
            variant="dark"
            className="w-full sm:w-auto whitespace-nowrap"
            onClick={handleSelectColumns}
          >
            Select Columns
          </Button>
          <Button
            variant="secondary"
            icon={PlusIcon}
            className="w-full sm:w-auto whitespace-nowrap"
            onClick={AddPatient}
          >
            Add Patients
          </Button>
        </div>
      </div>
      <div className="flex-1 min-h-0 overflow-hidden">
        <Table
          columns={displayedColumns}
          data={patients}
          activeRecordsCount={patients.length}
          onSort={handleSort}
          sortOrder={sortOrder}
        />
      </div>
      <CustomModal
        isOpen={showAddPatientsModal}
        onClose={() => setShowAddPatientsModal(false)}
        title={modalTitle}
        useFixedWidth={useFixedWidth}
        extraWide={extraWideModal}
      >
        <GetMultiplePatientsData
          onContentChange={handleContentChange}
          onClose={() => setShowAddPatientsModal(false)}
          onRefetch={() => {
            getPatients().then((p: Patient[]) => {
              setOriginalPatients(p);
            });
          }}
        />
      </CustomModal>

      {/* Select Columns Modal */}
      <SelectColumnsModal
        isOpen={isSelectColumnsModalOpen}
        onClose={() => setIsSelectColumnsModalOpen(false)}
        visibleColumns={visibleColumns}
        onColumnsChange={handleColumnsChange}
        availableColumns={[
          { key: 'name', label: 'Name' },
          { key: 'dateofbirth', label: 'DOB' },
          { key: 'admitdate', label: 'Admit Date' },
          { key: 'hospital_abbreviation', label: 'Facility' },
          { key: 'owning_provider_name', label: 'Provider' },
          { key: 'visittype', label: 'Visit Type' },
          { key: 'diagnoses', label: 'Diagnoses' },
          { key: 'status', label: 'Status' },
          { key: 'facesheet', label: 'Face Sheet' },
          { key: 'note', label: 'Note' },
        ]}
      />
    </div>
  );
};

export default PatientList;
