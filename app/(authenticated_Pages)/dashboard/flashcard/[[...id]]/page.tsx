"use client";

import { use, useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, FileText, Download, Edit, Play, Brain } from "lucide-react";
import axios from "axios";
import FlashcardDeck from "@/components/flashcard/FlashcardDeck";
import FlashcardEditor from "@/components/flashcard/FlashcardEditor";

interface FlashcardData {
  id: string;
  term: string;
  definition: string;
}

interface FlashcardDeckData {
  id: string;
  title: string;
  cards: FlashcardData[];
}

export default function FlashcardPage({ params }: { params: any }) {
  const rawId = (use(params) as { id: string | string[] }).id;
  const id = Array.isArray(rawId) ? rawId[0] : rawId;

  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [resourceTitle, setResourceTitle] = useState("");
  const [flashcardDeck, setFlashcardDeck] = useState<FlashcardDeckData | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);

  const hasFetched = useRef(false);

  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;

    async function fetchData() {
      try {
        // Fetch resource title
        const res = await axios.get<{ resource?: { title: string } }>(
          `/api/resource`,
          {
            params: { id },
          }
        );

        if (res.data.resource) {
          setResourceTitle(res.data.resource.title);
        }

        // Check if flashcard deck already exists
        const payload = {
          resourceId: id,
          task: "flashcards",
        };

        const resFlashcards = await axios.post("/api/resource-ai", payload);

        if (
          resFlashcards.data &&
          typeof resFlashcards.data === "object" &&
          "deck" in resFlashcards.data &&
          "cards" in resFlashcards.data
        ) {
          const data = resFlashcards.data as { deck: any; cards: any[] };
          setFlashcardDeck({
            id: data.deck.id,
            title: data.deck.title,
            cards: data.cards.map((card: any) => ({
              id: card.id,
              term: card.term,
              definition: card.definition,
            })),
          });
        }
      } catch (error: any) {
        console.error("Error fetching data:", error);
        if (error.response?.status === 404) {
          setError("Flashcard deck not found. Generate flashcards first.");
        } else {
          setError("Failed to load flashcards. Please try again.");
        }
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, [id]);

  const generateFlashcards = async () => {
    setIsGenerating(true);
    setError(null);

    try {
      const payload = {
        resourceId: id,
        task: "flashcards",
      };

      const res = await axios.post("/api/resource-ai", payload);

      if (
        res.data &&
        typeof res.data === "object" &&
        "deck" in res.data &&
        "cards" in res.data
      ) {
        const data = res.data as { deck: any; cards: any[] };
        setFlashcardDeck({
          id: data.deck.id,
          title: data.deck.title,
          cards: data.cards.map((card: any) => ({
            id: card.id,
            term: card.term,
            definition: card.definition,
          })),
        });
      }
    } catch (error: any) {
      console.error("Error generating flashcards:", error);
      setError("Failed to generate flashcards. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleExport = async (format: "txt" | "anki" = "txt") => {
    setIsExporting(true);
    try {
      const response = await axios.get(`/api/flashcard-export`, {
        params: {
          resourceId: id,
          format,
        },
        responseType: "blob",
      });

      const url = window.URL.createObjectURL(
        new Blob([response.data as BlobPart])
      );
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        response.headers["content-disposition"]
          ?.split("filename=")[1]
          ?.replace(/"/g, "") || `flashcards.${format}`
      );
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error exporting flashcards:", error);
      setError("Failed to export flashcards. Please try again.");
    } finally {
      setIsExporting(false);
    }
  };

  const handleSaveEdit = async (editedCards: FlashcardData[]) => {
    // In a real implementation, you would save the edited cards to the database
    // For now, we'll just update the local state
    if (flashcardDeck) {
      setFlashcardDeck({
        ...flashcardDeck,
        cards: editedCards,
      });
    }
    setIsEditing(false);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading flashcards...</span>
        </div>
      </div>
    );
  }

  if (error && !flashcardDeck) {
    return (
      <div className="container mx-auto px-4 pb-14">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Brain className="h-6 w-6" />
              <span>Flashcards</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">{error}</p>
            <Button onClick={generateFlashcards} disabled={isGenerating}>
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Brain className="mr-2 h-4 w-4" />
                  Generate Flashcards
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isEditing && flashcardDeck) {
    return (
      <div className="container mx-auto px-4 py-8">
        <FlashcardEditor
          cards={flashcardDeck.cards}
          onSave={handleSaveEdit}
          onCancel={() => setIsEditing(false)}
        />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Flashcards</h1>
        <p className="text-muted-foreground">
          {resourceTitle ? `For: ${resourceTitle}` : "Loading..."}
        </p>
      </div>

      {flashcardDeck ? (
        <Tabs defaultValue="study" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="study" className="flex items-center space-x-2">
              <Play className="h-4 w-4" />
              <span>Study</span>
            </TabsTrigger>
            <TabsTrigger value="review" className="flex items-center space-x-2">
              <Brain className="h-4 w-4" />
              <span>Review</span>
            </TabsTrigger>
            <TabsTrigger value="export" className="flex items-center space-x-2">
              <Download className="h-4 w-4" />
              <span>Export</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="study" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Study Mode</h2>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setIsEditing(true)}
                  className="flex items-center space-x-2"
                >
                  <Edit className="h-4 w-4" />
                  <span>Edit</span>
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleExport("txt")}
                  className="flex items-center space-x-2"
                >
                  <FileText className="h-4 w-4" />
                  <span>Export TXT</span>
                </Button>
              </div>
            </div>
            <FlashcardDeck
              resourceId={id}
              title={flashcardDeck.title}
              cards={flashcardDeck.cards}
              onExport={() => handleExport("txt")}
              isExporting={isExporting}
            />
          </TabsContent>

          <TabsContent value="review" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Review Mode</h2>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setIsEditing(true)}
                  className="flex items-center space-x-2"
                >
                  <Edit className="h-4 w-4" />
                  <span>Edit</span>
                </Button>
              </div>
            </div>
            <FlashcardDeck
              resourceId={id}
              title={`${flashcardDeck.title} - Review`}
              cards={flashcardDeck.cards}
              isExporting={isExporting}
            />
          </TabsContent>

          <TabsContent value="export" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Export Flashcards</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  Export your flashcards for offline use or import into other
                  applications.
                </p>
                <div className="flex space-x-4">
                  <Button
                    onClick={() => handleExport("txt")}
                    className="flex items-center space-x-2"
                    disabled={isExporting}
                  >
                    {isExporting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Exporting...
                      </>
                    ) : (
                      <>
                        <FileText className="h-4 w-4" />
                        <span>Export as Text</span>
                      </>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleExport("anki")}
                    className="flex items-center space-x-2"
                    disabled={isExporting}
                  >
                    {isExporting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Exporting...
                      </>
                    ) : (
                      <>
                        <Download className="h-4 w-4" />
                        <span>Export as CSV (Anki)</span>
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      ) : (
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Brain className="h-6 w-6" />
              <span>Generate Flashcards</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              Generate AI-powered flashcards from your resource content. This
              will create term-definition pairs based on the key concepts in
              your material.
            </p>
            <Button onClick={generateFlashcards} disabled={isGenerating}>
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Brain className="mr-2 h-4 w-4" />
                  Generate Flashcards
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
