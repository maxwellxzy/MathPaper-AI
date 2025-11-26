
import { Question, AnalysisResult } from '../types';
import { MOCK_MATH_PROBLEMS } from './mockData';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// 模拟 API 服务
export const MockApi = {
  // 1. 切割试卷
  // 返回: { sessionId: string, imageUrls: string[] }
  splitPaper: async (paperId: string): Promise<{ sessionId: string, imageUrls: string[] }> => {
    console.log(`[API] Splitting paper ${paperId}...`);
    await delay(1000); // 模拟耗时
    
    // 模拟后端生成唯一的 session_id
    const sessionId = `sess_${Math.random().toString(36).substr(2, 9)}`;
    
    return {
      sessionId,
      imageUrls: Array.from({ length: 3 }).map((_, i) => `https://picsum.photos/800/200?random=${paperId}-${i}`)
    };
  },

  // 2. OCR 识别
  ocrImage: async (imageUrl: string, index: number): Promise<string> => {
    console.log(`[API] OCR processing for ${imageUrl}...`);
    await delay(600);
    // 循环返回模拟题目
    const mockProblem = MOCK_MATH_PROBLEMS[index % MOCK_MATH_PROBLEMS.length];
    return mockProblem.markdown;
  },

  // 3. 智能分析
  analyzeQuestion: async (markdown: string, index: number): Promise<AnalysisResult> => {
    console.log(`[API] Analyzing question content...`);
    await delay(800);
    const mockProblem = MOCK_MATH_PROBLEMS[index % MOCK_MATH_PROBLEMS.length];
    return mockProblem.analysis;
  },

  // 4. 单题实时存储 (API) - Incremental Save
  // 按照要求：URL不含sessionId，参数包含sessionId, index, fileName等
  saveQuestionResult: async (payload: { 
    sessionId: string, 
    index: number, 
    fileName: string,
    question: Question 
  }) => {
    console.log(`[API] POST /api/v1/question/save`);
    console.log(`[API] Body:`, {
        sessionId: payload.sessionId,
        index: payload.index,
        fileName: payload.fileName,
        markdown: payload.question.markdown,
        imageUrl: payload.question.imageUrl,
        analysis: payload.question.analysis
    });
    
    await delay(400); // 模拟网络存储耗时
    return { success: true };
  },

  // 5. 结束试卷 Session (可选，通知后端此卷子已全部处理完毕)
  finishPaperSession: async (sessionId: string) => {
    console.log(`[API] Finalizing session [${sessionId}]`);
    await delay(200);
    return { success: true };
  }
};