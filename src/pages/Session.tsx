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
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/30 to-background">
      <header className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Tutoroo
          </Link>
          
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3 bg-secondary/50 px-4 py-2 rounded-xl">
              <GraduationCap className={`h-5 w-5 ${mode === "tutor" ? "text-primary" : "text-muted-foreground"}`} />
              <Switch 
                checked={mode === "student"} 
                onCheckedChange={(checked) => setMode(checked ? "student" : "tutor")}
              />
              <Lightbulb className={`h-5 w-5 ${mode === "student" ? "text-accent" : "text-muted-foreground"}`} />
            </div>
            <span className="text-sm font-medium">
              {mode === "tutor" ? "🎓 Tutor Mode" : "🤔 Curious Student"}
            </span>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card className="p-6 shadow-lg">
              <div className="aspect-video bg-muted/50 rounded-xl mb-4 flex items-center justify-center relative overflow-hidden">
                {!cameraOn && !screenShare ? (
                  <div className="text-center space-y-4">
                    <div className="text-6xl">📚</div>
                    <p className="text-muted-foreground">Start your session by enabling camera or screen share</p>
                  </div>
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center">
                    <p className="text-lg font-medium">{screenShare ? "Screen Sharing Active" : "Camera Active"}</p>
                  </div>
                )}
              </div>
              
              <div className="flex gap-3">
                <Button
                  variant={cameraOn ? "default" : "outline"}
                  className="flex-1"
                  onClick={() => setCameraOn(!cameraOn)}
                >
                  <Camera className="h-5 w-5 mr-2" />
                  {cameraOn ? "Camera On" : "Camera Off"}
                </Button>
                <Button
                  variant={screenShare ? "default" : "outline"}
                  className="flex-1"
                  onClick={() => setScreenShare(!screenShare)}
                >
                  <Monitor className="h-5 w-5 mr-2" />
                  {screenShare ? "Sharing" : "Share Screen"}
                </Button>
              </div>
            </Card>

            <Card className="p-6 shadow-lg">
              <h3 className="text-lg font-semibold mb-4">Real-time Insights</h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-secondary/50 p-4 rounded-xl text-center">
                  <p className="text-2xl font-bold text-primary">12:34</p>
                  <p className="text-sm text-muted-foreground">Time Spent</p>
                </div>
                <div className="bg-secondary/50 p-4 rounded-xl text-center">
                  <p className="text-2xl font-bold text-accent">85%</p>
                  <p className="text-sm text-muted-foreground">Confidence</p>
                </div>
                <div className="bg-secondary/50 p-4 rounded-xl text-center">
                  <p className="text-2xl font-bold text-primary">3</p>
                  <p className="text-sm text-muted-foreground">Questions</p>
                </div>
              </div>
            </Card>
          </div>

          <Card className="p-6 shadow-lg flex flex-col h-[calc(100vh-12rem)]">
            <h3 className="text-lg font-semibold mb-4">Chat with Tutoroo</h3>
            
            <ScrollArea className="flex-1 pr-4 mb-4">
              <div className="space-y-4">
                {messages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                        msg.role === "user"
                          ? "bg-primary text-primary-foreground"
                          : "bg-secondary text-secondary-foreground"
                      }`}
                    >
                      {msg.content}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>

            <div className="flex gap-2">
              <Input
                placeholder="Type your message..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                className="rounded-xl"
              />
              <Button onClick={handleSendMessage} size="icon" className="rounded-xl">
                <Send className="h-5 w-5" />
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Session;
