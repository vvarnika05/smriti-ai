import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { toast } from "sonner";

const topicAPI = "/api/topic";

export function useTopic(id: string | null) {
  const router = useRouter();
  const [topicId, setTopicId] = useState<string | null>(id || null);
  const [topicModalOpen, setTopicModalOpen] = useState(id ? false : true);
  const [editMode, setEditMode] = useState(!!id);
  const [topicName, setTopicName] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    async function fetchTopic() {
      if (!id) return;

      try {
        setIsLoading(true);
        console.log("Fetching topic for ID:", id);

        // Fetch the topic title
        const topicRes = await axios.get<{ topic: { title: string } }>(
          topicAPI,
          {
            params: { id },
          }
        );
        setTopicName(topicRes.data.topic.title);
      } catch (error) {
        console.error("Error fetching topic:", error);
        toast.error("Failed to fetch topic information.");
      } finally {
        setIsLoading(false);
      }
    }

    fetchTopic();
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

        // Update topicId if we just created a new topic
        if (!editMode) {
          const newTopicId = topic.id;
          setTopicId(newTopicId);

          // Update the URL to include the new topic ID without reloading the page
          router.replace(`/dashboard/topic/${newTopicId}`, { scroll: false });
        }
      } else {
        const responseData = res.data as { message: string };
        toast.error(responseData.message || "Something went wrong");
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Request failed");
      console.error("Error saving topic:", error);
    }

    setTopicModalOpen(false);
    setEditMode(true);
  };

  return {
    topicId,
    setTopicId,
    topicName,
    setTopicName,
    topicModalOpen,
    setTopicModalOpen,
    editMode,
    setEditMode,
    handleSaveTopic,
    isLoading,
  };
}
