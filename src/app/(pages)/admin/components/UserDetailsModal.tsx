import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { format } from "date-fns";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast } from "react-toastify";
import { useState } from "react";
import { Pencil, X } from "lucide-react";

type User = {
  id: string;
  email: string;
  name: string;
  profile_image_url: string | null;
  dob: string | null;
  phone: string | null;
  age: number | null;
  profession: string | null;
  about_me: string | null;
  children: string | null;
  recommended: string | null;
  open_to_other_cities: any | null;
  open_to_other_destinations: boolean | null;
  created_at: string;
  updated_at: string;
  submission_id: string | null;
};

interface UserDetailsModalProps {
  user: User | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate?: () => void;
}

export function UserDetailsModal({
  user,
  isOpen,
  onClose,
  onUpdate,
}: UserDetailsModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedUser, setEditedUser] = useState<User | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  const formatDate = (date: string | null) => {
    if (!date) return "-";
    return format(new Date(date), "MMM d, yyyy");
  };

  const handleInputChange = (field: keyof User, value: any) => {
    setEditedUser((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        [field]: value,
      };
    });
  };

  const startEditing = () => {
    setEditedUser(user);
    setIsEditing(true);
  };

  const cancelEdit = () => {
    setEditedUser(null);
    setIsEditing(false);
  };

  const updateUser = async () => {
    if (!editedUser) return;

    setIsUpdating(true);
    try {
      const response = await fetch(`/api/admin/updateUser`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-cache",
          Pragma: "no-cache",
        },
        body: JSON.stringify(editedUser),
      });

      if (!response.ok) {
        throw new Error("Failed to update user");
      }

      const data = await response.json();

      // Update the local user data with the new timestamp
      setEditedUser((prev) =>
        prev
          ? {
              ...prev,
              updated_at: data.updated_at,
            }
          : null
      );

      toast.success("User updated successfully");
      setIsEditing(false);
      await onUpdate?.();
      onClose(); // Close the modal after successful update
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsUpdating(false);
    }
  };

  if (!user) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>User Details</span>
            {!isEditing && (
              <Button
                variant="ghost"
                size="sm"
                onClick={startEditing}
                className="h-8 text-sm">
                <Pencil className="h-4 w-4 mr-2" />
                Edit
              </Button>
            )}
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[70vh] pr-6">
          <div className="space-y-8">
            {/* Basic Information */}
            <section>
              <h3 className="text-md font-semibold mb-4">Basic Information</h3>
              <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                <div>
                  <p className="text-sm text-gray-500">Name</p>
                  {isEditing ? (
                    <Input
                      value={editedUser?.name || ""}
                      onChange={(e) =>
                        handleInputChange("name", e.target.value)
                      }
                      className="mt-1"
                    />
                  ) : (
                    <Input
                      value={user.name || "-"}
                      className="mt-1 bg-gray-50"
                      disabled
                    />
                  )}
                </div>
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <Input
                    value={user.email}
                    className="mt-1 bg-gray-50"
                    disabled
                  />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Phone</p>
                  {isEditing ? (
                    <Input
                      value={editedUser?.phone || ""}
                      onChange={(e) =>
                        handleInputChange("phone", e.target.value)
                      }
                      className="mt-1"
                    />
                  ) : (
                    <Input
                      value={user.phone || "-"}
                      className="mt-1 bg-gray-50"
                      disabled
                    />
                  )}
                </div>
                <div>
                  <p className="text-sm text-gray-500">Age</p>
                  {isEditing ? (
                    <Input
                      type="number"
                      value={editedUser?.age || ""}
                      onChange={(e) =>
                        handleInputChange("age", parseInt(e.target.value))
                      }
                      className="mt-1"
                    />
                  ) : (
                    <Input
                      value={user.age?.toString() || "-"}
                      className="mt-1 bg-gray-50"
                      disabled
                    />
                  )}
                </div>
                <div>
                  <p className="text-sm text-gray-500">Date of Birth</p>
                  {isEditing ? (
                    <Input
                      type="date"
                      value={editedUser?.dob || ""}
                      onChange={(e) => handleInputChange("dob", e.target.value)}
                      className="mt-1"
                    />
                  ) : (
                    <Input
                      value={formatDate(user.dob)}
                      className="mt-1 bg-gray-50"
                      disabled
                    />
                  )}
                </div>
                <div>
                  <p className="text-sm text-gray-500">Profession</p>
                  {isEditing ? (
                    <Input
                      value={editedUser?.profession || ""}
                      onChange={(e) =>
                        handleInputChange("profession", e.target.value)
                      }
                      className="mt-1"
                    />
                  ) : (
                    <p className="text-sm">{user.profession || "-"}</p>
                  )}
                </div>
              </div>
            </section>

            {/* Additional Information */}
            <section>
              <h3 className="text-md font-semibold mb-4">
                Additional Information
              </h3>
              <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                <div className="col-span-2">
                  <p className="text-sm text-gray-500">About Me</p>
                  {isEditing ? (
                    <Textarea
                      value={editedUser?.about_me || ""}
                      onChange={(e) =>
                        handleInputChange("about_me", e.target.value)
                      }
                      className="mt-1"
                    />
                  ) : (
                    <Textarea
                      value={user.about_me || "-"}
                      className="mt-1 bg-gray-50"
                      disabled
                    />
                  )}
                </div>
                <div>
                  <p className="text-sm text-gray-500">Children</p>
                  {isEditing ? (
                    <Input
                      value={editedUser?.children || ""}
                      onChange={(e) =>
                        handleInputChange("children", e.target.value)
                      }
                      className="mt-1"
                    />
                  ) : (
                    <Input
                      value={user.children || "-"}
                      className="mt-1 bg-gray-50"
                      disabled
                    />
                  )}
                </div>
                <div>
                  <p className="text-sm text-gray-500">Recommended By</p>
                  {isEditing ? (
                    <Input
                      value={editedUser?.recommended || ""}
                      onChange={(e) =>
                        handleInputChange("recommended", e.target.value)
                      }
                      className="mt-1"
                    />
                  ) : (
                    <Input
                      value={user.recommended || "-"}
                      className="mt-1 bg-gray-50"
                      disabled
                    />
                  )}
                </div>
              </div>
            </section>

            {/* Administrative Details */}
            <section>
              <h3 className="text-md font-semibold mb-4">
                Administrative Details
              </h3>
              <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                <div>
                  <p className="text-sm text-gray-500">Created At</p>
                  <p className="text-sm">{formatDate(user.created_at)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Last Updated</p>
                  <p className="text-sm">{formatDate(user.updated_at)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Submission ID</p>
                  <p className="text-sm">{user.submission_id || "-"}</p>
                </div>
              </div>
            </section>
          </div>
        </ScrollArea>

        {isEditing && (
          <div className="flex justify-end gap-2 mt-6">
            <Button onClick={updateUser} disabled={isUpdating}>
              {isUpdating ? "Saving..." : "Save Changes"}
            </Button>
            <Button
              variant="outline"
              onClick={cancelEdit}
              disabled={isUpdating}
              className="gap-2">
              <X className="h-4 w-4" />
              Cancel
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
