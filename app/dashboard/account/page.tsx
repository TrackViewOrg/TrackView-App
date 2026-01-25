'use client'

import React from 'react'
import { useUser } from '@/components/providers/user-provider'
import { Button } from '@/components/ui/button'
import {
  SettingItem,
  SettingSection,
} from '@/components/dashboard/settings/SettingsSection'
import { ScrollArea } from '@/components/ui/scroll-area'
import UsernameSettings from '@/components/dashboard/settings/usernameSettings'
import EmailSettings from '@/components/dashboard/settings/emailSetting'
import PasswordSettings from '@/components/dashboard/settings/passwordSettings'
import MfaSettings from '@/components/dashboard/settings/mfaSettings'
import { AvatarUpload } from '@/components/dashboard/settings/AvatarUploader'
import { ProfileVisibilitySelector } from '@/components/dashboard/settings/ProfileSelector'
import DeleteSessions from '@/components/dashboard/settings/DeleteSessions'
import DeleteAccount from '@/components/dashboard/settings/DeleteAccount'
import { useSubscriptionModal } from '@/lib/hooks/subscription'

const ActionButton = ({ label }: { label: string }) => (
  <Button
    size="sm"
    variant="default"
    className="rounded-inner border-border/20 border"
  >
    {label}
  </Button>
)

function Page() {
  const { profile, user } = useUser()
  const subscriptionModal = useSubscriptionModal()

  React.useEffect(() => {
    if (window.location.hash === '#subscription') {
      subscriptionModal.open()
    }
  }, [subscriptionModal])

  return (
    <div className="bg-background h-full w-full overflow-hidden">
      <ScrollArea className="h-full w-full">
        <div className="flex w-full justify-center pt-20 pb-20">
          <div className="flex w-full max-w-7xl flex-col gap-10 px-8 md:px-12 lg:px-20">
            {/* Header Section */}
            <div className="flex flex-row items-center justify-between gap-6">
              <header className="flex flex-col items-start gap-0.5">
                <h1 className="text-3xl font-bold tracking-tight md:text-3xl">
                  Account Preferences
                </h1>
                <p className="md:text-md text-muted-foreground text-base font-light">
                  Manage the preferences for your account.
                </p>
              </header>
              <div className="group relative shrink-0 select-none">
                <AvatarUpload user={user} profile={profile} />
              </div>
            </div>

            {/* Settings Sections */}
            <div className="flex flex-col gap-10">
              <SettingSection>
                <SettingItem
                  title="Username"
                  value={profile?.display_name || 'N/A'}
                  action={<UsernameSettings />}
                />
                <SettingItem
                  title="Email"
                  value={user?.email || 'N/A'}
                  action={<EmailSettings />}
                />
                <SettingItem
                  title="Subscription"
                  value={profile?.plan.toLocaleLowerCase() || 'N/A'}
                  action={
                    <div onClick={() => subscriptionModal.open()}>
                      <ActionButton
                        label={
                          profile?.plan === 'DEFAULT'
                            ? 'Upgrade Plan'
                            : 'Manage Plan'
                        }
                      />
                    </div>
                  }
                />
              </SettingSection>

              <SettingSection
                title="Security"
                description="Manage your account security."
              >
                <SettingItem
                  title="Password"
                  value="Manage the password for your account."
                  action={<PasswordSettings />}
                />
                <SettingItem
                  title="Multi-factor authentication"
                  value="Secure your account with a second factor of authentication."
                  action={<MfaSettings />}
                />
                <SettingItem
                  title="Profile Visibility"
                  value="Change the visibility of your profile"
                  action={
                    <ProfileVisibilitySelector
                      initialVisibility={profile?.profile_visible || false}
                    />
                  }
                />
              </SettingSection>

              <SettingSection
                title="Danger Zone"
                description="Be careful here !"
              >
                <SettingItem
                  title="Delete Sessions"
                  value="Delete all recorded sessions from this account."
                  action={<DeleteSessions />}
                />
                <SettingItem
                  title="Delete Account"
                  value="Deleting your account is permanent and cannot be undone."
                  action={<DeleteAccount />}
                />
              </SettingSection>

              <div className={'flex w-full justify-between'}>
                <p className={'text-muted-foreground/50 text-xs'}>
                  TrackView © 2026
                </p>
                <p className={'text-muted-foreground/50 text-xs'}>V1.0.0</p>
              </div>
            </div>
          </div>
        </div>
      </ScrollArea>
    </div>
  )
}

export default Page
