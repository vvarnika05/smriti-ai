import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "sonner";
import { ResourceItem, ResourceType } from "@/types";

const resourceAPI = "/api/resource";

export function useResources(topicId: string | null) {
  const [media, setMedia] = useState<ResourceItem[]>([]);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [resourceModalOpen, setResourceModalOpen] = useState(false);
  const [newResourceType, setNewResourceType] = useState<ResourceType>("VIDEO");
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [pdfTitle, setPdfTitle] = useState("");
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [notesTitle, setNotesTitle] = useState("");
  const [notesContent, setNotesContent] = useState("");
  const [resourceToDelete, setResourceToDelete] = useState<ResourceItem | null>(
    null
  );

  // Filtered media based on search term
  const filteredMedia = media.filter((item) =>
    item.title.toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    async function fetchResources() {
      if (!topicId) return;

      try {
        setIsLoading(true);
        console.log("Fetching resources for topic ID:", topicId);

        // Fetch the resources associated with this topic
        const resourceRes = await axios.get<{ resources: any[] }>(resourceAPI, {
          params: { topicId },
        });

        // Map them to the format expected by setMedia
        const resources = resourceRes.data.resources.map((r) => ({
          id: r.id,
          title: r.title,
          type: (r.type?.toUpperCase?.() as ResourceType) || "UNKNOWN",
          url: r.url,
        }));

        setMedia(resources);
      } catch (error) {
        console.error("Error fetching resources:", error);
        toast.error("Failed to fetch resources.");
      } finally {
        setIsLoading(false);
      }
    }

    fetchResources();
  }, [topicId]);

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

  const handleAddResource = async () => {
    if (!topicId) return;

    if (newResourceType === "VIDEO") {
      const videoIdMatch = youtubeUrl.match(/(?:v=|\/)([0-9A-Za-z_-]{11})/);
      const videoId = videoIdMatch ? videoIdMatch[1] : null;

      if (!videoId) {
        toast.error("Please enter a valid YouTube URL");
        return;
      }

      const API_KEY = process.env.NEXT_PUBLIC_YOUTUBE_API_KEY;
      if (!API_KEY) {
        console.error("Missing YouTube API key in .env.local");
        toast.error("YouTube API key is missing. Please contact support.");
        return;
      }

      try {
        setIsLoading(true);

        const apiUrl = `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${videoId}&key=${API_KEY}`;
        const res = await fetch(apiUrl);
        const data = await res.json();
        const videoTitle = data.items?.[0]?.snippet?.title;

        if (!videoTitle) {
          toast.error("Failed to fetch video title");
          return;
        }

        const resourceData = {
          topicId,
          title: videoTitle,
          type: "VIDEO",
          url: youtubeUrl,
        };

        const response = await axios.post<ResourceResponse>(
          resourceAPI,
          resourceData,
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
        toast.success(response.data.message);

        const resourceID = response.data.resource.id;

        setMedia((prev) => [
          {
            id: resourceID,
            title: videoTitle,
            type: "VIDEO",
            url: youtubeUrl,
          },
          ...prev,
        ]);

        setYoutubeUrl("");
      } catch (error) {
        console.error("Error fetching or saving YouTube video:", error);
        toast.error(
          "Something went wrong while fetching the YouTube video info."
        );
      } finally {
        setResourceModalOpen(false);
        setIsLoading(false);
      }
    } else if (newResourceType === "PDF") {
      if (!pdfTitle.trim() || !pdfFile) {
        toast.error("Please enter PDF title and select a file");
        return;
      }

      try {
        setIsLoading(true);
        const formData = new FormData();
        formData.append("file", pdfFile);
        formData.append("type", "PDF");
        formData.append("title", pdfTitle);
        formData.append("topicId", topicId);

        const res = await axios.post<ResourceResponse>(resourceAPI, formData);

        setMedia((prev) => [
          ...prev,
          {
            id: res.data.resource.id,
            title: pdfTitle,
            type: "PDF",
            url: res.data.resource.url,
          },
        ]);

        toast.success(res.data.message);
      } catch (error) {
        console.error("Error saving the PDF:", error);
        toast.error("Something went wrong while storing the PDF.");
      } finally {
        setPdfTitle("");
        setPdfFile(null);
        setResourceModalOpen(false);
        setIsLoading(false);
      }
    } else if (newResourceType === "ARTICLE") {
      if (!notesTitle.trim() || !notesContent.trim()) {
        toast.error("Please enter notes title and content");
        return;
      }

      try {
        setIsLoading(true);

        const resourceData = {
          topicId,
          title: notesTitle,
          type: "ARTICLE",
          url: "about:blank",
          summary: notesContent,
        };

        const response = await axios.post<ResourceResponse>(resourceAPI, resourceData, {
          headers: { "Content-Type": "application/json" },
        });

        setMedia((prev) => [
          {
            id: response.data.resource.id,
            title: notesTitle,
            type: "ARTICLE",
            url: "about:blank",
          },
          ...prev,
        ]);

        setNotesTitle("");
        setNotesContent("");
        toast.success(response.data.message);
      } catch (error) {
        console.error("Error saving notes:", error);
        toast.error("Something went wrong while saving the notes.");
      } finally {
        setResourceModalOpen(false);
        setIsLoading(false);
      }
    }
  };

  const handleDeleteResource = async () => {
    if (!resourceToDelete) return;

    try {
      setIsDeleting(true);

      await axios.request({
        method: "DELETE",
        url: resourceAPI,
        data: { id: resourceToDelete.id },
      });

      setMedia((prev) =>
        prev.filter((item) => item.id !== resourceToDelete.id)
      );
      toast.success("Resource deleted successfully");
    } catch (error) {
      console.error("Failed to delete resource:", error);
      toast.error("Failed to delete resource");
    } finally {
      setIsDeleting(false);
      setDeleteDialogOpen(false);
      setResourceToDelete(null);
    }
  };

  return {
    media,
    filteredMedia,
    search,
    setSearch,
    resourceModalOpen,
    setResourceModalOpen,
    newResourceType,
    setNewResourceType,
    youtubeUrl,
    setYoutubeUrl,
    pdfTitle,
    setPdfTitle,
    pdfFile,
    setPdfFile,
    notesTitle,
    setNotesTitle,
    notesContent,
    setNotesContent,
    handleAddResource,
    deleteDialogOpen,
    setDeleteDialogOpen,
    resourceToDelete,
    setResourceToDelete,
    handleDeleteResource,
    isLoading,
    isDeleting,
  };
}
