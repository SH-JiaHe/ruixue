import { AnimatePresence, motion } from "framer-motion";
import { Award, BookOpen, Globe2, Map, UserRound } from "lucide-react";
import type { ReactNode } from "react";

export type TabKey = "world" | "memories" | "routes" | "achievements" | "profile";

const tabs: Array<{ key: TabKey; label: string; icon: typeof Globe2 }> = [
  { key: "world", label: "世界", icon: Globe2 },
  { key: "memories", label: "回忆", icon: BookOpen },
  { key: "routes", label: "路线", icon: Map },
  { key: "achievements", label: "成就", icon: Award },
  { key: "profile", label: "我的", icon: UserRound },
];

type ShellProps = {
  activeTab: TabKey;
  onTabChange: (tab: TabKey) => void;
  children: ReactNode;
  toast?: string;
};

export function Shell({ activeTab, onTabChange, children, toast }: ShellProps) {
  return (
    <div className="app-shell">
      <AnimatePresence mode="wait">
        <motion.main
          key={activeTab}
          className="page-stage"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.24 }}
        >
          {children}
        </motion.main>
      </AnimatePresence>

      <nav className="bottom-nav" aria-label="主导航">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const active = tab.key === activeTab;
          return (
            <button
              key={tab.key}
              type="button"
              className={active ? "nav-item active" : "nav-item"}
              onClick={() => onTabChange(tab.key)}
              aria-current={active ? "page" : undefined}
              title={tab.label}
            >
              <Icon size={20} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </nav>

      <AnimatePresence>
        {toast && (
          <motion.div
            className="toast"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
