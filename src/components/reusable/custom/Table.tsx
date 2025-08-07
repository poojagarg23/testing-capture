import React from 'react';
import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import ActiveRecords from './ActiveRecords';
import DragHandle from '../../../assets/icons/drag-handle.svg?react';
import CustomCheckbox from '../CustomCheckbox';

export interface TableColumn<T> {
  key: string;
  label: string;
  render?: (row: T) => React.ReactNode;
  priority?: 'high' | 'medium' | 'low'; // For responsive visibility
  width?: string; // Column width (e.g., "10%", "100px")
  /** Set to false to disable sorting UI and click for this column */
  sortable?: boolean;
  /** Text alignment for column content and header. Defaults to 'left'. */
  align?: 'left' | 'center' | 'right';
  /** If true, disables text truncation and max-width limit for this column's cell content. */
  noTruncate?: boolean;
}

interface TableProps<T> {
  columns: TableColumn<T>[];
  data: T[];
  activeRecordsCount?: number;
  activeRecordsText?: string; // Custom text for active records display
  draggable?: boolean; // Enable/disable drag functionality
  onDragEnd?: (newData: T[]) => void; // Callback for drag end
  onSelect?: (selectedItems: T[]) => void; // Callback for selection
  selectedItems?: T[]; // Currently selected items
  getRowId?: (row: T) => string; // Function to get unique ID for each row
  showSelectAll?: boolean; // Show select all checkbox
  onRowClick?: (row: T) => void; // Callback for row click
  onSort?: (column: string) => void; // Callback for column sorting
  sortOrder?: { column: string | null; order: 'asc' | 'desc' | null }; // Current sort state
}

