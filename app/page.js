"use client";

// import { useState, useEffect, useCallback } from "react";
// import { format } from "date-fns";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import { Button } from "@/components/ui/button";
// import { ScrollArea } from "@/components/ui/scroll-area";
// import { Separator } from "@/components/ui/separator";
// import { ImagePlus, Menu } from "lucide-react";
// import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
// import UploadModal from "@/components/modals/UploadModal"; // The modal we created earlier

// const PhotosPage = () => {
//   const [events, setEvents] = useState([]);
//   const [selectedEvent, setSelectedEvent] = useState(null);
//   const [images, setImages] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [sidebarOpen, setSidebarOpen] = useState(false);

//   useEffect(() => {
//     fetchEvents();
//   }, []);

//   const fetchEvents = async () => {
//     try {
//       const response = await fetch("/api/events");
//       if (!response.ok) throw new Error("Failed to fetch events");
//       const data = await response.json();
//       setEvents(data);
//     } catch (error) {
//       console.error("Error fetching events:", error);
//     }
//   };

//   const fetchImages = useCallback(async () => {
//     if (!selectedEvent) return;

//     setLoading(true);
//     try {
//       const response = await fetch(`/api/album/fetch?eventId=${selectedEvent.id}`);
//       if (!response.ok) throw new Error("Failed to fetch images");
//       const data = await response.json();
//       setImages(data);
//     } catch (error) {
//       console.error("Error fetching images:", error);
//     } finally {
//       setLoading(false);
//     }
//   }, [selectedEvent]);

//   useEffect(() => {
//     fetchImages();
//   }, [fetchImages]);

//   return (
//     <div className="h-screen flex flex-col">
//       <nav className="flex items-center px-4 py-3 border-b">
//         <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setSidebarOpen(true)}>
//           <Menu className="h-5 w-5" />
//         </Button>
//         <h1 className="text-xl font-semibold ml-2">Photo Gallery</h1>
//         <div className="ml-auto">
//           <UploadModal />
//         </div>
//       </nav>

//       <div className="flex-1 flex overflow-hidden">
//         <Sidebar
//           className="hidden md:block"
//           events={events}
//           selectedEvent={selectedEvent}
//           onEventSelect={setSelectedEvent}
//         />

//         <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
//           <SheetContent side="left" className="p-0 w-72">
//             <Sidebar
//               events={events}
//               selectedEvent={selectedEvent}
//               onEventSelect={(event) => {
//                 setSelectedEvent(event);
//                 setSidebarOpen(false);
//               }}
//             />
//           </SheetContent>
//         </Sheet>

//         <div className="flex-1 overflow-auto">
//           {selectedEvent ? (
//             <>
//               <div className="p-4 border-b">
//                 <h2 className="text-2xl font-semibold">{selectedEvent.eventName}</h2>
//                 <p className="text-muted-foreground">
//                   {format(new Date(selectedEvent.eventDate), "PPP")} • {selectedEvent.eventLocation}
//                 </p>
//               </div>
//               <ImageGrid images={images} loading={loading} />
//             </>
//           ) : (
//             <div className="flex flex-col items-center justify-center h-full text-center p-4">
//               <ImagePlus className="h-16 w-16 opacity-20 mb-4" />
//               <h2 className="text-xl font-semibold mb-2">Select an Event</h2>
//               <p className="text-muted-foreground">
//                 Choose an event from the sidebar to view its images
//               </p>
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// const Sidebar = ({ events, selectedEvent, onEventSelect, className = "" }) => {
//   return (
//     <div className={`w-64 border-r ${className}`}>
//       <div className="p-4">
//         <Select value={selectedEvent?.id?.toString()} onValueChange={(value) => {
//           const event = events.find(e => e.id.toString() === value);
//           onEventSelect(event);
//         }}>
//           <SelectTrigger>
//             <SelectValue placeholder="Select an event" />
//           </SelectTrigger>
//           <SelectContent>
//             {events.map((event) => (
//               <SelectItem key={event.id} value={event.id.toString()}>
//                 {event.eventName}
//               </SelectItem>
//             ))}
//           </SelectContent>
//         </Select>
//       </div>
//       <Separator />
//       <ScrollArea className="h-[calc(100vh-8rem)]">
//         <div className="p-4 space-y-4">
//           {events.map((event) => (
//             <button
//               key={event.id}
//               onClick={() => onEventSelect(event)}
//               className={`w-full text-left p-3 rounded-lg transition-colors ${
//                 selectedEvent?.id === event.id
//                   ? "bg-primary text-primary-foreground"
//                   : "hover:bg-muted"
//               }`}
//             >
//               <div className="font-medium">{event.eventName}</div>
//               <div className="text-sm opacity-70">
//                 {format(new Date(event.eventDate), "PPP")}
//               </div>
//               <div className="text-sm opacity-70">{event.eventLocation}</div>
//             </button>
//           ))}
//         </div>
//       </ScrollArea>
//     </div>
//   );
// };

// const ImageGrid = ({ images, loading }) => {
//   return (
//     <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 p-4">
//       {images.map((image) => (
//         <div key={image.id} className="relative aspect-square group overflow-hidden rounded-lg">
//           <img
//             src={image.s3Url}
//             alt={image.fileName}
//             className="object-cover w-full h-full transition-transform group-hover:scale-105"
//           />
//           <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-opacity" />
//         </div>
//       ))}
//       {images.length === 0 && !loading && (
//         <div className="col-span-full flex flex-col items-center justify-center p-12 text-center">
//           <ImagePlus className="h-12 w-12 opacity-20 mb-4" />
//           <h3 className="text-lg font-medium">No images yet</h3>
//           <p className="text-sm text-muted-foreground">
//             Upload some images to get started
//           </p>
//         </div>
//       )}
//       {loading && (
//         <div className="col-span-full text-center p-4">
//           Loading images...
//         </div>
//       )}
//     </div>
//   );
// };

