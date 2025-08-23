import { useState } from "react";
import { Background } from "./components/layout/Background";
import { Sidebar } from "./components/layout/Sidebar";
import { RightPanel } from "./components/layout/RightPanel";
import { WelcomeHeader } from "./components/layout/WelcomeHeader";
import { ChatPanel } from "./components/chat/ChatPanel";
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
    }
    // In future phases, handle other modules here
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

      {/* Right Panel Toggle Button */}
      <button
        onClick={toggleRightPanel}
        className={`fixed top-4 z-40 w-12 h-12 rounded-2xl bg-white/5 hover:bg-white/10 backdrop-blur-xl border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.3)] transition-all duration-500 active:scale-95 group ${
          isRightPanelVisible ? "bg-white/10 right-[20.5rem]" : "right-4"
        }`}
        title={isRightPanelVisible ? "Hide panels" : "Show panels"}
      >
        <div className="flex items-center justify-center">
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
        </div>
      </button>

      {/* Main content area */}
      <main className="relative min-h-screen flex flex-col items-center justify-start md:justify-center">
        <section className="w-full px-6 sm:px-10 lg:px-14 pt-28 md:pt-24">
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
      </main>
    </div>
  );
}

export default App;
