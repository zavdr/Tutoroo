import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, Award, Target, Clock, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

const Dashboard = () => {
  const learningData = [
    { week: "Week 1", progress: 45 },
    { week: "Week 2", progress: 60 },
    { week: "Week 3", progress: 75 },
    { week: "Week 4", progress: 85 },
  ];

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

      <div className="container mx-auto px-6 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Your Learning Dashboard</h1>
          <p className="text-muted-foreground text-lg">Track your progress and insights</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="p-6 shadow-lg hover:shadow-xl transition-shadow">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/10 rounded-xl">
                <Clock className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Time</p>
                <p className="text-2xl font-bold">24h 32m</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 shadow-lg hover:shadow-xl transition-shadow">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-accent/10 rounded-xl">
                <Award className="h-6 w-6 text-accent" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Sessions</p>
                <p className="text-2xl font-bold">18</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 shadow-lg hover:shadow-xl transition-shadow">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/10 rounded-xl">
                <TrendingUp className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Avg Confidence</p>
                <p className="text-2xl font-bold">82%</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 shadow-lg hover:shadow-xl transition-shadow">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-accent/10 rounded-xl">
                <Target className="h-6 w-6 text-accent" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Goals Met</p>
                <p className="text-2xl font-bold">12/15</p>
              </div>
            </div>
          </Card>
        </div>

        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          <Card className="p-6 shadow-lg">
            <h3 className="text-xl font-semibold mb-6">Learning Progress Timeline</h3>
            <div className="space-y-4">
              {learningData.map((item, idx) => (
                <div key={idx}>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium">{item.week}</span>
                    <span className="text-sm text-muted-foreground">{item.progress}%</span>
                  </div>
                  <Progress value={item.progress} className="h-2" />
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-6 shadow-lg">
            <h3 className="text-xl font-semibold mb-6">Strengths & Areas to Improve</h3>
            <div className="space-y-4">
              <div className="p-4 bg-accent/10 rounded-xl">
                <h4 className="font-semibold text-accent mb-2">✨ Strengths</h4>
                <ul className="space-y-1 text-sm">
                  <li>• Clear problem-solving approach</li>
                  <li>• Strong conceptual understanding</li>
                  <li>• Good use of visual aids</li>
                </ul>
              </div>
              <div className="p-4 bg-primary/10 rounded-xl">
                <h4 className="font-semibold text-primary mb-2">🎯 Areas to Improve</h4>
                <ul className="space-y-1 text-sm">
                  <li>• Practice more complex problems</li>
                  <li>• Work on explaining edge cases</li>
                  <li>• Review notation consistency</li>
                </ul>
              </div>
            </div>
          </Card>
        </div>

        <Card className="p-6 shadow-lg">
          <h3 className="text-xl font-semibold mb-4">Common Mistakes & Patterns</h3>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="p-4 bg-muted/50 rounded-xl">
              <p className="font-medium mb-2">Calculation Errors</p>
              <p className="text-sm text-muted-foreground">Appeared in 3 sessions</p>
            </div>
            <div className="p-4 bg-muted/50 rounded-xl">
              <p className="font-medium mb-2">Skipped Steps</p>
              <p className="text-sm text-muted-foreground">Appeared in 5 sessions</p>
            </div>
            <div className="p-4 bg-muted/50 rounded-xl">
              <p className="font-medium mb-2">Notation Issues</p>
              <p className="text-sm text-muted-foreground">Appeared in 2 sessions</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
