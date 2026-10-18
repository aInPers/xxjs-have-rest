import { useEffect, useRef, useState } from "react";
import { exit, onBackButtonPress } from "@tauri-apps/api/app";
import { isTauri } from "@tauri-apps/api/core";
import { approvals, createLeaveFields, defaultLeaveSettings, getLocalToday, resolveLeaveDates } from "../features/leave/leaveData";
import { loadLeaveSettings, saveLeaveSettings } from "../features/leave/leaveStorage";
import type { ApprovalItem, LeaveSettings } from "../features/leave/types";
import schoolBrand from "../../assets/school/school-brand.webp";
import closeIcon from "../../assets/close.svg";
import moreIcon from "../../assets/more.svg";
import documentIcon from "../../assets/document.png";
import infoIcon from "../../assets/info.svg";
import workflowIcon from "../../assets/workflow.svg";
import checkIcon from "../../assets/check-circle.svg";
import pendingIcon from "../../assets/clock.svg";
import pauseIcon from "../../assets/pause.svg";
import chevronIcon from "../../assets/chevron-down.svg";
import imageIcon from "../../assets/image.svg";
import ChatList from "../features/chat/ChatList";
import SettingsPage from "../features/settings/SettingsPage";
import AboutPage from "../features/about/AboutPage";

/** Renders a titled card that groups a section of the leave detail page. */
function DetailCard({ icon, title, children }: { icon: string; title: string; children: React.ReactNode }) {
  return (
    <section className="detail-card">
      <header className="card-heading">
        <img src={icon} alt="" />
        <h2>{title}</h2>
      </header>
      {children}
    </section>
  );
}

/** Renders an individual approval role with an icon matching its current status. */
function ApprovalRole({ item }: { item: ApprovalItem }) {
  const isApproved = item.status === "approved";
  return (
    <article className="approval-role">
      <strong>{item.title}</strong>
      <p className={isApproved ? "approved" : "pending"}>
        <img src={isApproved ? checkIcon : pendingIcon} alt="" />
        {isApproved ? "已批准" : "待审批"}
      </p>
    </article>
  );
}

