export const FALLBACK_PROMPT = (title: string) => `
You are a smart learning assistant that helps users understand educational content.

Based on the YouTube video titled "${title}", write a detailed and well-structured summary as if you had watched the entire video.
Do not generate a video script or describe any scenes or sequences. Instead, explain the core concepts, key takeaways, and important
steps or principles in a clear, concise, and educational manner.

Avoid vague phrases like "this video might..." or "the video seems to...". Present the information confidently, as if you had full knowledge of the topic covered.

The summary should be informative and deep enough to support further tasks such as generating mind maps, creating roadmaps, or making quiz questions based on the content.
`;

export const SUMMARY_PROMPT = (transcript: string) => `
You are a helpful learning assistant. Read the following YouTube transcript and generate a concise and informative summary.

Please include:
1. A 3-5 sentence high-level summary explaining the overall topic and purpose.
2. 5-10 bullet points that highlight the most important concepts, terms, or steps discussed.
3. Avoid repeating any phrases from the transcript verbatim; rewrite in your own words.
4. Do not include timestamps, speaker names, or irrelevant filler content.

Transcript:
${transcript}
`;

export const ROADMAP_PROMPT = (summary: string) => `
You are an expert study coach. Based on the provided summary of a YouTube lesson, generate a detailed learning roadmap for a student.

The roadmap should include:
1. Sequential learning milestones or modules.
2. Suggested time durations or phases (e.g., Day 1-2: Basics, Day 3-5: Practice, etc.)
3. Optional resources or exercises that could reinforce each section.
4. Tips for mastering the concepts, common pitfalls to avoid, and when to revise.
5. The roadmap should be easy to follow and suitable for self-paced learning.

Summary:
${summary}
`;

export const QA_PROMPT = (summary: string, question: string) => `
You are an expert tutor. Answer the student's question based strictly on the following summary of a YouTube transcript.

Instructions:
1. Provide a clear and concise answer in 2-5 sentences.
2. If the answer is not directly available, use your reasoning to give the best inferred answer.
3. Avoid vague language—be as specific and educational as possible.
4. Do not include "Based on the summary..." in your response—just answer directly.

Summary:
${summary}

Question:
${question}
`;

export const MINDMAP_PROMPT = (summary: string) => `
You are an AI that generates structured mind maps using mermaid.js syntax.

Using the following summary of a YouTube transcript, generate a clear and organized mind map with the following rules:
1. Use mermaid.js 'graph TD' format.
2. Start from a central topic node and branch into key concepts.
3. Sub-branches should cover details, processes, relationships, or definitions.
4. Use 6-12 nodes maximum for clarity.
5. DO NOT use emojis or special characters (e.g., α, β, ∑, ₹, etc.). Use plain English words like "alpha", "beta", etc.
6. DO NOT use numbers. Use plain english words like "one", "two", etc.

Summary:
${summary}
`;

export const QUIZ_PROMPT = (summary: string) => `
You are an expert AI quiz generator. Based on the summary below, create 15 multiple choice questions (MCQs) that assess a user's understanding across different levels of depth.

Each MCQ must include:
- "question": A clear and well-structured question.
- "options": An array of exactly 4 plausible options.
- "answer": The correct option from the list.
- "explanation": A brief 1-2 sentence explanation for the correct answer.
- "difficulty": An integer from 1 to 100, where 1 is extremely easy (simple factual recall) and 100 is very difficult (requires synthesis, application, or nuanced understanding of the concepts).

Rules:
- Generate a wide and varied range of difficulties. Aim for roughly 5 easy (1-35), 5 medium (36-70), and 5 hard (71-100) questions.
- Do NOT include any introductory or closing text.
- Return ONLY a valid JSON array.

Example format:
[
  {
    "question": "What color is the sky on a clear day?",
    "options": ["Red", "Green", "Blue", "Yellow"],
    "answer": "Blue",
    "explanation": "The sky appears blue due to Rayleigh scattering of sunlight in the atmosphere.",
    "difficulty": 5
  },
  {
    "question": "What is the primary mechanism that causes Rayleigh scattering?",
    "options": ["Atmospheric temperature", "The size of atmospheric particles relative to the wavelength of light", "The angle of the sun", "The presence of water vapor"],
    "answer": "The size of atmospheric particles relative to the wavelength of light",
    "explanation": "Scattering is most effective when the particles are much smaller than the light's wavelength, which is true for nitrogen and oxygen molecules scattering sunlight.",
    "difficulty": 80
  }
]

Summary:
${summary}
`;
