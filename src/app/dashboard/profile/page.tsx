"use client";

import { useState, useEffect, useCallback, type KeyboardEvent } from "react";
import { useRouter } from "next/navigation";
import {
  Loader2,
  Save,
  AlertCircle,
  X,
  Globe,
  Lock,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/components/providers/auth-provider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { cn } from "@/lib/utils";

type ProfileVisibility = "PUBLIC" | "PRIVATE";
type UserType = "GUEST" | "HOST" | "BOTH";

type ProfileForm = {
  name: string;
  email: string;
  image: string;
  headline: string;
  bio: string;
  jobTitle: string;
  companyName: string;
  industry: string;
  skills: string[];
  interests: string[];
  lookingFor: string;
  websiteUrl: string;
  linkedinUrl: string;
  city: string;
  languages: string[];
  preferredWorkdays: string[];
  profileVisibility: ProfileVisibility;
  userType: UserType;
};

const EMPTY_FORM: ProfileForm = {
  name: "",
  email: "",
  image: "",
  headline: "",
  bio: "",
  jobTitle: "",
  companyName: "",
  industry: "",
  skills: [],
  interests: [],
  lookingFor: "",
  websiteUrl: "",
  linkedinUrl: "",
  city: "",
  languages: [],
  preferredWorkdays: [],
  profileVisibility: "PRIVATE",
  userType: "GUEST",
};

// Map an API response (with possible nulls) into a fully-populated form state.
function toForm(data: Record<string, unknown>): ProfileForm {
  const str = (key: string) => (typeof data[key] === "string" ? (data[key] as string) : "");
  const arr = (key: string) =>
    Array.isArray(data[key]) ? (data[key] as unknown[]).filter((v): v is string => typeof v === "string") : [];
  return {
    name: str("name"),
    email: str("email"),
    image: str("image"),
    headline: str("headline"),
    bio: str("bio"),
    jobTitle: str("jobTitle"),
    companyName: str("companyName"),
    industry: str("industry"),
    skills: arr("skills"),
    interests: arr("interests"),
    lookingFor: str("lookingFor"),
    websiteUrl: str("websiteUrl"),
    linkedinUrl: str("linkedinUrl"),
    city: str("city"),
    languages: arr("languages"),
    preferredWorkdays: arr("preferredWorkdays"),
    profileVisibility: data.profileVisibility === "PUBLIC" ? "PUBLIC" : "PRIVATE",
    userType:
      data.userType === "HOST" || data.userType === "BOTH" ? (data.userType as UserType) : "GUEST",
  };
}

const WORKDAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

type ArrayField = "skills" | "interests" | "languages" | "preferredWorkdays";

export default function ProfilePage() {
  const [formData, setFormData] = useState<ProfileForm>(EMPTY_FORM);
  const [tagDrafts, setTagDrafts] = useState<Record<ArrayField, string>>({
    skills: "",
    interests: "",
    languages: "",
    preferredWorkdays: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const { isAuthenticated, user, isLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const loadProfile = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const res = await fetch("/api/profile", { cache: "no-store" });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.error || "Failed to load your profile");
      }
      const data = await res.json();
      setFormData(toForm(data));
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : "Failed to load your profile");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated) {
      toast({
        title: "Authentication required",
        description: "Please sign in to view your profile",
        variant: "destructive",
      });
      router.push("/signin");
      return;
    }
    void loadProfile();
  }, [isAuthenticated, isLoading, router, toast, loadProfile]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const addTag = (field: ArrayField, raw: string) => {
    const value = raw.trim();
    if (!value) return;
    setFormData((prev) =>
      prev[field].includes(value) ? prev : { ...prev, [field]: [...prev[field], value] },
    );
    setTagDrafts((prev) => ({ ...prev, [field]: "" }));
  };

  const removeTag = (field: ArrayField, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: prev[field].filter((v) => v !== value) }));
  };

  const handleTagKeyDown = (field: ArrayField) => (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag(field, tagDrafts[field]);
    } else if (e.key === "Backspace" && tagDrafts[field] === "" && formData[field].length > 0) {
      removeTag(field, formData[field][formData[field].length - 1]);
    }
  };

  const toggleWorkday = (day: string) => {
    setFormData((prev) => ({
      ...prev,
      preferredWorkdays: prev.preferredWorkdays.includes(day)
        ? prev.preferredWorkdays.filter((d) => d !== day)
        : [...prev.preferredWorkdays, day],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Flush any unconfirmed tag drafts so users don't silently lose typed input.
    const drafts = tagDrafts;
    // Send trimmed strings (including "") rather than dropping empty values to
    // `undefined` — otherwise a user can never CLEAR a previously-set field
    // (the schema accepts "" as "cleared"). `name` keeps the guard so a blank
    // name can't wipe the account's display name.
    const payload = {
      name: formData.name.trim() || undefined,
      headline: formData.headline.trim(),
      bio: formData.bio.trim(),
      jobTitle: formData.jobTitle.trim(),
      companyName: formData.companyName.trim(),
      industry: formData.industry.trim(),
      skills: mergeDraft(formData.skills, drafts.skills),
      interests: mergeDraft(formData.interests, drafts.interests),
      lookingFor: formData.lookingFor.trim(),
      websiteUrl: formData.websiteUrl.trim(),
      linkedinUrl: formData.linkedinUrl.trim(),
      city: formData.city.trim(),
      languages: mergeDraft(formData.languages, drafts.languages),
      preferredWorkdays: formData.preferredWorkdays,
      profileVisibility: formData.profileVisibility,
      userType: formData.userType,
    };

    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.error || "Failed to update your profile");
      }
      const data = await res.json();
      setFormData(toForm(data));
      setTagDrafts({ skills: "", interests: "", languages: "", preferredWorkdays: "" });
      toast({
        title: "Profile updated",
        description: "Your profile has been successfully saved.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update your profile.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading || loading) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <div className="h-7 w-40 animate-pulse rounded bg-muted" />
          <div className="h-4 w-72 animate-pulse rounded bg-muted" />
        </div>
        <div className="h-10 w-full animate-pulse rounded bg-muted" />
        <Card>
          <CardContent className="space-y-4 pt-6">
            <div className="mx-auto h-24 w-24 animate-pulse rounded-full bg-muted" />
            <div className="h-10 w-full animate-pulse rounded bg-muted" />
            <div className="h-10 w-full animate-pulse rounded bg-muted" />
            <div className="h-24 w-full animate-pulse rounded bg-muted" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">My Profile</h1>
          <p className="text-muted-foreground">Manage your professional information</p>
        </div>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Could not load your profile</AlertTitle>
          <AlertDescription>{loadError}</AlertDescription>
        </Alert>
        <Button variant="outline" onClick={() => void loadProfile()}>
          Try again
        </Button>
      </div>
    );
  }

  const displayName = formData.name || user?.name || "";
  const initials =
    displayName
      .split(" ")
      .map((n) => n[0])
      .filter(Boolean)
      .join("")
      .toUpperCase() || "?";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">My Profile</h1>
        <p className="text-muted-foreground">
          Manage your professional information and how others can discover you
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <Tabs defaultValue="personal" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="personal">Personal</TabsTrigger>
            <TabsTrigger value="professional">Professional</TabsTrigger>
            <TabsTrigger value="preferences">Preferences</TabsTrigger>
          </TabsList>

          {/* PERSONAL */}
          <TabsContent value="personal" className="mt-6 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>Your basic details and how you introduce yourself</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex flex-col items-center space-y-3">
                  <Avatar className="h-24 w-24">
                    <AvatarImage src={formData.image || user?.image || ""} alt={displayName} />
                    <AvatarFallback className="text-lg">{initials}</AvatarFallback>
                  </Avatar>
                  <p className="text-sm font-medium">{displayName || "Your profile"}</p>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      name="name"
                      placeholder="Your full name"
                      value={formData.name}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="Your email address"
                      value={formData.email}
                      disabled
                    />
                    <p className="text-xs text-muted-foreground">
                      Email cannot be changed here.
                    </p>
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="headline">Headline</Label>
                    <Input
                      id="headline"
                      name="headline"
                      placeholder="e.g. Product designer & remote-work enthusiast"
                      value={formData.headline}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      name="city"
                      placeholder="City"
                      value={formData.city}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea
                      id="bio"
                      name="bio"
                      placeholder="Tell others a bit about yourself"
                      value={formData.bio}
                      onChange={handleInputChange}
                      rows={4}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* PROFESSIONAL */}
          <TabsContent value="professional" className="mt-6 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Work & Expertise</CardTitle>
                <CardDescription>Help hosts and other members get to know you</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="jobTitle">Job Title</Label>
                    <Input
                      id="jobTitle"
                      name="jobTitle"
                      placeholder="e.g. Senior Developer"
                      value={formData.jobTitle}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="companyName">Company</Label>
                    <Input
                      id="companyName"
                      name="companyName"
                      placeholder="Where you work"
                      value={formData.companyName}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="industry">Industry</Label>
                    <Input
                      id="industry"
                      name="industry"
                      placeholder="e.g. Technology"
                      value={formData.industry}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="websiteUrl">Website</Label>
                    <Input
                      id="websiteUrl"
                      name="websiteUrl"
                      type="url"
                      placeholder="https://example.com"
                      value={formData.websiteUrl}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="linkedinUrl">LinkedIn URL</Label>
                    <Input
                      id="linkedinUrl"
                      name="linkedinUrl"
                      type="url"
                      placeholder="https://linkedin.com/in/you"
                      value={formData.linkedinUrl}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                <TagInput
                  id="skills"
                  label="Skills"
                  placeholder="Type a skill and press Enter"
                  values={formData.skills}
                  draft={tagDrafts.skills}
                  onDraftChange={(v) => setTagDrafts((p) => ({ ...p, skills: v }))}
                  onKeyDown={handleTagKeyDown("skills")}
                  onAdd={() => addTag("skills", tagDrafts.skills)}
                  onRemove={(v) => removeTag("skills", v)}
                />
                <TagInput
                  id="interests"
                  label="Interests"
                  placeholder="Type an interest and press Enter"
                  values={formData.interests}
                  draft={tagDrafts.interests}
                  onDraftChange={(v) => setTagDrafts((p) => ({ ...p, interests: v }))}
                  onKeyDown={handleTagKeyDown("interests")}
                  onAdd={() => addTag("interests", tagDrafts.interests)}
                  onRemove={(v) => removeTag("interests", v)}
                />
                <TagInput
                  id="languages"
                  label="Languages"
                  placeholder="Type a language and press Enter"
                  values={formData.languages}
                  draft={tagDrafts.languages}
                  onDraftChange={(v) => setTagDrafts((p) => ({ ...p, languages: v }))}
                  onKeyDown={handleTagKeyDown("languages")}
                  onAdd={() => addTag("languages", tagDrafts.languages)}
                  onRemove={(v) => removeTag("languages", v)}
                />

                <div className="space-y-2">
                  <Label htmlFor="lookingFor">What are you looking for?</Label>
                  <Textarea
                    id="lookingFor"
                    name="lookingFor"
                    placeholder="e.g. A quiet desk near Enschede a few days a week, and people to network with"
                    value={formData.lookingFor}
                    onChange={handleInputChange}
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* PREFERENCES */}
          <TabsContent value="preferences" className="mt-6 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Visibility & Role</CardTitle>
                <CardDescription>Control how your profile is shown and your role</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label>Profile Visibility</Label>
                  <div className="grid grid-cols-2 gap-3">
                    <VisibilityOption
                      active={formData.profileVisibility === "PRIVATE"}
                      onClick={() =>
                        setFormData((p) => ({ ...p, profileVisibility: "PRIVATE" }))
                      }
                      icon={<Lock className="h-4 w-4" />}
                      title="Private"
                      description="Only you can see your profile"
                    />
                    <VisibilityOption
                      active={formData.profileVisibility === "PUBLIC"}
                      onClick={() =>
                        setFormData((p) => ({ ...p, profileVisibility: "PUBLIC" }))
                      }
                      icon={<Globe className="h-4 w-4" />}
                      title="Public"
                      description="Other members can discover you"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="userType">I am a…</Label>
                  <Select
                    value={formData.userType}
                    onValueChange={(value) =>
                      setFormData((p) => ({ ...p, userType: value as UserType }))
                    }
                  >
                    <SelectTrigger id="userType">
                      <SelectValue placeholder="Select your role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="GUEST">Guest (I book spaces)</SelectItem>
                      <SelectItem value="HOST">Host (I offer spaces)</SelectItem>
                      <SelectItem value="BOTH">Both</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Preferred Workdays</Label>
                  <div className="flex flex-wrap gap-2">
                    {WORKDAYS.map((day) => {
                      const active = formData.preferredWorkdays.includes(day);
                      return (
                        <button
                          key={day}
                          type="button"
                          onClick={() => toggleWorkday(day)}
                          className={cn(
                            "rounded-full border px-3 py-1 text-sm transition-colors",
                            active
                              ? "border-transparent bg-primary text-primary-foreground"
                              : "bg-background hover:bg-accent",
                          )}
                        >
                          {day}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <Card className="mt-6">
          <CardFooter className="flex justify-end gap-3 px-6 py-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => void loadProfile()}
              disabled={isSubmitting}
            >
              Reset
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      </form>

      <Alert variant="destructive" className="mt-2">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Account Deletion</AlertTitle>
        <AlertDescription>
          If you wish to delete your account and all associated data, please contact our support
          team. This action cannot be undone.
        </AlertDescription>
      </Alert>
    </div>
  );
}

// Combine confirmed tags with a leftover draft (so a typed-but-not-Entered value
// still gets saved on submit).
function mergeDraft(values: string[], draft: string): string[] {
  const trimmed = draft.trim();
  if (!trimmed || values.includes(trimmed)) return values;
  return [...values, trimmed];
}

type TagInputProps = {
  id: string;
  label: string;
  placeholder: string;
  values: string[];
  draft: string;
  onDraftChange: (value: string) => void;
  onKeyDown: (e: KeyboardEvent<HTMLInputElement>) => void;
  onAdd: () => void;
  onRemove: (value: string) => void;
};

function TagInput({
  id,
  label,
  placeholder,
  values,
  draft,
  onDraftChange,
  onKeyDown,
  onAdd,
  onRemove,
}: TagInputProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      {values.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {values.map((value) => (
            <Badge key={value} variant="secondary" className="gap-1 pr-1">
              {value}
              <button
                type="button"
                aria-label={`Remove ${value}`}
                onClick={() => onRemove(value)}
                className="ml-1 rounded-full p-0.5 hover:bg-background/60"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
      <div className="flex gap-2">
        <Input
          id={id}
          placeholder={placeholder}
          value={draft}
          onChange={(e) => onDraftChange(e.target.value)}
          onKeyDown={onKeyDown}
        />
      </div>
    </div>
  );
}

type VisibilityOptionProps = {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  title: string;
  description: string;
};

function VisibilityOption({ active, onClick, icon, title, description }: VisibilityOptionProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "flex flex-col items-start gap-1 rounded-lg border p-4 text-left transition-colors",
        active ? "border-primary ring-2 ring-primary/30" : "hover:bg-accent",
      )}
    >
      <span className="flex items-center gap-2 font-medium">
        {icon}
        {title}
      </span>
      <span className="text-sm text-muted-foreground">{description}</span>
    </button>
  );
}
