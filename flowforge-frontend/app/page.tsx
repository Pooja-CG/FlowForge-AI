"use client";

import { useState } from "react";
import {
  FolderKanban,
  Activity,
  AlertTriangle,
  BrainCircuit,
  Play,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import Markdown from "react-markdown";
import { createGitLabIssue } from "@/services/gitlab";

export default function Home() {
  const [idea, setIdea] = useState("");
  const [workflow, setWorkflow] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Track execution states for individual tasks
  const [executingTasks, setExecutingTasks] = useState<{ [key: string]: boolean }>({});
  const [completedTasks, setCompletedTasks] = useState<{ [key: string]: boolean }>({});
  const [taskOutputs, setTaskOutputs] = useState<{ [key: string]: string }>({});

  const stats = [
    { title: "Active Projects", value: "12", icon: FolderKanban },
    { title: "Tasks Completed", value: "184", icon: Activity },
    { title: "Risk Alerts", value: "7", icon: AlertTriangle },
    { title: "AI Suggestions", value: "23", icon: BrainCircuit },
  ];

  async function handleGenerate() {
    if (!idea) return;

    setLoading(true);
    setError("");
    setWorkflow(null);
    setTaskOutputs({});
    setCompletedTasks({});

    try {
      const res = await fetch(
        `http://127.0.0.1:8000/api/generate-sprint?prompt=${encodeURIComponent(idea.trim())}`
      );

      if (!res.ok) {
        throw new Error(`Server responded with status: ${res.status}`);
      }

      const result = await res.json();

      if (result.status === "error") {
        throw new Error(result.message);
      }

      if (result.data && typeof result.data === "object" && result.data.modules) {
        setWorkflow(result.data);

        // AUTO CREATE GITLAB ISSUES
        if (result.data.modules) {
          for (const module of result.data.modules) {
            if (!module.tasks) continue;
            for (const task of module.tasks) {
              if (typeof createGitLabIssue === "function") {
                await createGitLabIssue(
                  task.title,
                  `Module: ${module.module}\nPriority: ${task.priority}\nEstimated Days: ${task.estimatedDays}`
                );
              }
            }
          }
        }
      }
    } catch (err: any) {
      console.error("FRONTEND FETCH ERROR:", err);
      setError(err.message || "Could not bridge connection to the AI Agent.");
    } finally {
      setLoading(false);
    }
  }

  // --- NEW: Trigger Autonomous Agent Execution for a specific task ---
  async function runAgentOnTask(taskTitle: string, moduleName: string, taskKey: string) {
    setExecutingTasks((prev) => ({ ...prev, [taskKey]: true }));
    try {
      const res = await fetch(
        `http://127.0.0.1:8000/api/execute-task?task_title=${encodeURIComponent(taskTitle)}&module_name=${encodeURIComponent(moduleName)}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          }
        }
      );

      if (!res.ok) {
        throw new Error(`Server responded with status: ${res.status}`);
      }

      const result = await res.json();
      if (result.status === "success") {
        setTaskOutputs((prev) => ({ ...prev, [taskKey]: result.execution_plan }));
        setCompletedTasks((prev) => ({ ...prev, [taskKey]: true }));
      } else {
        alert("Execution failed: " + result.message);
      }
    } catch (err: any) {
      console.error("Task Execution Error:", err);
      alert("Failed to connect to agent execution pipeline: " + err.message);
    } finally {
      setExecutingTasks((prev) => ({ ...prev, [taskKey]: false }));
    }
  }

  return (
    <main className="min-h-screen bg-black text-white p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-5xl font-bold mb-3 tracking-tight bg-gradient-to-r from-blue-400 to-cyan-500 bg-clip-text text-transparent">
            FlowForge AI
          </h1>
          <p className="text-gray-400 text-lg">
            Autonomous Project & Workflow Execution Agent
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((item, index) => {
            const Icon = item.icon;
            return (
              <div
                key={index}
                className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <Icon className="w-8 h-8 text-blue-400" />
                </div>
                <h2 className="text-gray-400 text-sm">{item.title}</h2>
                <p className="text-3xl font-bold mt-2">{item.value}</p>
              </div>
            );
          })}
        </div>

        {/* AI Input Panel */}
        <div className="mt-10 bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
          <h2 className="text-2xl font-semibold mb-4">Create New Project</h2>
          <textarea
            value={idea}
            onChange={(e) => setIdea(e.target.value)}
            placeholder="Example: Build a food delivery app in 7 days..."
            className="w-full h-36 bg-black border border-zinc-700 rounded-xl p-4 outline-none resize-none focus:border-blue-500 transition-colors text-white"
          />
          <button
            onClick={handleGenerate}
            disabled={loading}
            className="mt-5 bg-blue-600 hover:bg-blue-700 disabled:bg-zinc-800 disabled:text-zinc-500 disabled:cursor-not-allowed transition px-6 py-3 rounded-xl font-medium shadow-md"
          >
            {loading ? "Orchestrating Pipeline..." : "Generate Workflow"}
          </button>
        </div>

        {/* Error State */}
        {error && (
          <div className="mt-6 p-4 bg-red-950/40 border border-red-800 rounded-xl text-red-400 text-sm">
            {error}
          </div>
        )}

        {/* Structured Workflow Output Display */}
        {workflow && workflow.modules && (
          <div className="mt-10">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-3xl font-bold">Generated Workflow</h2>
              <div className="text-green-400 text-sm font-medium px-3 py-1 bg-green-500/10 rounded-full border border-green-500/20">
                GitLab Issues Tracked & Logged to MongoDB
              </div>
            </div>

            <div className="space-y-6">
              {workflow.modules.map((module: any, index: number) => (
                <div
                  key={index}
                  className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-xl"
                >
                  <h3 className="text-2xl font-semibold mb-4 text-blue-400">
                    {module.module}
                  </h3>

                  <div className="space-y-4">
                    {module.tasks?.map((task: any, taskIndex: number) => {
                      const taskKey = `${index}-${taskIndex}`;
                      const isExecuting = executingTasks[taskKey];
                      const isCompleted = completedTasks[taskKey];
                      const hasOutput = !!taskOutputs[taskKey];

                      return (
                        <div
                          key={taskIndex}
                          className="bg-black border border-zinc-800 rounded-xl p-4 hover:border-zinc-700 transition-colors"
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="flex items-center gap-2">
                                {isCompleted && <CheckCircle2 className="w-5 h-5 text-green-400 shrink-0" />}
                                <h4 className="font-medium text-zinc-100">{task.title}</h4>
                              </div>
                              <p className="text-gray-400 text-sm mt-1">
                                Estimated Scope: {task.estimatedDays || 1} days
                              </p>
                            </div>

                            <div className="flex items-center gap-3">
                              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 uppercase tracking-wider">
                                {task.priority || "Medium"}
                              </span>

                              {/* ACTION BUTTON TO EXECUTE THE TASK */}
                              <button
                                onClick={() => runAgentOnTask(task.title, module.module, taskKey)}
                                disabled={isExecuting}
                                className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg border transition ${isCompleted
                                    ? "bg-green-500/10 text-green-400 border-green-500/20 hover:bg-green-500/20"
                                    : "bg-blue-600 text-white border-transparent hover:bg-blue-700 disabled:bg-zinc-800"
                                  }`}
                              >
                                {isExecuting ? (
                                  <>
                                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                    Coding...
                                  </>
                                ) : isCompleted ? (
                                  <>
                                    <Play className="w-3.5 h-3.5" />
                                    Re-run Agent
                                  </>
                                ) : (
                                  <>
                                    <Play className="w-3.5 h-3.5" />
                                    Run Agent
                                  </>
                                )}
                              </button>
                            </div>
                          </div>

                          {/* INLINE EXPANDABLE OUTPUT PANEL */}
                          {hasOutput && (
                            <div className="mt-4 pt-4 border-t border-zinc-800 animate-fadeIn">
                              <div className="text-xs font-semibold text-zinc-400 mb-3 uppercase tracking-wider">
                                Agent Execution Output
                              </div>

                              {/* Beautiful Custom Styled Container for Parsed Markdown */}
                              <div className="bg-zinc-950 text-zinc-300 font-sans text-sm p-5 rounded-lg overflow-x-auto max-h-80 border border-zinc-900 shadow-inner overflow-y-auto">
                                <Markdown
                                  className="prose prose-invert max-w-none text-left space-y-4
          prose-headings:text-blue-400 prose-headings:font-semibold prose-headings:mt-4 prose-headings:mb-2
          prose-h2:text-xl prose-h3:text-lg
          prose-p:text-zinc-300 prose-p:leading-relaxed
          prose-ul:list-disc prose-ul:pl-5 prose-ul:space-y-1 prose-ul:text-zinc-300
          prose-ol:list-decimal prose-ol:pl-5 prose-ol:space-y-1 prose-ol:text-zinc-300
          prose-strong:text-white prose-strong:font-semibold
          prose-code:text-cyan-400 prose-code:font-mono prose-code:bg-zinc-900 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded"
                                >
                                  {taskOutputs[taskKey]}
                                </Markdown>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}