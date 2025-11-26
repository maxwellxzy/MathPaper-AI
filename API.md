
# MathPaper AI 接口文档

本文档描述了高中数学试卷智能分析系统的后端接口规范。

## 核心流程

1. **上传与切割**：前端上传试卷图片，后端切割成小题，并返回一个 `sessionId` 用于后续流程跟踪。
2. **逐题处理**：前端依次调用 OCR 和 分析接口处理每一张切割后的图片。
3. **实时保存**：每处理完一道题目，前端立即调用保存接口将结果同步给后端。
4. **归档**：所有题目处理完毕后，通知后端结束会话。

---

## 接口详情

### 1. 试卷切割 (Split Paper)

将上传的整张试卷图片进行版面分析，切割成独立的题目图片。

- **URL**: `/api/v1/paper/split`
- **Method**: `POST`
- **Content-Type**: `multipart/form-data`

#### 请求参数

| 参数名 | 类型 | 必选 | 描述 |
| :--- | :--- | :--- | :--- |
| file | File | 是 | 试卷原始图片文件 (JPG/PNG) |

#### 响应结果

```json
{
  "code": 200,
  "data": {
    "sessionId": "sess_k92j3n5m",
    "imageUrls": [
      "https://storage.example.com/split/sess_k92j3n5m/1.jpg",
      "https://storage.example.com/split/sess_k92j3n5m/2.jpg",
      "https://storage.example.com/split/sess_k92j3n5m/3.jpg"
    ]
  }
}
```

---

### 2. OCR 识别 (OCR)

识别切割后图片的文本内容，支持数学公式。

- **URL**: `/api/v1/ocr`
- **Method**: `POST`
- **Content-Type**: `application/json`

#### 请求参数

```json
{
  "imageUrl": "https://storage.example.com/split/sess_k92j3n5m/1.jpg"
}
```

#### 响应结果

```json
{
  "code": 200,
  "data": {
    "markdown": "已知集合 $A = \\{x | x^2 - 2x - 3 < 0\\}$, 则 $A = $ (   )"
  }
}
```

---

### 3. 智能分析 (Analyze)

根据题目文本进行 AI 分析，提取知识点并生成解题步骤。

- **URL**: `/api/v1/analyze`
- **Method**: `POST`
- **Content-Type**: `application/json`

#### 请求参数

```json
{
  "markdown": "已知集合 $A = \\{x | x^2 - 2x - 3 < 0\\}..."
}
```

#### 响应结果

```json
{
  "code": 200,
  "data": {
    "knowledgePoints": ["集合运算", "一元二次不等式"],
    "solutionMethod": [
      "1. 解不等式 $x^2 - 2x - 3 < 0$, 即 $(x-3)(x+1) < 0$",
      "2. 解得 $-1 < x < 3$",
      "故集合 A 为 (-1, 3)"
    ]
  }
}
```

---

### 4. 保存单题结果 (Save Question)

将前端处理完成的单道题目结果实时保存。URL中不包含SessionId，SessionId包含在请求体中。

- **URL**: `/api/v1/question/save`
- **Method**: `POST`
- **Content-Type**: `application/json`

#### 请求参数

```json
{
  "sessionId": "sess_k92j3n5m",
  "index": 1,
  "fileName": "2023_math_mock_1.jpg",
  "markdown": "题目文本...",
  "imageUrl": "https://storage.example.com/split/sess_k92j3n5m/1.jpg",
  "analysis": {
    "knowledgePoints": ["集合运算"],
    "solutionMethod": [
       "第一步...",
       "第二步..."
    ]
  }
}
```

#### 响应结果

```json
{
  "code": 200,
  "data": {
    "success": true
  }
}
```

---

### 5. 结束会话 (Finish Session)

标记当前试卷的所有题目已全部上传完毕，触发后端的最终归档流程。

- **URL**: `/api/v1/session/{sessionId}/finish`
- **Method**: `POST`
- **Content-Type**: `application/json`

#### 请求参数

```json
{}
```

#### 响应结果

```json
{
  "code": 200,
  "data": {
    "success": true,
    "totalSaved": 12
  }
}
```

## 数据结构定义

### AnalysisResult (分析结果)

| 字段 | 类型 | 描述 |
| :--- | :--- | :--- |
| `knowledgePoints` | `string[]` | 题目涉及的知识点列表 |
| `solutionMethod` | `string[]` | 解题步骤列表，数组中的每一项代表一个步骤 |