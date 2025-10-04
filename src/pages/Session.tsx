import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Camera, Monitor, Send, GraduationCap, Lightbulb } from "lucide-react";
import { Link } from "react-router-dom";

const Session = () => {
  const [mode, setMode] = useState<"tutor" | "student">("tutor");
  const [cameraOn, setCameraOn] = useState(false);
  const [screenShare, setScreenShare] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([
    { role: "ai", content: "Hi! I'm Tutoroo. What would you like to learn today?" },
  ]);

  const handleSendMessage = () => {
    if (!message.trim()) return;
    setMessages([...messages, { role: "user", content: message }]);
    setMessage("");
    
    setTimeout(() => {
      const response = mode === "tutor" 
        ? "Let me help you understand that step by step..."
        : "Interesting! Can you explain why you chose that approach?";
      setMessages(prev => [...prev, { role: "ai", content: response }]);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* FaceTime-style header */}
      <div className="absolute top-6 left-6 z-20">
        <Link to="/" className="text-xl font-semibold text-foreground hover:text-foreground/80 transition-colors">
          Tutoroo
        </Link>
      </div>

      <div className="absolute top-6 right-6 z-20 flex items-center gap-4">
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
      </div>

      {/* Main FaceTime-style layout */}
      <div className="h-screen flex">
        {/* Large video/screen area */}
        <div className="flex-1 relative bg-black">
          {!cameraOn && !screenShare ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center space-y-4">
                <div className="text-8xl opacity-20">📚</div>
                <p className="text-muted-foreground">Camera or screen share off</p>
              </div>
            </div>
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-card/20 to-background/20 flex items-center justify-center">
              <p className="text-xl font-medium text-foreground/80">
                {screenShare ? "Screen Sharing Active" : "Camera Active"}
              </p>
            </div>
          )}

          {/* Floating controls at bottom */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-3">
            <Button
              variant={cameraOn ? "default" : "secondary"}
              size="lg"
              onClick={() => setCameraOn(!cameraOn)}
              className="rounded-full h-14 px-6 shadow-lg"
            >
              <Camera className="h-5 w-5 mr-2" />
              {cameraOn ? "Camera On" : "Camera Off"}
            </Button>
            <Button
              variant={screenShare ? "default" : "secondary"}
              size="lg"
              onClick={() => setScreenShare(!screenShare)}
              className="rounded-full h-14 px-6 shadow-lg"
            >
              <Monitor className="h-5 w-5 mr-2" />
              {screenShare ? "Sharing" : "Share Screen"}
            </Button>
          </div>

          {/* Insights overlay - top left */}
          <div className="absolute top-6 left-6 flex gap-3">
            <div className="bg-card/90 backdrop-blur-md px-4 py-2 rounded-lg border border-border">
              <p className="text-sm text-muted-foreground">Time</p>
              <p className="text-lg font-semibold text-foreground">12:34</p>
            </div>
            <div className="bg-card/90 backdrop-blur-md px-4 py-2 rounded-lg border border-border">
              <p className="text-sm text-muted-foreground">Confidence</p>
              <p className="text-lg font-semibold text-foreground">85%</p>
            </div>
            <div className="bg-card/90 backdrop-blur-md px-4 py-2 rounded-lg border border-border">
              <p className="text-sm text-muted-foreground">Questions</p>
              <p className="text-lg font-semibold text-foreground">3</p>
            </div>
          </div>
        </div>

        {/* Chat sidebar - FaceTime style */}
        <div className="w-96 bg-card border-l border-border flex flex-col">
          <div className="p-4 border-b border-border">
            <h3 className="font-semibold text-foreground">Chat</h3>
          </div>
          
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-3">
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-2.5 ${
                      msg.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-secondary-foreground"
                    }`}
                  >
                    <p className="text-sm">{msg.content}</p>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>

          <div className="p-4 border-t border-border">
            <div className="flex gap-2">
              <Input
                placeholder="Message..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                className="rounded-full bg-secondary border-0"
              />
              <Button 
                onClick={handleSendMessage} 
                size="icon" 
                className="rounded-full h-10 w-10 flex-shrink-0"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Session;
