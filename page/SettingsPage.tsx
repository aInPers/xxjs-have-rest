import { useState } from "react";
import { calculateLeaveDays, leaveTypeOptions, periodOptions } from "../src/leaveData";
import type { LeaveSettings } from "../src/types";
import "./settings-page.css";

interface SettingsPageProps {
  initialSettings: LeaveSettings;
  onCancel: () => void;
  onSave: (settings: LeaveSettings) => void;
}

/**
 * Renders an editable leave-settings form and sends validated values to the application.
 *
 * @param initialSettings - The currently saved leave settings used to initialize the form.
 * @param onCancel - Returns to the WeChat list without saving changes.
 * @param onSave - Persists validated leave settings in the parent application.
 */
function SettingsPage({ initialSettings, onCancel, onSave }: SettingsPageProps) {
  const [settings, setSettings] = useState<LeaveSettings>(initialSettings);
  const [error, setError] = useState("");

  /**
   * Updates one value in the editable leave-settings draft.
   *
   * @param field - The LeaveSettings property to change.
   * @param value - The replacement string or boolean value.
   */
  function updateSetting(field: keyof LeaveSettings, value: string | boolean) {
    setSettings((current) => ({ ...current, [field]: value }) as LeaveSettings);
    setError("");
  }

  /** Validates date order and sends the completed settings back to the parent component. */
  function handleSave() {
    if (settings.endDate < settings.startDate) {
      setError("结束日期不能早于开始日期");
      return;
    }
    if (!settings.applicant.trim()) {
      setError("请填写请假人");
      return;
    }
    onSave(settings);
  }

  return (
    <main className="settings-page">
      <header className="settings-header"><button type="button" onClick={onCancel} aria-label="返回微信">‹</button><h1>请假设置</h1><button type="button" className="save-button" onClick={handleSave}>保存</button></header>
      <div className="settings-form">
        <p className="settings-caption">请假信息</p>
        <section className="settings-group">
          <label className="settings-row"><span>请假人</span><input value={settings.applicant} onChange={(event) => updateSetting("applicant", event.target.value)} placeholder="请输入请假人" /></label>
          <label className="settings-row"><span>请假开始</span><input type="date" value={settings.startDate} onChange={(event) => updateSetting("startDate", event.target.value)} /></label>
          <label className="settings-row"><span>请假结束</span><input type="date" min={settings.startDate} value={settings.endDate} onChange={(event) => updateSetting("endDate", event.target.value)} /></label>
          <div className="settings-row readonly"><span>请假天数</span><strong>{calculateLeaveDays(settings.startDate, settings.endDate)}</strong></div>
        </section>
        <p className="settings-caption">请假内容</p>
        <section className="settings-group">
          <label className="settings-row"><span>开始节次</span><select value={settings.startPeriod} onChange={(event) => updateSetting("startPeriod", event.target.value)}>{periodOptions.map((period) => <option key={period}>{period}</option>)}</select></label>
          <label className="settings-row"><span>结束节次</span><select value={settings.endPeriod} onChange={(event) => updateSetting("endPeriod", event.target.value)}>{periodOptions.map((period) => <option key={period}>{period}</option>)}</select></label>
          <label className="settings-row"><span>请假类型</span><select value={settings.leaveType} onChange={(event) => updateSetting("leaveType", event.target.value)}>{leaveTypeOptions.map((leaveType) => <option key={leaveType}>{leaveType}</option>)}</select></label>
          <label className="settings-row"><span>请假原因</span><input value={settings.reason} onChange={(event) => updateSetting("reason", event.target.value)} placeholder="请输入请假原因" /></label>
          <label className="settings-row"><span>是否住校</span><input className="switch" type="checkbox" checked={settings.isBoarding} onChange={(event) => updateSetting("isBoarding", event.target.checked)} /></label>
        </section>
        {error && <p className="settings-error" role="alert">{error}</p>}
      </div>
    </main>
  );
}

export default SettingsPage;
