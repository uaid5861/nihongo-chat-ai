export async function onRequestPost(context) {
  const { request, env } = context;
  const body = await request.json();
  const { action, word, sentence, translation } = body;
  
  const API_KEY = env.DEEPSEEK_API_KEY; // 需要在后台设置环境变量
  const API_URL = "https://api.deepseek.com";

  let systemPrompt = "";
  let userContent = "";

  // 场景 1: 给单词，生成中文句子
  if (action === 'generate') {
    systemPrompt = "你是一个日语老师。用户会给你一个日语单词。请你用这个单词造一个地道的日文句子，但**只返回这个句子的中文含义**给用户，让用户尝试翻译回日文。不要透露日文原句。";
    userContent = `单词是：${word}`;
  } 
  // 场景 2: 批改用户的翻译
  else if (action === 'correct') {
    systemPrompt = "你是一个日语老师。用户会提供一个单词，一个目标中文句子，以及用户的日文翻译。请你：1. 指出用户的错误。2. 给出最自然、地道的日文表达（必须包含原单词）。3. 给出评分(10分制)。格式清晰，语气温柔。";
    userContent = `单词：${word}\n目标中文：${sentence}\n用户翻译：${translation}`;
  }

  // 调用 DeepSeek
  const aiResponse = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${API_KEY}`
    },
    body: JSON.stringify({
      model: "deepseek-chat",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userContent }
      ],
      temperature: 0.7
    })
  });

  const aiData = await aiResponse.json();
  const aiText = aiData.choices[0].message.content;

  // 如果是批改阶段，保存到数据库 D1
  if (action === 'correct') {
    await env.DB.prepare(
      "INSERT INTO study_history (word, chinese_sentence, user_translation, ai_feedback) VALUES (?, ?, ?, ?)"
    ).bind(word, sentence, translation, aiText).run();
  }

  return new Response(JSON.stringify({ result: aiText }), {
    headers: { "Content-Type": "application/json" }
  });
}