"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Edit, Save, X, Plus, Trash2 } from "lucide-react";

interface FlashcardData {
  id: string;
  term: string;
  definition: string;
}

interface FlashcardEditorProps {
  cards: FlashcardData[];
  onSave: (cards: FlashcardData[]) => void;
  onCancel: () => void;
}

export default function FlashcardEditor({
  cards,
  onSave,
  onCancel,
}: FlashcardEditorProps) {
  const [editedCards, setEditedCards] = useState<FlashcardData[]>(cards);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const handleCardChange = (index: number, field: "term" | "definition", value: string) => {
    const updatedCards = [...editedCards];
    updatedCards[index] = {
      ...updatedCards[index],
      [field]: value,
    };
    setEditedCards(updatedCards);
  };

  const handleAddCard = () => {
    const newCard: FlashcardData = {
      id: `temp-${Date.now()}`,
      term: "",
      definition: "",
    };
    setEditedCards([...editedCards, newCard]);
    setEditingIndex(editedCards.length);
  };

  const handleDeleteCard = (index: number) => {
    const updatedCards = editedCards.filter((_, i) => i !== index);
    setEditedCards(updatedCards);
    if (editingIndex === index) {
      setEditingIndex(null);
    } else if (editingIndex && editingIndex > index) {
      setEditingIndex(editingIndex - 1);
    }
  };

  const handleSave = () => {
    // Filter out cards with empty terms or definitions
    const validCards = editedCards.filter(
      (card) => card.term.trim() && card.definition.trim()
    );
    onSave(validCards);
  };

  const isValid = editedCards.every(
    (card) => card.term.trim() && card.definition.trim()
  );

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Edit Flashcards</span>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleAddCard}
                className="flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Add Card</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={onCancel}
                className="flex items-center space-x-2"
              >
                <X className="w-4 h-4" />
                <span>Cancel</span>
              </Button>
              <Button
                onClick={handleSave}
                disabled={!isValid}
                className="flex items-center space-x-2"
              >
                <Save className="w-4 h-4" />
                <span>Save Changes</span>
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {editedCards.map((card, index) => (
              <Card key={card.id} className="p-4">
                <div className="flex items-start justify-between space-x-4">
                  <div className="flex-1 space-y-4">
                    <div>
                      <Label htmlFor={`term-${index}`}>Term</Label>
                      <Input
                        id={`term-${index}`}
                        value={card.term}
                        onChange={(e) =>
                          handleCardChange(index, "term", e.target.value)
                        }
                        placeholder="Enter term or concept"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor={`definition-${index}`}>Definition</Label>
                      <Textarea
                        id={`definition-${index}`}
                        value={card.definition}
                        onChange={(e) =>
                          handleCardChange(index, "definition", e.target.value)
                        }
                        placeholder="Enter definition or explanation"
                        className="mt-1"
                        rows={3}
                      />
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteCard(index)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
          {editedCards.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <p>No flashcards to edit. Click "Add Card" to create your first flashcard.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
