import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Download } from "lucide-react";
import { Link } from "react-router-dom";

const Settings = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/30 to-background">
      <header className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Tutoroo
          </Link>
          <Link to="/">
            <Button variant="ghost">
              <ArrowLeft className="h-5 w-5 mr-2" />
              Back to Home
            </Button>
          </Link>
        </div>
      </header>

      <div className="container mx-auto px-6 py-12 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Settings & Profile</h1>
          <p className="text-muted-foreground text-lg">Customize your learning experience</p>
        </div>

        <div className="space-y-6">
          <Card className="p-6 shadow-lg">
            <h3 className="text-xl font-semibold mb-6">Profile Information</h3>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input id="name" placeholder="Your name" className="mt-2" defaultValue="Alex Johnson" />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="your.email@example.com" className="mt-2" defaultValue="alex@example.com" />
              </div>
              <div>
                <Label htmlFor="grade">Grade Level</Label>
                <Select defaultValue="high-school">
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="middle-school">Middle School</SelectItem>
                    <SelectItem value="high-school">High School</SelectItem>
                    <SelectItem value="college">College</SelectItem>
                    <SelectItem value="graduate">Graduate</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </Card>

          <Card className="p-6 shadow-lg">
            <h3 className="text-xl font-semibold mb-6">Learning Preferences</h3>
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Visual Hints</Label>
                  <p className="text-sm text-muted-foreground">Prefer diagrams and visual explanations</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Step-by-step Guidance</Label>
                  <p className="text-sm text-muted-foreground">Break down problems into smaller steps</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Instant Feedback</Label>
                  <p className="text-sm text-muted-foreground">Get immediate corrections</p>
                </div>
                <Switch />
              </div>
              <div>
                <Label htmlFor="pace">Learning Pace</Label>
                <Select defaultValue="moderate">
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="slow">Slow and Thorough</SelectItem>
                    <SelectItem value="moderate">Moderate</SelectItem>
                    <SelectItem value="fast">Fast-paced</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </Card>

          <Card className="p-6 shadow-lg">
            <h3 className="text-xl font-semibold mb-6">Learning Goals</h3>
            <div className="space-y-4">
              <div className="p-4 bg-secondary/50 rounded-xl flex items-center justify-between">
                <div>
                  <p className="font-medium">Complete 20 sessions</p>
                  <p className="text-sm text-muted-foreground">18/20 completed</p>
                </div>
                <div className="text-2xl">🎯</div>
              </div>
              <div className="p-4 bg-secondary/50 rounded-xl flex items-center justify-between">
                <div>
                  <p className="font-medium">Maintain 80% confidence</p>
                  <p className="text-sm text-muted-foreground">Current: 82%</p>
                </div>
                <div className="text-2xl">⭐</div>
              </div>
              <div className="p-4 bg-secondary/50 rounded-xl flex items-center justify-between">
                <div>
                  <p className="font-medium">Master 5 new topics</p>
                  <p className="text-sm text-muted-foreground">4/5 completed</p>
                </div>
                <div className="text-2xl">📚</div>
              </div>
            </div>
          </Card>

          <Card className="p-6 shadow-lg">
            <h3 className="text-xl font-semibold mb-4">Session Summaries</h3>
            <p className="text-muted-foreground mb-4">Download your learning progress and insights</p>
            <Button variant="outline" className="w-full">
              <Download className="h-5 w-5 mr-2" />
              Download All Session Summaries
            </Button>
          </Card>

          <div className="flex gap-4">
            <Button variant="default" className="flex-1">Save Changes</Button>
            <Button variant="outline" className="flex-1">Cancel</Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
