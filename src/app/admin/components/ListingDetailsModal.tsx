import { useState, useEffect } from "react";
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
import { Checkbox } from "@/components/ui/checkbox";
import Image from "next/image";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { Upload, X } from "lucide-react";

interface ListingDetailsModalProps {
  listing: any;
  isOpen: boolean;
  onClose: () => void;
  onUpdate?: () => void;
}

const propertyTypes = [
  "House",
  "Apartment",
  "Villa",
  "Farm",
  "Boat",
  "RV",
  "Other",
];

const locationTypes = [
  "a condominium",
  "a gated community",
  "it rests freely",
  "other",
];

const sleepCapacity = ["1", "2", "3", "4", "5", "6", "7+"];
const bathroomOptions = ["1", "2", "3", "4+"];
const areaRanges = [
  "60-100",
  "100-150",
  "150-200",
  "200-250",
  "250-300",
  "300-350",
  "350-400",
  "400-450",
  "450-500",
  "500-550",
  "550-600",
];

const amenityGroups = [
  {
    title: "Comfort & Entertainment",
    items: [
      { id: "tv", label: "TV" },
      { id: "wifi", label: "WiFi" },
      { id: "ac", label: "Air Conditioning" },
      { id: "fireplace", label: "Fireplace" },
      { id: "computer", label: "Computer" },
      { id: "video_games", label: "Video Games" },
    ],
  },
  {
    title: "Appliances",
    items: [
      { id: "dishwasher", label: "Dishwasher" },
      { id: "washer", label: "Washer" },
      { id: "dryer", label: "Dryer" },
    ],
  },
  {
    title: "Outdoor & Recreation",
    items: [
      { id: "pool", label: "Pool" },
      { id: "hot_tub", label: "Hot Tub" },
      { id: "sauna", label: "Sauna" },
      { id: "terrace", label: "Terrace" },
      { id: "bbq", label: "BBQ" },
      { id: "playground", label: "Playground" },
      { id: "tennis_court", label: "Tennis Court" },
      { id: "gym", label: "Gym" },
    ],
  },
  {
    title: "Transportation",
    items: [
      { id: "car", label: "Car" },
      { id: "bike", label: "Bike" },
      { id: "scooter", label: "Scooter" },
      { id: "parking", label: "Parking" },
    ],
  },
  {
    title: "Services & Accessibility",
    items: [
      { id: "elevator", label: "Elevator" },
      { id: "doorman", label: "Doorman" },
      { id: "cleaning_service", label: "Cleaning Service" },
      { id: "wc_access", label: "Wheelchair Access" },
      { id: "baby_gear", label: "Baby Equipment" },
    ],
  },
  {
    title: "Recreation",
    items: [
      { id: "pingpong", label: "Ping Pong" },
      { id: "billiards", label: "Billiards" },
    ],
  },
];

