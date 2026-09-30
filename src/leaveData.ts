import type { ApprovalItem, ApprovalRole, LeaveField, LeaveSettings } from "./types";

export const periodOptions = ["跑操", "第一节", "第二节", "第三节", "第四节", "午休", "第五节", "第六节", "第七节", "晚自习"];
export const leaveTypeOptions = ["中餐晚餐外出", "事假", "病假", "外出", "其他"];
export const approvalRoleOptions: ApprovalRole[] = ["家长", "班主任", "学生科", "领导"];

export const defaultLeaveSettings: LeaveSettings = {
  applicant: "张三",
  startDate: "2026-05-12",
  endDate: "2026-05-12",
  startPeriod: "跑操",
  endPeriod: "晚自习",
  reason: "吃饭",
  leaveType: "中餐晚餐外出",
  isBoarding: false,
  proofImages: [],
  approvalRequests: approvalRoleOptions,
};

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

/**
 * Converts the current settings into labeled fields for the leave-detail page.
 *
 * @param settings - The saved leave settings.
 * @returns Detail fields formatted for display.
 */
export function createLeaveFields(settings: LeaveSettings): LeaveField[] {
  return [
    { label: "请假人：", value: settings.applicant },
    { label: "请假开始日期：", value: settings.startDate },
    { label: "请假结束日期：", value: settings.endDate },
    { label: "请假天数：", value: calculateLeaveDays(settings.startDate, settings.endDate) },
    { label: "请假类型：", value: settings.leaveType },
    { label: "请假总节数：", value: "未填写" },
    { label: "开始节次：", value: settings.startPeriod },
    { label: "结束节次：", value: settings.endPeriod },
    { label: "是否住校：", value: settings.isBoarding ? "是" : "否" },
    { label: "请假原因：", value: settings.reason || "未填写" },
  ];
}

export const approvals: ApprovalItem[] = [
  { title: "家长审批", detail: "", status: "approved" },
  { title: "班主任审批", detail: "", status: "approved" },
  { title: "学生科审批", detail: "", status: "pending" },
  { title: "领导审批", detail: "", status: "pending" },
];
