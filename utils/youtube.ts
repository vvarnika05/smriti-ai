import axios from "axios";
// import { YoutubeTranscript } from "youtube-transcript";

export function getYouTubeVideoId(url: string) {
  const regex = /(?:youtube\.com\/.*v=|youtu\.be\/)([^&#?/]+)/;
  const match = url.match(regex);
  return match ? match[1] : null;
}

export const getYouTubeThumbnail = (url: string) => {
  const match = url.match(/(?:v=|\.be\/)([\w-]{11})/);
  return match ? `https://img.youtube.com/vi/${match[1]}/mqdefault.jpg` : "";
};

interface TranscriptItem {
  text: string;
  start: number;
  duration: number;
}

interface Transcripts {
  [key: string]: {
    custom?: TranscriptItem[];
    default?: TranscriptItem[];
    auto?: TranscriptItem[];
    [key: string]: TranscriptItem[] | undefined;
  };
}

interface ApiResponse {
  code: number;
  message: string;
  data: {
    videoId: string;
    videoInfo: {
      name: string;
      thumbnailUrl: object;
      embedUrl: string;
      duration: string;
      description: string;
      upload_date: string;
      genre: string;
      author: string;
    };
    language_code: string[][];
    transcripts: Transcripts;
  };
}

export async function getYoutubeTranscript(url: string): Promise<string> {
  const videoId = getYouTubeVideoId(url);
  const options = {
    method: "GET",
    url: process.env.RAPIDAPI_URL || "",
    params: {
      video_id: videoId,
      platform: "youtube",
    },
    headers: {
      "x-rapidapi-host": process.env.RAPIDAPI_HOST || "",
      "x-rapidapi-key": process.env.RAPIDAPI_KEY || "",
    },
  };

  try {
    const response = await axios.request<ApiResponse>(options);
    // console.log("Response:", response.data);

    const transcriptsByLang = response.data.data.transcripts;
    const availableLangKeys = Object.keys(transcriptsByLang);

    if (availableLangKeys.length === 0) {
      throw new Error("No transcripts available.");
    }

    // Pick the first available language (or prioritize "en_auto" if present)
    const preferredLang = availableLangKeys.includes("en_auto")
      ? "en_auto"
      : availableLangKeys[0];

    const transcripts = transcriptsByLang[preferredLang];

    const fallbackOrder = ["custom", "default", "auto"] as const;

    // Fixed the type error by properly checking each property
    for (const type of fallbackOrder) {
      const transcriptArray = transcripts[type];
      if (Array.isArray(transcriptArray) && transcriptArray.length > 0) {
        return transcriptArray
          .map((item: TranscriptItem) => item.text)
          .join(" ");
      }
    }

    throw new Error("No valid transcript data found.");
  } catch (error) {
    console.error("Error fetching transcript:", error);
    // This will trigger the fallback prompt in your main handler
    throw new Error("Transcript fetch failed.");
  }

  // const transcript = await YoutubeTranscript.fetchTranscript(url);
  // return transcript.map((item) => item.text).join(" ");
}
