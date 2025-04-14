"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import TopicHeader from "@/components/topic/TopicHeader";
import TopicModal from "@/components/topic/TopicModal";
import ResourceGrid from "@/components/topic/ResourceGrid";
import ResourceModal from "@/components/topic/ResourceModal";
import DeleteDialog from "@/components/topic/DeleteDialog";
import SearchBar from "@/components/topic/SearchBar";
import { useTopic } from "@/hooks/useTopic";
import { useResources } from "@/hooks/useResources";

export default function TopicPage({ params }: { params: any }) {
  const rawId = (use(params) as { id: string | string[] }).id;
  const id = Array.isArray(rawId) ? rawId[0] : rawId;
  const router = useRouter();

  // Topic state management
  const {
    topicId,
    topicName,
    setTopicName,
    topicModalOpen,
    setTopicModalOpen,
    editMode,
    handleSaveTopic,
    isLoading: isTopicLoading,
  } = useTopic(id);

  // Resource state management
  const {
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
    handleAddResource,
    deleteDialogOpen,
    setDeleteDialogOpen,
    resourceToDelete,
    setResourceToDelete,
    handleDeleteResource,
    isLoading: isResourceLoading,
    isDeleting,
  } = useResources(id);

  const handleResourceClick = (item: any) => {
    router.push(`/dashboard/resource/${item.id}`);
  };

  const isLoading = isTopicLoading || isResourceLoading;

  return (
    <div className="min-h-screen bg-background text-foreground max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-14">
      {/* Topic Modal */}
      <TopicModal
        open={topicModalOpen}
        setOpen={setTopicModalOpen}
        topicName={topicName}
        setTopicName={setTopicName}
        editMode={editMode}
        onSave={handleSaveTopic}
        onCancel={() => {
          if (!id) router.push("/dashboard");
          setTopicModalOpen(false);
        }}
      />

      {/* Topic Header */}
      <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <TopicHeader
          topicName={topicName}
          onClick={() => setTopicModalOpen(true)}
        />

        <Button onClick={() => setResourceModalOpen(true)} className="gap-2">
          <PlusCircle className="h-4 w-4" />
          Add Resource
        </Button>
      </div>

      {/* Resource Modal */}
      <ResourceModal
        open={resourceModalOpen}
        setOpen={setResourceModalOpen}
        resourceType={newResourceType}
        setResourceType={setNewResourceType}
        youtubeUrl={youtubeUrl}
        setYoutubeUrl={setYoutubeUrl}
        pdfTitle={pdfTitle}
        setPdfTitle={setPdfTitle}
        setPdfFile={setPdfFile}
        onAdd={handleAddResource}
        isLoading={isLoading}
        pdfFile={pdfFile}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        resourceTitle={resourceToDelete?.title || ""}
        onDelete={handleDeleteResource}
        isDeleting={isDeleting}
      />

      {/* Search Bar */}
      {media.length > 0 && <SearchBar value={search} onChange={setSearch} />}

      {/* Resource Grid */}
      <ResourceGrid
        isLoading={isLoading}
        media={filteredMedia}
        onResourceClick={handleResourceClick}
        onDeleteClick={(item) => {
          setResourceToDelete(item);
          setDeleteDialogOpen(true);
        }}
      />
    </div>
  );
}
