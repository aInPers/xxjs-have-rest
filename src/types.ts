export interface LeaveField {
  label: string;
  value: string;
}

export interface ApprovalItem {
  title: string;
  detail: string;
  status: "approved" | "pending";
}

export type ApprovalRole = "家长" | "班主任" | "学生科" | "领导";

export interface LeaveSettings {
  applicant: string;
  startDate: string;
  endDate: string;
  startPeriod: string;
  endPeriod: string;
  reason: string;
  leaveType: string;
  isBoarding: boolean;
  proofImages: string[];
  approvalRequests: ApprovalRole[];
}
