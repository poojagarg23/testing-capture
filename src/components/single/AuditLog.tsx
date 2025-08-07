import React, { useState, useEffect } from 'react';
import PageHeader from '../reusable/custom/PageHeader';
import Table, { TableColumn } from '../reusable/custom/Table';
import type { AuditLogEntry, AuditLogProps } from '../../types/AuditLog.types';
import { fetchAuditLog } from '../../helpers';

const AuditLog: React.FC<AuditLogProps> = ({ patient }) => {
  const [auditLogEntries, setAuditLogEntries] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    const getAuditLog = async () => {
      if (!patient?.patient_id) return;

      setLoading(true);
      try {
        const data = await fetchAuditLog(patient.patient_id);
        setAuditLogEntries(data);
      } catch (error) {
        console.error('Error fetching audit log:', error);
      } finally {
        setLoading(false);
      }
    };

    getAuditLog();
  }, [patient]);

  const columns: TableColumn<AuditLogEntry>[] = [
    {
      key: 'description',
      label: 'Event',
      render: (row) => row.description,
      width: '50%',
    },
    {
      key: 'user_name',
      label: 'Changed By',
      render: (row) => row.user_name,
      width: '25%',
    },
    {
      key: 'created_at',
      label: 'Timestamp',
      render: (row) =>
        new Date(row.created_at).toLocaleString('en-US', {
          month: '2-digit',
          day: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true,
        }),
      width: '25%',
    },
  ];

  return (
    <div className="flex flex-col gap-4 p-6 shadow-sm">
      <PageHeader
        title="Audit Log"
        subtitle="An event log that tracks every event that occurs for a patient record."
        showBackButton={false}
        className="pb-2"
      />

      <div className="flex-1 min-h-0">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-blue"></div>
          </div>
        ) : (
          <Table
            columns={columns}
            data={auditLogEntries}
            getRowId={(row) => row.id.toString()}
            activeRecordsCount={auditLogEntries.length}
            activeRecordsText={`${auditLogEntries.length === 1 ? 'Event' : 'Events'} Found`}
          />
        )}
      </div>
    </div>
  );
};

export default AuditLog;
