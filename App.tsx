
import React, { useState, useEffect, useRef } from 'react';
import { PaperTask, TaskStatus, ProcessingStep, Question } from './types';
import { TaskSidebar } from './components/TaskSidebar';
import { ReviewPanel } from './components/ReviewPanel';
import { Button } from './components/ui/Button';
import { Upload, Plus } from 'lucide-react';
import { MockApi } from './services/mockApi';

const MAX_TASKS = 10;

export default function App() {
  const [tasks, setTasks] = useState<PaperTask[]>([]);
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);
  const processingRef = useRef(false); // Lock to prevent concurrent processing logic overlap
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-select the active task if processing
  useEffect(() => {
    if (!activeTaskId && tasks.length > 0) {
      setActiveTaskId(tasks[0].id);
    }
  }, [tasks, activeTaskId]);

  // Main Processing Loop: Watches the queue
  useEffect(() => {
    const processQueue = async () => {
      // 1. Check if we are already processing something globally
      if (processingRef.current) return;
      
      // 2. Check if ANY task is currently in processing state (double check)
      const currentlyProcessing = tasks.find(t => t.status === TaskStatus.PROCESSING);
      if (currentlyProcessing) return;

      // 3. Find the next QUEUED task
      const nextTask = tasks.find(t => t.status === TaskStatus.QUEUED);
      if (!nextTask) return; // Nothing to do

      // START PROCESSING
      processingRef.current = true;
      
      // Optionally switch view to the task being processed
      setActiveTaskId(nextTask.id);
      
      await runTaskPipeline(nextTask.id);
      processingRef.current = false;
    };

    const intervalId = setInterval(processQueue, 1000);
    return () => clearInterval(intervalId);
  }, [tasks]);

  const runTaskPipeline = async (taskId: string) => {
    // Helper to update task state
    const updateTask = (updates: Partial<PaperTask>) => {
      setTasks(prev => prev.map(t => t.id === taskId ? { ...t, ...updates } : t));
    };

    // Get current task details to ensure we have fileName
    const currentTask = tasks.find(t => t.id === taskId);
    if (!currentTask) return;

    try {
      updateTask({ status: TaskStatus.PROCESSING, currentStep: ProcessingStep.SPLITTING, progress: 10 });
      
      // 1. Split
      const imageUrls = await MockApi.splitPaper(taskId);
      updateTask({ currentStep: ProcessingStep.OCR, progress: 25 });

      // 2. Process each split image (OCR -> Analyze)
      const questions: Question[] = [];
      const totalSteps = imageUrls.length * 2; // OCR + Analysis for each
      let stepsCompleted = 0;

      for (let i = 0; i < imageUrls.length; i++) {
        // OCR
        const markdown = await MockApi.ocrImage(imageUrls[i], i);
        stepsCompleted++;
        updateTask({ progress: 25 + Math.floor((stepsCompleted / totalSteps) * 60) });

        // Analysis
        updateTask({ currentStep: ProcessingStep.ANALYZING });
        const analysis = await MockApi.analyzeQuestion(markdown, i);
        stepsCompleted++;
        updateTask({ progress: 25 + Math.floor((stepsCompleted / totalSteps) * 60) });

        questions.push({
          id: `${taskId}-q-${i}`,
          imageUrl: imageUrls[i],
          markdown,
          analysis,
        });

        // Live update of questions as they come in
        setTasks(prev => prev.map(t => t.id === taskId ? { ...t, questions: [...questions] } : t));
      }

      // 3. Save Results Automatically
      updateTask({ currentStep: ProcessingStep.SAVING, progress: 95 });
      await MockApi.savePaperResults(currentTask.fileName, questions);

      // Finish Pipeline
      updateTask({ 
        status: TaskStatus.COMPLETED, 
        currentStep: ProcessingStep.DONE, 
        progress: 100 
      });

    } catch (error) {
      console.error("Task failed", error);
      // In a real app, handle error state
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    if (tasks.length + files.length > MAX_TASKS) {
      alert(`最多只能添加 ${MAX_TASKS} 个任务`);
      return;
    }

    const newTasks: PaperTask[] = Array.from(files).map((file: File) => ({
      id: Math.random().toString(36).substr(2, 9),
      fileName: file.name,
      originalImageUrl: URL.createObjectURL(file), // Only for preview if needed
      status: TaskStatus.QUEUED,
      currentStep: ProcessingStep.NONE,
      progress: 0,
      questions: []
    }));

    setTasks(prev => [...prev, ...newTasks]);
    // Reset input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const activeTask = tasks.find(t => t.id === activeTaskId);

  return (
    <div className="flex h-screen bg-gray-50 font-sans text-slate-900">
      
      {/* Left Sidebar */}
      <TaskSidebar 
        tasks={tasks} 
        activeTaskId={activeTaskId} 
        onSelectTask={setActiveTaskId} 
      />

      {/* Main Area */}
      <main className="flex-1 flex flex-col relative">
        
        {tasks.length === 0 ? (
          // Empty State
          <div className="flex-1 flex flex-col items-center justify-center p-10 text-center">
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 max-w-md w-full">
              <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <Upload className="w-8 h-8 text-indigo-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">上传试卷图片</h2>
              <p className="text-gray-500 mb-8">
                支持 JPG, PNG 格式。系统将自动拆分题目并进行智能分析。<br/>
                <span className="text-xs text-gray-400 mt-2 block">(最多支持 {MAX_TASKS} 张试卷)</span>
              </p>
              
              <Button 
                size="lg" 
                className="w-full"
                onClick={() => fileInputRef.current?.click()}
              >
                <Plus className="w-5 h-5 mr-2" /> 选择图片开始
              </Button>
            </div>
          </div>
        ) : (
          // Active Workspace
          <>
            {activeTask ? (
              <ReviewPanel 
                task={activeTask}
              />
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-400">
                请选择左侧任务查看详情
              </div>
            )}
            
            {/* Floating Upload Button (if not full) */}
            {tasks.length < MAX_TASKS && (
               <div className="absolute bottom-6 right-6">
                 <Button 
                   onClick={() => fileInputRef.current?.click()}
                   className="rounded-full shadow-lg w-14 h-14 !p-0 flex items-center justify-center"
                   title="添加更多试卷"
                 >
                   <Plus className="w-8 h-8" />
                 </Button>
               </div>
            )}
          </>
        )}

        {/* Hidden File Input */}
        <input 
          type="file" 
          ref={fileInputRef} 
          className="hidden" 
          accept="image/*" 
          multiple 
          onChange={handleFileUpload}
        />
      </main>
    </div>
  );
}
