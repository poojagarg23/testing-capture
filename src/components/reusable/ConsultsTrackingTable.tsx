import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  getTokenFromLocalStorage,
  getTitlePrefix,
  fetchHospitals,
  fetchAuthorizedProviders,
  updateConsult,
  submitConsultForm,
} from '../../helpers/index';
import chargesPlus from '../../assets/icons/charges-plus.svg?react';
import SearchIcon from '../../assets/icons/search.svg?react';
import ClearFiltersIcon from '../../assets/icons/clear-filters.svg?react';
import { parseDate } from '../../helpers/dateUtils';

const apiUrl = import.meta.env.VITE_API_URL;

import { Hospital, Provider } from '../../types/index';
import { Consult, Filters } from '../../types/ConsultsTrackingTable.types.ts';

// Import reusable components
import PageHeader from './custom/PageHeader';
import Button from './custom/Button';
import SearchBar from './custom/SearchBar';
import Dropdown from './custom/Dropdown';
import ToggleButton from './custom/ToggleButton';
import ConsultsTable from './ConsultsTable';
import SelectColumnsModal from './SelectColumnsModal';
import AddConsultModal, { ConsultFormData } from './AddConsultModal';
import { TOAST_CONFIG } from '../../constants/index.ts';

const ConsultsTrackingTable = () => {
  const navigate = useNavigate();
  const [consults, setConsults] = useState<Consult[]>([]);
  const [originalConsults, setOriginalConsults] = useState<Consult[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isEditMode, setIsEditMode] = useState(false);
  const [consultChanges, setConsultChanges] = useState<
    Record<string, Record<string, string | number>>
  >({});
  const [isSelectColumnsModalOpen, setIsSelectColumnsModalOpen] = useState(false);
  const [isAddConsultModalOpen, setIsAddConsultModalOpen] = useState(false);
  const [isViewConsultModalOpen, setIsViewConsultModalOpen] = useState(false);
  const [selectedConsult, setSelectedConsult] = useState<Consult | null>(null);
  const [visibleColumns, setVisibleColumns] = useState<string[]>(() => {
    const savedColumns = localStorage.getItem('consultTableVisibleColumns');
    return savedColumns
      ? JSON.parse(savedColumns)
      : [
          'name',
          'facility',
          'room',
          'dob',
          'dateRequested',
          'timeRequested',
          'visitDate',
          'followupDate',
          'provider',
          'insurance',
          'rehabDx',
          'rec',
          'notes',
          'status',
        ];
  });
  const [sortOrder, setSortOrder] = useState<{
    column: string | null;
    order: 'asc' | 'desc' | null;
  }>({ column: null, order: null });

  // Add styles for edit mode
  const editModeStyles = `
    .edit-mode-table table tbody tr {
      height: auto !important;
      min-height: 80px !important;
    }
    .edit-mode-table table tbody td {
      padding: 12px 8px !important;
      vertical-align: middle !important;
    }
    .edit-mode-table input,
    .edit-mode-table select {
      min-height: 36px !important;
      height: 36px !important;
      font-size: 13px !important;
      border: 1px solid var(--border-subtle) !important;
      border-radius: 6px !important;
    }
    .edit-mode-table input:focus,
    .edit-mode-table select:focus {
      border-color: var(--primary-blue) !important;
      box-shadow: 0 0 0 3px var(--focus-ring-primary) !important;
      outline: none !important;
    }
  `;

  // Add styles for normal mode
  const normalModeStyles = `
    .consults-table table tbody tr {
      min-height: 70px !important;
    }
    .consults-table table tbody td {
      padding: 16px 10px !important;
      vertical-align: middle !important;
    }
  `;

  // Add the styles to the document head
  React.useEffect(() => {
    const styleElement = document.createElement('style');
    styleElement.textContent = isEditMode ? editModeStyles : normalModeStyles;
    document.head.appendChild(styleElement);

    return () => {
      document.head.removeChild(styleElement);
    };
  }, [isEditMode, editModeStyles, normalModeStyles]);

  const [filters, setFilters] = useState<Filters>(() => {
    const savedFilters = localStorage.getItem('consultTableFilters');
    if (savedFilters) {
      const parsed = JSON.parse(savedFilters);
      // If status is empty, default it to 'open'
      if (!parsed.status) {
        parsed.status = 'open';
      }
      return parsed;
    }
    return {
      facilityName: [],
      assignedProvider: [],
      status: 'open',
    };
  });

  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [authorizedProviders, setAuthorizedProviders] = useState<Provider[]>([]);

  useEffect(() => {
    const loadInitialData = async () => {
      const hospitalsData = await fetchHospitals();
      const providersData = await fetchAuthorizedProviders();
      setHospitals(hospitalsData);
      setAuthorizedProviders(providersData);
    };

    loadInitialData();
  }, []);

  const fetchConsultsList = useCallback(async (): Promise<void> => {
    const accessToken = getTokenFromLocalStorage();
    if (!accessToken) {
      navigate('/signin');
      return;
    }
    try {
      const response = await fetch(`${apiUrl}/consults/consults-list`, {
        method: 'GET',
        headers: {
          Authorization: 'Bearer ' + getTokenFromLocalStorage(),
        },
      });

      if (response.ok) {
        const data = await response.json();
        setOriginalConsults(data);
        applyFilters(filters, searchQuery, data);
      }
    } catch (error) {
      console.error('Error fetching consults:', error);
    }
  }, [navigate]);

  useEffect(() => {
    fetchConsultsList();
  }, [fetchConsultsList]);

  useEffect(() => {
    applyFilters(filters, searchQuery, originalConsults);
  }, [filters, searchQuery, originalConsults]);

  useEffect(() => {
    localStorage.setItem('consultTableFilters', JSON.stringify(filters));
  }, [filters]);

  useEffect(() => {
    // Save visible columns to localStorage
    localStorage.setItem('consultTableVisibleColumns', JSON.stringify(visibleColumns));
  }, [visibleColumns]);

  const applyFilters = (
    currentFilters: Filters,
    searchTerm: string,
    dataSource: Consult[] = originalConsults,
  ) => {
    const filteredResults = dataSource?.filter((consult) => {
      const matchesFacility =
        currentFilters.facilityName.length === 0 ||
        currentFilters.facilityName.includes(consult.hospital_id as number);

      const matchesProvider =
        currentFilters.assignedProvider.length === 0 ||
        currentFilters.assignedProvider.some(
          (selectedProvider: string) => consult.owning_provider_name === selectedProvider,
        );

      const matchesStatus =
        !currentFilters.status ||
        consult.status?.toLowerCase() === currentFilters.status.toLowerCase();

      const matchesSearch =
        !searchTerm ||
        `${consult.firstname} ${consult.middlename} ${consult.lastname}`
          .toLowerCase()
          .includes(searchTerm.toLowerCase());

      return matchesFacility && matchesProvider && matchesStatus && matchesSearch;
    });

    // Sort by most recent visit date first and set default sort order
    const sortByVisitDateDesc = (a: Consult, b: Consult): number => {
      const dateA = parseDate(a.visitdate);
      const dateB = parseDate(b.visitdate);

      if (!dateA && !dateB) return 0;
      if (!dateA) return 1;
      if (!dateB) return -1;

      return dateB.getTime() - dateA.getTime(); // Newest first
    };

    const sortedResults = [...filteredResults].sort(sortByVisitDateDesc);
    setConsults(sortedResults);
    setSortOrder({ column: 'visitDate', order: 'desc' });
  };

  const handleSearch = (searchTerm: string) => {
    setSearchQuery(searchTerm);
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
    localStorage.setItem('consultTableFilters', JSON.stringify(newFilters));

    const filteredResults = originalConsults.filter((consult) => {
      const matchesFacility =
        newFilters.facilityName.length === 0 ||
        newFilters.facilityName.includes(consult.hospital_id as number);
      const matchesProvider =
        newFilters.assignedProvider.length === 0 ||
        newFilters.assignedProvider.some(
          (selectedProvider: string) => consult.owning_provider_name === selectedProvider,
        );
      const matchesStatus =
        !newFilters.status || consult.status?.toLowerCase() === newFilters.status.toLowerCase();
      const matchesSearch =
        !searchQuery ||
        `${consult.firstname} ${consult.middlename} ${consult.lastname}`
          .toLowerCase()
          .includes(searchQuery.toLowerCase());

      return matchesFacility && matchesProvider && matchesStatus && matchesSearch;
    });

    // Sort by most recent visit date first and update sort order
    const sortByVisitDateDesc = (a: Consult, b: Consult): number => {
      const dateA = parseDate(a.visitdate);
      const dateB = parseDate(b.visitdate);

      if (!dateA && !dateB) return 0;
      if (!dateA) return 1;
      if (!dateB) return -1;

      return dateB.getTime() - dateA.getTime();
    };

    const sortedResults = [...filteredResults].sort(sortByVisitDateDesc);
    setConsults(sortedResults);
    setSortOrder({ column: 'visitDate', order: 'desc' });
  };

  const handleClearFilters = () => {
    const defaultFilters: Filters = {
      facilityName: [],
      assignedProvider: [],
      status: 'open',
    };
    setFilters(defaultFilters);
    const sortByVisitDateDesc = (a: Consult, b: Consult): number => {
      const dateA = parseDate(a.visitdate);
      const dateB = parseDate(b.visitdate);

      if (!dateA && !dateB) return 0;
      if (!dateA) return 1;
      if (!dateB) return -1;

      return dateB.getTime() - dateA.getTime();
    };

    setConsults([...originalConsults].sort(sortByVisitDateDesc));
    setSortOrder({ column: 'visitDate', order: 'desc' });
    localStorage.setItem('consultTableFilters', JSON.stringify(defaultFilters));
  };

  const handleEditModeToggle = () => {
    const newEditMode = !isEditMode;
    setIsEditMode(newEditMode);

    if (!newEditMode) {
      // Check if there are unsaved changes
      const hasUnsavedChanges = Object.keys(consultChanges).length > 0;

      // Clear all changes when exiting edit mode
      setConsultChanges({});
      // Refresh data when exiting edit mode
      fetchConsultsList();

      if (hasUnsavedChanges) {
        toast.warning('Edit mode disabled - unsaved changes discarded', TOAST_CONFIG.WARNING);
      } else {
        toast.info('Edit mode disabled', TOAST_CONFIG.INFO);
      }
    } else {
      toast.info('Edit mode enabled - you can now modify consult information', TOAST_CONFIG.INFO);
    }
  };

  const handleAddConsult = () => {
    setIsAddConsultModalOpen(true);
  };

  const handleSaveConsult = async (consultData: Record<string, string | number | boolean>) => {
    try {
      // Transform ConsultFormData to URLSearchParams format
      const formData = new URLSearchParams();

      // If id exists, this is an update operation
      if (consultData.id) {
        // For updates, only send the id and changed fields
        formData.append('id', consultData.id.toString());

        // Get the original consult data
        const originalConsult = selectedConsult;
        if (!originalConsult) return;
        // Helper function to safely append only defined values
        const appendIfChanged = (
          key: string,
          newValue: string | undefined,
          originalValue: string | undefined,
        ) => {
          const isValueChanged = newValue !== undefined && newValue !== originalValue;
          const isEmptyStringToNull = newValue === '' && originalValue !== '';

          if (isValueChanged || isEmptyStringToNull) {
            // If newValue is empty string or undefined/null, send literal null so backend clears field
            const valueToSend =
              newValue === '' || newValue === undefined || newValue === null ? 'null' : newValue;
            formData.append(key, valueToSend);
          }
        };

        // Only append fields that have changed and are defined
        appendIfChanged('firstname', consultData.firstName as string, originalConsult.firstname);
        appendIfChanged('lastname', consultData.lastName as string, originalConsult.lastname);
        appendIfChanged('roomnumber', consultData.room as string, originalConsult.roomnumber);
        appendIfChanged(
          'visitdate',
          consultData.visitDate as string,
          originalConsult.visitdate?.split('T')[0],
        );
        appendIfChanged(
          'followupdate',
          consultData.followupDate as string,
          originalConsult.followupdate?.split('T')[0],
        );
        appendIfChanged(
          'dob',
          consultData.dateOfBirth as string,
          originalConsult.dob?.split('T')[0],
        );
        appendIfChanged(
          'insurancecarrier',
          consultData.insuranceCarrier as string,
          originalConsult.insurancecarrier,
        );
        appendIfChanged(
          'rehabdiagnosis',
          consultData.rehabDiagnosis as string,
          originalConsult.rehabdiagnosis,
        );
        appendIfChanged('rehabrecs', consultData.rehabRecs as string, originalConsult.rehabrecs);
        appendIfChanged(
          'daterequested',
          consultData.dateRequested as string,
          originalConsult.daterequested?.split('T')[0],
        );
        appendIfChanged(
          'timerequested',
          consultData.timeRequested as string,
          originalConsult.timerequested,
        );
        appendIfChanged('notes', consultData.notes as string, originalConsult.notes);

        if (consultData.hospitalFacilityName !== originalConsult.hospital_id?.toString()) {
          formData.append('hospital_id', consultData.hospitalFacilityName as string);
          const hospitalName =
            hospitals.find((h) => h.id.toString() === consultData.hospitalFacilityName)?.hospital ||
            '';
          formData.append('hospitalfacilityname', hospitalName);
        }
        if (consultData.owningProvider !== originalConsult.owning_provider_id?.toString()) {
          formData.append('owning_provider_id', consultData.owningProvider as string);
        }
        if (consultData.status !== originalConsult.status) {
          formData.append('status', consultData.status as string);
        }
      } else {
        const appendIfDefined = (key: string, value: string | undefined) => {
          if (value !== undefined && value !== null && value !== '') {
            formData.append(key, value);
          }
        };

        // For new consults, only send defined fields
        appendIfDefined('firstname', consultData.firstName as string);
        appendIfDefined('lastname', consultData.lastName as string);
        appendIfDefined('roomnumber', consultData.room as string);
        appendIfDefined('visitdate', consultData.visitDate as string);
        appendIfDefined('followupdate', consultData.followupDate as string);
        appendIfDefined('dob', consultData.dateOfBirth as string);
        appendIfDefined('insurancecarrier', consultData.insuranceCarrier as string);
        appendIfDefined('rehabdiagnosis', consultData.rehabDiagnosis as string);
        appendIfDefined('rehabrecs', consultData.rehabRecs as string);
        appendIfDefined('daterequested', consultData.dateRequested as string);
        appendIfDefined('timerequested', consultData.timeRequested as string);
        appendIfDefined('notes', consultData.notes as string);
        appendIfDefined('hospital_id', consultData.hospitalFacilityName as string);
        const hospitalNameNew = hospitals.find(
          (h) => h.id.toString() === consultData.hospitalFacilityName,
        )?.hospital;
        appendIfDefined('hospitalfacilityname', hospitalNameNew);

        appendIfDefined('owning_provider_id', consultData.owningProvider as string);

        // Always include status and sendsmsalert for new consults
        formData.append('status', (consultData.status as string) || 'open');
        formData.append('smsAlert', consultData.smsAlert ? 'true' : 'false');
      }

      await submitConsultForm(formData);
      toast.success(
        consultData.id ? 'Consult updated successfully' : 'Consult added successfully',
        TOAST_CONFIG.SUCCESS,
      );

      // After successful save, refresh the consults list
      fetchConsultsList();
    } catch (error) {
      console.error('Error saving consult:', error);
      toast.error(
        consultData.id ? 'Failed to update consult' : 'Failed to add consult',
        TOAST_CONFIG.ERROR,
      );
    }
  };

  const handleSelectColumns = () => {
    setIsSelectColumnsModalOpen(true);
  };

  const handleColumnsChange = (columns: string[]) => {
    setVisibleColumns(columns);
  };

  const handleFieldUpdate = (consultId: string, field: string, value: string) => {
    // Track changes for this consult
    setConsultChanges((prev) => ({
      ...prev,
      [consultId]: {
        ...prev[consultId],
        [field]: value,
      },
    }));

    // Update the main consults array for immediate UI feedback
    setConsults((prev) =>
      prev.map((consult) => {
        if (consult.id?.toString() === consultId) {
          const updatedConsult = { ...consult, [field]: value };

          // Special handling for facility changes
          if (field === 'hospital_id') {
            const selectedHospital = hospitals.find((h) => h.id.toString() === value);
            if (selectedHospital) {
              updatedConsult.hospital_abbreviation = selectedHospital.abbreviation;
            }
          }

          return updatedConsult;
        }
        return consult;
      }),
    );
  };

  const handleStatusUpdate = (consultId: string, newStatus: string) => {
    // Update original consults
    setOriginalConsults((prevConsults) =>
      prevConsults.map((consult) =>
        consult.id.toString() === consultId ? { ...consult, status: newStatus } : consult,
      ),
    );

    // Update filtered consults
    setConsults((prevConsults) =>
      prevConsults.map((consult) =>
        consult.id.toString() === consultId ? { ...consult, status: newStatus } : consult,
      ),
    );
  };

  const saveConsultChanges = async (
    consultId: string,
    directChange?: { field: string; value: string },
  ) => {
    let changes = consultChanges[consultId];
    // If a direct change is provided (for immediate updates like status toggle), use it
    if (directChange) {
      changes = { [directChange.field]: directChange.value };
    }

    if (!changes || Object.keys(changes).length === 0) return;

    try {
      // Convert empty rehabrecs string to null for backend
      if (
        changes &&
        Object.prototype.hasOwnProperty.call(changes, 'rehabrecs') &&
        changes['rehabrecs'] === ''
      ) {
        changes['rehabrecs'] = null as unknown as string;
      }

      await updateConsult(parseInt(consultId), changes);

      // Clear changes for this consult after successful update
      setConsultChanges((prev) => {
        const newChanges = { ...prev };
        delete newChanges[consultId];
        return newChanges;
      });

      // If this was a status change, update both consults arrays
      if (directChange?.field === 'status') {
        handleStatusUpdate(consultId, directChange.value);
      }
    } catch (error) {
      console.error('Error updating consult:', error);
    }
  };

  // Transform Consult data to ConsultFormData format
  const transformConsultToFormData = (consult: Consult): ConsultFormData => {
    return {
      id: consult.id,
      firstName: consult.firstname || '',
      lastName: consult.lastname || '',
      room: consult.roomnumber || '',
      visitDate: consult.visitdate?.split('T')[0] || '',
      followupDate: consult.followupdate?.split('T')[0] || '',
      dateOfBirth: consult.dob?.split('T')[0] || '',
      dateRequested: consult.daterequested?.split('T')[0] || '',
      timeRequested: consult.timerequested || '',
      insuranceCarrier: consult.insurancecarrier || '',
      rehabDiagnosis: consult.rehabdiagnosis || '',
      rehabRecs: consult.rehabrecs || '',
      notes: consult.notes || '',
      hospitalFacilityName: consult.hospital_id?.toString() || '',
      owningProvider: consult.owning_provider_id?.toString() || '',
      status: (consult.status as 'open' | 'resolved') || 'open',
      smsAlert: false,
    };
  };

  const handleRowClick = (consult: Consult) => {
    // Only open view modal if not in edit mode to allow clicking on edit fields
    if (!isEditMode) {
      setSelectedConsult(consult);
      setIsViewConsultModalOpen(true);
    }
  };

  const handleSort = (column: string) => {
    // Determine sort direction
    let order: 'asc' | 'desc' = 'asc';
    if (sortOrder.column === column && sortOrder.order === 'asc') {
      order = 'desc';
    }

    setSortOrder({ column, order });

    // Map table column keys to Consult object keys
    const fieldMap: Record<string, keyof Consult> = {
      // Special
      facility: 'hospital_abbreviation',
      room: 'roomnumber',
      dateRequested: 'daterequested',
      timeRequested: 'timerequested',
      visitDate: 'visitdate',
      followupDate: 'followupdate',
      provider: 'owning_provider_name',
      insurance: 'insurancecarrier',
      rehabDx: 'rehabdiagnosis',
      rec: 'rehabrecs',
      status: 'status',
    };

    const dateColumns = ['dateRequested', 'visitDate', 'followupDate'];

    const sorted = [...consults].sort((a: Consult, b: Consult) => {
      // Handle Name column separately ("Last, First")
      if (column === 'name') {
        const nameA = `${a.lastname || ''} ${a.firstname || ''}`.toLowerCase().trim();
        const nameB = `${b.lastname || ''} ${b.firstname || ''}`.toLowerCase().trim();
        return order === 'asc' ? nameA.localeCompare(nameB) : nameB.localeCompare(nameA);
      }

      const key = fieldMap[column] ?? (column as keyof Consult);
      const valueA = a[key];
      const valueB = b[key];

      // Undefined / null handling: always push missing values to the bottom regardless of sort order
      if (valueA == null) return 1;
      if (valueB == null) return -1;

      // Date handling
      if (dateColumns.includes(column)) {
        const dateA = new Date(valueA as string);
        const dateB = new Date(valueB as string);

        const timeA = isNaN(dateA.getTime()) ? null : dateA.getTime();
        const timeB = isNaN(dateB.getTime()) ? null : dateB.getTime();

        // If both are invalid, treat as equal
        if (timeA === null && timeB === null) return 0;
        // If only one is invalid, push it to the bottom irrespective of sort order
        if (timeA === null) return 1;
        if (timeB === null) return -1;

        return order === 'asc' ? timeA - timeB : timeB - timeA;
      }

      // String handling (case-insensitive)
      if (typeof valueA === 'string' && typeof valueB === 'string') {
        const strA = (valueA as string).toLowerCase();
        const strB = (valueB as string).toLowerCase();
        return order === 'asc' ? strA.localeCompare(strB) : strB.localeCompare(strA);
      }

      // Number handling
      if (typeof valueA === 'number' && typeof valueB === 'number') {
        return order === 'asc'
          ? (valueA as number) - (valueB as number)
          : (valueB as number) - (valueA as number);
      }

      return 0;
    });

    setConsults(sorted);
  };

  return (
    <div className="w-full h-full bg-white rounded-2xl shadow-lg px-4 sm:px-6  py-2 md:py-6 flex flex-col">
      {/* Header Section */}
      <PageHeader title="Consult Tracker" showBackButton={true} />

      {/* Search and Actions Section */}
      <div
        className="flex flex-col sm:flex-row sm:justify-between items-start"
        style={{ gap: 'var(--filter-gap)', marginBottom: 'var(--section-gap)' }}
      >
        <SearchBar
          value={searchQuery}
          onChange={handleSearch}
          placeholder="Search consults..."
          icon={<SearchIcon className="w-5 h-5 opacity-30" />}
          className="rounded-full w-full "
        />
        <div className="flex gap-3 sm:ml-auto">
          <Button
            variant="secondary"
            icon={chargesPlus}
            className="whitespace-nowrap sm:w-auto"
            onClick={handleAddConsult}
          >
            Add Consult
          </Button>
          <Button
            variant="dark"
            className="whitespace-nowrap sm:w-auto"
            onClick={handleSelectColumns}
          >
            Select Columns
          </Button>
        </div>
      </div>

      {/* Toggle Section */}
      <div className="flex items-center gap-3 mb-6">
        <ToggleButton
          checked={isEditMode}
          onChange={handleEditModeToggle}
          title="Toggle Edit Mode"
        />
        <span className="text-xs lg:text-sm font-gotham-medium text-secondary">
          Turn on to make changes to consult information.
        </span>
      </div>

      {/* Filters Section */}
      <div
        className="flex flex-col md:flex-row md:items-center"
        style={{ gap: 'var(--filter-gap)', marginBottom: 'var(--section-gap)' }}
      >
        <div className="flex flex-1 flex-wrap items-center" style={{ gap: 'var(--filter-gap)' }}>
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
          />
          <Dropdown
            options={[
              { label: 'All Status', value: '' },
              { label: 'Open', value: 'open' },
              { label: 'Resolved', value: 'resolved' },
            ]}
            value={filters.status}
            onChange={(val) => handleFilterChange('status', val)}
            placeholder="All Status"
            maxWidth="200px"
            className="rounded-full"
          />
          <div className="flex items-center justify-center h-9 lg:h-11">
            <ClearFiltersIcon
              onClick={handleClearFilters}
              className="w-7 h-7 lg:w-9 lg:h-9 text-[var(--text-secondary)] icon-interactive"
              title="Clear Filters"
            />
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="flex-1 min-h-0 overflow-hidden">
        <ConsultsTable
          consults={consults}
          isEditMode={isEditMode}
          hospitals={hospitals}
          authorizedProviders={authorizedProviders}
          onFieldUpdate={handleFieldUpdate}
          onSaveChanges={saveConsultChanges}
          onRowClick={handleRowClick}
          visibleColumns={visibleColumns}
          onSort={handleSort}
          sortOrder={sortOrder}
        />
      </div>

      {/* Select Columns Modal */}
      <SelectColumnsModal
        isOpen={isSelectColumnsModalOpen}
        onClose={() => setIsSelectColumnsModalOpen(false)}
        visibleColumns={visibleColumns}
        onColumnsChange={handleColumnsChange}
      />

      {/* Add Consult Modal */}
      <AddConsultModal
        isOpen={isAddConsultModalOpen}
        onClose={() => setIsAddConsultModalOpen(false)}
        onSave={handleSaveConsult}
      />

      {/* View Consult Modal */}
      <AddConsultModal
        isOpen={isViewConsultModalOpen}
        onClose={() => {
          setIsViewConsultModalOpen(false);
          setSelectedConsult(null);
        }}
        mode="view"
        initialData={selectedConsult ? transformConsultToFormData(selectedConsult) : undefined}
        onSave={handleSaveConsult}
        onEdit={() => {
          // Handle edit mode activation if needed
          toast.info('Edit mode activated', TOAST_CONFIG.INFO);
        }}
      />
    </div>
  );
};

export default ConsultsTrackingTable;
