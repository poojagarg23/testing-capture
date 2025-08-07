import React, { useEffect, useState } from 'react';
import {
  getPatients,
  addPatientIdToChargesPage,
  updatePatientOrder,
  capitalizeNames,
  capitalizeVisitType,
} from '../../helpers/index';
import Table, { TableColumn } from './custom/Table';
import { Patient } from '../../types/Patient.types';
import { ChargesAddPatientProps } from '../../types/ChargesAddPatient.type';
import Button from './custom/Button';
import CustomModal from './CustomModal';
import SearchBar from './custom/SearchBar';
import SearchIcon from '../../assets/icons/search.svg?react';
import { formatDisplayDate, isDateValid } from '../../helpers/dateUtils';

const ChargesAddPatient: React.FC<ChargesAddPatientProps> = ({
  setShowModal,
  reRenderPatients,
}) => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [originalPatients, setOriginalPatients] = useState<Patient[]>([]);
  const [selectedPatients, setSelectedPatients] = useState<Patient[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [sortOrder, setSortOrder] = useState<{
    column: string | null;
    order: 'asc' | 'desc' | null;
  }>({ column: null, order: null });

  useEffect(() => {
    getPatients().then((res: Patient[]) => {
      const activePatients = res.filter((patient) => patient.status === 'active');
      setPatients(activePatients);
      setOriginalPatients(activePatients);
    });
  }, []);

  const handleSearch = (searchTerm: string) => {
    setSearchTerm(searchTerm);
    if (searchTerm.trim() === '') {
      setPatients(originalPatients);
      return;
    }

    const filteredPatients = originalPatients.filter((patient) => {
      return (
        (patient.firstname && patient.firstname.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (patient.middlename &&
          patient.middlename.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (patient.lastname && patient.lastname.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    });

    setPatients(filteredPatients);
  };

  const handleSave = async () => {
    const promises: Promise<Response>[] = [];
    selectedPatients.forEach((patient) => {
      promises.push(addPatientIdToChargesPage(patient.id));
    });

    try {
      await Promise.all(promises);

      const arrayOfPatientsId = selectedPatients.map((patient) => patient.patient_id);

      if (arrayOfPatientsId.length > 0) {
        await updatePatientOrder(arrayOfPatientsId);
      }
      reRenderPatients(' Patients Added! ');
    } catch (error) {
      console.warn(error);
    }

    setSelectedPatients([]);
    setShowModal(false);
  };

  const columns: TableColumn<Patient>[] = [
    {
      key: 'name',
      label: 'Patient Name',
      render: (patient) => {
        return capitalizeNames(patient.firstname, patient.lastname);
      },
      width: '25%',
    },
    {
      key: 'admitdate',
      label: 'Admit Date',
      render: (patient) => {
        return patient.admitdate && isDateValid(patient.admitdate)
          ? formatDisplayDate(patient.admitdate)
          : '';
      },
      width: '20%',
    },
    {
      key: 'location',
      label: 'Location',
      render: (patient) => patient.hospital_abbreviation || '',
      width: '15%',
    },
    {
      key: 'visittype',
      label: 'Visit Type',
      render: (patient) => (patient.visittype ? capitalizeVisitType(patient.visittype) : ''),
      width: '20%',
    },
    {
      key: 'status',
      label: 'Status',
      width: '20%',
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
  ];

  // Sorting handler (similar logic to PatientList)
  const handleSort = (column: string) => {
    let order: 'asc' | 'desc' = 'asc';
    if (sortOrder.column === column && sortOrder.order === 'asc') {
      order = 'desc';
    }

    setSortOrder({ column, order });

    const sortedPatients = [...patients].sort((a: Patient, b: Patient) => {
      // Helper to compare strings based on order
      const compareStrings = (strA: string, strB: string) =>
        order === 'asc' ? strA.localeCompare(strB) : strB.localeCompare(strA);

      switch (column) {
        case 'name': {
          const nameA = `${a.lastname || ''} ${a.firstname || ''}`.toLowerCase().trim();
          const nameB = `${b.lastname || ''} ${b.firstname || ''}`.toLowerCase().trim();
          return compareStrings(nameA, nameB);
        }
        case 'admitdate': {
          const dateA = a.admitdate ? new Date(a.admitdate).getTime() : 0;
          const dateB = b.admitdate ? new Date(b.admitdate).getTime() : 0;
          return order === 'asc' ? dateA - dateB : dateB - dateA;
        }
        case 'location': {
          const locA = (a.hospital_abbreviation || '').toLowerCase();
          const locB = (b.hospital_abbreviation || '').toLowerCase();
          return compareStrings(locA, locB);
        }
        case 'visittype': {
          const visitA = (a.visittype || '').toLowerCase();
          const visitB = (b.visittype || '').toLowerCase();
          return compareStrings(visitA, visitB);
        }
        case 'status': {
          const statusA = (a.status || '').toLowerCase();
          const statusB = (b.status || '').toLowerCase();
          return compareStrings(statusA, statusB);
        }
        default:
          return 0;
      }
    });

    setPatients(sortedPatients);
  };

  // Toggle selection when a row is clicked (anywhere on the row)
  const handleRowClick = (patient: Patient) => {
    const isAlreadySelected = selectedPatients.some((p) => p.id === patient.id);
    if (isAlreadySelected) {
      // row was selected → un-select it
      setSelectedPatients(selectedPatients.filter((p) => p.id !== patient.id));
    } else {
      // row wasn’t selected → add it
      setSelectedPatients([...selectedPatients, patient]);
    }
  };

  return (
    <CustomModal
      isOpen={true}
      onClose={() => setShowModal(false)}
      title="Add Patients"
      extraWide
      className="!overflow-hidden"
    >
      <div className="flex flex-col h-full">
        {/* Search Bar */}
        <div className="mb-6">
          <SearchBar
            placeholder="Search"
            value={searchTerm}
            icon={<SearchIcon className="w-5 h-5 opacity-30" />}
            onChange={(val) => handleSearch(val)}
          />
        </div>

        {/* Table Container */}
        <div className="overflow-y-auto" style={{ height: '60vh' }}>
          <Table
            columns={columns}
            data={patients}
            selectedItems={selectedPatients}
            onSelect={setSelectedPatients}
            getRowId={(patient) => patient.id.toString()}
            showSelectAll={true}
            activeRecordsCount={originalPatients.length}
            activeRecordsText="Active Patients In The System"
            onSort={handleSort}
            sortOrder={sortOrder}
            onRowClick={handleRowClick}
          />
        </div>

        {/* Save Button */}
        <div className="mt-6">
          <Button
            variant="primary"
            onClick={handleSave}
            className="w-full py-3 text-base font-medium rounded-full"
            disabled={selectedPatients.length === 0}
          >
            Save
          </Button>
        </div>
      </div>
    </CustomModal>
  );
};

export default ChargesAddPatient;
