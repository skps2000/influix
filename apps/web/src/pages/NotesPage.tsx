import { useState } from 'react';
import { Button, Card, CardContent, Input, Heading, Text } from '@influix/ui';

/**
 * Notes Page
 * 
 * Notes are designed as a thinking extension, not a memo app
 * They connect user thinking to AI insights
 */
export function NotesPage() {
  const [showEditor, setShowEditor] = useState(false);

  return (
    <div className="page-container">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <Heading as="h1" size="xl">Notes</Heading>
          <Text muted className="mt-1">
            Connect your thinking to AI insights
          </Text>
        </div>
        <Button onClick={() => setShowEditor(true)}>
          New Note
        </Button>
      </div>

      {/* Notes grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {showEditor ? (
          <NoteEditor onClose={() => setShowEditor(false)} />
        ) : (
          <EmptyState onAdd={() => setShowEditor(true)} />
        )}
      </div>
    </div>
  );
}

function EmptyState({ onAdd }: { onAdd: () => void }) {
  return (
    <Card
      variant="bordered"
      className="col-span-full text-center py-16 border-dashed cursor-pointer hover:border-surface-600 transition-colors"
      onClick={onAdd}
    >
      <div className="text-5xl mb-4">📓</div>
      <Heading size="md" className="mb-2">Start thinking</Heading>
      <Text muted className="max-w-md mx-auto">
        Notes help you process insights and develop your own understanding.
        Click to create your first note.
      </Text>
    </Card>
  );
}

function NoteEditor({ onClose }: { onClose: () => void }) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  const handleSave = () => {
    // TODO: Implement note creation
    onClose();
  };

  return (
    <Card variant="bordered" className="col-span-full md:col-span-2">
      <CardContent className="space-y-4">
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Note title..."
          className="text-lg font-medium border-0 bg-transparent px-0 focus:ring-0"
        />
        
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Start writing..."
          className="w-full h-48 bg-transparent text-surface-100 placeholder-surface-500 resize-none focus:outline-none"
        />

        <div className="flex items-center justify-between pt-4 border-t border-surface-800">
          <div className="flex gap-2">
            <button className="text-sm text-surface-400 hover:text-surface-100">
              Link to insight
            </button>
            <button className="text-sm text-surface-400 hover:text-surface-100">
              Add tags
            </button>
          </div>
          
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleSave}>
              Save
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
