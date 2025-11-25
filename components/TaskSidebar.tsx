
import React from 'react';
import { PaperTask, TaskStatus, ProcessingStep } from '../types';
import { FileText, Loader2, CheckCircle2, Circle, UploadCloud, Layers } from 'lucide-react';

interface TaskSidebarProps {
  tasks: PaperTask[];
  activeTaskId: string | null;
  onSelectTask: (id: string) => void;
}

export const TaskSidebar: React.FC<TaskSidebarProps> = ({ tasks, activeTaskId, onSelectTask }) => {
  
  const getStatusIcon = (status: TaskStatus) => {
    switch (status) {
      case TaskStatus.COMPLETED: return <CheckCircle2 className="w-5 h-5 text-green-500" />;
      case TaskStatus.PROCESSING: return <Loader2 className="w-5 h-5 text-indigo-500 animate-spin" />;
      default: return <Circle className="w-5 h-5 text-gray-300" />;
    }
  };

  const getStatusText = (task: PaperTask) => {
    if (task.status === TaskStatus.PROCESSING) {
      if (task.currentStep === ProcessingStep.SAVING) return `保存中...`;
      return `${task.currentStep === ProcessingStep.SPLITTING ? '切割' : task.currentStep === ProcessingStep.OCR ? 'OCR' : '分析'} (${task.progress}%)`;
    }
    if (task.status === TaskStatus.COMPLETED) return "已归档";
    return "等待中";
  };

  const completedCount = tasks.filter(t => t.status === TaskStatus.COMPLETED).length;
  const totalQuestions = tasks.reduce((acc, t) => acc + t.questions.length, 0);

  return (
    <div className="w-80 bg-white border-r border-gray-200 h-screen flex flex-col shrink-0">
      <div className="p-4 border-b border-gray-100 bg-gray-50">
        <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
          <FileText className="w-5 h-5" />
          任务列表
        </h2>
        <p className="text-xs text-gray-500 mt-1">
          共 {tasks.length} 个任务 
        </p>
      </div>
      
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {tasks.map(task => (
          <div 
            key={task.id}
            onClick={() => onSelectTask(task.id)}
            className={`
              p-3 rounded-lg border cursor-pointer transition-all
              ${activeTaskId === task.id ? 'bg-indigo-50 border-indigo-200 shadow-sm' : 'bg-white border-gray-100 hover:bg-gray-50'}
            `}
          >
            <div className="flex justify-between items-start mb-2">
              <span className="font-medium text-sm text-gray-900 truncate flex-1 pr-2" title={task.fileName}>
                {task.fileName}
              </span>
              {getStatusIcon(task.status)}
            </div>
            
            <div className="flex justify-between items-center text-xs">
              <span className={`
                px-2 py-0.5 rounded-full font-medium flex items-center gap-1
                ${task.status === TaskStatus.PROCESSING ? 'bg-indigo-100 text-indigo-700' : 
                  task.status === TaskStatus.COMPLETED ? 'bg-green-100 text-green-700' :
                  'bg-gray-100 text-gray-600'}
              `}>
                {task.currentStep === ProcessingStep.SAVING && <UploadCloud className="w-3 h-3" />}
                {getStatusText(task)}
              </span>
              
              {/* Question Count Display */}
              {task.questions.length > 0 && (
                 <span className="flex items-center gap-1 text-gray-400 font-medium" title="已解析题目数">
                    <Layers className="w-3 h-3" />
                    {task.questions.length}题
                 </span>
              )}
            </div>

            {task.status === TaskStatus.PROCESSING && (
              <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2 overflow-hidden">
                <div 
                  className="bg-indigo-500 h-1.5 rounded-full transition-all duration-300"
                  style={{ width: `${task.progress}%` }}
                />
              </div>
            )}
          </div>
        ))}
        {tasks.length === 0 && (
          <div className="text-center py-10 text-gray-400 text-sm">
            暂无任务，请上传试卷
          </div>
        )}
      </div>

      <div className="p-4 border-t border-gray-100 bg-gray-50 text-xs text-gray-500 flex flex-col gap-2">
        <div className="flex justify-between items-center">
            <span>任务进度</span>
            <span className="font-medium text-gray-800">{completedCount} / {tasks.length} 完成</span>
        </div>
        <div className="flex justify-between items-center border-t border-gray-200 pt-2 mt-1">
            <span>总提取题目</span>
            <span className="font-bold text-indigo-600 text-sm">{totalQuestions} 题</span>
        </div>
      </div>
    </div>
  );
};
