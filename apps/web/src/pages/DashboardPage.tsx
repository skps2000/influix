import { useAuthStore } from '../stores/authStore';
import { Card, CardHeader, CardTitle, CardContent, Badge, Heading, Text } from '@influix/ui';

/**
 * Dashboard Page
 * 
 * Product philosophy:
 * - Show what matters today
 * - Contain AI-generated insight blocks
 * - Avoid useless charts
 * - Less UI, more meaning
 */
export function DashboardPage() {
  const user = useAuthStore((state) => state.user);
  
  const greeting = getGreeting();

  return (
    <div className="page-container">
      {/* Header */}
      <div className="mb-8">
        <Heading as="h1" size="xl">
          {greeting}, {user?.name?.split(' ')[0] || 'there'}
        </Heading>
        <Text muted className="mt-1">
          Here's what matters today
        </Text>
      </div>

      {/* Today's Focus - AI generated */}
      <Card variant="bordered" className="mb-6 border-primary-800/30 bg-primary-950/20">
        <CardHeader>
          <div className="flex items-center gap-2">
            <span className="text-lg">✨</span>
            <CardTitle>Today's Focus</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <Text>
            Start by adding your first piece of content. InfluiX will analyze it and help you understand why it works.
          </Text>
          <button className="mt-4 text-sm text-primary-400 hover:text-primary-300 font-medium">
            Add your first content →
          </button>
        </CardContent>
      </Card>

      {/* Stats - Meaningful only */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <StatCard label="Content Analyzed" value="0" />
        <StatCard label="Insights Generated" value="0" />
        <StatCard label="Patterns Discovered" value="0" />
      </div>

      {/* Recent Insights */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <Heading size="md">Recent Insights</Heading>
          <button className="text-sm text-surface-400 hover:text-surface-100">
            View all
          </button>
        </div>
        
        <div className="space-y-4">
          <EmptyState
            icon="💡"
            title="No insights yet"
            description="Add content to start receiving AI-powered insights"
          />
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <QuickActionCard
          icon="📝"
          title="Add Content"
          description="Analyze a video, post, or article"
          href="/content"
        />
        <QuickActionCard
          icon="📓"
          title="Start a Note"
          description="Capture your thoughts and ideas"
          href="/notes"
        />
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <Card variant="bordered" padding="md">
      <Text size="sm" muted>{label}</Text>
      <div className="text-2xl font-bold text-surface-100 mt-1">{value}</div>
    </Card>
  );
}

function EmptyState({
  icon,
  title,
  description,
}: {
  icon: string;
  title: string;
  description: string;
}) {
  return (
    <Card variant="bordered" padding="lg" className="text-center">
      <div className="text-4xl mb-3">{icon}</div>
      <Text weight="medium" className="mb-1">{title}</Text>
      <Text size="sm" muted>{description}</Text>
    </Card>
  );
}

function QuickActionCard({
  icon,
  title,
  description,
  href,
}: {
  icon: string;
  title: string;
  description: string;
  href: string;
}) {
  return (
    <a href={href} className="block">
      <Card variant="bordered" className="card-hover">
        <CardContent>
          <div className="flex items-start gap-4">
            <span className="text-2xl">{icon}</span>
            <div>
              <Text weight="semibold">{title}</Text>
              <Text size="sm" muted className="mt-1">{description}</Text>
            </div>
          </div>
        </CardContent>
      </Card>
    </a>
  );
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}