function Table<T>({
  columns,
  data,
  activeRecordsCount,
  activeRecordsText,
  draggable = false,
  onDragEnd,
  onSelect,
  selectedItems = [],
  getRowId,
  showSelectAll = false,
  onRowClick,
  onSort,
  sortOrder,
}: TableProps<T>) {
  const [localData, setLocalData] = React.useState<T[]>(data);
  const [isAllSelected, setIsAllSelected] = React.useState(false);

  // Column keys that should default to center alignment when no explicit align is provided
  const defaultCenterKeys = ['visittype', 'status', 'facesheet', 'note'];

  React.useEffect(() => {
    setLocalData(data);
  }, [data]);

  React.useEffect(() => {
    setIsAllSelected(selectedItems.length === data.length && data.length > 0);
  }, [selectedItems, data]);

  // dnd-kit drag end handler
  const handleDragEnd = (event: DragEndEvent) => {
    if (!getRowId || !event.over) return;

    const { active, over } = event;
    if (active.id === over.id) return;

    const oldIndex = localData.findIndex((row) => getRowId(row) === active.id);
    const newIndex = localData.findIndex((row) => getRowId(row) === over.id);
    if (oldIndex === -1 || newIndex === -1) return;

    const newData = arrayMove(localData, oldIndex, newIndex);
    setLocalData(newData);
    onDragEnd?.(newData);
  };

  // Sensors for dnd-kit
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    }),
  );

  const SortableRow: React.FC<{ row: T }> = ({ row }) => {
    // getRowId is guaranteed to be available when SortableRow is rendered
    const id = getRowId!(row);
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
      id,
    });

    const style: React.CSSProperties = {
      transform: CSS.Transform.toString(transform),
      transition,
    };

    return (
      <tr
        ref={setNodeRef}
        style={style}
        {...attributes}
        className={`hover:bg-[var(--table-hover)] transition-colors h-[65px] border-[var(--table-header)] max-h-[65px] ${
          isDragging ? 'bg-[var(--table-hover)] shadow-lg' : ''
        } ${onRowClick ? 'cursor-pointer' : ''}`}
        onClick={() => onRowClick?.(row)}
      >
        <td className="w-8 px-3 py-3 transition-opacity duration-200">
          <DragHandle className="w-5 h-5 text-secondary cursor-grab opacity-60" {...listeners} />
        </td>
        {showSelectAll && onSelect && (
          <td className="w-12 px-3 py-3">
            <CustomCheckbox
              checked={isRowSelected(row)}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                handleRowSelect(row, e.target.checked)
              }
              label="Select row"
              labelClassName="sr-only"
              className=""
            />
          </td>
        )}
        {columns.map((col) => {
          const alignment = col.align ?? (defaultCenterKeys.includes(col.key) ? 'center' : 'left');
          return (
            <td
              key={col.key}
              className={`px-4 py-3 text-sm text-secondary border-r border-[var(--table-header)] last:border-r-0 ${
                col.priority === 'low'
                  ? 'hidden lg:table-cell'
                  : col.priority === 'medium'
                    ? 'hidden md:table-cell'
                    : ''
              }`}
              style={{ textAlign: alignment }}
            >
              <div
                className={`${col.noTruncate ? '' : 'truncate max-w-[200px]'}`}
                style={{
                  textAlign: alignment,
                  width: '100%',
                  overflowX: col.noTruncate ? 'auto' : undefined,
                }}
              >
                {col.render
                  ? col.render(row)
                  : String((row as Record<string, unknown>)[col.key] ?? '')}
              </div>
            </td>
          );
        })}
      </tr>
    );
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      onSelect?.(data);
    } else {
      onSelect?.([]);
    }
  };

  const handleRowSelect = (row: T, checked: boolean) => {
    if (!getRowId) return;

    const rowId = getRowId(row);
    let newSelected: T[];

    if (checked) {
      newSelected = [...selectedItems, row];
    } else {
      newSelected = selectedItems.filter((item) => getRowId(item) !== rowId);
    }

    onSelect?.(newSelected);
  };

  const isRowSelected = (row: T): boolean => {
    if (!getRowId) return false;
    const rowId = getRowId(row);
    return selectedItems.some((item) => getRowId(item) === rowId);
  };

  const renderTable = () => (
    <div className="w-full h-full flex flex-col">
      <div className="flex-1 min-h-0 border border-[var(--table-header)] rounded-xl bg-white shadow-sm overflow-hidden">
        <div className="h-full landscape-table overflow-auto">
          <table className="w-full">
            <thead className="sticky top-0 z-10">
              <tr className="bg-[var(--table-header)] border-b border-[var(--table-header)]">
                {draggable && (
                  <th className="w-8 px-3 py-4 text-left">{/* Drag handle column header */}</th>
                )}
                {showSelectAll && onSelect && (
                  <th className="w-12 px-3 py-4 text-left">
                    <CustomCheckbox
                      checked={isAllSelected}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        handleSelectAll(e.target.checked)
                      }
                      label="Select all"
                      labelClassName="sr-only"
                      className=""
                    />
                  </th>
                )}
                {columns.map((col) => {
                  const alignment =
                    col.align ?? (defaultCenterKeys.includes(col.key) ? 'center' : 'left');
                  const isSortable = onSort && col.sortable !== false;
                  return (
                    <th
                      key={col.key}
                      style={{ width: col.width, textAlign: alignment }}
                      className={`px-4 py-4 text-sm font-medium text-secondary border-r border-[var(--table-header)] last:border-r-0 ${
                        col.priority === 'low'
                          ? 'hidden lg:table-cell'
                          : col.priority === 'medium'
                            ? 'hidden md:table-cell'
                            : ''
                      } ${isSortable ? 'cursor-pointer hover:bg-[var(--table-hover)]' : ''}`}
                      onClick={isSortable ? () => onSort?.(col.key) : undefined}
                    >
                      <div
                        className="flex items-center gap-1"
                        style={{
                          justifyContent:
                            alignment === 'center'
                              ? 'center'
                              : alignment === 'right'
                                ? 'flex-end'
                                : 'flex-start',
                        }}
                      >
                        <span className="truncate">{col.label}</span>
                        {isSortable && (
                          <div className="flex flex-col">
                            <svg
                              className={`w-3 h-3 ${
                                sortOrder?.column === col.key && sortOrder?.order === 'asc'
                                  ? 'text-primary'
                                  : 'text-[var(--text-secondary)]'
                              }`}
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={1.5}
                                d="M8 15l4-4 4 4"
                              />
                            </svg>
                            <svg
                              className={`w-3 h-3 -mt-1 ${
                                sortOrder?.column === col.key && sortOrder?.order === 'desc'
                                  ? 'text-primary'
                                  : 'text-[var(--text-secondary)]'
                              }`}
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={1.5}
                                d="M8 9l4 4 4-4"
                              />
                            </svg>
                          </div>
                        )}
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {localData.length === 0 ? (
                <tr>
                  <td
                    colSpan={columns.length + (draggable ? 1 : 0) + (showSelectAll ? 1 : 0)}
                    className="px-4 py-8 text-center text-sm text-[var(--text-secondary)]"
                  >
                    No records found.
                  </td>
                </tr>
              ) : (
                localData.map((row, i) => {
                  if (draggable && getRowId) {
                    return <SortableRow key={getRowId(row)} row={row} />;
                  }

                  return (
                    <tr
                      key={i}
                      className={`hover:bg-[var(--table-hover)] border-[var(--table-header)] transition-colors h-[65px] max-h-[65px] ${onRowClick ? 'cursor-pointer' : ''}`}
                      onClick={() => onRowClick?.(row)}
                    >
                      {draggable && (
                        <td className="w-8 px-3 py-3 hover:opacity-100 opacity-0 transition-opacity duration-200">
                          <DragHandle className="w-5 h-5 text-secondary cursor-grab opacity-60" />
                        </td>
                      )}
                      {showSelectAll && onSelect && (
                        <td className="w-12 px-3 py-3">
                          <CustomCheckbox
                            checked={isRowSelected(row)}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                              handleRowSelect(row, e.target.checked)
                            }
                            label="Select row"
                            labelClassName="sr-only"
                            className=""
                          />
                        </td>
                      )}
                      {columns.map((col) => {
                        const alignment =
                          col.align ?? (defaultCenterKeys.includes(col.key) ? 'center' : 'left');
                        return (
                          <td
                            key={col.key}
                            className={`px-4 py-3 text-sm text-secondary border-r border-[var(--table-header)] last:border-r-0 ${
                              col.priority === 'low'
                                ? 'hidden lg:table-cell'
                                : col.priority === 'medium'
                                  ? 'hidden md:table-cell'
                                  : ''
                            }`}
                            style={{ textAlign: alignment }}
                          >
                            <div
                              className={`${col.noTruncate ? '' : 'truncate max-w-[200px]'}`}
                              style={{
                                textAlign: alignment,
                                width: '100%',
                                overflowX: col.noTruncate ? 'auto' : undefined,
                              }}
                            >
                              {col.render
                                ? col.render(row)
                                : String((row as Record<string, unknown>)[col.key] ?? '')}
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
      {typeof activeRecordsCount === 'number' && (
        <div className="flex justify-end mt-4 flex-shrink-0">
          <ActiveRecords count={activeRecordsCount} text={activeRecordsText} />
        </div>
      )}
    </div>
  );

  if (draggable) {
    return (
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext
          items={localData.map((row) => (getRowId ? getRowId(row) : ''))}
          strategy={verticalListSortingStrategy}
        >
          {renderTable()}
        </SortableContext>
      </DndContext>
    );
  }

  return renderTable();
}

export default Table;
