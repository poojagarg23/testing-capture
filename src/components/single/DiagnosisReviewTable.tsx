import { useState, useMemo, useEffect } from 'react';
import { toast } from 'react-toastify';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { convertNotes } from '../../helpers';
import type DiagnosisReviewTableProps from '../../types/DiagnosisReviewTable.types';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import Button from '../reusable/custom/Button';
import InputField from '../reusable/custom/InputField';
import { TOAST_CONFIG } from '../../constants';
import DragHandle from '../../assets/icons/drag-handle.svg?react';
import type { DetailedDiagnosis, Diagnosis as BestGuessCode } from '../../types';

interface SortableDiagnosisRowProps {
  diag: DetailedDiagnosis;
  viewSuggestedICDCodes: (
    best_guess_codes: BestGuessCode[],
    physician_diagnosis: string,
    id: number,
  ) => void;
  hideSuggestions: () => void;
  setDetailedDiagnoses: (diagnoses: DetailedDiagnosis[]) => void;
  diagnoses: DetailedDiagnosis[];
  handleMenuOpen: (event: React.MouseEvent<HTMLButtonElement>, id: number) => void;
  open: boolean;
  menuRowId: number | null;
}

const SortableDiagnosisRow = ({
  diag,
  viewSuggestedICDCodes,
  hideSuggestions,
  setDetailedDiagnoses,
  diagnoses,
  handleMenuOpen,
  open,
}: SortableDiagnosisRowProps) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: diag.assigned_icd_diagnosis.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.7 : 1,
    zIndex: isDragging ? 1 : 'auto',
  };

  const isVerified = (notes?: string) =>
    typeof notes === 'string' && notes.toLowerCase().startsWith('verified match');

  const isNotFound = (text?: string) =>
    typeof text === 'string' &&
    (text.toLowerCase().startsWith('not found') ||
      text.toLowerCase().startsWith('unable to determine'));

  return (
    <tr
      ref={setNodeRef}
      style={style}
      {...attributes}
      className="bg-[var(--input-bg)] hover:bg-[var(--table-hover)]"
    >
      <td className="px-3 py-4 text-center cursor-grab">
        <button {...listeners} className="cursor-grab">
          <DragHandle className="w-5 h-5 text-secondary opacity-60 inline-block" />
        </button>
      </td>
      <td className="px-3 py-4 text-xs 2xl:text-base font-gotham-medium text-secondary whitespace-normal break-words">
        {diag?.physician_diagnosis}
      </td>
      <td className="px-3 py-4">
        <div className="flex items-center justify-between gap-1">
          <span className="font-gotham-medium text-xs 2xl:text-base text-secondary whitespace-normal break-words">
            {diag?.assigned_icd_diagnosis.code} {diag?.assigned_icd_diagnosis.description}
          </span>
          <IconButton
            aria-label="more"
            aria-controls={open ? 'diagnosis-menu' : undefined}
            aria-haspopup="true"
            onClick={(e) => handleMenuOpen(e, diag.assigned_icd_diagnosis.id)}
            size="small"
            sx={{ color: 'var(--text-secondary)' }}
          >
            <MoreVertIcon fontSize="small" />
          </IconButton>
        </div>
      </td>
      <td className="px-3 py-4">
        <span className="text-xs 2xl:text-base font-gotham-medium text-secondary whitespace-normal break-words">
          {diag?.notes}
        </span>
        <div className="flex items-center gap-2 mt-2">
          {diag?.queries?.length > 0 && (
            <Button
              variant="secondary"
              size="small"
              childrenClassName="text-xs"
              onClick={() => {
                const updatedDiagnoses = diagnoses.map((d) =>
                  d.assigned_icd_diagnosis.id === diag.assigned_icd_diagnosis.id
                    ? {
                        ...d,
                        notes: 'Verified Match',
                        queries: [],
                        best_guess_codes: [],
                      }
                    : d,
                );
                setDetailedDiagnoses(updatedDiagnoses);
                hideSuggestions();
                toast.info('Query ignored and marked as verified', TOAST_CONFIG.INFO);
              }}
            >
              Keep As-Is
            </Button>
          )}
          {diag?.best_guess_codes?.length > 0 && !isVerified(diag?.notes) && (
            <Button
              variant="primary"
              size="small"
              childrenClassName="text-xs"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                viewSuggestedICDCodes(
                  diag?.best_guess_codes,
                  diag?.physician_diagnosis,
                  diag?.assigned_icd_diagnosis.id,
                );
              }}
            >
              View Suggested ICD Code
            </Button>
          )}
          {(isNotFound(diag?.assigned_icd_diagnosis.code) || isNotFound(diag?.notes)) && (
            <Button
              variant="primary"
              size="small"
              childrenClassName="text-xs"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                viewSuggestedICDCodes(
                  [],
                  diag?.physician_diagnosis,
                  diag?.assigned_icd_diagnosis.id,
                );
              }}
            >
              Search
            </Button>
          )}
        </div>
      </td>
    </tr>
  );
};