export function ListingDetailsModal({
  listing,
  isOpen,
  onClose,
  onUpdate,
}: ListingDetailsModalProps) {
  const [editedListing, setEditedListing] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    if (listing) {
      setEditedListing(JSON.parse(JSON.stringify(listing)));
    }
  }, [listing]);

  if (!listing || !editedListing) return null;

  const formatDate = (date: string | null) => {
    if (!date) return "N/A";
    try {
      const parsedDate = new Date(date);
      if (isNaN(parsedDate.getTime())) return "Invalid date";
      return format(parsedDate, "PPP");
    } catch (error) {
      return "Invalid date";
    }
  };

  const renderAmenities = () => {
    if (!listing.amenities) return "No amenities data available";

    return (
      Object.entries(listing.amenities)
        .filter(([_, value]) => value === true)
        .map(([key]) => key.replace(/_/g, " "))
        .map((amenity) => amenity.charAt(0).toUpperCase() + amenity.slice(1))
        .join(", ") || "None selected"
    );
  };

  const handleInputChange = (section: string, field: string, value: any) => {
    setEditedListing((prev: any) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }));
  };

  const handleAmenityToggle = (amenity: string) => {
    setEditedListing((prev: any) => ({
      ...prev,
      amenities: {
        ...prev.amenities,
        [amenity]: !prev.amenities[amenity],
      },
    }));
  };

  const handleSlugChange = (value: string) => {
    setEditedListing((prev: any) => ({
      ...prev,
      slug: value,
    }));
  };

  const handleSave = async () => {
    try {
      console.log("Sending data:", {
        id: editedListing.id,
        homeInfoId: editedListing.home_info?.id,
        userInfoId: editedListing.user_info?.id,
        amenitiesId: editedListing.amenities?.id,
      });

      const response = await fetch("/api/admin/updateListing", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: editedListing.id,
          status: editedListing.status,
          slug: editedListing.slug,
          home_info: {
            id: editedListing.home_info.id,
            ...editedListing.home_info,
          },
          user_info: {
            id: editedListing.user_info.id,
            ...editedListing.user_info,
          },
          amenities: {
            id: editedListing.amenities.id,
            ...editedListing.amenities,
          },
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update listing");
      }

      toast.success("Listing updated successfully");
      await onUpdate?.();
      setIsEditing(false);
    } catch (error: any) {
      toast.error(error.message || "Failed to update listing");
      console.error("Error updating listing:", error);
    }
  };

  const handleCancel = () => {
    setEditedListing(JSON.parse(JSON.stringify(listing)));
    setIsEditing(false);
  };

  const hasChanges = JSON.stringify(listing) !== JSON.stringify(editedListing);

  const handleImageReorder = (result: any) => {
    if (!result.destination) return;

    const items = Array.from(editedListing.home_info.listing_images);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setEditedListing((prev: any) => ({
      ...prev,
      home_info: {
        ...prev.home_info,
        listing_images: items,
      },
    }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    try {
      const formData = new FormData();
      Array.from(files).forEach((file) => {
        formData.append("files", file);
      });

      const response = await fetch("/api/admin/uploadImages", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to upload images");
      }

      const { urls } = await response.json();

      setEditedListing((prev: any) => ({
        ...prev,
        home_info: {
          ...prev.home_info,
          listing_images: [...prev.home_info.listing_images, ...urls],
        },
      }));

      toast.success("Images uploaded successfully");
    } catch (error) {
      toast.error("Failed to upload images");
      console.error("Error uploading images:", error);
    }
  };

  const handleImageDelete = (index: number) => {
    setEditedListing((prev: any) => ({
      ...prev,
      home_info: {
        ...prev.home_info,
        listing_images: prev.home_info.listing_images.filter(
          (_: any, i: number) => i !== index
        ),
      },
    }));
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-hidden">
          <DialogHeader className="pb-2">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div className="space-y-2 flex-1">
                  <DialogTitle className="text-xl">
                    {isEditing ? (
                      <Input
                        value={editedListing.home_info.title}
                        onChange={(e) =>
                          handleInputChange(
                            "home_info",
                            "title",
                            e.target.value
                          )
                        }
                        className="text-xl font-semibold w-fit"
                      />
                    ) : (
                      listing.home_info.title
                    )}
                  </DialogTitle>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-500">Slug:</span>
                    {isEditing ? (
                      <Input
                        value={editedListing.slug || ""}
                        onChange={(e) => handleSlugChange(e.target.value)}
                        className="text-sm  w-fit"
                      />
                    ) : (
                      <span className="text-sm">{listing.slug || "N/A"}</span>
                    )}
                  </div>
                </div>
                <div className="space-x-2">
                  {!isEditing && (
                    <Button onClick={() => setIsEditing(true)}>Edit</Button>
                  )}
                  {isEditing && (
                    <>
                      <Button variant="outline" onClick={handleCancel}>
                        Cancel
                      </Button>
                      <Button onClick={handleSave} disabled={!hasChanges}>
                        Save
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </DialogHeader>
          <ScrollArea className="h-[50vh] pr-4">
            {/* Image Gallery */}
            {listing.home_info.listing_images?.length > 0 && (
              <div className="space-y-4 pb-4">
                {isEditing && (
                  <div className="flex items-center gap-2">
                    <Input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      id="image-upload"
                    />
                    <label
                      htmlFor="image-upload"
                      className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md cursor-pointer hover:bg-primary/90">
                      <Upload className="h-4 w-4" />
                      Add Images
                    </label>
                    <p className="text-sm text-gray-500">
                      Drag and drop to reorder images
                    </p>
                  </div>
                )}
                <DragDropContext onDragEnd={handleImageReorder}>
                  <Droppable droppableId="images" direction="horizontal">
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={`grid grid-cols-6 gap-2 !relative ${
                          snapshot.isDraggingOver ? "bg-gray-50" : ""
                        }`}>
                        {editedListing.home_info.listing_images.map(
                          (image: string, index: number) => (
                            <Draggable
                              key={image}
                              draggableId={image}
                              index={index}
                              isDragDisabled={!isEditing}>
                              {(provided, snapshot) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  className={`relative aspect-square group ${
                                    snapshot.isDragging ? "z-50 shadow-lg" : ""
                                  }`}
                                  style={{
                                    ...provided.draggableProps.style,
                                  }}>
                                  <Image
                                    src={image}
                                    alt={`Property image ${index + 1}`}
                                    fill
                                    className={`object-cover rounded-md cursor-pointer hover:opacity-90 ${
                                      snapshot.isDragging ? "opacity-90" : ""
                                    }`}
                                    onClick={() =>
                                      !isEditing && setSelectedImage(image)
                                    }
                                  />
                                  {isEditing && (
                                    <button
                                      onClick={() => handleImageDelete(index)}
                                      className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                                      <X className="h-4 w-4" />
                                    </button>
                                  )}
                                </div>
                              )}
                            </Draggable>
                          )
                        )}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </DragDropContext>
              </div>
            )}
            <div className="space-y-4">
              {/* Property Details */}
              <section>
                <h3 className="text-md font-semibold mb-1">Property Details</h3>
                <div className="grid grid-cols-3 gap-x-6 gap-y-2">
                  <div>
                    <p className="text-sm text-gray-500">Location</p>
                    {isEditing ? (
                      <Input
                        value={editedListing.home_info.city}
                        onChange={(e) =>
                          handleInputChange("home_info", "city", e.target.value)
                        }
                        className="text-sm"
                      />
                    ) : (
                      <p className="text-sm">{listing.home_info.city}</p>
                    )}
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Located In</p>
                    {isEditing ? (
                      <select
                        value={editedListing.home_info.located_in}
                        onChange={(e) =>
                          handleInputChange(
                            "home_info",
                            "located_in",
                            e.target.value
                          )
                        }
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md">
                        {locationTypes.map((type) => (
                          <option key={type} value={type}>
                            {type}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <p className="text-sm">{listing.home_info.located_in}</p>
                    )}
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Property Type</p>
                    {isEditing ? (
                      <select
                        value={editedListing.home_info.property_type}
                        onChange={(e) =>
                          handleInputChange(
                            "home_info",
                            "property_type",
                            e.target.value
                          )
                        }
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md">
                        {propertyTypes.map((type) => (
                          <option key={type} value={type}>
                            {type}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <p className="text-sm">
                        {listing.home_info.property_type}
                      </p>
                    )}
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Sleeps</p>
                    {isEditing ? (
                      <select
                        value={editedListing.home_info.how_many_sleep}
                        onChange={(e) =>
                          handleInputChange(
                            "home_info",
                            "how_many_sleep",
                            e.target.value
                          )
                        }
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md">
                        {sleepCapacity.map((num) => (
                          <option key={num} value={num}>
                            {num}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <p className="text-sm">
                        {listing.home_info.how_many_sleep} people
                      </p>
                    )}
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Bathrooms</p>
                    {isEditing ? (
                      <select
                        value={editedListing.home_info.bathrooms}
                        onChange={(e) =>
                          handleInputChange(
                            "home_info",
                            "bathrooms",
                            e.target.value
                          )
                        }
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md">
                        {bathroomOptions.map((num) => (
                          <option key={num} value={num}>
                            {num}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <p className="text-sm">{listing.home_info.bathrooms}</p>
                    )}
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Area</p>
                    {isEditing ? (
                      <select
                        value={editedListing.home_info.area}
                        onChange={(e) =>
                          handleInputChange("home_info", "area", e.target.value)
                        }
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md">
                        {areaRanges.map((range) => (
                          <option key={range} value={range}>
                            {range} m²
                          </option>
                        ))}
                      </select>
                    ) : (
                      <p className="text-sm">{listing.home_info.area}</p>
                    )}
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Usage</p>
                    {isEditing ? (
                      <select
                        value={editedListing.home_info.main_or_second}
                        onChange={(e) =>
                          handleInputChange(
                            "home_info",
                            "main_or_second",
                            e.target.value
                          )
                        }
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md">
                        <option value="main">Main Home</option>
                        <option value="second">Second Home</option>
                      </select>
                    ) : (
                      <p className="text-sm">
                        {listing.home_info.main_or_second}
                      </p>
                    )}
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Images</p>
                    <p className="text-sm">
                      {listing.home_info.listing_images?.length || 0} photos
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Last Updated</p>
                    <p className="text-sm">
                      {formatDate(listing.home_info.updated_at)}
                    </p>
                  </div>
                </div>
                <div className="mt-2">
                  <p className="text-sm text-gray-500">Description</p>
                  {isEditing ? (
                    <Textarea
                      value={editedListing.home_info.description}
                      onChange={(e) =>
                        handleInputChange(
                          "home_info",
                          "description",
                          e.target.value
                        )
                      }
                      className="text-sm"
                      rows={4}
                    />
                  ) : (
                    <p className="text-sm whitespace-pre-wrap">
                      {listing.home_info.description}
                    </p>
                  )}
                </div>
              </section>

              {/* User Details - Updated to be fully editable */}
              <section>
                <h3 className="text-md font-semibold mb-1">Host Information</h3>
                <div className="grid grid-cols-3 gap-x-6 gap-y-2">
                  {/* Name */}
                  <div>
                    <p className="text-sm text-gray-500">Name</p>
                    {isEditing ? (
                      <Input
                        value={editedListing.user_info.name}
                        onChange={(e) =>
                          handleInputChange("user_info", "name", e.target.value)
                        }
                        className="text-sm"
                      />
                    ) : (
                      <p className="text-sm">{listing.user_info.name}</p>
                    )}
                  </div>
                  {/* Email */}
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    {isEditing ? (
                      <Input
                        value={editedListing.user_info.email}
                        onChange={(e) =>
                          handleInputChange(
                            "user_info",
                            "email",
                            e.target.value
                          )
                        }
                        className="text-sm"
                      />
                    ) : (
                      <p className="text-sm">{listing.user_info.email}</p>
                    )}
                  </div>
                  {/* Phone */}
                  <div>
                    <p className="text-sm text-gray-500">Phone</p>
                    {isEditing ? (
                      <Input
                        value={editedListing.user_info.phone}
                        onChange={(e) =>
                          handleInputChange(
                            "user_info",
                            "phone",
                            e.target.value
                          )
                        }
                        className="text-sm"
                      />
                    ) : (
                      <p className="text-sm">{listing.user_info.phone}</p>
                    )}
                  </div>
                  {/* Age */}
                  <div>
                    <p className="text-sm text-gray-500">Age</p>
                    {isEditing ? (
                      <Input
                        type="number"
                        value={editedListing.user_info.age}
                        onChange={(e) =>
                          handleInputChange("user_info", "age", e.target.value)
                        }
                        className="text-sm"
                      />
                    ) : (
                      <p className="text-sm">{listing.user_info.age}</p>
                    )}
                  </div>
                  {/* Profession */}
                  <div>
                    <p className="text-sm text-gray-500">Profession</p>
                    {isEditing ? (
                      <Input
                        value={editedListing.user_info.profession}
                        onChange={(e) =>
                          handleInputChange(
                            "user_info",
                            "profession",
                            e.target.value
                          )
                        }
                        className="text-sm"
                      />
                    ) : (
                      <p className="text-sm">{listing.user_info.profession}</p>
                    )}
                  </div>
                  {/* Children */}
                  <div>
                    <p className="text-sm text-gray-500">Children</p>
                    {isEditing ? (
                      <Input
                        value={editedListing.user_info.children}
                        onChange={(e) =>
                          handleInputChange(
                            "user_info",
                            "children",
                            e.target.value
                          )
                        }
                        className="text-sm"
                      />
                    ) : (
                      <p className="text-sm">{listing.user_info.children}</p>
                    )}
                  </div>
                  {/* Recommended By */}
                  <div>
                    <p className="text-sm text-gray-500">Recommended By</p>
                    {isEditing ? (
                      <Input
                        value={editedListing.user_info.recommended || ""}
                        onChange={(e) =>
                          handleInputChange(
                            "user_info",
                            "recommended",
                            e.target.value
                          )
                        }
                        className="text-sm"
                      />
                    ) : (
                      <p className="text-sm">
                        {listing.user_info.recommended || "N/A"}
                      </p>
                    )}
                  </div>
                  {/* Open to Other Cities */}
                  <div>
                    <p className="text-sm text-gray-500">
                      Open to Other Cities
                    </p>
                    {isEditing ? (
                      <Checkbox
                        checked={editedListing.user_info.open_to_other_cities}
                        onCheckedChange={(checked: boolean) =>
                          handleInputChange(
                            "user_info",
                            "open_to_other_cities",
                            checked
                          )
                        }
                      />
                    ) : (
                      <p className="text-sm">
                        {listing.user_info.open_to_other_cities ? "Yes" : "No"}
                      </p>
                    )}
                  </div>
                  {/* Open to Other Destinations */}
                  <div>
                    <p className="text-sm text-gray-500">
                      Open to Other Destinations
                    </p>
                    {isEditing ? (
                      <Checkbox
                        checked={
                          editedListing.user_info.open_to_other_destinations
                        }
                        onCheckedChange={(checked: boolean) =>
                          handleInputChange(
                            "user_info",
                            "open_to_other_destinations",
                            checked
                          )
                        }
                      />
                    ) : (
                      <p className="text-sm">
                        {listing.user_info.open_to_other_destinations
                          ? "Yes"
                          : "No"}
                      </p>
                    )}
                  </div>
                </div>
                {/* About */}
                <div className="mt-2">
                  <p className="text-sm text-gray-500">About</p>
                  {isEditing ? (
                    <Textarea
                      value={editedListing.user_info.about_me}
                      onChange={(e) =>
                        handleInputChange(
                          "user_info",
                          "about_me",
                          e.target.value
                        )
                      }
                      className="text-sm"
                      rows={4}
                    />
                  ) : (
                    <p className="text-sm whitespace-pre-wrap">
                      {listing.user_info.about_me}
                    </p>
                  )}
                </div>
              </section>

              {/* Amenities */}
              <section>
                <h3 className="text-md font-semibold mb-1">Amenities</h3>
                {isEditing ? (
                  <div className="grid grid-cols-2 gap-6">
                    {amenityGroups.map((group) => (
                      <div key={group.title} className="space-y-3">
                        <h4 className="font-medium text-sm text-gray-700">
                          {group.title}
                        </h4>
                        <div className="space-y-2">
                          {group.items.map((item) => (
                            <label
                              key={item.id}
                              className="flex items-center space-x-2">
                              <Checkbox
                                checked={editedListing.amenities[item.id]}
                                onCheckedChange={(checked: boolean) =>
                                  handleAmenityToggle(item.id)
                                }
                              />
                              <span className="text-sm">{item.label}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm">{renderAmenities()}</p>
                )}
              </section>

              {/* Administrative Details */}
              <section>
                <h3 className="text-md font-semibold mb-1">
                  Administrative Details
                </h3>
                <div className="grid grid-cols-3 gap-x-6 gap-y-2">
                  <div>
                    <p className="text-sm text-gray-500">Status</p>
                    <p className="text-sm">{listing.status}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Created</p>
                    <p className="text-sm">{formatDate(listing.created_at)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Last Updated</p>
                    <p className="text-sm">{formatDate(listing.updated_at)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Highlighted</p>
                    <p className="text-sm">
                      {listing.is_highlighted ? "Yes" : "No"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Privacy Policy</p>
                    <p className="text-sm">
                      {listing.privacy_policy_accepted
                        ? "Accepted"
                        : "Not Accepted"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Privacy Policy Date</p>
                    <p className="text-sm">
                      {listing.privacy_policy_date
                        ? formatDate(listing.privacy_policy_date)
                        : "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Submission ID</p>
                    <p className="text-sm">{listing.submission_id}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Listing ID</p>
                    <p className="text-sm">{listing.id}</p>
                  </div>
                </div>
              </section>
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Image Lightbox */}
      {selectedImage && (
        <Dialog
          open={!!selectedImage}
          onOpenChange={() => setSelectedImage(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] p-0">
            <div className="relative aspect-video">
              <Image
                src={selectedImage}
                alt="Property image"
                fill
                className="object-contain"
              />
            </div>
            <div className="p-4 flex justify-between">
              <Button
                variant="outline"
                onClick={() => {
                  const currentIndex =
                    listing.home_info.listing_images.indexOf(selectedImage);
                  const prevIndex =
                    (currentIndex -
                      1 +
                      listing.home_info.listing_images.length) %
                    listing.home_info.listing_images.length;
                  setSelectedImage(listing.home_info.listing_images[prevIndex]);
                }}>
                Previous
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  const currentIndex =
                    listing.home_info.listing_images.indexOf(selectedImage);
                  const nextIndex =
                    (currentIndex + 1) %
                    listing.home_info.listing_images.length;
                  setSelectedImage(listing.home_info.listing_images[nextIndex]);
                }}>
                Next
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
