import { useState } from 'react';
import { Button, Card, CardContent, CardHeader, CardTitle, Input, Badge, Heading, Text } from '@influix/ui';

/**
 * Content Page
 * 
 * Store content metadata, trigger AI analysis
 */
export function ContentPage() {
  const [showAddModal, setShowAddModal] = useState(false);

  return (
    <div className="page-container">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <Heading as="h1" size="xl">Content</Heading>
          <Text muted className="mt-1">
            Analyze content to understand why it works
          </Text>
        </div>
        <Button onClick={() => setShowAddModal(true)}>
          Add Content
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-6">
        <Badge>All</Badge>
        <Badge variant="default">YouTube</Badge>
        <Badge variant="default">TikTok</Badge>
        <Badge variant="default">Instagram</Badge>
      </div>

      {/* Content list */}
      <div className="space-y-4">
        <EmptyState />
      </div>

      {/* Add Content Modal */}
      {showAddModal && (
        <AddContentModal onClose={() => setShowAddModal(false)} />
      )}
    </div>
  );
}

function EmptyState() {
  return (
    <Card variant="bordered" padding="lg" className="text-center py-16">
      <div className="text-5xl mb-4">📦</div>
      <Heading size="md" className="mb-2">No content yet</Heading>
      <Text muted className="max-w-md mx-auto">
        Add a video, post, or article to analyze. InfluiX will break down why it works
        and give you actionable insights.
      </Text>
    </Card>
  );
}

function AddContentModal({ onClose }: { onClose: () => void }) {
  const [url, setUrl] = useState('');
  const [title, setTitle] = useState('');
  const [platform, setPlatform] = useState('youtube');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement content creation
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card variant="elevated" padding="lg" className="w-full max-w-lg">
        <CardHeader>
          <CardTitle>Add Content</CardTitle>
        </CardHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Content URL"
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://youtube.com/watch?v=..."
            hint="Paste a link to the content you want to analyze"
          />
          
          <Input
            label="Title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Give it a memorable title"
          />

          <div>
            <label className="block text-sm font-medium text-surface-200 mb-2">
              Platform
            </label>
            <div className="flex gap-2 flex-wrap">
              {['youtube', 'tiktok', 'instagram', 'twitter', 'linkedin', 'other'].map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPlatform(p)}
                  className={`px-3 py-1.5 rounded-lg text-sm capitalize transition-colors ${
                    platform === p
                      ? 'bg-primary-600 text-white'
                      : 'bg-surface-800 text-surface-300 hover:bg-surface-700'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button variant="secondary" type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" className="flex-1">
              Add & Analyze
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
