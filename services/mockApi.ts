
import { Question, AnalysisResult } from '../types';
import { MOCK_MATH_PROBLEMS } from './mockData';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// 模拟 API 服务
export const MockApi = {
  // 1. 切割试卷
  splitPaper: async (paperId: string): Promise<string[]> => {
    console.log(`[API] Splitting paper ${paperId}...`);
    await delay(1000); // 模拟耗时
    // 返回3个模拟的题目ID/图片URL占位符
    return Array.from({ length: 3 }).map((_, i) => `https://picsum.photos/800/200?random=${paperId}-${i}`);
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

  // 4. 自动存储结果 (API)
  savePaperResults: async (fileName: string, questions: Question[]) => {
    console.log(`[API] Automatically saving results for ${fileName}`, {
      fileName,
      totalQuestions: questions.length,
      payload: questions.map(q => ({
        originalImage: q.imageUrl,
        ocrContent: q.markdown,
        analysis: q.analysis
      }))
    });
    await delay(1200); // 模拟网络存储耗时
    return { success: true };
  }
};