// export default PhotosPage;
import { useState, useEffect, useCallback } from "react";
import { format } from "date-fns";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { ImagePlus, Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import UploadModal from "@/components/modals/UploadModal"; // The modal we created earlier
import ImageModal from "@/components/modals/imageModel"; // Import the new modal

const PhotosPage = () => {
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [eventType, setEventType] = useState("AwayDay"); // Default type
  const [selectedImage, setSelectedImage] = useState(null); // State to hold the selected image for modal

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await fetch("/api/events");
      if (!response.ok) throw new Error("Failed to fetch events");
      const data = await response.json();
      setEvents(data);
      setFilteredEvents(data.filter(event => event.eventType === eventType));
    } catch (error) {
      console.error("Error fetching events:", error);
    }
  };

  useEffect(() => {
    setFilteredEvents(events.filter(event => event.eventType === eventType)); // Update filtered events on type change
  }, [eventType, events]);

  const fetchImages = useCallback(async () => {
    if (!selectedEvent) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/album/fetch?eventId=${selectedEvent.id}`);
      if (!response.ok) throw new Error("Failed to fetch images");
      const data = await response.json();
      setImages(data);
    } catch (error) {
      console.error("Error fetching images:", error);
    } finally {
      setLoading(false);
    }
  }, [selectedEvent]);

  useEffect(() => {
    fetchImages();
  }, [fetchImages]);

  return (
    <div className="h-screen flex flex-col">
      <nav className="flex items-center px-4 py-3 border-b">
        <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setSidebarOpen(true)}>
          <Menu className="h-5 w-5" />
        </Button>
        <h1 className="text-xl font-semibold ml-2">Photo Gallery</h1>
        <div className="ml-auto">
          <UploadModal onUploadComplete={fetchImages} />
        </div>
      </nav>

      <div className="flex-1 flex overflow-hidden">
        <Sidebar
          className="hidden md:block"
          events={filteredEvents}
          selectedEvent={selectedEvent}
          onEventSelect={setSelectedEvent}
          eventType={eventType}
          setEventType={setEventType}
        />

        <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
          <SheetContent side="left" className="p-0 w-72">
            <Sidebar
              events={filteredEvents}
              selectedEvent={selectedEvent}
              onEventSelect={(event) => {
                setSelectedEvent(event);
                setSidebarOpen(false);
              }}
              eventType={eventType}
              setEventType={setEventType}
            />
          </SheetContent>
        </Sheet>

        <div className="flex-1 overflow-auto">
          {selectedEvent ? (
            <>
              <div className="p-4 border-b">
                <h2 className="text-2xl font-semibold">{selectedEvent.eventName}</h2>
                <p className="text-muted-foreground">
                  {format(new Date(selectedEvent.eventDate), "PPP")} • {selectedEvent.eventLocation}
                </p>
              </div>
              <ImageGrid images={images} loading={loading} onImageClick={setSelectedImage} />
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center p-4">
              <ImagePlus className="h-16 w-16 opacity-20 mb-4" />
              <h2 className="text-xl font-semibold mb-2">Select an Event</h2>
              <p className="text-muted-foreground">
                Choose an event from the sidebar to view its images
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Image Modal */}
      {selectedImage && (
        <ImageModal image={selectedImage} onClose={() => setSelectedImage(null)} />
      )}
    </div>
  );
};

const Sidebar = ({ events, selectedEvent, onEventSelect, eventType, setEventType, className = "" }) => {
  return (
    <div className={`w-64 border-r ${className}`}>
      <div className="p-4">
        <Select value={eventType} onValueChange={setEventType}>
          <SelectTrigger>
            <SelectValue placeholder="Select event type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="AwayDay">Away Day</SelectItem>
            <SelectItem value="Celebration">Celebration</SelectItem>
            <SelectItem value="TeamOuting">Team Outing</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Separator />
      <ScrollArea className="h-[calc(100vh-8rem)]">
        <div className="p-4 space-y-4">
          {events.map((event) => (
            <button
              key={event.id}
              onClick={() => onEventSelect(event)}
              className={`w-full text-left p-3 rounded-lg transition-colors ${
                selectedEvent?.id === event.id
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-muted"
              }`}
            >
              <div className="font-medium">{event.eventName}</div>
              <div className="text-sm opacity-70">
                {format(new Date(event.eventDate), "PPP")}
              </div>
              <div className="text-sm opacity-70">{event.eventLocation}</div>
            </button>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};

const ImageGrid = ({ images, loading, onImageClick }) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 p-4">
      {images.map((image) => (
        <div key={image.id} className="relative aspect-square group overflow-hidden rounded-lg cursor-pointer" onClick={() => onImageClick(image)}>
          <img
            src={image.s3Url}
            alt={image.fileName}
            className="object-cover w-full h-full transition-transform group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-opacity" />
        </div>
      ))}
      {images.length === 0 && !loading && (
        <div className="col-span-full flex flex-col items-center justify-center p-12 text-center">
          <ImagePlus className="h-12 w-12 opacity-20 mb-4" />
          <h3 className="text-lg font-medium">No images yet</h3>
          <p className="text-sm text-muted-foreground">
            Upload some images to get started
          </p>
        </div>
      )}
      {loading && (
        <div className="col-span-full text-center p-4">
          Loading images...
        </div>
      )}
    </div>
  );
};

export default PhotosPage;
