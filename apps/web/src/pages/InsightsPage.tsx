import { Card, Heading, Text, Badge } from '@influix/ui';

/**
 * Insights Page
 * 
 * AI explains "why", not just "what"
 * The user should feel smarter, not overwhelmed
 */
export function InsightsPage() {
  return (
    <div className="page-container">
      {/* Header */}
      <div className="mb-8">
        <Heading as="h1" size="xl">Insights</Heading>
        <Text muted className="mt-1">
          AI-powered analysis of your content
        </Text>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-6">
        <Badge>All Insights</Badge>
        <Badge variant="default">Hook Analysis</Badge>
        <Badge variant="default">Tone</Badge>
        <Badge variant="default">Patterns</Badge>
      </div>

      {/* Insights list */}
      <div className="space-y-4">
        <EmptyState />
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <Card variant="bordered" padding="lg" className="text-center py-16">
      <div className="text-5xl mb-4">💡</div>
      <Heading size="md" className="mb-2">No insights yet</Heading>
      <Text muted className="max-w-md mx-auto">
        Add and analyze content to receive AI-powered insights that explain
        why content works and how to adapt those techniques.
      </Text>
    </Card>
  );
}
