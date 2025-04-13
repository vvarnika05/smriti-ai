"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { FileText, PlusCircle, Pencil, X, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { backendURI } from "@/app/backendURL";
import axios from "axios";
import { use } from "react";
import { toast } from "sonner";
const getYouTubeThumbnail = (url: string) => {
  const match = url.match(/(?:v=|\.be\/)([\w-]{11})/);
  return match ? `https://img.youtube.com/vi/${match[1]}/mqdefault.jpg` : "";
};

export default function NewTopicPage({ params }: { params: any }) {
  const { id }: { id: any } = use(params);
  const [topicModalOpen, setTopicModalOpen] = useState(id ? false : true);
  const [editMode, setEditMode] = useState(false);
  const [topicName, setTopicName] = useState("");
  const [descriptionName, setDescriptionName] = useState("");
  const [media, setMedia] = useState<
    { id: string; title: string; type: "youtube" | "pdf"; url: string }[]
  >([]);
  const [resourceModalOpen, setResourceModalOpen] = useState(false);
  const [newResourceType, setNewResourceType] = useState<"youtube" | "pdf">(
    "youtube"
  );
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [pdfTitle, setPdfTitle] = useState("");
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const filteredMedia = media.filter((item) =>
    item.title.toLowerCase().includes(search.toLowerCase())
  );

  const router = useRouter();
  useEffect(() => {
    async function DataFetcher() {
      try {
        const res = await axios.get(`${backendURI}/api/folder/${id}`, {
          headers: {
            backendtoken: localStorage.getItem("backendtoken"),
          },
        });
        setIsLoading(true);
        console.log("error occur from here");
        const dataMedia = await axios.get(`${backendURI}/api/resources/${id}`, {
          headers: {
            backendtoken: localStorage.getItem("backendtoken"),
          },
        });
        console.log(dataMedia);
        const transformed = (dataMedia.data as any).resources.map(
          ({ _id, ...rest }: { _id: any }) => ({
            id: _id,
            ...rest,
          })
        );
        setIsLoading(false);
        setTopicName((res.data as any).folder.title);
        setDescriptionName((res.data as any).folder.description);
        setMedia(transformed);
      } catch (error) {
        setIsLoading(false);
        console.log("Error occurred:", error);
      }
    }
    if (id) {
      DataFetcher();
    }
  }, [id]); /*here will be the fn or something */
  const handleSaveTopic = async () => {
    console.log("here");
    const title = topicName.trim();
    const description = descriptionName.trim();
    if (!title || !description) return;
    try {
      const res = await axios.post(
        `${backendURI}/api/folders`,
        {
          title,
          description,
        },
        {
          headers: {
            backendtoken: localStorage.getItem("backendtoken"),
          },
        }
      );
      if (res.status === 201) {
        router.push(`/dashboard/topic/${(res.data as any).folder._id}`);
        toast.success((res.data as any).message);
        console.log("200 status");
        //toast sucess res.data.message
        console.log((res.data as any).message);
      } else {
        // res.data
        console.log("else condition");
        toast.error((res.data as any).message);
        console.log((res.data as any).message);
      }
    } catch (error) {
      //toast message res.data.message
      console.log("error condition");

      console.log(error);
    }
    setTopicModalOpen(false);
    setEditMode(true);
  };

  const handleResourceClick = (item: (typeof media)[0]) => {
    router.push(`/dashboard/resource/${item.id}`);
  };

  const handleAddResource = async () => {
    //const CryptoId = crypto.randomUUID();

    if (newResourceType === "youtube") {
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
        const apiUrl = `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${videoId}&key=${API_KEY}`;
        const res = await fetch(apiUrl);
        const data = await res.json();
        const videoTitle = data.items?.[0]?.snippet?.title;
        console.log(videoTitle);
        if (!videoTitle) {
          alert("Failed to fetch video title");
          return;
        }

        // TODO: Replace this with POST to /api/topic/{topicId}/resource/
        // Send payload: { id, title: videoTitle, type: "youtube", url: youtubeUrl }
        setIsLoading(true);
        const response = await axios.post(
          `${backendURI}/api/resources`,
          {
            type: "youtube",
            title: videoTitle,
            folderId: id,
            url: youtubeUrl,
          },
          {
            headers: {
              backendtoken: localStorage.getItem("backendtoken"),
            },
          }
        );
        toast.success((response.data as any).message);
        setIsLoading(false);
        setMedia((prev) => [
          ...prev,
          {
            id,
            title: videoTitle,
            type: "youtube",
            url: youtubeUrl,
          },
        ]);

        setYoutubeUrl("");
        setResourceModalOpen(false);
      } catch (error) {
        console.error("Error fetching video title:", error);
        setIsLoading(false);
        toast.error(
          "Something went wrong while fetching the YouTube video info."
        );
        //alert("Something went wrong while fetching the YouTube video info.");
      }
    } else {
      if (!pdfTitle.trim() || !pdfFile) {
        alert("Enter PDF title and select a file.");
        return;
      }

      // TODO: Replace with POST to /api/topic/{topicId}/resource/
      // Example using FormData:
      /*
      const formData = new FormData();
      formData.append("id", id);
      formData.append("title", pdfTitle);
      formData.append("type", "pdf");
      formData.append("file", pdfFile);

      await axios.post(`/api/topic/${topicId}/resource/`, formData);
    */

      setMedia((prev) => [
        ...prev,
        {
          id,
          title: pdfTitle,
          type: "pdf",
          url: "", // Backend should return the PDF URL
        },
      ]);

      setPdfTitle("");
      setPdfFile(null);
      setResourceModalOpen(false);
    }
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
            <h2 className="text-xl font-semibold mb-4 mt-4">
              {editMode ? "Edit Description" : "Enter Description"}
            </h2>
            <Input
              value={descriptionName}
              onChange={(e) => setDescriptionName(e.target.value)}
              placeholder="e.g. This folder is all about the linear algebra"
            />
            <div className="mt-4 flex justify-end">
              <Button
                onClick={handleSaveTopic}
                disabled={!topicName.trim() || !descriptionName.trim()}
              >
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
          <div>
            <p>{topicName}</p>
            <p className="text-sm font-medium text-neutral-500">
              {descriptionName}
            </p>
          </div>
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
                    checked={newResourceType === "youtube"}
                    onChange={() => setNewResourceType("youtube")}
                  />
                  <span className="ml-2">YouTube Video</span>
                </Label>
                <Label>
                  <input
                    type="radio"
                    name="resource"
                    checked={newResourceType === "pdf"}
                    onChange={() => setNewResourceType("pdf")}
                  />
                  <span className="ml-2">PDF File</span>
                </Label>
              </div>

              {newResourceType === "youtube" ? (
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
        <div className="h-[50vh] flex items-center justify-center text-white text-lg">
          Loading Resources
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredMedia.map((item) => (
            <Card
              key={item.url}
              className="cursor-pointer hover:ring-2 hover:ring-primary transition flex flex-col py-0 gap-0"
              onClick={() => handleResourceClick(item)}
            >
              {item.type === "youtube" ? (
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
