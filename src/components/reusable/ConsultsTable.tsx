import React, { useState, useEffect } from 'react';
import { getTitlePrefix } from '../../helpers/index';
import { Hospital, Provider } from '../../types/index';
import { Consult } from '../../types/ConsultsTrackingTable.types';
import Open from '../../assets/icons/open.svg?react';

// Import reusable components
import Table, { TableColumn } from './custom/Table';
import ToggleButton from './custom/ToggleButton';
import EditableField from './custom/EditableField';
import EditableSelect from './custom/EditableSelect';
import EditableNameField from './custom/EditableNameField';
import { isDateValid, formatDisplayDate, formatISODate } from '../../helpers/dateUtils';

interface ConsultsTableProps {
  consults: Consult[];
  isEditMode: boolean;
  hospitals: Hospital[];
  authorizedProviders: Provider[];
  onFieldUpdate: (consultId: string, field: string, value: string) => void;
  onSaveChanges: (consultId: string, directChange?: { field: string; value: string }) => void;
  onRowClick?: (consult: Consult) => void;
  visibleColumns?: string[];
  editableFields?: string[];
  onSort?: (column: string) => void;
  sortOrder?: { column: string | null; order: 'asc' | 'desc' | null };
}

const ConsultsTable: React.FC<ConsultsTableProps> = ({
  consults,
  isEditMode,
  authorizedProviders,
  onFieldUpdate,
  onSaveChanges,
  onRowClick,
  visibleColumns = [
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
  ],
  editableFields = [
    'room',
    'visitDate',
    'followupDate',
    'insurance',
    'rehabDx',
    'rec',
    'notes',
    'status',
  ],
  onSort,
  sortOrder,
}): JSX.Element => {
  const [sortedConsults, setSortedConsults] = useState<Consult[]>(consults);

  useEffect(() => {
    setSortedConsults(consults);
  }, [consults]);

  const handleLocalSort = (column: string) => {
    if (onSort) {
      onSort(column);
    }
  };

  const capitalizeNames = (firstname: string | undefined, lastname: string | undefined): string => {
    const capitalizeFirstLetter = (str: string): string =>
      str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
    const capitalizedFirstName = firstname ? capitalizeFirstLetter(firstname) : '';
    const capitalizedLastName = lastname ? capitalizeFirstLetter(lastname) : '';
    return `${capitalizedLastName}, ${capitalizedFirstName}`;
  };

  const renderStatusToggle = (consult: Consult) => {
    if (!(isEditMode && editableFields.includes('status'))) {
      return (
        <span
          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
            consult.status === 'open' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}
        >
          {consult.status ? consult.status.charAt(0).toUpperCase() + consult.status.slice(1) : ''}
        </span>
      );
    }

    const isOpen = consult.status?.toLowerCase() === 'open';

    return (
      <div className="flex items-center justify-center">
        <ToggleButton
          checked={isOpen}
          onChange={() => {
            const newStatus = isOpen ? 'resolved' : 'open';
            onFieldUpdate(consult.id?.toString() || '', 'status', newStatus);
            if (consult.id) {
              onSaveChanges(consult.id.toString(), { field: 'status', value: newStatus });
            }
          }}
          title={`Toggle between Open and Resolved`}
          width="w-13"
          height="h-6"
          colorVariant="green"
        />
      </div>
    );
  };

  const columns: TableColumn<Consult>[] = [
    {
      key: 'name',
      label: 'Name',
      render: (consult) => (
        <div className="flex items-center gap-2">
          <span
            onClick={(e) => {
              e.stopPropagation();
              if (onRowClick) {
                onRowClick(consult);
              }
            }}
            className="cursor-pointer"
            title={isEditMode ? 'Open for editing' : 'View details'}
          >
            <Open style={{ fill: 'var(--primary-blue)' }} className="icon-size-sm flex-shrink-0" />
          </span>
          <EditableNameField
            id={consult.id?.toString() || ''}
            firstName={consult.firstname || ''}
            middleName={consult.middlename || ''}
            lastName={consult.lastname || ''}
            isEditMode={isEditMode && editableFields.includes('name')}
            onUpdate={onFieldUpdate}
            onSave={onSaveChanges}
            displayValue={capitalizeNames(consult.firstname, consult.lastname)}
          />
        </div>
      ),
      priority: 'high',
    },
    {
      key: 'facility',
      label: 'Facility',
      render: (consult) => consult.hospital_abbreviation || '-',
      priority: 'high',
    },
    {
      key: 'room',
      label: 'Room',
      render: (consult) => (
        <EditableField
          id={consult.id?.toString() || ''}
          field="roomnumber"
          value={consult.roomnumber || (!isEditMode ? '-' : '')}
          isEditMode={isEditMode && editableFields.includes('room')}
          onUpdate={onFieldUpdate}
          onSave={onSaveChanges}
        />
      ),
      priority: 'high',
    },
    {
      key: 'dob',
      label: 'DOB',
      render: (consult) =>
        isEditMode && editableFields.includes('dob') ? (
          <EditableField
            id={consult.id?.toString() || ''}
            field="dob"
            value={isDateValid(consult.dob) ? formatISODate(consult.dob) : !isEditMode ? '-' : ''}
            type="date"
            isEditMode={isEditMode && editableFields.includes('dob')}
            onUpdate={onFieldUpdate}
            onSave={onSaveChanges}
          />
        ) : isDateValid(consult.dob) ? (
          formatDisplayDate(consult.dob)
        ) : (
          '-'
        ),
      priority: 'high',
    },
    {
      key: 'dateRequested',
      label: 'Date Req.',
      render: (consult) =>
        isEditMode && editableFields.includes('dateRequested') ? (
          <EditableField
            id={consult.id?.toString() || ''}
            field="daterequested"
            value={
              isDateValid(consult.daterequested)
                ? formatISODate(consult.daterequested)
                : !isEditMode
                  ? '-'
                  : ''
            }
            type="date"
            isEditMode={isEditMode && editableFields.includes('dateRequested')}
            onUpdate={onFieldUpdate}
            onSave={onSaveChanges}
          />
        ) : isDateValid(consult.daterequested) ? (
          formatDisplayDate(consult.daterequested)
        ) : (
          '-'
        ),
      priority: 'high',
    },
    {
      key: 'timeRequested',
      label: 'Time Req.',
      render: (consult) => (
        <EditableField
          id={consult.id?.toString() || ''}
          field="timerequested"
          value={consult.timerequested || (!isEditMode ? '-' : '')}
          type="time"
          isEditMode={isEditMode && editableFields.includes('timeRequested')}
          onUpdate={onFieldUpdate}
          onSave={onSaveChanges}
        />
      ),
      priority: 'high',
    },
    {
      key: 'visitDate',
      label: 'Visit Date',
      render: (consult) =>
        isEditMode && editableFields.includes('visitDate') ? (
          <EditableField
            id={consult.id?.toString() || ''}
            field="visitdate"
            value={
              isDateValid(consult.visitdate)
                ? formatISODate(consult.visitdate)
                : !isEditMode
                  ? '-'
                  : ''
            }
            type="date"
            isEditMode={isEditMode && editableFields.includes('visitDate')}
            onUpdate={onFieldUpdate}
            onSave={onSaveChanges}
          />
        ) : isDateValid(consult.visitdate) ? (
          formatDisplayDate(consult.visitdate)
        ) : (
          '-'
        ),
      priority: 'high',
    },
    {
      key: 'followupDate',
      label: 'F/U Date',
      render: (consult) =>
        isEditMode && editableFields.includes('followupDate') ? (
          <EditableField
            id={consult.id?.toString() || ''}
            field="followupdate"
            value={
              isDateValid(consult.followupdate)
                ? formatISODate(consult.followupdate)
                : !isEditMode
                  ? '-'
                  : ''
            }
            type="date"
            isEditMode={isEditMode && editableFields.includes('followupDate')}
            onUpdate={onFieldUpdate}
            onSave={onSaveChanges}
          />
        ) : isDateValid(consult.followupdate) ? (
          formatDisplayDate(consult.followupdate)
        ) : (
          '-'
        ),
      priority: 'high',
    },
    {
      key: 'provider',
      label: 'Provider',
      render: (consult) =>
        isEditMode && editableFields.includes('provider') ? (
          <EditableSelect
            id={consult.id?.toString() || ''}
            field="owning_provider_name"
            value={consult.owning_provider_name || '-'}
            options={authorizedProviders.map((provider) => ({
              label: `${getTitlePrefix(provider.title)} ${provider.firstname} ${provider.lastname}`,
              value: `${getTitlePrefix(provider.title)} ${provider.firstname} ${provider.lastname}`,
            }))}
            placeholder="Select Provider"
            isEditMode={isEditMode && editableFields.includes('provider')}
            onUpdate={onFieldUpdate}
            onSave={onSaveChanges}
          />
        ) : (
          consult.owning_provider_name || '-'
        ),
      priority: 'high',
    },
    {
      key: 'insurance',
      label: 'Insurance',
      render: (consult) => (
        <EditableField
          id={consult.id?.toString() || ''}
          field="insurancecarrier"
          value={consult.insurancecarrier || (!isEditMode ? '-' : '')}
          isEditMode={isEditMode && editableFields.includes('insurance')}
          onUpdate={onFieldUpdate}
          onSave={onSaveChanges}
        />
      ),
      priority: 'high',
    },
    {
      key: 'rehabDx',
      label: 'Rehab Dx',
      render: (consult) => (
        <EditableField
          id={consult.id?.toString() || ''}
          field="rehabdiagnosis"
          value={consult.rehabdiagnosis || (!isEditMode ? '-' : '')}
          isEditMode={isEditMode && editableFields.includes('rehabDx')}
          onUpdate={onFieldUpdate}
          onSave={onSaveChanges}
        />
      ),
      priority: 'high',
    },
    {
      key: 'rec',
      label: 'Rec',
      render: (consult) =>
        isEditMode && editableFields.includes('rec') ? (
          <EditableSelect
            id={consult.id?.toString() || ''}
            field="rehabrecs"
            value={consult.rehabrecs || '-'}
            options={[
              { label: 'Select Rehab Rec', value: '' },
              { label: 'IRF', value: 'IRF' },
              { label: 'SNF', value: 'SNF' },
              { label: 'HH', value: 'HH' },
              { label: 'Other', value: 'Other' },
            ]}
            placeholder="Selec Rehab Rec"
            isEditMode={isEditMode && editableFields.includes('rec')}
            onUpdate={onFieldUpdate}
            onSave={onSaveChanges}
          />
        ) : (
          consult.rehabrecs || '-'
        ),
      priority: 'high',
    },
    {
      key: 'notes',
      label: 'Notes',
      render: (consult) => (
        <EditableField
          id={consult.id?.toString() || ''}
          field="notes"
          value={consult.notes || (!isEditMode ? '-' : '')}
          isEditMode={isEditMode && editableFields.includes('notes')}
          onUpdate={onFieldUpdate}
          onSave={onSaveChanges}
        />
      ),
      priority: 'high',
    },
    {
      key: 'status',
      label: 'Status',
      render: (consult) => renderStatusToggle(consult),
      priority: 'high',
    },
  ];

  // Filter columns based on visibility
  const filteredColumns = columns.filter((column) => visibleColumns.includes(column.key));

  return (
    <div className="h-full">
      <Table
        columns={filteredColumns}
        data={sortedConsults}
        activeRecordsCount={consults.length}
        activeRecordsText="Active Records Available"
        onRowClick={isEditMode ? undefined : onRowClick}
        getRowId={(consult) => String(consult.id)}
        onSort={handleLocalSort}
        sortOrder={sortOrder}
      />
    </div>
  );
};

export default ConsultsTable;
