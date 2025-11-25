
export enum TaskStatus {
  IDLE = 'IDLE',
  QUEUED = 'QUEUED',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
}

export enum ProcessingStep {
  NONE = 'NONE',
  SPLITTING = 'SPLITTING', // 切割中
  OCR = 'OCR',             // 识别中
  ANALYZING = 'ANALYZING', // 分析中
  SAVING = 'SAVING',       // 存储结果中 (Single question or finalization)
  DONE = 'DONE',
}

export interface AnalysisResult {
  knowledgePoints: string[];
  solutionMethod: string;
}

export interface Question {
  id: string;
  imageUrl: string; // The split image
  markdown: string; // OCR result
  analysis: AnalysisResult;
}

export interface PaperTask {
  id: string; // Frontend internal ID
  sessionId?: string; // Backend session ID returned from split API
  fileName: string;
  originalImageUrl: string;
  status: TaskStatus;
  currentStep: ProcessingStep;
  progress: number; // 0-100
  questions: Question[];
}
