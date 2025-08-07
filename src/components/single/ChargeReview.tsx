import React, { useEffect, useState } from 'react';
import { MultiValue, SingleValue } from 'react-select';
import {
  AMD_SubmitCharges,
  deletePatientChargesRequest,
  updatePatientChargeHistoryRequest,
} from '../../helpers/Charges/charges-review';
import { fetchUserAddedCharges } from '../../helpers/Charges/charges-review';
import Cross from '../../assets/icons/facesheet_cross.svg?react';
import {
  capitalizeNames,
  capitalizeVisitType,
  fetchAuthorizedProviders,
  fetchSharedVisitUsers,
  fetchVisitCodes,
} from '../../helpers';
import { toast } from 'react-toastify';
import ConfirmationModal from '../reusable/ConfirmationModal.tsx';
import HoverContent from '../reusable/HoverContent.tsx';
import DiagnosisSummary from '../reusable/DiagnosisSummary.tsx';
import WarningIcon from '../../assets/icons/Warning.svg?react';
import type { SubmittedChargePatient } from '../../types/ChargeReview.types';
import type { VisitCode, SharedVisit, Provider } from '../../types';

// Import reusable components
import PageHeader from '../reusable/custom/PageHeader';
import Table, { TableColumn } from '../reusable/custom/Table';
import Button from '../reusable/custom/Button';
import ToggleButton from '../reusable/custom/ToggleButton';
import Dropdown from '../reusable/custom/Dropdown';
import InputField from '../reusable/custom/InputField';

// Import icons
import SubmitIcon from '../../assets/icons/charges-submit.svg?react';
import DeleteIcon from '../../assets/icons/trash.svg?react';
import { formatDisplayDate, formatISODate, isDateValid } from '../../helpers/dateUtils.ts';
import { TOAST_CONFIG } from '../../constants/index.ts';

