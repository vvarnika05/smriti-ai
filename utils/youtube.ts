export const getYouTubeThumbnail = (url: string) => {
  const match = url.match(/(?:v=|\.be\/)([\w-]{11})/);
  return match ? `https://img.youtube.com/vi/${match[1]}/mqdefault.jpg` : "";
};
