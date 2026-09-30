import { useState } from "react";
import aboutIcon from "../assets/about-chat.svg";
import settingsIcon from "../assets/settings-chat.svg";
import leaveIcon from "../assets/leave-chat.svg";
import chatsTabIcon from "../assets/wechat/chats.png";
import contactsTabIcon from "../assets/wechat/contacts.png";
import discoverTabIcon from "../assets/wechat/discover.png";
import profileTabIcon from "../assets/wechat/profile.png";
import "./chat-list.css";

interface ChatListProps {
  onOpenLeave: () => void;
  onOpenSettings: () => void;
}

interface Conversation {
  icon: string;
  name: string;
  preview: string;
  time: string;
  destination?: "leave" | "settings";
}

const conversations: Conversation[] = [
  { icon: leaveIcon, name: "请假", preview: "请假申请已通过", time: "下午 7:28", destination: "leave" },
  { icon: settingsIcon, name: "设置", preview: "配置请假信息", time: "下午 7:26", destination: "settings" },
  { icon: aboutIcon, name: "关于", preview: "请假系统 · 版本 1.0.0", time: "昨天" },
];

/**
 * Renders a WeChat-inspired conversation list after the user closes the leave detail page.
 *
 * @param onOpenLeave - Opens the leave-detail view from the leave conversation.
 * @param onOpenSettings - Opens the settings form from the settings conversation.
 */
function ChatList({ onOpenLeave, onOpenSettings }: ChatListProps) {
  const [activeName, setActiveName] = useState<string | null>(null);

  /**
   * Marks a selected mock conversation and shows a lightweight in-page feedback message.
   *
   * @param name - The visible name of the selected conversation.
   */
  function handleChatClick(name: string) {
    setActiveName(name);
    window.setTimeout(() => setActiveName(null), 1800);
  }

  return (
    <main className="wechat-page">
      <header className="wechat-header">
        <span aria-hidden="true" />
        <h1>微信</h1>
        <button type="button" className="wechat-add" aria-label="添加会话">+</button>
      </header>

      <section className="chat-list" aria-label="聊天列表">
        {conversations.map((conversation) => (
          <button type="button" className="chat-row" key={conversation.name} onClick={() => conversation.destination === "leave" ? onOpenLeave() : conversation.destination === "settings" ? onOpenSettings() : handleChatClick(conversation.name)}>
            <img src={conversation.icon} alt="" />
            <span className="chat-copy"><strong>{conversation.name}</strong><small>{conversation.preview}</small></span>
            <time>{conversation.time}</time>
          </button>
        ))}
      </section>

      <nav className="wechat-tabs" aria-label="底部导航">
        <span className="active"><img src={chatsTabIcon} alt="" />微信</span>
        <span><img src={contactsTabIcon} alt="" />通讯录</span>
        <span><img src={discoverTabIcon} alt="" />发现</span>
        <span><img src={profileTabIcon} alt="" />我</span>
      </nav>
      {activeName && <div className="wechat-toast" role="status">已打开{activeName}</div>}
    </main>
  );
}

export default ChatList;
