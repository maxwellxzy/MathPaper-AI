import { AnalysisResult } from '../types';

export const MOCK_MATH_PROBLEMS = [
  {
    markdown: `已知集合 $A = \\{x | x^2 - 2x - 3 < 0\\}$, $B = \\{x | y = \\ln(2-x)\\}$, 则 $A \\cap B = $ (   )`,
    analysis: {
      knowledgePoints: ['集合的交集运算', '一元二次不等式的解法', '对数函数的定义域'],
      solutionMethod: `1. **求集合 A**: 解不等式 $x^2 - 2x - 3 < 0$, 即 $(x-3)(x+1) < 0$, 解得 $-1 < x < 3$。\n2. **求集合 B**: 由 $\\ln(2-x)$ 有意义，得 $2-x > 0$, 即 $x < 2$。\n3. **求交集**: 取公共部分，得 $-1 < x < 2$。\n\n故 $A \\cap B = (-1, 2)$。`
    }
  },
  {
    markdown: `若 $\\tan \\alpha = 2$, 则 $\\frac{\\sin \\alpha - 3\\cos \\alpha}{\\sin \\alpha + \\cos \\alpha}$ 的值为?`,
    analysis: {
      knowledgePoints: ['同角三角函数的基本关系', '齐次式化简'],
      solutionMethod: `1. 观察式子 $\\frac{\\sin \\alpha - 3\\cos \\alpha}{\\sin \\alpha + \\cos \\alpha}$，分子分母同时除以 $\\cos \\alpha$。\n2. 原式转化为 $\\frac{\\tan \\alpha - 3}{\\tan \\alpha + 1}$。\n3. 代入 $\\tan \\alpha = 2$，得 $\\frac{2 - 3}{2 + 1} = -\\frac{1}{3}$。`
    }
  },
  {
    markdown: `已知函数 $f(x) = \\sin(\omega x + \phi)$ $(\omega > 0, |\phi| < \frac{\pi}{2})$ 的部分图象如图所示，则 $f(\frac{\pi}{6}) = $ ?`,
    analysis: {
      knowledgePoints: ['三角函数的图象与性质', '正弦型函数的解析式'],
      solutionMethod: `1. **求周期**: 根据图像(假设)观察 $T/4$ 或 $T/2$，计算 $\omega$。\n2. **求初相**: 代入最值点坐标求 $\phi$。\n3. 写出解析式后代入 $x = \frac{\pi}{6}$ 计算。`
    }
  }
];

export const MOCK_TITLES = [
  "2023年某省高考数学模拟卷(一)",
  "高三数学第一次诊断性考试",
  "重点中学期中复习卷"
];