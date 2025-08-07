export interface StaffMember {
  id: number;
  name: string;
  staff_email: string;
}

export interface AddOrEditStaffMembers {
  name: string;
  email: string;
  editingId?: number;
}
