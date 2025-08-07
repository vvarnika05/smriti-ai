export function generateMathCaptcha() {
  const a = Math.ceil(Math.random() * 10);
  const b = Math.ceil(Math.random() * 10);
  return { question: `${a} + ${b}`, answer: a + b };
}
