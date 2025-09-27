"use client"

import { useEffect, useState } from "react"
import { Button } from "@/src/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import { Alert, AlertDescription } from "@/src/components/ui/alert";
import { useUserStore } from "@/lib/user-store"
import { User, Mail, Lock, Shield, Edit3, Save, X, AlertCircle, Loader2 } from "lucide-react"

export default function AccountPage() {
  const { user, isLoading, error, fetchUser, updateName, updateEmail, updatePassword, clearError } = useUserStore()

  const [editingField, setEditingField] = useState<"name" | "email" | "password" | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })

  useEffect(() => {
    fetchUser()
  }, [fetchUser])

  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        name: user.fullName,
        email: user.email,
      }))
    }
  }, [user])

  const handleEdit = (field: "name" | "email" | "password") => {
    setEditingField(field)
    clearError()
  }

  const handleCancel = () => {
    setEditingField(null)
    if (user) {
      setFormData((prev) => ({
        ...prev,
        name: user.fullName,
        email: user.email,
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      }))
    }
  }

  const handleSave = async () => {
    if (!editingField) return

    try {
      switch (editingField) {
        case "name":
          await updateName(formData.name)
          break
        case "email":
          await updateEmail(formData.currentPassword, formData.email)
          break
        case "password":
          if (formData.newPassword !== formData.confirmPassword) {
            return // Handle password mismatch
          }
          await updatePassword(formData.currentPassword, formData.newPassword)
          setFormData((prev) => ({
            ...prev,
            currentPassword: "",
            newPassword: "",
            confirmPassword: "",
          }))
          break
      }
      setEditingField(null)
    } catch (error) {
      // Error is handled by the store
    }
  }

  if (isLoading && !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl space-y-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Account</h1>
        <p className="text-muted-foreground">Manage your profile information and account settings</p>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert className="border-destructive/50 text-destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Profile Information */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-card-foreground">
            <User className="w-5 h-5 text-primary" />
            Profile Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Avatar and Basic Info */}
          <div className="flex items-center gap-4 pb-6 border-b border-border">
            <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center">
              <User className="w-8 h-8 text-primary-foreground" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-semibold text-card-foreground">{user?.fullName || "Loading..."}</h3>
              <p className="text-muted-foreground">{user?.email}</p>
            </div>
          </div>

          {/* Name Field */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <User className="w-5 h-5 text-muted-foreground" />
                <div>
                  <Label className="text-sm font-medium text-card-foreground">Full Name</Label>
                  <p className="text-sm text-muted-foreground">Your display name</p>
                </div>
              </div>
              {editingField !== "name" && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEdit("name")}
                  className="border-border hover:bg-accent hover:text-accent-foreground"
                >
                  <Edit3 className="w-4 h-4 mr-2" />
                  Edit
                </Button>
              )}
            </div>

            {editingField === "name" ? (
              <div className="flex gap-2">
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                  className="bg-input border-border focus:ring-ring"
                  placeholder="Enter your full name"
                />
                <Button
                  onClick={handleSave}
                  disabled={isLoading}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                </Button>
                <Button
                  variant="outline"
                  onClick={handleCancel}
                  className="border-border hover:bg-secondary bg-transparent"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <div className="ml-8">
                <p className="text-card-foreground font-medium">{user?.fullName}</p>
              </div>
            )}
          </div>

          {/* Email Field */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-muted-foreground" />
                <div>
                  <Label className="text-sm font-medium text-card-foreground">Email Address</Label>
                  <p className="text-sm text-muted-foreground">Your account email</p>
                </div>
              </div>
              {editingField !== "email" && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEdit("email")}
                  className="border-border hover:bg-accent hover:text-accent-foreground"
                >
                  <Edit3 className="w-4 h-4 mr-2" />
                  Edit
                </Button>
              )}
            </div>

            {editingField === "email" ? (
              <div className="space-y-3 ml-8">
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                  className="bg-input border-border focus:ring-ring"
                  placeholder="Enter your new email address"
                />
                <Input
                  type="password"
                  value={formData.currentPassword}
                  onChange={(e) => setFormData((prev) => ({ ...prev, currentPassword: e.target.value }))}
                  className="bg-input border-border focus:ring-ring"
                  placeholder="Enter your current password"
                />
                <div className="flex gap-2">
                  <Button
                    onClick={handleSave}
                    disabled={isLoading || !formData.currentPassword || !formData.email}
                    className="bg-primary hover:bg-primary/90 text-primary-foreground"
                  >
                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    Update Email
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleCancel}
                    className="border-border hover:bg-secondary bg-transparent"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div className="ml-8">
                <p className="text-card-foreground font-medium">{user?.email}</p>
              </div>
            )}
          </div>

          {/* Password Field */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Lock className="w-5 h-5 text-muted-foreground" />
                <div>
                  <Label className="text-sm font-medium text-card-foreground">Password</Label>
                  <p className="text-sm text-muted-foreground">Change your account password</p>
                </div>
              </div>
              {editingField !== "password" && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEdit("password")}
                  className="border-border hover:bg-accent hover:text-accent-foreground"
                >
                  <Edit3 className="w-4 h-4 mr-2" />
                  Change
                </Button>
              )}
            </div>

            {editingField === "password" ? (
              <div className="space-y-3 ml-8">
                <Input
                  type="password"
                  value={formData.currentPassword}
                  onChange={(e) => setFormData((prev) => ({ ...prev, currentPassword: e.target.value }))}
                  className="bg-input border-border focus:ring-ring"
                  placeholder="Current password"
                />
                <Input
                  type="password"
                  value={formData.newPassword}
                  onChange={(e) => setFormData((prev) => ({ ...prev, newPassword: e.target.value }))}
                  className="bg-input border-border focus:ring-ring"
                  placeholder="New password"
                />
                <Input
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData((prev) => ({ ...prev, confirmPassword: e.target.value }))}
                  className="bg-input border-border focus:ring-ring"
                  placeholder="Confirm new password"
                />
                <div className="flex gap-2">
                  <Button
                    onClick={handleSave}
                    disabled={isLoading || formData.newPassword !== formData.confirmPassword}
                    className="bg-primary hover:bg-primary/90 text-primary-foreground"
                  >
                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    Update Password
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleCancel}
                    className="border-border hover:bg-secondary bg-transparent"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div className="ml-8">
                <p className="text-muted-foreground">••••••••</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Account Information */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-card-foreground">
            <Shield className="w-5 h-5 text-primary" />
            Account Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium text-card-foreground">Account Created</Label>
              <p className="text-sm text-muted-foreground mt-1">
                {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : "N/A"}
              </p>
            </div>
            <div>
              <Label className="text-sm font-medium text-card-foreground">Last Login</Label>
              <p className="text-sm text-muted-foreground mt-1">
                {user?.lastLoginAt ? new Date(user.lastLoginAt).toLocaleDateString() : "N/A"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