/** Provides the complete leave-detail application view and local expand/back interactions. */
function App() {
  const [rolesOpen, setRolesOpen] = useState(false);
  const [activePage, setActivePage] = useState<"leave" | "wechat" | "settings" | "about">("wechat");
  const activePageRef = useRef(activePage);
  const lastBackPressRef = useRef(0);
  const exitPromptTimerRef = useRef<number | undefined>(undefined);
  const [showExitPrompt, setShowExitPrompt] = useState(false);
  const [leaveSettings, setLeaveSettings] = useState<LeaveSettings>(defaultLeaveSettings);
  const [settingsReady, setSettingsReady] = useState(false);
  const [today, setToday] = useState(getLocalToday);
  const displayedSettings = resolveLeaveDates(leaveSettings, today);
  const approvalItems = approvals.map((approval) => ({
    ...approval,
    status: leaveSettings.approvalRequests.some((role) => approval.title === `${role}审批`) ? "approved" as const : "pending" as const,
  }));
  const parentApproval = approvalItems.find((approval) => approval.title === "家长审批");
  const anyApprovalItems = approvalItems.filter((approval) => approval.title !== "家长审批");
  const hasAnyApproval = anyApprovalItems.some((approval) => approval.status === "approved");
  const doctorApproved = leaveSettings.approvalRequests.includes("校医");

  /** Restores the latest leave settings after the local database becomes available. */
  useEffect(() => {
    let isMounted = true;
    loadLeaveSettings().then((savedSettings) => {
      if (isMounted && savedSettings) setLeaveSettings(savedSettings);
      if (isMounted) setSettingsReady(true);
    });
    return () => {
      isMounted = false;
    };
  }, []);

  /** Refreshes automatic dates after midnight and when the app becomes active again. */
  useEffect(() => {
    const refreshToday = () => setToday(getLocalToday());
    const interval = window.setInterval(refreshToday, 30_000);
    window.addEventListener("focus", refreshToday);
    document.addEventListener("visibilitychange", refreshToday);
    return () => {
      window.clearInterval(interval);
      window.removeEventListener("focus", refreshToday);
      document.removeEventListener("visibilitychange", refreshToday);
    };
  }, []);

  /** Handles the Android system back button, including a two-press exit from the root page. */
  useEffect(() => {
    if (!isTauri()) return;
    let mounted = true;
    let unregister: (() => Promise<void>) | undefined;
    void onBackButtonPress(() => {
      if (activePageRef.current !== "wechat") {
        navigateTo("wechat");
        return;
      }
      const now = Date.now();
      if (now - lastBackPressRef.current <= 2_000) {
        lastBackPressRef.current = 0;
        setShowExitPrompt(false);
        void exit().catch((error) => console.error("退出应用失败", error));
        return;
      }
      lastBackPressRef.current = now;
      setShowExitPrompt(true);
      window.clearTimeout(exitPromptTimerRef.current);
      exitPromptTimerRef.current = window.setTimeout(() => {
        lastBackPressRef.current = 0;
        setShowExitPrompt(false);
      }, 2_000);
    }).then((listener) => {
      if (mounted) unregister = () => listener.unregister();
      else void listener.unregister();
    }).catch((error) => console.error("注册系统返回键失败", error));
    return () => {
      mounted = false;
      window.clearTimeout(exitPromptTimerRef.current);
      void unregister?.();
    };
  }, []);

  /** Changes pages and clears any pending root-page exit gesture. */
  function navigateTo(page: "leave" | "wechat" | "settings" | "about") {
    activePageRef.current = page;
    lastBackPressRef.current = 0;
    window.clearTimeout(exitPromptTimerRef.current);
    setShowExitPrompt(false);
    setActivePage(page);
  }

  /** Switches from the leave detail page to the WeChat-inspired chat-list page. */
  function openWechat() {
    navigateTo("wechat");
  }

  /** Switches from the chat-list page back to the leave-detail page. */
  function returnToLeave() {
    navigateTo("leave");
  }

  /** Opens the editable leave-settings page from the WeChat-style chat list. */
  function openSettings() {
    navigateTo("settings");
  }

  /** Opens the product-information page from the WeChat-style chat list. */
  function openAbout() {
    navigateTo("about");
  }

  /**
   * Saves the validated settings form and returns the user to the chat list.
   *
   * @param settings - The newly saved leave settings.
   */
  function saveSettings(settings: LeaveSettings) {
    const currentToday = getLocalToday();
    const savedSettings = resolveLeaveDates(settings, currentToday);
    setToday(currentToday);
    setLeaveSettings(savedSettings);
    navigateTo("wechat");
    void saveLeaveSettings(savedSettings);
  }

  if (activePage === "wechat") {
    return <ChatList onOpenLeave={returnToLeave} onOpenSettings={openSettings} onOpenAbout={openAbout} showExitPrompt={showExitPrompt} />;
  }

  if (activePage === "settings") {
    return settingsReady ? <SettingsPage initialSettings={displayedSettings} today={today} onCancel={openWechat} onSave={saveSettings} /> : <main className="storage-loading">正在读取本地设置…</main>;
  }

  if (activePage === "about") {
    return <AboutPage onBack={openWechat} />;
  }

  return (
    <main className="app-shell">
      <header className="mobile-bar">
        <button type="button" className="icon-button" onClick={openWechat} aria-label="返回微信"><img src={closeIcon} alt="" /></button>
        <div><strong>请假详情 - {displayedSettings.applicant}</strong><span>qj.gzitvs.com</span></div>
        <button type="button" className="icon-button" aria-label="更多"><img src={moreIcon} alt="" /></button>
      </header>

      <header className="school-bar">
        <div className="school-name"><img src={schoolBrand} alt="广州市信息技术职业学校" /></div>
        <button type="button" className="return-button" onClick={openWechat}>返回列表</button>
      </header>

      <div className="page-content">
        <h1><img src={documentIcon} alt="" />请假详情</h1>

        <DetailCard icon={infoIcon} title="基本信息">
          <dl className="leave-fields">
            {createLeaveFields(displayedSettings).map((field) => <div key={field.label}><dt><span>{field.label}</span></dt><dd>{field.value}</dd></div>)}
          </dl>
        </DetailCard>

        <DetailCard icon={workflowIcon} title="审批流程">
          <div className={`success-alert ${hasAnyApproval ? "" : "pending-alert"}`}><img src={hasAnyApproval ? checkIcon : pendingIcon} alt="" /><div><strong>{hasAnyApproval ? "已通过" : "待审批"}</strong><span>{hasAnyApproval ? "任一审批人已批准，请假申请已通过" : "等待任一审批人批准"}</span></div></div>
          <div className="timeline">
            <div className="timeline-item"><i className={parentApproval?.status === "approved" ? "approved-dot" : "pending-dot"} /><div><strong>家长审批</strong><p className={parentApproval?.status === "approved" ? "approved" : "pending"}><img src={parentApproval?.status === "approved" ? checkIcon : pendingIcon} alt="" />{parentApproval?.status === "approved" ? "已批准" : "待审批"}</p><span>需家长确认</span></div></div>
            <div className="timeline-item"><i className={hasAnyApproval ? "approved-dot" : "pending-dot"} /><div className="any-approval"><strong>任一审批</strong><p className={hasAnyApproval ? "approved" : "pending"}><img src={hasAnyApproval ? checkIcon : pendingIcon} alt="" />{hasAnyApproval ? "已批准" : "待审批"}</p><span>班主任、学生科、领导任一批准即可</span><div className="roles-box">{anyApprovalItems.map((item) => <ApprovalRole key={item.title} item={item} />)}</div></div></div>
            {doctorApproved && <div className="timeline-item"><i className="approved-dot" /><div><strong>校医审批</strong><p className="approved"><img src={checkIcon} alt="" />已批准</p><span>需校医审核</span></div></div>}
            {!doctorApproved && <button type="button" className="role-toggle" aria-expanded={rolesOpen} onClick={() => setRolesOpen(!rolesOpen)}><img className={rolesOpen ? "rotated" : ""} src={chevronIcon} alt="" />{rolesOpen ? "隐藏无需审批的角色 (1)" : "显示无需审批的角色 (1)"}</button>}
            {!doctorApproved && rolesOpen && <div className="timeline-item"><i className="skipped-dot" /><div><strong>校医审批</strong><p className="not-required"><img src={pauseIcon} alt="" />无需审批</p><span>需校医审核</span></div></div>}
          </div>
        </DetailCard>

        <DetailCard icon={imageIcon} title="证明图片">
          {leaveSettings.proofImages.length ? <div className="detail-proof-list">{leaveSettings.proofImages.map((image, index) => <img key={image} src={image} alt={`证明图片 ${index + 1}`} />)}</div> : <div className="empty-proof"><img src={imageIcon} alt="" /><span>暂无证明图片</span></div>}
        </DetailCard>
      </div>
    </main>
  );
}

export default App;
