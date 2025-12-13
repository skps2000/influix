import { useAuthStore } from '../stores/authStore';
import { Button, Card, CardContent, CardHeader, CardTitle, Input, Heading, Text } from '@influix/ui';

/**
 * Settings Page
 */
export function SettingsPage() {
  const { user } = useAuthStore();

  return (
    <div className="page-container max-w-3xl">
      {/* Header */}
      <div className="mb-8">
        <Heading as="h1" size="xl">Settings</Heading>
        <Text muted className="mt-1">
          Manage your account and preferences
        </Text>
      </div>

      {/* Profile Section */}
      <Card variant="bordered" className="mb-6">
        <CardHeader>
          <CardTitle>Profile</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 bg-primary-600 rounded-full flex items-center justify-center">
              <span className="text-2xl font-bold">
                {user?.name?.charAt(0).toUpperCase() || 'U'}
              </span>
            </div>
            <div>
              <Button variant="secondary" size="sm">
                Change avatar
              </Button>
            </div>
          </div>

          <Input
            label="Name"
            defaultValue={user?.name}
            placeholder="Your name"
          />
          
          <Input
            label="Email"
            type="email"
            defaultValue={user?.email}
            disabled
            hint="Email cannot be changed"
          />

          <Button>Save changes</Button>
        </CardContent>
      </Card>

      {/* Preferences Section */}
      <Card variant="bordered" className="mb-6">
        <CardHeader>
          <CardTitle>Preferences</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <Text weight="medium">Theme</Text>
              <Text size="sm" muted>Choose your preferred theme</Text>
            </div>
            <div className="flex gap-2">
              <ThemeButton active label="Dark" />
              <ThemeButton label="Light" />
              <ThemeButton label="System" />
            </div>
          </div>

          <div className="divider" />

          <div className="flex items-center justify-between">
            <div>
              <Text weight="medium">Email notifications</Text>
              <Text size="sm" muted>Receive insights and updates via email</Text>
            </div>
            <ToggleSwitch />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Text weight="medium">Weekly digest</Text>
              <Text size="sm" muted>Summary of your insights and patterns</Text>
            </div>
            <ToggleSwitch defaultChecked />
          </div>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card variant="bordered" className="border-red-900/50">
        <CardHeader>
          <CardTitle className="text-red-400">Danger Zone</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <Text weight="medium">Delete account</Text>
              <Text size="sm" muted>Permanently delete your account and all data</Text>
            </div>
            <Button variant="danger" size="sm">
              Delete account
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function ThemeButton({ label, active }: { label: string; active?: boolean }) {
  return (
    <button
      className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
        active
          ? 'bg-primary-600 text-white'
          : 'bg-surface-800 text-surface-300 hover:bg-surface-700'
      }`}
    >
      {label}
    </button>
  );
}

function ToggleSwitch({ defaultChecked }: { defaultChecked?: boolean }) {
  return (
    <button
      className={`w-11 h-6 rounded-full transition-colors ${
        defaultChecked ? 'bg-primary-600' : 'bg-surface-700'
      }`}
    >
      <span
        className={`block w-4 h-4 bg-white rounded-full transition-transform ${
          defaultChecked ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  );
}
