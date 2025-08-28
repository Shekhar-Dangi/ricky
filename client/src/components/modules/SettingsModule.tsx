import { useState } from "react";
import { Card } from "../ui/Card";
import { Button } from "../ui/Button";
import { Settings, User, Shield, Bell, Palette, Database, Trash2, Save } from "lucide-react";

export function SettingsModule() {
  const [settings, setSettings] = useState({
    // General
    username: "User",
    theme: "dark",
    
    // Privacy
    saveConversations: true,
    shareUsageData: false,
    
    // Notifications
    soundEnabled: true,
    desktopNotifications: true,
    
    // Memory
    maxConversations: 100,
    autoCleanup: true,
    retentionDays: 30
  });

  const updateSetting = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="flex-1 p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-100">Settings</h1>
          <p className="text-sm text-slate-400">Customize your Ricky experience</p>
        </div>
        <Button className="gap-2">
          <Save size={16} />
          Save Changes
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* General Settings */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <User size={16} className="text-blue-400" />
            <h2 className="text-lg font-medium text-slate-100">General</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm text-slate-200 mb-2">Username</label>
              <input
                type="text"
                value={settings.username}
                onChange={(e) => updateSetting("username", e.target.value)}
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
              />
            </div>

            <div>
              <label className="block text-sm text-slate-200 mb-2">Theme</label>
              <select
                value={settings.theme}
                onChange={(e) => updateSetting("theme", e.target.value)}
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
              >
                <option value="dark">Dark</option>
                <option value="light">Light</option>
                <option value="auto">Auto</option>
              </select>
            </div>
          </div>
        </Card>

        {/* Privacy Settings */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Shield size={16} className="text-green-400" />
            <h2 className="text-lg font-medium text-slate-100">Privacy</h2>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-slate-200">Save Conversations</div>
                <div className="text-xs text-slate-400">Store chat history locally</div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.saveConversations}
                  onChange={(e) => updateSetting("saveConversations", e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-slate-200">Share Usage Data</div>
                <div className="text-xs text-slate-400">Help improve Ricky</div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.shareUsageData}
                  onChange={(e) => updateSetting("shareUsageData", e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-600"></div>
              </label>
            </div>
          </div>
        </Card>

        {/* Notification Settings */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Bell size={16} className="text-yellow-400" />
            <h2 className="text-lg font-medium text-slate-100">Notifications</h2>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-slate-200">Sound Effects</div>
                <div className="text-xs text-slate-400">Play sounds for actions</div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.soundEnabled}
                  onChange={(e) => updateSetting("soundEnabled", e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-slate-200">Desktop Notifications</div>
                <div className="text-xs text-slate-400">Show system notifications</div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.desktopNotifications}
                  onChange={(e) => updateSetting("desktopNotifications", e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-600"></div>
              </label>
            </div>
          </div>
        </Card>

        {/* Memory Settings */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Database size={16} className="text-purple-400" />
            <h2 className="text-lg font-medium text-slate-100">Memory</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm text-slate-200 mb-2">Max Conversations</label>
              <input
                type="number"
                value={settings.maxConversations}
                onChange={(e) => updateSetting("maxConversations", parseInt(e.target.value))}
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                min="10"
                max="1000"
              />
            </div>

            <div>
              <label className="block text-sm text-slate-200 mb-2">Retention Period (days)</label>
              <input
                type="number"
                value={settings.retentionDays}
                onChange={(e) => updateSetting("retentionDays", parseInt(e.target.value))}
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                min="1"
                max="365"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-slate-200">Auto Cleanup</div>
                <div className="text-xs text-slate-400">Automatically remove old data</div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.autoCleanup}
                  onChange={(e) => updateSetting("autoCleanup", e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-600"></div>
              </label>
            </div>
          </div>
        </Card>
      </div>

      {/* Danger Zone */}
      <Card className="p-6 border-red-500/20">
        <div className="flex items-center gap-2 mb-4">
          <Trash2 size={16} className="text-red-400" />
          <h2 className="text-lg font-medium text-red-200">Danger Zone</h2>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-lg bg-red-500/10 border border-red-500/20">
            <div>
              <div className="text-sm text-red-200">Clear All Data</div>
              <div className="text-xs text-red-300">This will permanently delete all conversations, memories, and settings</div>
            </div>
            <Button variant="ghost" className="text-red-400 hover:text-red-300 hover:bg-red-500/20">
              Clear All
            </Button>
          </div>

          <div className="flex items-center justify-between p-4 rounded-lg bg-red-500/10 border border-red-500/20">
            <div>
              <div className="text-sm text-red-200">Reset Settings</div>
              <div className="text-xs text-red-300">Reset all settings to default values</div>
            </div>
            <Button variant="ghost" className="text-red-400 hover:text-red-300 hover:bg-red-500/20">
              Reset
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}