import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { GraduationCap, Lightbulb, TrendingUp, Users, Sparkles, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import heroImage from "@/assets/hero-image.jpg";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/30 to-background">
      <header className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Tutoroo
          </div>
          <nav className="hidden md:flex gap-8">
            <Link to="/" className="text-foreground hover:text-primary transition-colors">
              Home
            </Link>
            <Link to="/dashboard" className="text-foreground hover:text-primary transition-colors">
              Dashboard
            </Link>
            <Link to="/settings" className="text-foreground hover:text-primary transition-colors">
              Settings
            </Link>
          </nav>
          <Link to="/session">
            <Button variant="default">Start Learning</Button>
          </Link>
        </div>
      </header>

      <section className="container mx-auto px-6 py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <div className="inline-block">
              <span className="px-4 py-2 bg-accent/10 text-accent rounded-full text-sm font-medium">
                ✨ AI-Powered Learning
              </span>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold leading-tight">
              Learn deeper by{" "}
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                teaching Tutoroo
              </span>
            </h1>
            <p className="text-xl text-muted-foreground">
              Master complex concepts through interactive conversations. Get guided feedback or teach your AI peer—the choice is yours.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Link to="/session">
                <Button variant="hero" size="lg">
                  Start Learning
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link to="/dashboard">
                <Button variant="outline" size="lg">
                  View Dashboard
                </Button>
              </Link>
            </div>
          </div>
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-accent/20 rounded-3xl blur-3xl"></div>
            <img
              src={heroImage}
              alt="Students learning with AI"
              className="relative rounded-3xl shadow-2xl"
            />
          </div>
        </div>
      </section>

      <section className="container mx-auto px-6 py-20">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4">Two Ways to Learn</h2>
          <p className="text-xl text-muted-foreground">Choose the mode that works best for you</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          <Card className="p-8 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 border-2 border-primary/20">
            <div className="w-16 h-16 bg-gradient-to-br from-primary to-primary/70 rounded-2xl flex items-center justify-center mb-6">
              <GraduationCap className="h-8 w-8 text-primary-foreground" />
            </div>
            <h3 className="text-2xl font-bold mb-4">🎓 Tutor Mode</h3>
            <p className="text-muted-foreground mb-6 leading-relaxed">
              Get step-by-step guidance, hints, and corrections from Tutoroo. Perfect for when you need help understanding new concepts or working through challenging problems.
            </p>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <Sparkles className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <span className="text-sm">Personalized hints and feedback</span>
              </li>
              <li className="flex items-start gap-3">
                <Sparkles className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <span className="text-sm">Step-by-step explanations</span>
              </li>
              <li className="flex items-start gap-3">
                <Sparkles className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <span className="text-sm">Gentle corrections and guidance</span>
              </li>
            </ul>
          </Card>

          <Card className="p-8 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 border-2 border-accent/20">
            <div className="w-16 h-16 bg-gradient-to-br from-accent to-accent/70 rounded-2xl flex items-center justify-center mb-6">
              <Lightbulb className="h-8 w-8 text-accent-foreground" />
            </div>
            <h3 className="text-2xl font-bold mb-4">🤔 Curious Student Mode</h3>
            <p className="text-muted-foreground mb-6 leading-relaxed">
              Teach Tutoroo by explaining your work. The AI asks thoughtful questions to help you solidify your understanding and identify gaps in your knowledge.
            </p>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <Sparkles className="h-5 w-5 text-accent shrink-0 mt-0.5" />
                <span className="text-sm">Questions to deepen thinking</span>
              </li>
              <li className="flex items-start gap-3">
                <Sparkles className="h-5 w-5 text-accent shrink-0 mt-0.5" />
                <span className="text-sm">Learn by teaching</span>
              </li>
              <li className="flex items-start gap-3">
                <Sparkles className="h-5 w-5 text-accent shrink-0 mt-0.5" />
                <span className="text-sm">Build confident explanations</span>
              </li>
            </ul>
          </Card>
        </div>
      </section>

      <section className="container mx-auto px-6 py-20">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4">Why Students Love Tutoroo</h2>
          <p className="text-xl text-muted-foreground">A smarter way to learn and grow</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <Card className="p-6 shadow-lg text-center">
            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4">
              <TrendingUp className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-3">Track Your Progress</h3>
            <p className="text-muted-foreground">
              See your confidence grow with real-time metrics and detailed session insights.
            </p>
          </Card>

          <Card className="p-6 shadow-lg text-center">
            <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Users className="h-6 w-6 text-accent" />
            </div>
            <h3 className="text-xl font-semibold mb-3">Personalized Learning</h3>
            <p className="text-muted-foreground">
              Tutoroo adapts to your pace and learning style for maximum effectiveness.
            </p>
          </Card>

          <Card className="p-6 shadow-lg text-center">
            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Sparkles className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-3">Always Available</h3>
            <p className="text-muted-foreground">
              Get help anytime, anywhere. Your AI learning companion never sleeps.
            </p>
          </Card>
        </div>
      </section>

      <section className="container mx-auto px-6 py-20">
        <Card className="p-12 shadow-2xl bg-gradient-to-br from-primary/5 to-accent/5 border-2 border-primary/10">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <h2 className="text-4xl font-bold">Ready to Transform Your Learning?</h2>
            <p className="text-xl text-muted-foreground">
              Join thousands of students who are learning smarter with Tutoroo
            </p>
            <Link to="/session">
              <Button variant="hero" size="lg">
                Start Your First Session
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </Card>
      </section>

      <footer className="border-t border-border bg-card/50 backdrop-blur-sm mt-20">
        <div className="container mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-muted-foreground text-sm">
              © 2025 Tutoroo. Learn deeper, together.
            </p>
            <div className="flex gap-6">
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors text-sm">
                Privacy
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors text-sm">
                Terms
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors text-sm">
                Support
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
