import React, { useState, useEffect, ChangeEvent, FormEvent } from "react";
import axios from "axios";
import { CameraIcon, LinkIcon } from "@heroicons/react/24/outline";

type UserProfile = {
  first_name: string;
  last_name: string;
  email: string;
  avatar?: string;
  bio?: string;
  current_title?: string;
  experience_level?: string;
  linkedin_url?: string;
  github_url?: string;
  portfolio_url?: string;
};

export default function Profile() {
  const [profile, setProfile] = useState<UserProfile>({
    first_name: "",
    last_name: "",
    email: "",
    avatar: "",
    bio: "",
    current_title: "",
    experience_level: "",
    linkedin_url: undefined,
    github_url: undefined,
    portfolio_url: undefined,
  });
  const [passwords, setPasswords] = useState({
    current_password: "",
    new_password: "",
  });
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProfile() {
      try {
        const token = localStorage.getItem("access");
        const res = await axios.get("/api/users/me/", {
          headers: { Authorization: "Bearer " + token },
        });
        setProfile(res.data.profile || res.data);
      } catch (err) {
        setError("Failed to load profile");
      }
    }
    fetchProfile();
  }, []);

  function handleInputChange(
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
  }

  function handlePasswordChange(e: ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setPasswords((prev) => ({ ...prev, [name]: value }));
  }

  function handleAvatarChange(e: ChangeEvent<HTMLInputElement>) {
    if (e.target.files && e.target.files.length > 0) {
      setAvatarFile(e.target.files[0]);
    }
  }

  async function uploadAvatar() {
    if (!avatarFile) return null;
    const formData = new FormData();
    formData.append("avatar", avatarFile);
    try {
      const token = localStorage.getItem("access");
      const res = await axios.post("/api/users/avatar/", formData, {
        headers: {
          Authorization: "Bearer " + token,
          "Content-Type": "multipart/form-data",
        },
      });
      return res.data.avatar;
    } catch {
      setError("Failed to upload avatar");
      return null;
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);
    try {
      const token = localStorage.getItem("access");
      let avatarUrl = profile.avatar;
      if (avatarFile) {
        const uploadedAvatar = await uploadAvatar();
        if (uploadedAvatar) avatarUrl = uploadedAvatar;
      }
      const updateData = { ...profile, avatar: avatarUrl };
      await axios.put("/api/users/me/", updateData, {
        headers: { Authorization: "Bearer " + token },
      });
      setMessage("Profile updated successfully");
    } catch {
      setError("Failed to update profile");
    } finally {
      setLoading(false);
    }
  }

  async function handleChangePassword(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);
    try {
      const token = localStorage.getItem("access");
      await axios.post(
        "/api/users/change-password/",
        {
          current_password: passwords.current_password,
          new_password: passwords.new_password,
        },
        {
          headers: { Authorization: "Bearer " + token },
        }
      );
      setMessage("Password changed successfully");
      setPasswords({ current_password: "", new_password: "" });
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to change password");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Profile</h1>
        <p className="text-sm text-gray-600 dark:text-gray-300">Manage your personal information and account security.</p>
      </div>

      {/* Alerts */}
      {error && <div className="mb-4 p-3 border border-error-200 bg-error-50 text-error-700 rounded-lg">{error}</div>}
      {message && <div className="mb-4 p-3 border border-success-200 bg-success-50 text-success-700 rounded-lg">{message}</div>}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Profile card */}
        <div className="lg:col-span-1">
          <div className="card">
            <div className="card-header">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Your Avatar</h3>
            </div>
            <div className="card-body">
              <div className="flex items-center gap-4">
                <div className="relative h-20 w-20 rounded-full overflow-hidden bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                  {profile.avatar ? (
                    <img src={profile.avatar} alt="Avatar" className="h-full w-full object-cover" />
                  ) : (
                    <CameraIcon className="h-8 w-8 text-gray-400" />
                  )}
                </div>
                <div>
                  <p className="text-sm text-gray-700 dark:text-gray-200 font-medium">{profile.first_name} {profile.last_name}</p>
                  <p className="text-xs text-gray-500">{profile.email}</p>
                </div>
              </div>

              <div className="mt-4">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-200">Upload new avatar</label>
                <input type="file" accept="image/*" onChange={handleAvatarChange} className="mt-2 block w-full text-sm text-gray-700 dark:text-gray-300" />
                <p className="text-xs text-gray-500 mt-1">PNG or JPG up to 2MB.</p>
              </div>
            </div>
          </div>

          <div className="card mt-6">
            <div className="card-header">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Social Links</h3>
            </div>
            <div className="card-body space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">LinkedIn</label>
                <div className="mt-1 flex items-center gap-2">
                  <LinkIcon className="h-4 w-4 text-gray-400" />
                  <input type="url" name="linkedin_url" value={profile.linkedin_url || ""} onChange={handleInputChange} className="input" placeholder="https://linkedin.com/in/username" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">GitHub</label>
                <div className="mt-1 flex items-center gap-2">
                  <LinkIcon className="h-4 w-4 text-gray-400" />
                  <input type="url" name="github_url" value={profile.github_url || ""} onChange={handleInputChange} className="input" placeholder="https://github.com/username" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">Portfolio</label>
                <div className="mt-1 flex items-center gap-2">
                  <LinkIcon className="h-4 w-4 text-gray-400" />
                  <input type="url" name="portfolio_url" value={profile.portfolio_url || ""} onChange={handleInputChange} className="input" placeholder="https://your-site.com" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Forms */}
        <div className="lg:col-span-2 space-y-6">
          <form onSubmit={handleSubmit} className="card">
            <div className="card-header">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Personal Information</h3>
            </div>
            <div className="card-body grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">First Name</label>
                <input type="text" name="first_name" value={profile.first_name} onChange={handleInputChange} className="input mt-1" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">Last Name</label>
                <input type="text" name="last_name" value={profile.last_name} onChange={handleInputChange} className="input mt-1" />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">Email</label>
                <input type="email" name="email" value={profile.email} onChange={handleInputChange} className="input mt-1" />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">Bio</label>
                <textarea name="bio" value={profile.bio || ""} onChange={handleInputChange} className="input mt-1 h-28 resize-y" placeholder="A short summary about you" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">Current Title</label>
                <input type="text" name="current_title" value={profile.current_title || ""} onChange={handleInputChange} className="input mt-1" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">Experience Level</label>
                <input type="text" name="experience_level" value={profile.experience_level || ""} onChange={handleInputChange} className="input mt-1" />
              </div>
            </div>
            <div className="card-footer flex justify-end">
              <button type="submit" disabled={loading} className="btn-primary">
                {loading ? "Saving..." : "Save Profile"}
              </button>
            </div>
          </form>

          <form onSubmit={handleChangePassword} className="card max-w-2xl">
            <div className="card-header">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Change Password</h3>
            </div>
            <div className="card-body space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">Current Password</label>
                <input type="password" name="current_password" value={passwords.current_password} onChange={handlePasswordChange} className="input mt-1" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">New Password</label>
                <input type="password" name="new_password" value={passwords.new_password} onChange={handlePasswordChange} className="input mt-1" required />
              </div>
            </div>
            <div className="card-footer flex justify-end">
              <button type="submit" disabled={loading} className="btn-error">
                {loading ? "Changing..." : "Change Password"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
