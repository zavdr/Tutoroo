import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Camera, Monitor, Mic, MicOff, GraduationCap, Lightbulb, BarChart3 } from "lucide-react";
import { Link } from "react-router-dom";

const Session = () => {
  const [mode, setMode] = useState<"tutor" | "student">("tutor");
  const [cameraOn, setCameraOn] = useState(false);
  const [screenShare, setScreenShare] = useState(false);
  const [micOn, setMicOn] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      {/* Header with logo and controls */}
      <div className="absolute top-0 left-0 right-0 z-20 bg-card/40 backdrop-blur-md border-b border-border">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="text-xl font-semibold text-foreground hover:text-foreground/80 transition-colors">
            Tutoroo
          </Link>
          
          <div className="flex items-center gap-4">
            {/* Stats moved to header */}
            <div className="hidden md:flex items-center gap-3">
              <div className="bg-card/90 backdrop-blur-md px-4 py-2 rounded-lg border border-border">
                <p className="text-xs text-muted-foreground">Time</p>
                <p className="text-sm font-semibold text-foreground">12:34</p>
              </div>
              <div className="bg-card/90 backdrop-blur-md px-4 py-2 rounded-lg border border-border">
                <p className="text-xs text-muted-foreground">Confidence</p>
                <p className="text-sm font-semibold text-foreground">85%</p>
              </div>
              <div className="bg-card/90 backdrop-blur-md px-4 py-2 rounded-lg border border-border">
                <p className="text-xs text-muted-foreground">Questions</p>
                <p className="text-sm font-semibold text-foreground">3</p>
              </div>
            </div>

            {/* Mode toggle */}
            <div className="flex items-center gap-2 bg-card/80 backdrop-blur-md px-4 py-2 rounded-full border border-border">
              <GraduationCap className={`h-4 w-4 ${mode === "tutor" ? "text-foreground" : "text-muted-foreground"}`} />
              <Switch 
                checked={mode === "student"} 
                onCheckedChange={(checked) => setMode(checked ? "student" : "tutor")}
              />
              <Lightbulb className={`h-4 w-4 ${mode === "student" ? "text-foreground" : "text-muted-foreground"}`} />
              <span className="text-sm ml-2 text-foreground">
                {mode === "tutor" ? "Tutor" : "Student"}
              </span>
            </div>

            {/* Dashboard button */}
            <Link to="/dashboard">
              <Button variant="outline" size="sm" className="rounded-full">
                <BarChart3 className="h-4 w-4 mr-2" />
                Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Main FaceTime-style layout */}
      <div className="h-screen pt-20 flex items-center justify-center">
        {/* Large video/screen area - centered */}
        <div className="flex-1 h-full relative bg-black">
          {!cameraOn && !screenShare ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center space-y-6">
                <div className="text-9xl opacity-20">📚</div>
                <p className="text-lg text-muted-foreground">
                  {micOn ? "Listening..." : "Start your session by turning on your mic"}
                </p>
                {micOn && (
                  <div className="flex items-center justify-center gap-2">
                    <div className="h-2 w-2 bg-red-500 rounded-full animate-pulse"></div>
                    <span className="text-sm text-muted-foreground">AI is listening</span>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-card/20 to-background/20 flex items-center justify-center">
              <p className="text-2xl font-medium text-foreground/80">
                {screenShare ? "Screen Sharing Active" : "Camera Active"}
              </p>
            </div>
          )}

          {/* Floating controls at bottom center */}
          <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex items-center gap-4">
            <Button
              variant={cameraOn ? "default" : "secondary"}
              size="lg"
              onClick={() => setCameraOn(!cameraOn)}
              className="rounded-full h-16 w-16 p-0 shadow-2xl"
            >
              <Camera className="h-6 w-6" />
            </Button>
            
            <Button
              variant={micOn ? "default" : "secondary"}
              size="lg"
              onClick={() => setMicOn(!micOn)}
              className={`rounded-full h-20 w-20 p-0 shadow-2xl ${
                micOn ? "bg-red-500 hover:bg-red-600" : ""
              }`}
            >
              {micOn ? <Mic className="h-8 w-8" /> : <MicOff className="h-8 w-8" />}
            </Button>
            
            <Button
              variant={screenShare ? "default" : "secondary"}
              size="lg"
              onClick={() => setScreenShare(!screenShare)}
              className="rounded-full h-16 w-16 p-0 shadow-2xl"
            >
              <Monitor className="h-6 w-6" />
            </Button>
          </div>

          {/* AI Status indicator */}
          {micOn && (
            <div className="absolute top-8 left-1/2 -translate-x-1/2 bg-card/90 backdrop-blur-md px-6 py-3 rounded-full border border-border shadow-lg">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="h-3 w-3 bg-green-500 rounded-full animate-pulse"></div>
                  <div className="absolute inset-0 h-3 w-3 bg-green-500 rounded-full animate-ping"></div>
                </div>
                <p className="text-sm font-medium text-foreground">
                  {mode === "tutor" ? "Tutoroo is ready to guide you" : "Tutoroo is ready to learn from you"}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Session;
