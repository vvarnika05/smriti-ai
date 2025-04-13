"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { FileText, PlusCircle, Pencil, X, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import axios from "axios";
import { use } from "react";
import { toast } from "sonner";

const getYouTubeThumbnail = (url: string) => {
  const match = url.match(/(?:v=|\.be\/)([\w-]{11})/);
  return match ? `https://img.youtube.com/vi/${match[1]}/mqdefault.jpg` : "";
};

export default function NewTopicPage({ params }: { params: any }) {
  const rawId = (use(params) as { id: string | string[] }).id;
  const id = Array.isArray(rawId) ? rawId[0] : rawId;

  const [topicId, setTopicId] = useState<string | null>(null);
  const [topicModalOpen, setTopicModalOpen] = useState(id ? false : true);
  const [editMode, setEditMode] = useState(false);
  const [topicName, setTopicName] = useState("");
  const [media, setMedia] = useState<
    { id: string; title: string; type: "VIDEO" | "PDF"; url: string }[]
  >([]);
  const [resourceModalOpen, setResourceModalOpen] = useState(false);
  const [newResourceType, setNewResourceType] = useState<"VIDEO" | "PDF">(
    "VIDEO"
  );
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [pdfTitle, setPdfTitle] = useState("");
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const filteredMedia = media.filter((item) =>
    item.title.toLowerCase().includes(search.toLowerCase())
  );

  interface ResourceResponse {
    message: string;
    resource: {
      id: string;
      topicId: string;
      title: string;
      type: string;
      url: string;
      summary: string;
      createdAt: string;
      updatedAt: string;
    };
  }

  const topicAPI = "/api/topic";
  const resourceAPI = `/api/resource`;

  const router = useRouter();

  useEffect(() => {
    async function fetchTopicAndResources() {
      try {
        setIsLoading(true);
        console.log("Fetching topic and resources for ID:", id);

        // Fetch the topic title
        const topicRes = await axios.get<{ topic: { title: string } }>(
          topicAPI,
          {
            params: { id },
          }
        );
        setTopicName(topicRes.data.topic.title);

        // Fetch the resources associated with this topic
        const resourceRes = await axios.get<{ resources: any[] }>(resourceAPI, {
          params: { topicId: id },
        });

        // Map them to the format expected by setMedia
        const resources = resourceRes.data.resources.map((r) => ({
          id: r.id,
          title: r.title,
          type: r.type?.toUpperCase?.() || "UNKNOWN",
          url: r.url,
        }));

        setMedia(resources);
      } catch (error) {
        console.error("Error fetching topic/resources:", error);
        toast.error("Failed to fetch topic or resources.");
      } finally {
        setIsLoading(false);
      }
    }

    if (id) {
      fetchTopicAndResources();
    }
  }, [id]);

  const handleSaveTopic = async () => {
    const title = topicName.trim();
    if (!title) return;

    try {
      let res;

      if (editMode && topicId) {
        // Edit mode: update topic
        res = await axios.put(topicAPI, {
          id: topicId,
          title,
        });
      } else {
        // Create mode: add topic
        res = await axios.post(topicAPI, {
          title,
        });
      }

      if (res.status === 201 || res.status === 200) {
        const topic = (res.data as { topic: { id: string } }).topic;
        const responseData = res.data as { message: string };
        toast.success(responseData.message);

        router.push(`/dashboard/topic/${topic.id}`);
      } else {
        const responseData = res.data as { message: string };
        toast.error(responseData.message || "Something went wrong");
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Request failed");
      console.log("error condition", error);
    }

    setTopicModalOpen(false);
    setEditMode(true);
  };

  const handleAddResource = async () => {
    if (newResourceType === "VIDEO") {
      const videoIdMatch = youtubeUrl.match(/(?:v=|\/)([0-9A-Za-z_-]{11})/);
      const videoId = videoIdMatch ? videoIdMatch[1] : null;

      if (!videoId) {
        alert("Enter a valid YouTube URL");
        return;
      }

      const API_KEY = process.env.NEXT_PUBLIC_YOUTUBE_API_KEY;
      if (!API_KEY) {
        console.error("Missing YouTube API key in .env.local");
        return;
      }

      try {
        setIsLoading(true);

        const apiUrl = `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${videoId}&key=${API_KEY}`;
        const res = await fetch(apiUrl);
        const data = await res.json();
        const videoTitle = data.items?.[0]?.snippet?.title;

        if (!videoTitle) {
          alert("Failed to fetch video title");
          return;
        }

        const resourceData = {
          topicId: id,
          title: videoTitle,
          type: "VIDEO",
          url: youtubeUrl,
        };

        const response = await axios.post<ResourceResponse>(
          resourceAPI,
          resourceData
        );
        toast.success(response.data.message);

        const resourceID = response.data.resource.id;

        setMedia((prev) => [
          ...prev,
          {
            id: resourceID,
            title: videoTitle,
            type: "VIDEO",
            url: youtubeUrl,
          },
        ]);

        setYoutubeUrl("");
        setResourceModalOpen(false);
      } catch (error) {
        console.error("Error fetching or saving YouTube video:", error);
        toast.error(
          "Something went wrong while fetching the YouTube video info."
        );
      } finally {
        setIsLoading(false);
      }
    } else {
      if (!pdfTitle.trim() || !pdfFile) {
        alert("Enter PDF title and select a file.");
        return;
      }

      // TODO: add cloudinary upload logic here

      setMedia((prev) => [
        ...prev,
        {
          id,
          title: pdfTitle,
          type: "PDF",
          url: "", // Backend should return the PDF URL
        },
      ]);

      setPdfTitle("");
      setPdfFile(null);
      setResourceModalOpen(false);
    }
  };

  const handleResourceClick = (item: (typeof media)[0]) => {
    router.push(`/dashboard/resource/${item.id}`);
  };

  return (
    <div className="min-h-screen bg-background text-foreground max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-14">
      {/* Custom Modal for Topic Name */}
      {topicModalOpen && (
        <div className="fixed inset-0 bg-black flex items-center justify-center z-50">
          <div className="bg-white dark:bg-zinc-900 rounded-md p-6 w-full max-w-md shadow-lg">
            <h2 className="text-xl font-semibold mb-4">
              {editMode ? "Edit Topic Name" : "Enter Topic Name"}
            </h2>
            <Input
              value={topicName}
              onChange={(e) => setTopicName(e.target.value)}
              placeholder="e.g. Linear Algebra"
            />
            <div className="mt-4 flex justify-end">
              <Button onClick={handleSaveTopic} disabled={!topicName.trim()}>
                Save
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h2
          className="text-2xl font-bold flex items-center gap-2 cursor-pointer group transition"
          onClick={() => setTopicModalOpen(true)}
        >
          <Pencil className="h-5 w-5 text-muted-foreground group-hover:text-primary transition" />
          <p>{topicName}</p>
        </h2>

        <Button onClick={() => setResourceModalOpen(true)} className="gap-2">
          <PlusCircle className="h-4 w-4" />
          Add Resource
        </Button>
      </div>

      {/* Custom Modal for Adding Resources */}
      {resourceModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-zinc-900 rounded-md p-6 w-full max-w-md shadow-lg relative">
            {/* Close Icon */}
            <button
              onClick={() => setResourceModalOpen(false)}
              className="absolute top-3 right-3 text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-xl font-semibold mb-4">Add New Resource</h2>

            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <Label>
                  <input
                    type="radio"
                    name="resource"
                    checked={newResourceType === "VIDEO"}
                    onChange={() => setNewResourceType("VIDEO")}
                  />
                  <span className="ml-2">YouTube Video</span>
                </Label>
                <Label>
                  <input
                    type="radio"
                    name="resource"
                    checked={newResourceType === "PDF"}
                    onChange={() => setNewResourceType("PDF")}
                  />
                  <span className="ml-2">PDF File</span>
                </Label>
              </div>

              {newResourceType === "VIDEO" ? (
                <Input
                  value={youtubeUrl}
                  onChange={(e) => setYoutubeUrl(e.target.value)}
                  placeholder="YouTube video URL"
                />
              ) : (
                <>
                  <Input
                    value={pdfTitle}
                    onChange={(e) => setPdfTitle(e.target.value)}
                    placeholder="PDF title"
                  />
                  <Input
                    type="file"
                    accept="application/pdf"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setPdfFile(e.target.files[0]);
                      }
                    }}
                    className="mt-2"
                  />
                </>
              )}
            </div>

            <div className="mt-4 flex justify-end">
              <Button onClick={handleAddResource}>
                {isLoading ? "Loading" : "Add"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Search Bar */}
      {media.length > 0 && (
        <div className="mb-6 flex items-center justify-center">
          <div className="relative w-full sm:max-w-md">
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search resources..."
              className="pl-10 pr-4 py-2 rounded-xl border border-muted-foreground/30 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary bg-background"
            />
            <Search className="absolute left-3 top-2 text-muted-foreground h-5 w-5" />
          </div>
        </div>
      )}

      {/* Resource Grid */}
      {isLoading ? (
        <div className="h-[50vh] flex flex-col items-center justify-center text-white text-lg gap-4">
          <div className="w-10 h-10 border-4 border-white border-t-transparent rounded-full animate-spin" />
          <span>Loading Resources...</span>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredMedia.map((item) => (
            <Card
              key={item.url}
              className="cursor-pointer hover:ring-2 hover:ring-primary transition flex flex-col py-0 gap-0"
              onClick={() => handleResourceClick(item)}
            >
              {item.type === "VIDEO" ? (
                <Image
                  src={getYouTubeThumbnail(item.url)}
                  alt={item.title}
                  width={320}
                  height={180}
                  className="rounded-t-md w-full object-cover h-38"
                />
              ) : (
                <div className="flex items-center justify-center h-38 bg-muted rounded-t-md">
                  <FileText className="h-12 w-12 text-muted-foreground" />
                </div>
              )}
              <CardContent className="p-4 min-h-[40px] flex items-center">
                <p className="text-sm font-medium truncate w-full">
                  {item.title}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
