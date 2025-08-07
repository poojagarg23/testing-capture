import React, {
  useCallback,
  useEffect,
  useState,
  useRef,
  forwardRef,
  useImperativeHandle,
} from 'react';

import { fetchNotes } from '../../helpers/notes/index.js';
import Note from './Note.tsx';
import HoverContent from '../reusable/HoverContent.tsx';
import DiagnosisSummary from '../reusable/DiagnosisSummary.tsx';
import { Patient } from '../../types/Patient.types.ts';
import { NotesProps } from '../../types/Notes.types.ts';
import { PatientNote as NoteType } from '../../types/index.ts';
import Table, { TableColumn } from '../reusable/custom/Table';
import Button from '../reusable/custom/Button';
import Loader from '../reusable/Loader.tsx';
import OpenIcon from '../../assets/icons/open.svg?react';
import { formatDisplayDate, isDateValid } from '../../helpers/dateUtils.ts';
import { NoteHandle } from './Note.tsx';

export type NotesHandle = {
  hasUnsavedChanges: () => boolean;
  discardChanges: () => void;
};

const Notes = forwardRef<NotesHandle, NotesProps>(({ patient, subMode }, ref) => {
  const noteRef = useRef<NoteHandle>(null);
  const [showPatientNote, setShowPatientNote] = useState<boolean>(false);
  const [currentPatientNote, setCurrentPatientNote] = useState<NoteType | null>(null);
  const [currentPatient, setCurrentPatient] = useState<Partial<Patient> | null>(null);
  const [notes, setNotes] = useState<NoteType[]>([]);
  const [isNewPatientNote, setIsNewPatientNote] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  const [sortOrder, setSortOrder] = useState<{
    column: string | null;
    order: 'asc' | 'desc' | null;
  }>({ column: null, order: null });

  const loadNotes = useCallback(async () => {
    if (patient?.patient_id) {
      setLoading(true);
      try {
        const fetchedNotes: NoteType[] = await fetchNotes(patient.patient_id);
        setNotes(fetchedNotes);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }
  }, [patient]);

  useEffect(() => {
    loadNotes();
  }, [loadNotes]);

  const redirectToNotelist = () => {
    setShowPatientNote(false);
    loadNotes();
  };

  const onCellClick = (row: NoteType) => {
    setCurrentPatientNote(row);
    setShowPatientNote(true);
    setIsNewPatientNote(false);
  };

  const handleNewNoteClick = () => {
    setIsNewPatientNote(true);
    setShowPatientNote(true);
    setCurrentPatient({
      admission_id: patient.id,
      patient_id: patient.patient_id,
      admitdate: patient.admitdate,
      status: 'active',
    });
  };

  const handleBack = () => {
    setShowPatientNote(false);
    setCurrentPatientNote(null);
    setIsNewPatientNote(false);
  };

  const handleSort = (column: string) => {
    // Determine sort direction
    let order: 'asc' | 'desc' = 'asc';
    if (sortOrder.column === column && sortOrder.order === 'asc') {
      order = 'desc';
    }

    setSortOrder({ column, order });

    // Helper to keep empty / null / undefined values at the bottom
    const compareWithEmptyLast = (
      a: string | number,
      b: string | number,
      dir: 'asc' | 'desc',
    ): number => {
      const isEmpty = (v: string | number) =>
        v === '' || v === null || v === undefined || (typeof v === 'number' && Number.isNaN(v));

      if (isEmpty(a) && isEmpty(b)) return 0;
      if (isEmpty(a)) return 1; // place empty at the bottom
      if (isEmpty(b)) return -1; // place empty at the bottom

      if (typeof a === 'number' && typeof b === 'number') {
        return dir === 'asc' ? (a as number) - (b as number) : (b as number) - (a as number);
      }

      const strA = String(a).toLowerCase();
      const strB = String(b).toLowerCase();
      return dir === 'asc' ? strA.localeCompare(strB) : strB.localeCompare(strA);
    };

    const getTime = (d?: string): number => (d && d !== '' ? new Date(d).getTime() : NaN);

    const sortedNotes = [...notes].sort((a: NoteType, b: NoteType) => {
      switch (column) {
        case 'admitdate': {
          const timeA = getTime(a.admitdate);
          const timeB = getTime(b.admitdate);
          return compareWithEmptyLast(timeA, timeB, order);
        }
        case 'date_of_service': {
          const timeA = getTime(a.date_of_service);
          const timeB = getTime(b.date_of_service);
          return compareWithEmptyLast(timeA, timeB, order);
        }
        case 'provider_fullname': {
          return compareWithEmptyLast(a.provider_fullname ?? '', b.provider_fullname ?? '', order);
        }
        case 'created_at': {
          const timeA = getTime(a.created_at);
          const timeB = getTime(b.created_at);
          return compareWithEmptyLast(timeA, timeB, order);
        }
        default:
          return 0;
      }
    });

    setNotes(sortedNotes);
  };

  const columns: TableColumn<NoteType>[] = [
    {
      key: 'admitdate',
      label: 'Admit Date',
      render: (row: NoteType) => (
        <div className="flex items-center gap-2">
          <OpenIcon
            style={{ fill: 'var(--primary-blue)' }}
            className="icon-size-sm cursor-pointer hover:opacity-80 flex-shrink-0"
            width={16}
            height={16}
            onClick={(e: React.MouseEvent<SVGSVGElement, MouseEvent>) => {
              e.stopPropagation();
              onCellClick(row);
            }}
          />
          {row.admitdate && isDateValid(row.admitdate) ? formatDisplayDate(row.admitdate) : '-'}
        </div>
      ),
    },
    {
      key: 'date_of_service',
      label: 'Date of Service',
      render: (row) =>
        row.date_of_service && isDateValid(row.date_of_service)
          ? formatDisplayDate(row.date_of_service)
          : '-',
    },
    {
      key: 'visit_codes',
      label: 'Visit Codes',
      render: (row) =>
        row.visit_codes && row.visit_codes.length > 0 ? (
          <HoverContent
            hoverContent={row.visit_codes.map((visitCode, vcIndex) => (
              <div key={vcIndex}>
                {visitCode.visit_code} - {visitCode.description}
              </div>
            ))}
            position="top"
            maxHeight="200px"
          >
            {row.visit_codes.map((vc, vcIndex) => (
              <span key={vcIndex}>
                {vc.visit_code}
                {row.visit_codes && row.visit_codes.length - 1 !== vcIndex && ', '}
              </span>
            ))}
          </HoverContent>
        ) : (
          '-'
        ),
    },
    {
      key: 'diagnoses',
      label: 'Diagnoses Codes',
      render: (row) => <DiagnosisSummary diagnoses={row.diagnoses} />,
    },
    {
      key: 'action',
      label: 'Notes',
      sortable: false,
      render: (row) => (
        <div className="w-full flex items-center justify-center">
          <span
            onClick={(e) => {
              e.stopPropagation();
              onCellClick(row);
            }}
            className="inline-flex w-full items-center justify-center bg-primary-gradient hover:opacity-90 text-white text-xs font-medium px-2 py-1 2xl:py-4 rounded-md cursor-pointer transition-all max-w-[40px] 2xl:max-w-[60px] h-6 "
          >
            View
          </span>
        </div>
      ),

      priority: 'high',
    },
    {
      key: 'provider_fullname',
      label: 'Provider',
      render: (row) => row.provider_fullname || '-',
    },
    {
      key: 'created_at',
      label: 'Timestamp',
      render: (row) =>
        row.created_at && isDateValid(row.created_at)
          ? new Date(row.created_at).toLocaleString('en-US', {
              month: '2-digit',
              day: '2-digit',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
              hour12: true,
            })
          : '-',
      priority: 'medium',
    },
  ];

  useImperativeHandle(
    ref,
    () => ({
      hasUnsavedChanges: () => noteRef.current?.hasUnsavedChanges?.() || false,
      discardChanges: () => noteRef.current?.discardChanges?.(),
    }),
    [],
  );

  return (
    <div className="w-full px-4 sm:px-6 h-full flex flex-col">
      {showPatientNote ? (
        <Note
          ref={noteRef}
          patient={currentPatient as Patient}
          mode={isNewPatientNote ? 'add' : 'view&edit'}
          currentPatientNote={currentPatientNote ?? undefined}
          redirectToNotelist={redirectToNotelist}
          subMode={isNewPatientNote ? 'edit' : subMode}
          onBack={handleBack}
        />
      ) : (
        <div className="py-2 2xl:py-6 ">
          <div className="flex justify-between items-center mb-4 2xl:mb-8">
            <div>
              <h2 className="font-gotham-bold text-sm 2xl:text-lg text-secondary mb-2">Notes</h2>
              <p className="font-gotham text-sm text-muted">Patient-related notes and comments.</p>
            </div>

            <Button
              variant="success"
              size="small"
              className="!h-[20px] !2xl:h-[36px]"
              childrenClassName="text-xs 2xl:text-sm"
              onClick={handleNewNoteClick}
            >
              <span className="text-xs 2xl:text-sm font-gotham">+ New Note</span>
            </Button>
          </div>

          {loading ? (
            <div className="flex-1 flex items-center justify-center">
              <Loader size="lg" />
            </div>
          ) : (
            <Table<NoteType>
              columns={columns}
              data={notes}
              onRowClick={onCellClick}
              onSort={handleSort}
              sortOrder={sortOrder}
              activeRecordsCount={notes.length}
            />
          )}
        </div>
      )}
    </div>
  );
});

export default Notes;
