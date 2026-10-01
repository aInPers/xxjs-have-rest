import { useEffect, useState } from "react";
import { approvals, createLeaveFields, defaultLeaveSettings } from "./leaveData";
import { loadLeaveSettings, saveLeaveSettings } from "./leaveStorage";
import type { ApprovalItem, LeaveSettings } from "./types";
import schoolBrand from "../assets/school-brand.webp";
import closeIcon from "../assets/close.svg";
import moreIcon from "../assets/more.svg";
import documentIcon from "../assets/document.svg";
import infoIcon from "../assets/info.svg";
import workflowIcon from "../assets/workflow.svg";
import checkIcon from "../assets/check-circle.svg";
import pendingIcon from "../assets/clock.svg";
import chevronIcon from "../assets/chevron-down.svg";
import imageIcon from "../assets/image.svg";
import ChatList from "../page/ChatList";
import SettingsPage from "../page/SettingsPage";
import AboutPage from "../page/AboutPage";

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
  const [backNotice, setBackNotice] = useState(false);
  const [activePage, setActivePage] = useState<"leave" | "wechat" | "settings" | "about">("wechat");
  const [leaveSettings, setLeaveSettings] = useState<LeaveSettings>(defaultLeaveSettings);
  const [settingsReady, setSettingsReady] = useState(false);
  const approvalItems = approvals.map((approval) => ({
    ...approval,
    status: leaveSettings.approvalRequests.some((role) => approval.title === `${role}审批`) ? "approved" as const : "pending" as const,
  }));
  const parentApproval = approvalItems.find((approval) => approval.title === "家长审批");
  const anyApprovalItems = approvalItems.filter((approval) => approval.title !== "家长审批");
  const hasAnyApproval = anyApprovalItems.some((approval) => approval.status === "approved");

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

  /** Shows an in-page notice in the desktop demonstration when the return action is selected. */
  function handleBack() {
    setBackNotice(true);
    window.setTimeout(() => setBackNotice(false), 2200);
  }

  /** Switches from the leave detail page to the WeChat-inspired chat-list page. */
  function openWechat() {
    setActivePage("wechat");
  }

  /** Switches from the chat-list page back to the leave-detail page. */
  function returnToLeave() {
    setActivePage("leave");
  }

  /** Opens the editable leave-settings page from the WeChat-style chat list. */
  function openSettings() {
    setActivePage("settings");
  }

  /** Opens the product-information page from the WeChat-style chat list. */
  function openAbout() {
    setActivePage("about");
  }

  /**
   * Saves the validated settings form and returns the user to the chat list.
   *
   * @param settings - The newly saved leave settings.
   */
  function saveSettings(settings: LeaveSettings) {
    setLeaveSettings(settings);
    setActivePage("wechat");
    void saveLeaveSettings(settings);
  }

  if (activePage === "wechat") {
    return <ChatList onOpenLeave={returnToLeave} onOpenSettings={openSettings} onOpenAbout={openAbout} />;
  }

  if (activePage === "settings") {
    return settingsReady ? <SettingsPage initialSettings={leaveSettings} onCancel={openWechat} onSave={saveSettings} /> : <main className="storage-loading">正在读取本地设置…</main>;
  }

  if (activePage === "about") {
    return <AboutPage onBack={openWechat} />;
  }

  return (
    <main className="app-shell">
      <header className="mobile-bar">
        <button type="button" className="icon-button" onClick={openWechat} aria-label="返回微信"><img src={closeIcon} alt="" /></button>
        <div><strong>请假详情 - {leaveSettings.applicant}</strong><span>qj.gzitvs.com</span></div>
        <button type="button" className="icon-button" aria-label="更多"><img src={moreIcon} alt="" /></button>
      </header>

      <header className="school-bar">
        <div className="school-name"><img src={schoolBrand} alt="广州市信息技术职业学校" /></div>
        <button type="button" className="return-button" onClick={handleBack}>返回列表</button>
      </header>

      <div className="page-content">
        <h1><img src={documentIcon} alt="" />请假详情</h1>

        <DetailCard icon={infoIcon} title="基本信息">
          <dl className="leave-fields">
            {createLeaveFields(leaveSettings).map((field) => <div key={field.label}><dt>{field.label}</dt><dd>{field.value}</dd></div>)}
          </dl>
        </DetailCard>

        <DetailCard icon={workflowIcon} title="审批流程">
          <div className={`success-alert ${hasAnyApproval ? "" : "pending-alert"}`}><img src={hasAnyApproval ? checkIcon : pendingIcon} alt="" /><div><strong>{hasAnyApproval ? "已通过" : "待审批"}</strong><span>{hasAnyApproval ? "任一审批人已批准，请假申请已通过" : "等待任一审批人批准"}</span></div></div>
          <div className="timeline">
            <div className="timeline-item"><i className={parentApproval?.status === "approved" ? "approved-dot" : "pending-dot"} /><div><strong>家长审批</strong><p className={parentApproval?.status === "approved" ? "approved" : "pending"}><img src={parentApproval?.status === "approved" ? checkIcon : pendingIcon} alt="" />{parentApproval?.status === "approved" ? "已批准" : "待审批"}</p><span>需家长确认</span></div></div>
            <div className="timeline-item"><i className={hasAnyApproval ? "approved-dot" : "pending-dot"} /><div className="any-approval"><strong>任一审批</strong><p className={hasAnyApproval ? "approved" : "pending"}><img src={hasAnyApproval ? checkIcon : pendingIcon} alt="" />{hasAnyApproval ? "已批准" : "待审批"}</p><span>班主任、学生科、领导任一批准即可</span><div className="roles-box">{anyApprovalItems.map((item) => <ApprovalRole key={item.title} item={item} />)}</div></div></div>
          </div>
          <button type="button" className="role-toggle" onClick={() => setRolesOpen(!rolesOpen)}><img className={rolesOpen ? "rotated" : ""} src={chevronIcon} alt="" />{rolesOpen ? "收起无需审批的角色" : "显示无需审批的角色 (1)"}</button>
          {rolesOpen && <div className="unneeded-role">宿舍管理员：无需审批</div>}
        </DetailCard>

        <DetailCard icon={imageIcon} title="证明图片">
          {leaveSettings.proofImages.length ? <div className="detail-proof-list">{leaveSettings.proofImages.map((image, index) => <img key={image} src={image} alt={`证明图片 ${index + 1}`} />)}</div> : <div className="empty-proof"><img src={imageIcon} alt="" /><span>暂无证明图片</span></div>}
        </DetailCard>
      </div>
      {backNotice && <div className="toast" role="status">已返回请假列表</div>}
    </main>
  );
}

export default App;
