
import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { PaperTask, TaskStatus, ProcessingStep } from '../types';
import { CheckCircle2, Loader2 } from 'lucide-react';

interface ReviewPanelProps {
  task: PaperTask;
}

export const ReviewPanel: React.FC<ReviewPanelProps> = ({ task }) => {
  const isCompleted = task.status === TaskStatus.COMPLETED;
  const isProcessing = task.status === TaskStatus.PROCESSING;

  return (
    <div className="flex-1 h-screen overflow-hidden flex flex-col bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center shadow-sm z-10">
        <div>
          <h1 className="text-xl font-bold text-gray-800">{task.fileName}</h1>
          <div className="flex items-center gap-2 mt-1">
             {isProcessing && (
                <span className="flex items-center text-sm text-indigo-600">
                  <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                  {task.currentStep === ProcessingStep.SAVING ? '正在上传保存结果...' : 'AI 正在分析中...'}
                </span>
             )}
             {isCompleted && (
                <span className="flex items-center text-sm text-green-600">
                  <CheckCircle2 className="w-3 h-3 mr-1" />
                  分析完成并已归档
                </span>
             )}
             {!isProcessing && !isCompleted && (
               <span className="text-sm text-gray-400">等待处理...</span>
             )}
          </div>
        </div>
        
        <div className="flex items-center gap-4">
           {isProcessing && (
             <div className="w-32 bg-gray-100 rounded-full h-2 overflow-hidden">
                <div 
                  className="bg-indigo-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${task.progress}%` }}
                />
             </div>
           )}
        </div>
      </header>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-8">
        {task.questions.map((q, index) => (
          <div key={q.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col lg:flex-row">
            
            {/* Left: Original Image & OCR (Reference) */}
            <div className="lg:w-5/12 border-b lg:border-b-0 lg:border-r border-gray-100 p-4 bg-gray-50/50">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-gray-400">题目 {index + 1}</span>
                <span className="text-xs text-gray-400">OCR 识别结果</span>
              </div>
              
              {/* Image Preview */}
              <div className="mb-4 rounded-lg overflow-hidden border border-gray-200 bg-white">
                <img src={q.imageUrl} alt={`Question ${index + 1}`} className="w-full object-cover max-h-48 opacity-90 hover:opacity-100 transition-opacity" />
              </div>

              {/* Rendered OCR Markdown */}
              <div className="prose prose-sm max-w-none p-3 bg-white rounded border border-gray-200 text-gray-600">
                <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
                  {q.markdown}
                </ReactMarkdown>
              </div>
            </div>

            {/* Right: Analysis Result (Read Only) */}
            <div className="lg:w-7/12 p-6 flex flex-col relative">
              <div className="mb-6">
                <h3 className="text-sm font-bold text-indigo-600 mb-2 uppercase tracking-wide">涉及知识点</h3>
                <div className="flex flex-wrap gap-2">
                  {q.analysis.knowledgePoints.map((kp, i) => (
                    <span key={i} className="px-2.5 py-1 bg-indigo-50 text-indigo-700 rounded text-sm border border-indigo-100 font-medium">
                      {kp}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex-1">
                <h3 className="text-sm font-bold text-teal-600 mb-2 uppercase tracking-wide">解题思路与方法</h3>
                <div className="prose prose-slate prose-sm max-w-none bg-slate-50 p-4 rounded-lg border border-slate-100">
                  <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
                    {q.analysis.solutionMethod}
                  </ReactMarkdown>
                </div>
              </div>
            </div>
          </div>
        ))}

        {task.questions.length === 0 && (
          <div className="flex flex-col items-center justify-center h-64 text-gray-400">
             <div className="animate-pulse flex space-x-4">
                <div className="h-10 w-10 bg-gray-200 rounded-full"></div>
                <div className="space-y-3">
                  <div className="h-2 bg-gray-200 rounded w-48"></div>
                  <div className="h-2 bg-gray-200 rounded w-32"></div>
                </div>
              </div>
              <p className="mt-4">
                {task.currentStep === ProcessingStep.SPLITTING ? '正在智能切割试卷...' : '等待开始分析...'}
              </p>
          </div>
        )}
      </div>
    </div>
  );
};