const ChargeReview: React.FC = () => {
  const [patientChargesHistory, setPatientChargesHistory] = useState<SubmittedChargePatient[]>([]);
  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  const [submitLoading, setSubmitLoading] = useState<boolean>(false);
  const [deleteLoading, setDeleteLoading] = useState<boolean>(false);
  const [authorizedProviders, setAuthorizedProviders] = useState<Provider[]>([]);
  const [visitCodes, setVisitCodes] = useState<VisitCode[]>([]);
  const [sharedVisitUsers, setSharedVisitUsers] = useState<SharedVisit[]>([]);
  const [selectedRows, setSelectedRows] = useState<SubmittedChargePatient[]>([]);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState<boolean>(false);

  // Sorting state for table
  const [sortOrder, setSortOrder] = useState<{
    column: string | null;
    order: 'asc' | 'desc' | null;
  }>({ column: null, order: null });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [
          visitCodesData,
          authorizedProvidersData,
          sharedVisitUsersData,
          userAddedChargesData,
        ] = await Promise.all([
          fetchVisitCodes(),
          fetchAuthorizedProviders(),
          fetchSharedVisitUsers(),
          fetchUserAddedCharges(),
        ]);

        setVisitCodes(visitCodesData);
        setAuthorizedProviders(authorizedProvidersData);
        setSharedVisitUsers(sharedVisitUsersData);
        setPatientChargesHistory(userAddedChargesData);
        setSelectedRows(userAddedChargesData);
      } catch (error) {
        console.error(error);
      }
    };

    fetchData();
  }, []);

  const handleVisitCodeChange = (selectedOptions: MultiValue<VisitCode>, patientIndex: number) => {
    (async () => {
      try {
        const updatedPatientChargesHistory = [...patientChargesHistory];
        const visit_codes = selectedOptions.map((option) => ({
          id: option.id,
          visit_code: option.visit_code,
          description: option.description,
        }));

        await updatePatientChargeHistory(
          patientChargesHistory[patientIndex],
          {
            visit_codes,
          },
          patientChargesHistory[patientIndex].charges_provider_id,
        );

        updatedPatientChargesHistory[patientIndex].visit_codes = visit_codes;
        setPatientChargesHistory(updatedPatientChargesHistory);
      } catch (error) {
        console.error('Failed to update visit codes:', error);
      }
    })();
  };

  const handleAdmitDateChange = (date: string, patientIndex: number) => {
    (async () => {
      try {
        const updatedPatientChargesHistory = [...patientChargesHistory];

        await updatePatientChargeHistory(
          patientChargesHistory[patientIndex],
          {
            admitdate: date,
          },
          patientChargesHistory[patientIndex].charges_provider_id,
        );

        updatedPatientChargesHistory[patientIndex].admitdate = date;
        setPatientChargesHistory(updatedPatientChargesHistory);
      } catch (error) {
        console.error('Failed to update admit date:', error);
      }
    })();
  };

  const handleDateOfServiceChange = (date: string, patientIndex: number) => {
    (async () => {
      try {
        const updatedPatientChargesHistory = [...patientChargesHistory];

        await updatePatientChargeHistory(
          patientChargesHistory[patientIndex],
          {
            date_of_service: date,
          },
          patientChargesHistory[patientIndex].charges_provider_id,
        );

        updatedPatientChargesHistory[patientIndex].date_of_service = date;
        setPatientChargesHistory(updatedPatientChargesHistory);
      } catch (error) {
        console.error('Failed to update date of service:', error);
      }
    })();
  };

  const handleSharedVisitChange = (
    selectedOption: SingleValue<{ value: number | undefined; label: string }>,
    patientIndex: number,
  ) => {
    (async () => {
      try {
        const updatedPatientChargesHistory = [...patientChargesHistory];
        const shared_visits = selectedOption
          ? [
              {
                id: selectedOption.value,
                name: selectedOption.label,
              },
            ]
          : [];

        await updatePatientChargeHistory(
          patientChargesHistory[patientIndex],
          {
            shared_visits,
          },
          patientChargesHistory[patientIndex].charges_provider_id,
        );

        updatedPatientChargesHistory[patientIndex].shared_visits = shared_visits;
        setPatientChargesHistory(updatedPatientChargesHistory);
      } catch (error) {
        console.error('Failed to update shared visits:', error);
      }
    })();
  };

  const handleProviderChange = (
    selectedOption: SingleValue<{
      value: number;
      label: string;
      firstname: string;
      lastname: string;
      title: string;
      current_user_amd_provider_id: number;
    }>,
    patientIndex: number,
  ) => {
    (async () => {
      try {
        const updatedPatientChargesHistory = [...patientChargesHistory];
        // Update in the database first
        const charges_provider_id = selectedOption!.value;
        await updatePatientChargeHistory(
          patientChargesHistory[patientIndex],
          {
            charges_provider_id,
          },
          charges_provider_id,
        );
        // If database update successful, update the local state
        updatedPatientChargesHistory[patientIndex].charges_provider_id = selectedOption!.value;
        updatedPatientChargesHistory[patientIndex].submitter_firstname = selectedOption!.firstname;
        updatedPatientChargesHistory[patientIndex].submitter_lastname = selectedOption!.lastname;
        updatedPatientChargesHistory[patientIndex].submitter_title = selectedOption!.title;
        updatedPatientChargesHistory[patientIndex].current_user_amd_provider_id =
          selectedOption!.current_user_amd_provider_id;
        setPatientChargesHistory(updatedPatientChargesHistory);
      } catch (error) {
        console.error('Failed to update provider:', error);
        toast.error('Failed to update provider', TOAST_CONFIG.ERROR);
      }
    })();
  };

  const updatePatientChargeHistory = async (
    patient_charges_history: SubmittedChargePatient,
    updateData: Partial<SubmittedChargePatient>,
    charges_provider_id: number,
  ) => {
    patient_charges_history.charges_provider_id = charges_provider_id;
    try {
      const response = await updatePatientChargeHistoryRequest(
        patient_charges_history,
        updateData,
        charges_provider_id,
      );

      if (!response.ok) {
        throw new Error('Failed to update patient charge history');
      }

      const result = await response.json();
      if (result.success) {
        toast.success(result.message, TOAST_CONFIG.SUCCESS);
      }
    } catch (error) {
      console.error('Error updating patient charge history:', error);
      throw error;
    }
  };

  const handleDelete = () => {
    if (selectedRows.length === 0) {
      toast.warning('Please select records to delete', TOAST_CONFIG.WARNING);
      return;
    }

    setShowDeleteConfirmation(true);
  };

  const confirmDelete = async () => {
    setDeleteLoading(true);
    try {
      const { ok } = await deletePatientChargesRequest(selectedRows.map((patient) => patient.id));

      if (ok) {
        toast.success('Records deleted successfully', TOAST_CONFIG.SUCCESS);
        setPatientChargesHistory((prev) =>
          prev.filter((record) => !selectedRows.find((selected) => selected.id === record.id)),
        );
        setSelectedRows([]);
      }
    } catch (error) {
      console.error('Error deleting records:', error);
      toast.error('Error deleting records', TOAST_CONFIG.ERROR);
    } finally {
      setDeleteLoading(false);
      setShowDeleteConfirmation(false);
    }
  };

  const submitCharges = async () => {
    if (selectedRows.length === 0) {
      toast.warning('Please select records to submit', TOAST_CONFIG.WARNING);
      return;
    }

    setSubmitLoading(true);
    try {
      const results = await Promise.all(
        selectedRows.map(async (patient) => {
          const result = await AMD_SubmitCharges(
            patient.amd_patient_id!,
            patient.id,
            patient.visit_codes,
            patient.diagnoses,
            patient.shared_visits,
            patient.current_user_amd_provider_id!,
            patient.amd_hospital_id!,
            patient.date_of_service!,
          );
          return {
            patient,
            patientName: `${patient.firstname} ${patient.lastname}`,
            success: result && result.success,
            message: result && result.message,
          };
        }),
      );

      const successful = results.filter((r) => r.success);
      const failed = results.filter((r) => !r.success);

      if (successful.length > 0) {
        const successfulIds = new Set(successful.map((s) => s.patient.id));
        setPatientChargesHistory((prev) => prev.filter((record) => !successfulIds.has(record.id)));
        setSelectedRows((prev) => prev.filter((row) => !successfulIds.has(row.id)));
        toast.success(
          `Successfully submitted charges for ${successful.length} patient(s)`,
          TOAST_CONFIG.SUCCESS,
        );
      }

      if (failed.length > 0) {
        failed.forEach((r) => {
          toast.error(
            `Failed to submit charges for ${r.patientName}: ${r.message}`,
            TOAST_CONFIG.ERROR,
          );
        });
      }
    } catch (error) {
      console.error('Error submitting charges:', error);
      toast.error('Error submitting charges to AMD', TOAST_CONFIG.ERROR);
    } finally {
      setSubmitLoading(false);
    }
  };

  // Handle table column sorting
  const handleSort = (column: string) => {
    // Skip non-sortable columns
    if (column === 'diagnoses' || column === 'facesheet') return;

    // Toggle sort direction
    let order: 'asc' | 'desc' = 'asc';
    if (sortOrder.column === column && sortOrder.order === 'asc') {
      order = 'desc';
    }

    setSortOrder({ column, order });

    // Helper to place empty values last regardless of sort direction
    const compareWithEmptyLast = (
      a: string | number,
      b: string | number,
      dir: 'asc' | 'desc',
    ): number => {
      const isEmpty = (v: string | number) =>
        v === '' || v === null || v === undefined || (typeof v === 'number' && Number.isNaN(v));

      if (isEmpty(a) && isEmpty(b)) return 0;
      if (isEmpty(a)) return 1;
      if (isEmpty(b)) return -1;

      if (typeof a === 'number' && typeof b === 'number') {
        return dir === 'asc' ? (a as number) - (b as number) : (b as number) - (a as number);
      }

      const strA = String(a).toLowerCase();
      const strB = String(b).toLowerCase();
      return dir === 'asc' ? strA.localeCompare(strB) : strB.localeCompare(strA);
    };

    const getTime = (d?: string | Date | null): number =>
      d ? new Date(d instanceof Date ? d : (d as string)).getTime() : NaN;

    const sorted = [...patientChargesHistory].sort((a, b): number => {
      switch (column) {
        case 'id':
          return compareWithEmptyLast(a.id, b.id, order);
        case 'name': {
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
          return compareWithEmptyLast(getTime(a.admitdate), getTime(b.admitdate), order);
        }
        case 'date_of_service': {
          return compareWithEmptyLast(
            getTime(a.date_of_service),
            getTime(b.date_of_service),
            order,
          );
        }
        case 'visittype': {
          return compareWithEmptyLast(a.visittype ?? '', b.visittype ?? '', order);
        }
        case 'hospital_abbreviation': {
          return compareWithEmptyLast(
            a.hospital_abbreviation ?? '',
            b.hospital_abbreviation ?? '',
            order,
          );
        }
        case 'status': {
          return compareWithEmptyLast(a.status ?? '', b.status ?? '', order);
        }
        case 'provider': {
          const provA = `${a.submitter_lastname ?? ''} ${a.submitter_firstname ?? ''}`;
          const provB = `${b.submitter_lastname ?? ''} ${b.submitter_firstname ?? ''}`;
          return compareWithEmptyLast(provA, provB, order);
        }
        default:
          return 0;
      }
    });

    setPatientChargesHistory(sorted);
  };

  // Define table columns
  const columns: TableColumn<SubmittedChargePatient>[] = [
    {
      key: 'id',
      label: 'ID',
      priority: 'high',
      width: '60px',
      render: (patient) => patient.id || '-',
    },
    {
      key: 'name',
      label: 'Name',
      priority: 'high',
      render: (patient) => {
        const fullName = capitalizeNames(patient.firstname, patient.lastname).trim();
        return fullName ? fullName : '-';
      },
    },
    {
      key: 'visit_codes',
      label: 'Visit Code',
      priority: 'high',
      render: (patient: SubmittedChargePatient) => {
        const index = patientChargesHistory.findIndex((p) => p.id === patient.id);
        return (
          <div className="text-sm">
            {isEditMode ? (
              <Dropdown
                options={visitCodes.map((code) => ({
                  label: `${code.visit_code} - ${code.description}`,
                  value: code.id || 0,
                }))}
                value={patient.visit_codes?.map((vc) => vc.id || 0) || []}
                onChange={(selectedValues) => {
                  const selectedOptions = Array.isArray(selectedValues)
                    ? (selectedValues
                        .map((id) => visitCodes.find((code) => code.id === id))
                        .filter(Boolean) as VisitCode[])
                    : [];
                  handleVisitCodeChange(selectedOptions as MultiValue<VisitCode>, index);
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
                    {patient.visit_codes.map((vc, vcIndex) => (
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
                {patient.visit_codes.map((vc, i) => (
                  <span key={i}>
                    {vc.visit_code}
                    {patient.visit_codes.length - 1 !== i ? ', ' : ''}
                  </span>
                ))}
              </HoverContent>
            ) : (
              '-'
            )}
          </div>
        );
      },
    },
    {
      key: 'shared_visits',
      label: 'Shared Visit',
      priority: 'medium',
      render: (patient: SubmittedChargePatient) => {
        const index = patientChargesHistory.findIndex((p) => p.id === patient.id);
        return (
          <div className="text-sm">
            {isEditMode ? (
              <Dropdown
                options={[
                  { label: 'None', value: '' },
                  ...sharedVisitUsers.map((user) => ({
                    label: user.name,
                    value: user.id || 0,
                  })),
                ]}
                value={patient.shared_visits?.[0]?.id || ''}
                onChange={(selectedValue) => {
                  if (selectedValue === '') {
                    handleSharedVisitChange(null, index);
                    return;
                  }

                  const selectedOption = sharedVisitUsers.find((user) => user.id === selectedValue);
                  handleSharedVisitChange(
                    selectedOption
                      ? { value: selectedOption.id, label: selectedOption.name }
                      : null,
                    index,
                  );
                }}
                placeholder="Select shared visit"
                className="min-w-[150px]"
                variant="variant_1"
              />
            ) : patient && patient.shared_visits && patient.shared_visits.length > 0 ? (
              patient.shared_visits.map((visit, visitIndex) => (
                <div key={visitIndex}>{visit.name}&nbsp;</div>
              ))
            ) : (
              '-'
            )}
          </div>
        );
      },
    },
    {
      key: 'admitdate',
      label: 'Admit Date',
      priority: 'medium',
      render: (patient: SubmittedChargePatient) => {
        const index = patientChargesHistory.findIndex((p) => p.id === patient.id);
        return (
          <div className="text-sm">
            {isEditMode ? (
              <InputField
                type="date"
                value={
                  patient.admitdate && isDateValid(patient.admitdate)
                    ? formatISODate(patient.admitdate)
                    : ''
                }
                onChange={(e) => handleAdmitDateChange(e.target.value, index)}
                className="min-w-[150px] !h-9 !text-xs"
              />
            ) : patient.admitdate && isDateValid(patient.admitdate) ? (
              formatDisplayDate(patient.admitdate)
            ) : (
              '-'
            )}
          </div>
        );
      },
    },
    {
      key: 'hospital_abbreviation',
      label: 'Location',
      priority: 'medium',
      render: (patient) => <div className="text-sm">{patient.hospital_abbreviation || '-'}</div>,
    },
    {
      key: 'date_of_service',
      label: 'Date of Service',
      priority: 'medium',
      render: (patient: SubmittedChargePatient) => {
        const index = patientChargesHistory.findIndex((p) => p.id === patient.id);
        return (
          <div className="text-sm">
            {isEditMode ? (
              <InputField
                type="date"
                value={
                  patient.date_of_service && isDateValid(patient.date_of_service)
                    ? formatISODate(patient.date_of_service)
                    : ''
                }
                onChange={(e) => handleDateOfServiceChange(e.target.value, index)}
                className="min-w-[150px] !h-9 !text-xs"
              />
            ) : patient.date_of_service && isDateValid(patient.date_of_service) ? (
              formatDisplayDate(patient.date_of_service)
            ) : (
              '-'
            )}
          </div>
        );
      },
    },
    {
      key: 'visittype',
      label: 'Visit Type',
      priority: 'low',
      render: (patient) => (
        <div className="text-sm">
          {patient.visittype ? capitalizeVisitType(patient.visittype) : '-'}
        </div>
      ),
    },
    {
      key: 'diagnoses',
      label: 'Diagnosis',
      priority: 'high',
      sortable: false,
      render: (patient) => (
        <div className="text-sm">
          <DiagnosisSummary diagnoses={patient.diagnoses} />
        </div>
      ),
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
      render: (patient) => (
        <div className="flex items-center justify-center">
          {patient.facesheetalias ? (
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
      label: 'Provider',
      priority: 'high',
      render: (patient: SubmittedChargePatient) => {
        const index = patientChargesHistory.findIndex((p) => p.id === patient.id);
        return (
          <div className="text-sm">
            {isEditMode ? (
              <Dropdown
                options={authorizedProviders.map((provider) => ({
                  label: `${provider.firstname} ${provider.lastname} - ${provider.title}`,
                  value: provider.id,
                }))}
                value={patient.charges_provider_id || ''}
                onChange={(selectedValue) => {
                  const selectedProvider = authorizedProviders.find((p) => p.id === selectedValue);
                  if (selectedProvider) {
                    handleProviderChange(
                      {
                        value: selectedProvider.id,
                        label: `${selectedProvider.firstname} ${selectedProvider.lastname} - ${selectedProvider.title}`,
                        firstname: selectedProvider.firstname,
                        lastname: selectedProvider.lastname || '',
                        title: selectedProvider.title || '',
                        current_user_amd_provider_id: selectedProvider.amd_provider_id,
                      },
                      index,
                    );
                  }
                }}
                placeholder="Select provider"
                className="min-w-[180px]"
                variant="variant_1"
              />
            ) : (
              (() => {
                const providerName = capitalizeNames(
                  patient.submitter_firstname,
                  patient.submitter_lastname,
                ).trim();
                return providerName ? providerName : '-';
              })()
            )}
          </div>
        );
      },
    },
  ];

  return (
    <div className="w-full h-full bg-white rounded-2xl px-3 sm:px-2 py-1 sm:py-2 flex flex-col">
      {/* Header + Controls */}
      <div className="flex-shrink-0">
        <div className="flex flex-col lg:flex-row items-start sm:items-center justify-between gap-3 mb-4">
          <PageHeader
            title="Charges Review"
            subtitle="View a complete list of all previously billed charges, payment statuses, and service dates."
            className="!mb-0 !py-2"
          />

          <div className="flex w-full lg:w-auto items-center gap-4">
            <div className="flex items-center gap-2">
              <ToggleButton
                checked={isEditMode}
                onChange={() => setIsEditMode(!isEditMode)}
                title="Toggle Edit Mode"
              />
              <span className="text-sm font-gotham text-secondary">Edit Mode</span>
            </div>

            <Button
              variant="tertiary"
              icon={DeleteIcon}
              size="small"
              paddingLevel={1}
              onClick={handleDelete}
              disabled={!isEditMode || deleteLoading}
              className={`text-red-600 hover:text-red-700 !px-3 !py-2 !text-sm [&_.btn-icon]:fill-white [&_.btn-icon]:w-4 [&_.btn-icon]:h-4 ${isEditMode ? '' : 'invisible'}`}
            >
              {deleteLoading ? 'Deleting...' : 'Delete Selected'}
            </Button>
          </div>
        </div>
      </div>

      {/* Scrollable Table Section */}
      <div className="flex-1 min-h-0 overflow-hidden">
        <Table
          columns={columns}
          data={patientChargesHistory}
          onSort={handleSort}
          sortOrder={sortOrder}
          activeRecordsCount={patientChargesHistory.length}
          activeRecordsText="Active Patients In The System"
          showSelectAll={true}
          onSelect={setSelectedRows}
          selectedItems={selectedRows}
          getRowId={(row) => row.id.toString()}
        />
      </div>

      {/* Fixed Footer Section */}
      <div className="flex-shrink-0 mt-6">
        <div className="flex justify-end">
          <Button
            variant="primary"
            icon={SubmitIcon}
            onClick={submitCharges}
            disabled={submitLoading || selectedRows.length === 0}
          >
            {submitLoading ? 'Submitting...' : 'Submit Charges to AMD'}
          </Button>
        </div>
      </div>

      {/* Confirmation Modal */}
      <ConfirmationModal
        open={showDeleteConfirmation}
        onClose={() => setShowDeleteConfirmation(false)}
        onConfirm={confirmDelete}
        title="Delete Selected Records"
        message={`Are you sure you want to delete ${selectedRows.length} selected record(s)?`}
        confirmText="Delete"
        cancelText="Cancel"
        icon={<WarningIcon />}
      />
    </div>
  );
};

export default ChargeReview;
