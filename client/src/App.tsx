import { useState } from "react";
import { Background } from "./components/layout/Background";
import { Sidebar } from "./components/layout/Sidebar";
import { RightPanel } from "./components/layout/RightPanel";
import { WelcomeHeader } from "./components/layout/WelcomeHeader";
import { ChatPanel } from "./components/chat/ChatPanel";
import { KnowledgeModule } from "./components/modules/KnowledgeModule";
import { FilesModule } from "./components/modules/FilesModule";
import { MemoryModule } from "./components/modules/MemoryModule";
import { ActionsModule } from "./components/modules/ActionsModule";
import { SettingsModule } from "./components/modules/SettingsModule";
import { ChevronLeft } from "lucide-react";
import { useChat } from "../hooks/useChat";

function App() {
  const [activeModule, setActiveModule] = useState("chat");
  const [isChatVisible, setIsChatVisible] = useState(false);
  const [isRightPanelVisible, setIsRightPanelVisible] = useState(false);

  // Get chat state for model management
  const chatState = useChat();

  const handleStartChat = () => {
    setIsChatVisible(true);
    setActiveModule("chat");
  };

  const handleModuleChange = (module: string) => {
    setActiveModule(module);
    if (module === "chat") {
      setIsChatVisible(true);
    } else {
      setIsChatVisible(false);
    }
  };

  const renderActiveModule = () => {
    switch (activeModule) {
      case "chat":
        return null;
      case "memory":
        return <MemoryModule />;
      case "files":
        return <FilesModule />;
      case "actions":
        return <ActionsModule />;
      case "settings":
        return <SettingsModule />;
      default:
        return <KnowledgeModule />;
    }
  };

  const toggleRightPanel = () => {
    setIsRightPanelVisible(!isRightPanelVisible);
  };

  return (
    <div className="min-h-screen bg-black text-slate-200 antialiased selection:bg-cyan-500/30 selection:text-cyan-100">
      <Background />

      <Sidebar
        activeModule={activeModule}
        onModuleChange={handleModuleChange}
      />

      <RightPanel
        isVisible={isRightPanelVisible}
        availableModels={chatState.availableModels}
        selectedModel={chatState.selectedModel}
        onModelSelect={chatState.setSelectedModel}
      />

      {/* Right Panel Toggle Button - Only show on chat page */}
      <button
        onClick={toggleRightPanel}
        style={{ display: activeModule === "chat" ? "flex" : "none" }}
        className={`fixed top-4 z-40 w-12 h-12 rounded-2xl bg-white/5 hover:bg-white/10 backdrop-blur-xl border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.3)] transition-all duration-500 active:scale-95 group items-center justify-center ${
          isRightPanelVisible ? "bg-white/10 right-[20.5rem]" : "right-4"
        }`}
        title={isRightPanelVisible ? "Hide panels" : "Show panels"}
      >
        <div
          className={`transition-transform duration-300 ${
            isRightPanelVisible ? "rotate-180" : ""
          }`}
        >
          <ChevronLeft
            size={16}
            className="text-slate-300 group-hover:text-slate-100"
          />
        </div>
      </button>

      {/* Main content area */}
      <main className="relative min-h-screen flex flex-col">
        {activeModule === "chat" ? (
          // Chat layout
          <section className="w-full px-6 sm:px-10 lg:px-14 pt-28 md:pt-24 flex flex-col items-center justify-start md:justify-center flex-1">
            <WelcomeHeader onStartChat={handleStartChat} />

            <div className="flex justify-center">
              <ChatPanel
                isVisible={isChatVisible}
                messages={chatState.messages}
                isLoading={chatState.isLoading}
                sendMessage={chatState.sendMessage}
                clearChat={chatState.clearChat}
                stopGeneration={chatState.stopGeneration}
              />
            </div>

            {/* Helper tips */}
            <div className="mt-6 flex flex-wrap items-center justify-center gap-2 text-[11px] text-slate-400">
              <div className="rounded-full px-2.5 py-1 bg-white/5 border border-white/10">
                Shift + Space to talk
              </div>
              <div className="rounded-full px-2.5 py-1 bg-white/5 border border-white/10">
                / to search modules
              </div>
              <div className="rounded-full px-2.5 py-1 bg-white/5 border border-white/10">
                Drag files anywhere
              </div>
              <button
                onClick={toggleRightPanel}
                className="rounded-full px-2.5 py-1 bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
              >
                {isRightPanelVisible ? "Hide panels" : "Show panels"}
              </button>
            </div>
          </section>
        ) : (
          // Module layout
          <section className="flex-1 flex">
            <div className="flex-1 ml-20 mr-4">{renderActiveModule()}</div>
          </section>
        )}
      </main>
    </div>
  );
}

export default App;
