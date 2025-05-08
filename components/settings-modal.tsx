import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useTheme } from 'next-themes';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const { theme, setTheme } = useTheme();

  if (!isOpen) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
          <DialogDescription>
            Manage your application settings and preferences.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-6 py-4">
          {/* Theme Settings */}
          <div className="grid gap-3">
            <h3 className="text-lg font-medium">Appearance</h3>
            <div className="flex items-center justify-between">
              <Label htmlFor="theme-mode" className="text-sm">
                Theme
              </Label>
              <div className="flex items-center gap-2">
                <Button variant={theme === 'light' ? 'secondary' : 'ghost'} size="sm" onClick={() => setTheme('light')}>Light</Button>
                <Button variant={theme === 'dark' ? 'secondary' : 'ghost'} size="sm" onClick={() => setTheme('dark')}>Dark</Button>
                <Button variant={theme === 'system' ? 'secondary' : 'ghost'} size="sm" onClick={() => setTheme('system')}>System</Button>
              </div>
            </div>
          </div>

          {/* Notification Settings */}
          <div className="grid gap-3">
            <h3 className="text-lg font-medium">Notifications</h3>
            <div className="flex items-center justify-between">
              <Label htmlFor="desktop-notifications" className="text-sm">
                Enable Desktop Notifications
              </Label>
              <Switch id="desktop-notifications" disabled /> 
            </div>
             <p className="text-xs text-muted-foreground">
              Configure how you receive notifications from the app. (Coming soon)
            </p>
          </div>

          {/* Account Settings */}
          <div className="grid gap-3">
            <h3 className="text-lg font-medium">Account</h3>
            <p className="text-sm text-muted-foreground">
              Manage your account details and preferences. (Coming soon)
            </p>
            {/* Placeholder for account related settings */}
            <Button variant="outline" disabled>Manage Account</Button>
          </div>
        </div>

        <DialogFooter>
          <Button onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 