const DiagnosisReviewTable = ({
  detailed_diagnoses,
  viewSuggestedICDCodes,
  handleReviewSubmit,
  setDetailedDiagnoses,
  hideSuggestions,
}: DiagnosisReviewTableProps) => {
  const [diagnoses, setDiagnoses] = useState<DetailedDiagnosis[]>(detailed_diagnoses || []);
  const [primaryDiagnosis, setPrimaryDiagnosis] = useState<DetailedDiagnosis | null>(null);
  const [secondaryDiagnoses, setSecondaryDiagnoses] = useState<DetailedDiagnosis[]>([]);
  const [, setActiveId] = useState<string | number | null>(null);

  const [showInputRow, setShowInputRow] = useState(false);
  const [notesInput, setNotesInput] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [menuRowId, setMenuRowId] = useState<number | null>(null);

  const open = Boolean(anchorEl);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    }),
  );

  useEffect(() => {
    setDiagnoses(detailed_diagnoses || []);
  }, [detailed_diagnoses]);

  useEffect(() => {
    if (!diagnoses) return;
    const primary = diagnoses.find((d) => d.assigned_icd_diagnosis.is_primary) || null;
    const secondary = diagnoses.filter((d) => !d.assigned_icd_diagnosis.is_primary);
    setPrimaryDiagnosis(primary);
    setSecondaryDiagnoses(secondary);
  }, [diagnoses]);

  const handleMenuOpen = (event: React.MouseEvent<HTMLButtonElement>, id: number) => {
    setAnchorEl(event.currentTarget);
    setMenuRowId(id);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setMenuRowId(null);
  };

  const handleAddRow = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!notesInput.trim()) {
      toast.warning('Please enter notes to add new rows', TOAST_CONFIG.WARNING);
      return;
    }
    setIsLoading(true);
    try {
      const data = await convertNotes(notesInput);

      setDetailedDiagnoses((prev) => {
        const existingIds = new Set(prev.map((item) => item.assigned_icd_diagnosis.id));
        const existingPhysicians = new Set(
          prev.map((item) => item.physician_diagnosis.toLowerCase().trim()),
        );

        let newDiagnoses = data.detailed_diagnoses.filter((item) => {
          const phys = item.physician_diagnosis.toLowerCase().trim();
          return !existingIds.has(item.assigned_icd_diagnosis.id) && !existingPhysicians.has(phys);
        });

        if (newDiagnoses.length === 0) {
          toast.info('No new diagnoses found or all diagnoses already added', TOAST_CONFIG.INFO);
          return prev;
        }
        toast.success(
          `${newDiagnoses.length} new diagnosis${newDiagnoses.length > 1 ? 'es' : ''} added`,
          TOAST_CONFIG.SUCCESS,
        );
        newDiagnoses = newDiagnoses.map((item) => ({
          ...item,
          assigned_icd_diagnosis: {
            ...item.assigned_icd_diagnosis,
            is_primary: false,
          },
        }));
        return [...prev, ...newDiagnoses];
      });
    } catch (error) {
      if (error instanceof Error) {
        toast.error(
          error.message || 'An error occurred while converting notes',
          TOAST_CONFIG.ERROR,
        );
      }
    } finally {
      setIsLoading(false);
      setNotesInput('');
    }
  };

  const allVerified = useMemo(() => {
    return diagnoses?.every((diag) => diag.notes?.toLowerCase().startsWith('verified match'));
  }, [diagnoses]);

  const secondaryIds = useMemo(
    () => secondaryDiagnoses.map((d) => d.assigned_icd_diagnosis.id),
    [secondaryDiagnoses],
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id);
  };
  const handleDragEnd = (event: DragEndEvent) => {
    setActiveId(null);
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    if (activeId === overId) return;

    const isDraggingPrimary = primaryDiagnosis?.assigned_icd_diagnosis.id === activeId;
    const isDroppingOnPrimary =
      overId === 'primary-droppable' || primaryDiagnosis?.assigned_icd_diagnosis.id === overId;

    // Move within secondary
    if (!isDraggingPrimary && !isDroppingOnPrimary) {
      const oldIndex = secondaryDiagnoses.findIndex(
        (d) => d.assigned_icd_diagnosis.id === activeId,
      );
      const newIndex = secondaryDiagnoses.findIndex((d) => d.assigned_icd_diagnosis.id === overId);
      if (oldIndex !== -1 && newIndex !== -1) {
        const newSecondary = arrayMove(secondaryDiagnoses, oldIndex, newIndex);
        setDetailedDiagnoses(primaryDiagnosis ? [primaryDiagnosis, ...newSecondary] : newSecondary);
      }
      return;
    }

    // Move to primary
    if (!isDraggingPrimary && isDroppingOnPrimary) {
      const newPrimary = secondaryDiagnoses.find((d) => d.assigned_icd_diagnosis.id === activeId);
      if (!newPrimary) return;

      const newSecondary = secondaryDiagnoses.filter(
        (d) => d.assigned_icd_diagnosis.id !== activeId,
      );
      if (
        primaryDiagnosis &&
        primaryDiagnosis.assigned_icd_diagnosis.id !== newPrimary.assigned_icd_diagnosis.id
      ) {
        newSecondary.unshift({
          ...primaryDiagnosis,
          assigned_icd_diagnosis: {
            ...primaryDiagnosis.assigned_icd_diagnosis,
            is_primary: false,
          },
        });
      }

      newPrimary.assigned_icd_diagnosis.is_primary = true;
      setDetailedDiagnoses([newPrimary, ...newSecondary]);
      return;
    }

    // Move from primary to secondary
    if (isDraggingPrimary && !isDroppingOnPrimary) {
      if (!primaryDiagnosis) return;

      const newSecondary = [...secondaryDiagnoses];
      const dropIndex = newSecondary.findIndex((d) => d.assigned_icd_diagnosis.id === overId);

      const oldPrimary = {
        ...primaryDiagnosis,
        assigned_icd_diagnosis: {
          ...primaryDiagnosis.assigned_icd_diagnosis,
          is_primary: false,
        },
      };

      if (dropIndex !== -1) {
        newSecondary.splice(dropIndex, 0, oldPrimary);
      } else {
        newSecondary.push(oldPrimary);
      }

      setDetailedDiagnoses(newSecondary);
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={() => setActiveId(null)}
    >
      <div className="w-full overflow-auto flex flex-col">
        <div className="flex-1 min-h-0 border border-[var(--table-header)] rounded-xl bg-white shadow-sm">
          <div className="h-full overflow-auto overflow-x-auto">
            <table className="min-w-[700px] w-full text-xs sm:text-sm 2xl:text-base sm:table-fixed">
              <thead className="sticky top-0 z-10">
                <tr className="bg-[var(--table-header)] border-b border-[var(--table-header)] text-secondary font-gotham-medium">
                  <th className="py-3 px-4 w-12"></th>
                  <th className="py-3 px-4 text-left">Physician Diagnosis</th>
                  <th className="py-3 px-4 text-left">Assigned ICD-10 Code</th>
                  <th className="py-3 px-4 text-left">Notes</th>
                </tr>
              </thead>

              {/* Primary Diagnosis Section */}
              <tbody className="divide-y divide-[var(--table-header)] bg-white">
                <tr className="bg-[var(--table-secondary-header)] font-bold mt-2 text-secondary">
                  <td colSpan={4} className="text-left py-4 px-3 font-gotham-bold">
                    Primary Diagnosis
                  </td>
                </tr>
                <SortableContext
                  items={primaryDiagnosis ? [primaryDiagnosis.assigned_icd_diagnosis.id] : []}
                  strategy={verticalListSortingStrategy}
                >
                  {primaryDiagnosis ? (
                    <SortableDiagnosisRow
                      diag={primaryDiagnosis}
                      diagnoses={diagnoses}
                      viewSuggestedICDCodes={viewSuggestedICDCodes}
                      hideSuggestions={hideSuggestions}
                      setDetailedDiagnoses={setDetailedDiagnoses}
                      handleMenuOpen={handleMenuOpen}
                      open={open}
                      menuRowId={menuRowId}
                    />
                  ) : (
                    <DroppableRow id="primary-droppable">
                      <td colSpan={4} className="text-center text-secondary opacity-60 py-2 px-3">
                        Drag a diagnosis here to make it primary
                      </td>
                    </DroppableRow>
                  )}
                </SortableContext>
              </tbody>

              {/* Secondary Diagnoses Section */}
              {secondaryDiagnoses.length > 0 && (
                <tbody className="divide-y divide-[var(--table-header)] bg-white">
                  <tr className="bg-[var(--table-secondary-header)] font-bold text-secondary">
                    <td colSpan={4} className="text-left py-4 px-3 font-gotham-bold">
                      Non Primary Diagnosis
                    </td>
                  </tr>
                  <SortableContext items={secondaryIds} strategy={verticalListSortingStrategy}>
                    {secondaryDiagnoses.map((diag) => (
                      <SortableDiagnosisRow
                        key={diag.assigned_icd_diagnosis.id}
                        diag={diag}
                        diagnoses={diagnoses}
                        viewSuggestedICDCodes={viewSuggestedICDCodes}
                        hideSuggestions={hideSuggestions}
                        setDetailedDiagnoses={setDetailedDiagnoses}
                        handleMenuOpen={handleMenuOpen}
                        open={open}
                        menuRowId={menuRowId}
                      />
                    ))}
                  </SortableContext>
                </tbody>
              )}
            </table>
          </div>
        </div>

        {showInputRow ? (
          <div className="flex flex-wrap items-center gap-2 mt-4 mb-4 ml-2">
            <div className="flex-1 min-w-[200px]">
              <InputField
                placeholder="Enter Physician Diagnosis"
                value={notesInput}
                className="!h-[45px] 2xl:h-[45px]"
                onChange={(e) => setNotesInput(e.target.value)}
              />
            </div>
            <Button
              variant="primary"
              paddingLevel={4}
              loading={isLoading}
              loadingText="Adding..."
              onClick={handleAddRow}
            >
              {isLoading ? (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    justifyContent: 'center',
                  }}
                >
                  <span>Adding...</span>
                </div>
              ) : (
                'Add'
              )}
            </Button>
            <Button variant="tertiary" paddingLevel={4} onClick={() => setShowInputRow(false)}>
              Cancel
            </Button>
          </div>
        ) : (
          <Button
            variant="primary"
            size="small"
            className="mt-4 w-fit"
            paddingLevel={3}
            onClick={() => setShowInputRow(true)}
          >
            Add More Rows
          </Button>
        )}
        <div className="mt-4 text-right flex justify-end ">
          <Button
            type="button"
            variant="primary"
            paddingLevel={3}
            onClick={() => {
              if (!allVerified) {
                toast.error(
                  "Please confirm the accuracy of all ICD-10 codes before proceeding. If no changes are needed, select 'Keep As-Is' for all diagnoses.",
                  TOAST_CONFIG.ERROR,
                );
                return;
              }
              handleReviewSubmit();
            }}
          >
            Submit
          </Button>
        </div>
        <Menu
          id="diagnosis-menu"
          anchorEl={anchorEl}
          open={open}
          onClose={handleMenuClose}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
          <MenuItem
            onClick={() => {
              const selected = diagnoses.find((d) => d.assigned_icd_diagnosis.id === menuRowId);
              if (selected) {
                viewSuggestedICDCodes(
                  selected.best_guess_codes,
                  selected.physician_diagnosis,
                  selected.assigned_icd_diagnosis.id,
                );
              }
              handleMenuClose();
            }}
          >
            Edit
          </MenuItem>
          <MenuItem
            disabled={
              diagnoses?.find((d) => d.assigned_icd_diagnosis.id === menuRowId)
                ?.assigned_icd_diagnosis.is_primary
            }
            onClick={() => {
              const updated = diagnoses.filter((d) => d.assigned_icd_diagnosis.id !== menuRowId);
              setDetailedDiagnoses(updated);
              hideSuggestions();
              toast.success('Diagnosis removed', TOAST_CONFIG.SUCCESS);
              handleMenuClose();
            }}
          >
            Delete
          </MenuItem>
        </Menu>
      </div>
    </DndContext>
  );
};

const DroppableRow = ({ children, id }: { children: React.ReactNode; id: string }) => {
  const { setNodeRef, isOver } = useSortable({ id });
  const style = {
    backgroundColor: isOver ? 'rgba(0,0,255,0.1)' : undefined,
  };
  return (
    <tr ref={setNodeRef} style={style} className="bg-subtle">
      {children}
    </tr>
  );
};

export default DiagnosisReviewTable;
