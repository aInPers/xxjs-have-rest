import type { ApprovalItem, ApprovalRole, LeaveField, LeaveSettings } from "./types";

export const periodOptions = ["跑操", "第一节", "第二节", "第三节", "第四节", "午休", "第五节", "第六节", "第七节", "晚自习"];
export const leaveTypeOptions = ["中餐晚餐外出", "事假", "病假", "外出", "其他"];
export const approvalRoleOptions: ApprovalRole[] = ["家长", "班主任", "学生科", "领导", "校医"];

export const defaultLeaveSettings: LeaveSettings = {
  applicant: "张三",
  startDate: "2026-05-12",
  endDate: "2026-05-12",
  autoToday: false,
  startPeriod: "跑操",
  endPeriod: "晚自习",
  reason: "吃饭",
  leaveType: "中餐晚餐外出",
  isBoarding: false,
  proofImages: [],
  approvalRequests: approvalRoleOptions.filter((role) => role !== "校医"),
};

/** Formats the device's local calendar date for date inputs. */
export function getLocalToday(date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/** Applies the automatic date setting without changing the stored manual values. */
export function resolveLeaveDates(settings: LeaveSettings, today: string): LeaveSettings {
  return settings.autoToday ? { ...settings, startDate: today, endDate: today } : settings;
}

/**
 * Calculates leave duration from the difference between two calendar dates.
 *
 * @param startDate - The leave start date in YYYY-MM-DD format.
 * @param endDate - The leave end date in YYYY-MM-DD format.
 * @returns 当天 for the same date, otherwise the number of calendar days.
 */
export function calculateLeaveDays(startDate: string, endDate: string): string {
  const start = new Date(`${startDate}T00:00:00`);
  const end = new Date(`${endDate}T00:00:00`);
  const difference = Math.round((end.getTime() - start.getTime()) / 86_400_000);
  if (!Number.isFinite(difference) || difference < 0) return "0天";
  return difference === 0 ? "当天" : `${difference}天`;
}

/** Counts both selected periods and all ten periods on each complete day between them. */
export function calculateLeavePeriods(settings: Pick<LeaveSettings, "startDate" | "endDate" | "startPeriod" | "endPeriod">): number {
  const startIndex = periodOptions.indexOf(settings.startPeriod);
  const endIndex = periodOptions.indexOf(settings.endPeriod);
  const start = Date.parse(`${settings.startDate}T00:00:00Z`);
  const end = Date.parse(`${settings.endDate}T00:00:00Z`);
  const days = Math.round((end - start) / 86_400_000);

  if (startIndex < 0 || endIndex < 0 || !Number.isFinite(days) || days < 0) return 0;
  if (days === 0) return Math.max(0, endIndex - startIndex + 1);
  return days * periodOptions.length + endIndex - startIndex + 1;
}

/**
 * Converts the current settings into labeled fields for the leave-detail page.
 *
 * @param settings - The saved leave settings.
 * @returns Detail fields formatted for display.
 */
export function createLeaveFields(settings: LeaveSettings): LeaveField[] {
  return [
    { label: "请假开始日期: ", value: settings.startDate },
    { label: "请假结束日期: ", value: settings.endDate },
    { label: "请假天数: ", value: calculateLeaveDays(settings.startDate, settings.endDate) },
    { label: "请假类型: ", value: settings.leaveType },
    { label: "请假总节数: ", value: `${calculateLeavePeriods(settings)}节` },
    { label: "开始节次: ", value: settings.startPeriod },
    { label: "结束节次: ", value: settings.endPeriod },
    { label: "请假当天是否在校: \n留宿", value: settings.isBoarding ? "是" : "否" },
    { label: "请假原因: ", value: settings.reason || "未填写" },
  ];
}

export const approvals: ApprovalItem[] = [
  { title: "家长审批", detail: "", status: "approved" },
  { title: "班主任审批", detail: "", status: "approved" },
  { title: "学生科审批", detail: "", status: "pending" },
  { title: "领导审批", detail: "", status: "pending" },
];
