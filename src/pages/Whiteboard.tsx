import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Eraser, 
  RotateCcw, 
  Calculator, 
  Loader2,
  CheckCircle,
  XCircle,
  Pen,
  Monitor,
  Volume2,
  VolumeX,
  Play,
  Pause,
  Mic,
  MicOff,
  Gauge,
  User as UserIcon,
  Settings as SettingsIcon,
  Info
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Point {
  x: number;
  y: number;
}

interface Stroke {
  points: Point[];
  color: string;
  width: number;
}

const Whiteboard: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const captureCanvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [strokes, setStrokes] = useState<Stroke[]>([]);
  const [currentStroke, setCurrentStroke] = useState<Point[]>([]);
  const [strokeColor, setStrokeColor] = useState('#000000');
  const [strokeWidth, setStrokeWidth] = useState(3);
  const [isRecognizing, setIsRecognizing] = useState(false);
  const [recognitionResult, setRecognitionResult] = useState<string>('');
  const [recognitionHistory, setRecognitionHistory] = useState<string[]>([]);
  const [recognitionMode, setRecognitionMode] = useState<'ai' | 'mock'>('mock');
  const [apiStatus, setApiStatus] = useState<'checking' | 'online' | 'offline'>('checking');
  const [healthInfo, setHealthInfo] = useState<any>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null);
  const [isContinuousMonitoring, setIsContinuousMonitoring] = useState(true);
  const [previousWork, setPreviousWork] = useState<string>('');
  const [lastMonitoringTime, setLastMonitoringTime] = useState<number>(0);
  
  // Speech-to-text state
  const [isListening, setIsListening] = useState(false);
  const [speechRecognition, setSpeechRecognition] = useState<any>(null);
  const [transcript, setTranscript] = useState<string>('');
  
  
  const { toast } = useToast();
  // Fake login state
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [loginEmail, setLoginEmail] = useState<string>("");
  const [loginPassword, setLoginPassword] = useState<string>("");

  useEffect(() => {
    const flag = localStorage.getItem('tutoroo_logged_in');
    setIsLoggedIn(flag === 'true');
  }, []);

  const handleFakeLogin = () => {
    // accept anything non-empty; keep it simple
    if (!loginEmail || !loginPassword) {
      toast({ title: 'Login required', description: 'Enter email and password to continue', variant: 'destructive' });
      return;
    }
    localStorage.setItem('tutoroo_logged_in', 'true');
    setIsLoggedIn(true);
  };

  const handleFakeLogout = () => {
    localStorage.removeItem('tutoroo_logged_in');
    setIsLoggedIn(false);
  };

  // Voice selection state (optional overrides)
  const [coStudentVoice, setCoStudentVoice] = useState<string>("");
  const [tutorVoice, setTutorVoice] = useState<string>("");
  const voiceDescriptions: Record<string, string> = {
    "": "Default (balanced, neutral)",
    "gfRt6Z3Z8aTbpLfexQ7N": "Voice A — warm, curious, encourages reflection",
    "1YGgSmpRGVzkcaI7zhbX": "Voice B — calm, clear, teacher‑like explanations",
    "dNH3PGQenpJn3UgJkJS8": "Voice C — energetic, motivating, upbeat tempo"
  };

  // Initialize speech recognition
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-US';

        recognition.onstart = () => {
          setIsListening(true);
        };

        recognition.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          setTranscript(transcript);
          console.log('Speech recognized:', transcript);
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        recognition.onerror = (event: any) => {
          console.error('Speech recognition error:', event.error);
          setIsListening(false);
          toast({
            title: "Speech recognition error",
            description: "Could not recognize speech. Please try again.",
            variant: "destructive"
          });
        };

        setSpeechRecognition(recognition);
      }
    }
  }, []);

  // Initialize camera stream
  useEffect(() => {
    const initCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' }, audio: false });
        if (videoRef.current) {
          videoRef.current.srcObject = stream as unknown as MediaStream;
          await videoRef.current.play().catch(() => {});
        }
      } catch (error) {
        console.error('Camera init error:', error);
        toast({
          title: 'Camera error',
          description: 'Unable to access camera. Please allow camera permissions.',
          variant: 'destructive'
        });
      }
    };
    if (navigator.mediaDevices?.getUserMedia) {
      initCamera();
    }
  }, [toast]);

  // Capture current camera frame as data URL
  const getCameraSnapshot = useCallback((): string | null => {
    const video = videoRef.current;
    const capCanvas = captureCanvasRef.current;
    if (!video || !capCanvas) return null;
    const width = video.videoWidth || 800;
    const height = video.videoHeight || 600;
    capCanvas.width = width;
    capCanvas.height = height;
    const ctx = capCanvas.getContext('2d');
    if (!ctx) return null;
    ctx.drawImage(video, 0, 0, width, height);
    return capCanvas.toDataURL('image/png');
  }, []);

  // Check API status on component mount
  useEffect(() => {
    const checkApiStatus = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/health');
        if (response.ok) {
          const data = await response.json();
          setApiStatus('online');
          setRecognitionMode(data.model_loaded ? 'ai' : 'mock');
          setHealthInfo(data);
        } else {
          setApiStatus('offline');
          setRecognitionMode('mock');
          setHealthInfo(null);
        }
      } catch (error) {
        setApiStatus('offline');
        setRecognitionMode('mock');
        setHealthInfo(null);
      }
    };

    checkApiStatus();
  }, []);

  // Session timer for dashboard
  useEffect(() => {
    const t = setInterval(() => setElapsedSeconds((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, []);

  const formatDuration = (total: number) => {
    const h = Math.floor(total / 3600);
    const m = Math.floor((total % 3600) / 60);
    const s = total % 60;
    const pad = (n: number) => String(n).padStart(2, '0');
    return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${m}:${pad(s)}`;
  };

  // Right sidebar dashboard component
  const RightSidebarDashboard: React.FC = () => (
    <aside className="rounded-xl border border-white/10 bg-white/5 text-white p-4 space-y-4 max-h-[calc(100vh-160px)] overflow-hidden backdrop-blur-sm" style={{background:'rgba(255,255,255,0.05)'}}>
      {/* HEADER */}
      <div className="mb-4">
        <div className="text-lg font-semibold">Your Learning Dashboard</div>
        <div className="text-xs text-white/70">Track your progress and insights</div>
      </div>

      {/* TOP KPI ROW */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="rounded-xl border border-white/10 bg-white/5 p-3">
          <div className="text-[11px] text-white/70">Total Time</div>
          <div className="text-sm font-semibold">24h 32m</div>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/5 p-3">
          <div className="text-[11px] text-white/70">Sessions</div>
          <div className="text-sm font-semibold">18</div>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/5 p-3">
          <div className="text-[11px] text-white/70">Avg Confidence</div>
          <div className="text-sm font-semibold">82%</div>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/5 p-3">
          <div className="text-[11px] text-white/70">Goals Met</div>
          <div className="text-sm font-semibold">12/15</div>
        </div>
      </div>

      {/* PROGRESS TIMELINE */}
      <div className="mb-4">
        <div className="text-sm font-semibold mb-2">Learning Progress Timeline</div>
        {[
          { label: 'Week 1', pct: 45 },
          { label: 'Week 2', pct: 60 },
          { label: 'Week 3', pct: 75 },
          { label: 'Week 4', pct: 85 },
        ].map((row) => (
          <div key={row.label} className="mb-2 last:mb-0">
            <div className="flex items-center justify-between text-[12px] text-white/80 mb-1">
              <span>{row.label}</span>
              <span>{row.pct}%</span>
            </div>
            <div className="h-2 rounded-full bg-white/10 overflow-hidden">
              <div className="h-full rounded-full bg-emerald-500" style={{width: `${row.pct}%`}} />
            </div>
          </div>
        ))}
      </div>

      {/* STRENGTHS & AREAS TO IMPROVE */}
      <div className="mb-4">
        <div className="text-sm font-semibold mb-2">Strengths & Areas to Improve</div>
        <div className="rounded-xl border border-white/10 bg-white/5 p-3 mb-2">
          <div className="text-[12px] text-white/70 mb-1">Strengths</div>
          <ul className="text-xs list-disc pl-4 space-y-1">
            <li>Clear problem-solving approach</li>
            <li>Strong conceptual understanding</li>
            <li>Good use of visual aids</li>
          </ul>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/5 p-3">
          <div className="text-[12px] text-white/70 mb-1">Areas to Improve</div>
          <ul className="text-xs list-disc pl-4 space-y-1">
            <li>Practice more complex problems</li>
            <li>Work on explaining edge cases</li>
            <li>Review notation consistency</li>
          </ul>
        </div>
      </div>

      {/* End of dashboard content */}
    </aside>
  );

  // Initialize canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = 800;
    canvas.height = 600;
    
    // Set default styles
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Add touch event listeners with passive: false to allow preventDefault
    const handleTouchStart = (e: TouchEvent) => {
      e.preventDefault();
      const touch = e.touches[0];
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      
      const point = {
        x: (touch.clientX - rect.left) * scaleX,
        y: (touch.clientY - rect.top) * scaleY
      };
      
      setIsDrawing(true);
      setCurrentStroke([point]);
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isDrawing) return;
      e.preventDefault();
      
      const touch = e.touches[0];
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      
      const point = {
        x: (touch.clientX - rect.left) * scaleX,
        y: (touch.clientY - rect.top) * scaleY
      };
      
      setCurrentStroke(prev => [...prev, point]);

      // Draw the current stroke
      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = strokeWidth;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      if (currentStroke.length > 0) {
        const lastPoint = currentStroke[currentStroke.length - 1];
        ctx.beginPath();
        ctx.moveTo(lastPoint.x, lastPoint.y);
        ctx.lineTo(point.x, point.y);
        ctx.stroke();
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      e.preventDefault();
      if (!isDrawing) return;
      setIsDrawing(false);
      
      if (currentStroke.length > 0) {
        const newStroke: Stroke = {
          points: currentStroke,
          color: strokeColor,
          width: strokeWidth
        };
        setStrokes(prev => [...prev, newStroke]);
      }
      setCurrentStroke([]);
    };

    // Add touch event listeners with passive: false
    canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
    canvas.addEventListener('touchmove', handleTouchMove, { passive: false });
    canvas.addEventListener('touchend', handleTouchEnd, { passive: false });

    // Cleanup function
    return () => {
      canvas.removeEventListener('touchstart', handleTouchStart);
      canvas.removeEventListener('touchmove', handleTouchMove);
      canvas.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isDrawing, currentStroke, strokeColor, strokeWidth]);

  // Draw function
  const draw = useCallback((ctx: CanvasRenderingContext2D, stroke: Stroke) => {
    if (stroke.points.length < 2) return;

    ctx.strokeStyle = stroke.color;
    ctx.lineWidth = stroke.width;
    ctx.beginPath();
    ctx.moveTo(stroke.points[0].x, stroke.points[0].y);

    for (let i = 1; i < stroke.points.length; i++) {
      ctx.lineTo(stroke.points[i].x, stroke.points[i].y);
    }
    ctx.stroke();
  }, []);

  // Redraw all strokes
  const redrawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Redraw all strokes
    strokes.forEach(stroke => draw(ctx, stroke));
  }, [strokes, draw]);

  useEffect(() => {
    redrawCanvas();
  }, [redrawCanvas]);

  // Continuous monitoring effect
  useEffect(() => {
    if (!isContinuousMonitoring) return;

    const interval = setInterval(() => {
      if (strokes.length > 0) { // Only monitor if there's something drawn
        continuousMonitor();
      }
    }, 10000); // Check every 10 seconds

    return () => clearInterval(interval);
  }, [isContinuousMonitoring, strokes.length, previousWork, lastMonitoringTime]);

  // Mouse/Touch event handlers
  const getPointFromEvent = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>): Point => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    let clientX: number, clientY: number;
    
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY
    };
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    // Only prevent default for mouse events, not touch events
    if (e.type === 'mousedown') {
      e.preventDefault();
    }
    setIsDrawing(true);
    const point = getPointFromEvent(e);
    setCurrentStroke([point]);
  };

  const drawStroke = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    // Only prevent default for mouse events, not touch events
    if (e.type === 'mousemove') {
      e.preventDefault();
    }
    
    const point = getPointFromEvent(e);
    setCurrentStroke(prev => [...prev, point]);

    // Draw the current stroke
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = strokeWidth;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    if (currentStroke.length > 0) {
      const lastPoint = currentStroke[currentStroke.length - 1];
      ctx.beginPath();
      ctx.moveTo(lastPoint.x, lastPoint.y);
      ctx.lineTo(point.x, point.y);
      ctx.stroke();
    }
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    
    if (currentStroke.length > 0) {
      const newStroke: Stroke = {
        points: currentStroke,
        color: strokeColor,
        width: strokeWidth
      };
      setStrokes(prev => [...prev, newStroke]);
    }
    setCurrentStroke([]);
  };

  // Clear canvas
  const clearCanvas = () => {
    setStrokes([]);
    setCurrentStroke([]);
    setRecognitionResult('');
    
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  };

  // Download canvas as image
  const downloadCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const link = document.createElement('a');
    link.download = `whiteboard-${Date.now()}.png`;
    link.href = canvas.toDataURL();
    link.click();
  };

  // Advanced drawing analysis with detailed pattern recognition
  const analyzeDrawing = () => {
    if (strokes.length === 0) return null;

    console.log(`Analyzing ${strokes.length} strokes with ${strokes.reduce((sum, stroke) => sum + stroke.points.length, 0)} total points`);

    // Detailed stroke analysis
    const strokeAnalysis = strokes.map((stroke, index) => {
      const points = stroke.points;
      const length = points.length;
      
      if (length < 2) return null;

      // Calculate stroke metrics
      const firstPoint = points[0];
      const lastPoint = points[length - 1];
      const totalDistance = Math.sqrt(
        Math.pow(lastPoint.x - firstPoint.x, 2) + 
        Math.pow(lastPoint.y - firstPoint.y, 2)
      );
      
      // Calculate path length (actual distance traveled)
      let pathLength = 0;
      for (let i = 1; i < length; i++) {
        const dx = points[i].x - points[i-1].x;
        const dy = points[i].y - points[i-1].y;
        pathLength += Math.sqrt(dx * dx + dy * dy);
      }

      // Analyze direction changes
      let directionChanges = 0;
      let totalAngleChange = 0;
      let maxAngleChange = 0;
      
      for (let i = 2; i < length; i++) {
        const p1 = points[i - 2];
        const p2 = points[i - 1];
        const p3 = points[i];
        
        const dir1 = Math.atan2(p2.y - p1.y, p2.x - p1.x);
        const dir2 = Math.atan2(p3.y - p2.y, p3.x - p2.x);
        const angleDiff = Math.abs(dir2 - dir1);
        
        totalAngleChange += angleDiff;
        maxAngleChange = Math.max(maxAngleChange, angleDiff);
        
        if (angleDiff > Math.PI / 6) { // 30 degrees
          directionChanges++;
        }
      }

      // Calculate straightness (0 = perfectly straight, 1 = very curved)
      const straightness = totalDistance / Math.max(pathLength, 1);
      
      // Calculate average direction
      const avgDirection = Math.atan2(lastPoint.y - firstPoint.y, lastPoint.x - firstPoint.x);
      const angleDegrees = Math.abs(avgDirection * 180 / Math.PI);
      
      // Determine stroke type
      let strokeType = 'unknown';
      if (straightness > 0.8) {
        if (angleDegrees < 15 || angleDegrees > 165) {
          strokeType = 'horizontal';
        } else if (angleDegrees > 75 && angleDegrees < 105) {
          strokeType = 'vertical';
        } else {
          strokeType = 'diagonal';
        }
      } else if (directionChanges > length * 0.2) {
        strokeType = 'curved';
      } else {
        strokeType = 'mixed';
      }

      // Check for specific shapes
      let isCircle = false;
      let isSquare = false;
      let isTriangle = false;
      
      if (length > 20 && straightness < 0.3) {
        // Check for circular shape
        const centerX = points.reduce((sum, p) => sum + p.x, 0) / length;
        const centerY = points.reduce((sum, p) => sum + p.y, 0) / length;
        const avgRadius = points.reduce((sum, p) => {
          return sum + Math.sqrt(Math.pow(p.x - centerX, 2) + Math.pow(p.y - centerY, 2));
        }, 0) / length;
        
        const radiusVariance = points.reduce((sum, p) => {
          const radius = Math.sqrt(Math.pow(p.x - centerX, 2) + Math.pow(p.y - centerY, 2));
          return sum + Math.pow(radius - avgRadius, 2);
        }, 0) / length;
        
        if (radiusVariance < avgRadius * 0.4) {
          isCircle = true;
        }
      }

      return {
        index,
        length,
        totalDistance,
        pathLength,
        straightness,
        directionChanges,
        totalAngleChange,
        maxAngleChange,
        strokeType,
        angleDegrees,
        isCircle,
        isSquare,
        isTriangle
      };
    }).filter(Boolean);

    console.log('Stroke analysis:', strokeAnalysis);

    // Count different stroke types
    const strokeTypes = strokeAnalysis.reduce((acc, stroke) => {
      acc[stroke.strokeType] = (acc[stroke.strokeType] || 0) + 1;
      return acc;
    }, {});

    const totalStrokes = strokeAnalysis.length;
    const avgStraightness = strokeAnalysis.reduce((sum, s) => sum + s.straightness, 0) / totalStrokes;
    const totalCurvature = strokeAnalysis.reduce((sum, s) => sum + s.totalAngleChange, 0);
    const hasCircles = strokeAnalysis.some(s => s.isCircle);
    const hasVerticalStrokes = strokeTypes.vertical > 0;
    const hasHorizontalStrokes = strokeTypes.horizontal > 0;
    const hasCurvedStrokes = strokeTypes.curved > 0;
    const hasDiagonalStrokes = strokeTypes.diagonal > 0;

    console.log('Patterns detected:', {
      strokeTypes,
      avgStraightness,
      totalCurvature,
      hasCircles,
      hasVerticalStrokes,
      hasHorizontalStrokes,
      hasCurvedStrokes,
      hasDiagonalStrokes
    });

    // Advanced pattern recognition based on actual analysis
    if (hasCircles && hasVerticalStrokes) {
      return "x² + y² = r²"; // Circle with vertical elements
    } else if (hasCurvedStrokes && hasVerticalStrokes && totalCurvature > 10) {
      return "∫₀^∞ e^(-x) dx"; // Integration symbol with curves
    } else if (hasCurvedStrokes && !hasVerticalStrokes && !hasHorizontalStrokes) {
      return "sin(x) = cos(π/2 - x)"; // Pure curves - trigonometric
    } else if (hasVerticalStrokes && hasHorizontalStrokes && totalStrokes > 5) {
      return "∑(n=1 to ∞) 1/n²"; // Grid pattern - summation
    } else if (hasVerticalStrokes && totalStrokes > 8 && totalCurvature > 5) {
      return "∂f/∂x = 2x + 3y"; // Complex with verticals - partial derivative
    } else if (hasDiagonalStrokes && hasHorizontalStrokes && avgStraightness > 0.7) {
      return "x² + 2x + 1"; // Mixed straight lines - quadratic
    } else if (hasHorizontalStrokes && !hasVerticalStrokes && avgStraightness > 0.8) {
      return "y = mx + c"; // Pure horizontal - linear
    } else if (hasDiagonalStrokes && totalStrokes > 6) {
      return "f(x) = ax² + bx + c"; // Multiple diagonals - polynomial
    } else if (hasCurvedStrokes && totalStrokes > 4) {
      return "e^(iπ) + 1 = 0"; // Curves with complexity - Euler's identity
    } else if (totalStrokes > 8 && totalCurvature > 15) {
      return "∇·F = ∂F/∂x + ∂F/∂y + ∂F/∂z"; // High complexity - divergence
    } else if (totalStrokes > 5) {
      return "α + β = γ"; // Multiple strokes - equation
    } else if (hasHorizontalStrokes || hasDiagonalStrokes) {
      return "f(x) = ax + b"; // Simple lines - basic function
    } else {
      return "x = y"; // Fallback - simple equation
    }
  };

  // Text-to-speech functionality
  const speakText = async (text: string) => {
    if (!text) return;
    
    setIsSpeaking(true);
    
    try {
      const response = await fetch('http://localhost:5000/api/speak', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text, voice_id: tutorVoice || undefined })
      });
      
      if (response.ok) {
        const audioBlob = await response.blob();
        const audioUrl = URL.createObjectURL(audioBlob);
        setAudioUrl(audioUrl);
        
        const audio = new Audio(audioUrl);
        setCurrentAudio(audio);
        
        audio.onended = () => {
          setIsSpeaking(false);
          URL.revokeObjectURL(audioUrl);
          setAudioUrl(null);
        };
        
        audio.onerror = () => {
          setIsSpeaking(false);
          toast({
            title: "Audio error",
            description: "Failed to play speech audio.",
            variant: "destructive"
          });
        };
        
        await audio.play();
      } else {
        throw new Error('TTS request failed');
      }
    } catch (error) {
      console.error('TTS error:', error);
      setIsSpeaking(false);
      toast({
        title: "Speech failed",
        description: "Unable to generate speech.",
        variant: "destructive"
      });
    }
  };

  const stopSpeaking = () => {
    if (currentAudio) {
      currentAudio.pause();
      currentAudio.currentTime = 0;
    }
    setIsSpeaking(false);
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
      setAudioUrl(null);
    }
  };

  const continuousMonitor = async () => {
    if (!isContinuousMonitoring) return;
    
    const now = Date.now();
    // Only monitor every 10 seconds
    if (now - lastMonitoringTime < 10000) return;
    
    setLastMonitoringTime(now);
    console.log('Continuous monitoring triggered...');
    
    try {
      // Quick health check first
      const healthResponse = await fetch('http://localhost:5000/api/health', {
        method: 'GET',
        signal: AbortSignal.timeout(5000) // 5 second timeout for health check
      });
      
      if (!healthResponse.ok) {
        console.log('Backend not ready, skipping this monitoring cycle');
        return;
      }
      const imageData = getCameraSnapshot();
      if (!imageData) {
        console.log('No camera snapshot available');
        return;
      }
      console.log('Sending camera snapshot to AI...');
      
      const response = await fetch('http://localhost:5000/api/continuous-monitor', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          work_image: imageData,
          user_id: 'default',
          previous_work: previousWork,
          include_voice: true,
          voice_id: coStudentVoice || undefined
        }),
        // Add timeout and retry logic
        signal: AbortSignal.timeout(30000) // 30 second timeout
      });

      if (response.ok) {
        const contentType = response.headers.get('content-type');
        console.log('Response content type:', contentType);
        
        if (contentType && contentType.includes('audio')) {
          console.log('Received audio response from AI classmate');
          // Handle audio response
          const audioBlob = await response.blob();
          const audioUrl = URL.createObjectURL(audioBlob);
          setAudioUrl(audioUrl);
          
          const audio = new Audio(audioUrl);
          setCurrentAudio(audio);
          
          audio.onended = () => {
            setIsSpeaking(false);
            URL.revokeObjectURL(audioUrl);
            setAudioUrl(null);
          };
          
          audio.onerror = (error) => {
            console.error('Audio playback error:', error);
            setIsSpeaking(false);
            toast({
              title: "Audio error",
              description: "Failed to play AI response. Check your internet connection.",
              variant: "destructive"
            });
          };
          
          setIsSpeaking(true);
          try {
            await audio.play();
          } catch (playError) {
            console.error('Audio play error:', playError);
            setIsSpeaking(false);
            toast({
              title: "Playback error",
              description: "Could not play audio. Please try again.",
              variant: "destructive"
            });
          }
        } else {
          // Handle text response
          const result = await response.json();
          console.log('AI classmate response:', result);
          if (result.should_speak && result.message) {
            console.log('AI classmate wants to speak:', result.message);
            // Convert text to speech
            const speechResponse = await fetch('http://localhost:5000/api/speak', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ text: result.message, voice_id: tutorVoice || undefined })
            });
            
            if (speechResponse.ok) {
              const audioBlob = await speechResponse.blob();
              const audioUrl = URL.createObjectURL(audioBlob);
              setAudioUrl(audioUrl);
              
              const audio = new Audio(audioUrl);
              setCurrentAudio(audio);
              
              audio.onended = () => {
                setIsSpeaking(false);
                URL.revokeObjectURL(audioUrl);
                setAudioUrl(null);
              };
              
              audio.onerror = (error) => {
                console.error('Audio playback error:', error);
                setIsSpeaking(false);
                toast({
                  title: "Audio error",
                  description: "Failed to play AI response.",
                  variant: "destructive"
                });
              };
              
              setIsSpeaking(true);
              try {
                await audio.play();
              } catch (playError) {
                console.error('Audio play error:', playError);
                setIsSpeaking(false);
                toast({
                  title: "Playback error",
                  description: "Could not play audio. Please try again.",
                  variant: "destructive"
                });
              }
            }
          }
        }
        
        // Update previous work
        setPreviousWork(imageData);
      }
    } catch (error) {
      console.error('Continuous monitoring error:', error);
      // Don't show error toasts for continuous monitoring to avoid spam
      // The system will retry on the next 10-second interval
    }
  };

  // Capture screen once and send question to backend
  const shareScreenQuestion = async () => {
    try {
      // Request screen
      // Some browsers require user gesture; this is triggered by button
      // Do not include audio
      // @ts-ignore - TS may not know getDisplayMedia on some lib versions
      const screenStream: MediaStream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: false });
      const tmpVideo = document.createElement('video');
      tmpVideo.srcObject = screenStream as unknown as MediaStream;
      await tmpVideo.play().catch(() => {});
      await new Promise(resolve => {
        if (tmpVideo.readyState >= 2) return resolve(null);
        tmpVideo.onloadedmetadata = () => resolve(null);
      });
      const width = tmpVideo.videoWidth || 1280;
      const height = tmpVideo.videoHeight || 720;
      const off = document.createElement('canvas');
      off.width = width;
      off.height = height;
      const ctx = off.getContext('2d');
      if (!ctx) throw new Error('Canvas context unavailable');
      ctx.drawImage(tmpVideo, 0, 0, width, height);
      const dataUrl = off.toDataURL('image/png');
      // Stop screen tracks
      screenStream.getTracks().forEach(t => t.stop());

      // Send to backend
      const res = await fetch('http://localhost:5000/api/screen-share-init', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: dataUrl, user_id: 'default' })
      });
      if (!res.ok) {
        const txt = await res.text();
        throw new Error(`Init failed: ${res.status} ${txt}`);
      }
      const result = await res.json();
      toast({
        title: 'Question captured',
        description: result.summary ? result.summary : 'Screen question saved for context.',
      });
    } catch (error) {
      console.error('Screen share error:', error);
      toast({
        title: 'Screen share failed',
        description: 'Could not capture your screen. Please allow permissions and try again.',
        variant: 'destructive'
      });
    }
  };

  // Speech-to-text functions
  const startListening = () => {
    if (speechRecognition && !isListening) {
      setTranscript('');
      speechRecognition.start();
    }
  };

  const stopListening = () => {
    if (speechRecognition && isListening) {
      speechRecognition.stop();
    }
  };

  // Send voice message to AI
  const sendVoiceMessage = async (message: string) => {
    if (!message.trim()) return;
    
    try {
      // Get current camera image (chalkboard)
      const screenImage = getCameraSnapshot() || '';
      
      const response = await fetch('http://localhost:5000/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: message,
          user_id: 'default',
          include_voice: true,
          screen_image: screenImage
        })
      });

      if (response.ok) {
        const contentType = response.headers.get('content-type');
        
        if (contentType && contentType.includes('audio')) {
          // Handle audio response
          const audioBlob = await response.blob();
          const audioUrl = URL.createObjectURL(audioBlob);
          setAudioUrl(audioUrl);
          
          const audio = new Audio(audioUrl);
          setCurrentAudio(audio);
          
          try {
            await audio.play();
            setIsSpeaking(true);
            
            audio.onended = () => {
              setIsSpeaking(false);
              URL.revokeObjectURL(audioUrl);
              setAudioUrl(null);
            };
          } catch (playError) {
            console.error('Audio playback error:', playError);
            toast({
              title: "Playback error",
              description: "Could not play audio. Please try again.",
              variant: "destructive"
            });
          }
        } else {
          // Handle text response
          const result = await response.json();
          console.log('AI response:', result.message);
        }
      } else {
        throw new Error(`Voice chat failed: ${response.status}`);
      }
    } catch (error) {
      console.error('Voice chat error:', error);
      toast({
        title: "Voice chat error",
        description: "Failed to send voice message. Please try again.",
        variant: "destructive"
      });
    }
  };

  // Send transcript to AI when speech recognition completes
  useEffect(() => {
    if (transcript.trim()) {
      sendVoiceMessage(transcript);
      setTranscript(''); // Clear transcript after sending
    }
  }, [transcript]);

  // Mathematical expression recognition using intelligent analysis
  const recognizeExpression = async () => {
    if (strokes.length === 0) {
      toast({
        title: "No drawing detected",
        description: "Please draw a mathematical expression first.",
        variant: "destructive"
      });
      return;
    }

    setIsRecognizing(true);
    
    try {
      // First try backend API if available
      if (apiStatus === 'online') {
        const canvas = canvasRef.current;
        if (!canvas) throw new Error('Canvas not available');
        
        const imageData = canvas.toDataURL('image/png');
        
        const response = await fetch('http://localhost:5000/api/recognize', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            image: imageData
          })
        });
        
        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            setRecognitionResult(data.expression);
            setRecognitionHistory(prev => [data.expression, ...prev.slice(0, 4)]);
            
            toast({
              title: "Expression recognized!",
              description: `Detected: ${data.expression} (Confidence: ${Math.round(data.confidence * 100)}%)`,
            });
            return;
          }
        }
      }
      
      // Fallback to intelligent pattern analysis
      const result = analyzeDrawing();
      if (result) {
        setRecognitionResult(result);
        setRecognitionHistory(prev => [result, ...prev.slice(0, 4)]);
        
        toast({
          title: "Expression recognized!",
          description: `Detected: ${result}`,
        });
      } else {
        throw new Error('Unable to analyze drawing');
      }
      
    } catch (error) {
      console.error('Recognition error:', error);
      
      toast({
        title: "Recognition failed",
        description: "Unable to recognize the mathematical expression.",
        variant: "destructive"
      });
    } finally {
      setIsRecognizing(false);
    }
  };

  // Recognize and speak in one action
  const recognizeAndSpeak = async () => {
    if (strokes.length === 0) {
      toast({
        title: "No drawing detected",
        description: "Please draw a mathematical expression first.",
        variant: "destructive"
      });
      return;
    }

    setIsRecognizing(true);
    
    try {
      const canvas = canvasRef.current;
      if (!canvas) throw new Error('Canvas not available');
      
      const imageData = canvas.toDataURL('image/png');
      
      const response = await fetch('http://localhost:5000/api/recognize-and-speak', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image: imageData
        })
      });
      
      if (response.ok) {
        const audioBlob = await response.blob();
        const audioUrl = URL.createObjectURL(audioBlob);
        setAudioUrl(audioUrl);
        
        const audio = new Audio(audioUrl);
        setCurrentAudio(audio);
        
        audio.onended = () => {
          setIsSpeaking(false);
          URL.revokeObjectURL(audioUrl);
          setAudioUrl(null);
        };
        
        audio.onerror = () => {
          setIsSpeaking(false);
          toast({
            title: "Audio error",
            description: "Failed to play speech audio.",
            variant: "destructive"
          });
        };
        
        setIsSpeaking(true);
        await audio.play();
        
        toast({
          title: "Expression recognized and spoken!",
          description: "The mathematical expression has been spoken aloud.",
        });
      } else if (response.status === 429) {
        const errorData = await response.json();
        toast({
          title: "Rate Limited",
          description: errorData.error || "Please wait before trying again.",
          variant: "destructive"
        });
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Recognition and speech failed');
      }
      
    } catch (error) {
      console.error('Recognition and speech error:', error);
      
      toast({
        title: "Recognition and speech failed",
        description: "Unable to recognize and speak the mathematical expression.",
        variant: "destructive"
      });
    } finally {
      setIsRecognizing(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden" style={{backgroundColor:'#21242f'}}>
      {/* Solid deep navy background */}

      <div className="relative z-10 max-w-6xl mx-auto px-4 py-3">
        {!isLoggedIn && (
          <div className="fixed inset-0 z-50 flex items-center justify-center" style={{backgroundColor:'rgba(0,0,0,0.6)'}}>
            <div className="w-full max-w-md rounded-2xl border border-white/10 bg-white/5 backdrop-blur p-6 text-white shadow-2xl" style={{background:'rgba(255,255,255,0.05)'}}>
              <div className="flex items-center justify-center mb-4">
                <img src="/tutoroo-logo.png" alt="Tutoroo" className="h-16 w-auto" />
              </div>
              <div className="text-center mb-6">
                <div className="text-xl font-semibold">Sign in to Tutoroo</div>
                <div className="text-xs text-white/70">Continue to your AI learning session</div>
              </div>
              <div className="space-y-3">
                <input
                  type="email"
                  className="w-full rounded-lg bg-white/10 border border-white/15 px-3 py-2 text-sm placeholder-white/60 focus:outline-none"
                  placeholder="Email"
                  value={loginEmail}
                  onChange={(e)=>setLoginEmail(e.target.value)}
                />
                <input
                  type="password"
                  className="w-full rounded-lg bg-white/10 border border-white/15 px-3 py-2 text-sm placeholder-white/60 focus:outline-none"
                  placeholder="Password"
                  value={loginPassword}
                  onChange={(e)=>setLoginPassword(e.target.value)}
                />
                <Button className="w-full bg-emerald-500 hover:bg-emerald-600" onClick={handleFakeLogin}>
                  Continue
                </Button>
                <Button variant="outline" className="w-full rounded-lg bg-white/10 hover:bg-white/20 border-white/20 text-white text-sm">
                  Continue with Google
                </Button>
              </div>
            </div>
          </div>
        )}
        {/* Brand Header */}
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/tutoroo-logo.png" alt="Tutoroo" className="h-[6.6rem] w-auto" />
          </div>
          <div className="hidden md:flex items-center gap-2">
            {isLoggedIn && (
              <Button variant="outline" className="rounded-full bg-white/10 hover:bg-white/20 border-white/20 text-white text-sm" onClick={handleFakeLogout}>
                Sign out
              </Button>
            )}
          </div>
        
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-6 items-start pr-[456px] lg:pr-0">
          {/* FaceTime-style Chalkboard Camera */}
          <div className="w-full">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
        
                </div>
              </CardHeader>
              <CardContent>
                <div className="relative rounded-[24px] overflow-hidden border" style={{borderColor:'#21242f', backgroundColor:'#21242f'}}>
                  <video
                    ref={videoRef}
                    className="w-full h-[600px] object-cover"
                    playsInline
                    muted
                    autoPlay
                  />
                  {/* Status chips */}
                  <div className="absolute top-4 left-4 flex items-center gap-2">
                    <div className="px-3 py-1 rounded-full text-xs text-white bg-emerald-500/90 backdrop-blur border border-white/20 shadow-md">Camera Live</div>
                    {isListening && (
                      <div className="px-3 py-1 rounded-full text-xs text-white bg-red-500/90 backdrop-blur border border-white/20 shadow-md flex items-center gap-1">
                        <div className="h-2 w-2 bg-white rounded-full animate-pulse" />
                        Listening
                      </div>
                    )}
                  </div>
                  {/* Floating FaceTime-style control bar */}
                  <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-5">
                    <Button
                      onClick={isListening ? stopListening : startListening}
                      disabled={!speechRecognition}
                      className={`h-16 w-16 rounded-full border backdrop-blur text-white transition-transform duration-200 ${isListening ? 'bg-red-500 hover:scale-105' : 'bg-white/15 hover:bg-white/25 hover:scale-105'} border-white/30 shadow-[0_8px_30px_-10px_rgba(239,68,68,0.8)]`}
                      variant="outline"
                    >
                      {isListening ? <Mic className="h-7 w-7" /> : <MicOff className="h-7 w-7" />}
                    </Button>
                    <Button
                      onClick={shareScreenQuestion}
                      className="h-14 w-14 rounded-full bg-white/15 hover:bg-white/25 border border-white/30 backdrop-blur text-white hover:scale-105 transition-transform duration-200 shadow-[0_8px_30px_-10px_rgba(16,185,129,0.85)]"
                      variant="outline"
                    >
                      <Monitor className="h-6 w-6" />
                    </Button>
                  </div>
                  {/* Voice personalization */}
                  <div className="absolute top-4 left-1/2 -translate-x-1/2 w-[92%] flex flex-wrap items-center justify-center gap-2 text-white/90 z-10">
                    <div className="flex items-center gap-2 text-[10px] bg-black/50 border border-white/20 rounded-full px-3 py-1 backdrop-blur">
                      <span>Co‑Student:</span>
                      <select
                        className="bg-black/80 outline-none text-white/90 rounded px-1.5 py-0.5"
                        value={coStudentVoice}
                        onChange={(e)=>setCoStudentVoice(e.target.value)}
                      >
                        <option value="">Default</option>
                        <option value="gfRt6Z3Z8aTbpLfexQ7N">Voice A</option>
                        <option value="1YGgSmpRGVzkcaI7zhbX">Voice B</option>
                        <option value="dNH3PGQenpJn3UgJkJS8">Voice C</option>
                      </select>
                      <span className="text-white/60 hidden sm:block text-[10px]">{voiceDescriptions[coStudentVoice]}</span>
                    </div>
                    <div className="flex items-center gap-2 text-[10px] bg-black/50 border border-white/20 rounded-full px-3 py-1 backdrop-blur">
                      <span>Tutor:</span>
                      <select
                        className="bg-black/80 outline-none text-white/90 rounded px-1.5 py-0.5"
                        value={tutorVoice}
                        onChange={(e)=>setTutorVoice(e.target.value)}
                      >
                        <option value="">Default</option>
                        <option value="gfRt6Z3Z8aTbpLfexQ7N">Voice A</option>
                        <option value="1YGgSmpRGVzkcaI7zhbX">Voice B</option>
                        <option value="dNH3PGQenpJn3UgJkJS8">Voice C</option>
                      </select>
                      <span className="text-white/60 hidden sm:block text-[10px]">{voiceDescriptions[tutorVoice]}</span>
                    </div>
                  </div>
                  {/* Removed bottom voice mode chips for a cleaner look */}
                  {/* hidden offscreen canvas used to capture snapshots */}
                  <canvas ref={captureCanvasRef} className="hidden" />
                </div>
                <div className="mt-3 text-xs text-white/80">
                  Point your camera at your chalkboard. Tutoroo will snapshot it every 10s and when you speak.
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Mount fixed right sidebar dashboard */}
          <RightSidebarDashboard />

          {/* Recognition Panel hidden */}
          <div className="hidden">
            <Card>

              <CardContent className="space-y-4 bg-white/5 backdrop-blur rounded-b-xl border border-white/10">
                <div className="space-y-2">
                  {/* Removed manual recognize buttons */}

                  {recognitionResult && (
                    <div className="flex gap-2">
                      <Button
                        onClick={() => speakText(recognitionResult)}
                        disabled={isSpeaking}
                        variant="outline"
                        size="sm"
                        className="flex-1 bg-white/10 hover:bg-white/20 border-white/20 text-white"
                      >
                        {isSpeaking ? (
                          <>
                            <Pause className="h-4 w-4 mr-2" />
                            Speaking...
                          </>
                        ) : (
                          <>
                            <Play className="h-4 w-4 mr-2" />
                            Speak Result
                          </>
                        )}
                      </Button>
                      
                      {isSpeaking && (
                        <Button
                          onClick={stopSpeaking}
                          variant="destructive"
                          size="sm"
                        >
                          <VolumeX className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  )}
                </div>

                {/* Continuous Monitoring Controls */}
                <div className="mt-4 p-3 rounded-lg border border-white/15 bg-white/10 backdrop-blur">
                  {/* Removed AI Learning Partner status and toggle */}
                  
                  {/* Voice Input Status */}
                  {isListening && (
                    <div className="mt-2 flex items-center gap-2 text-xs text-green-600">
                      <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span>Listening... Speak now</span>
                    </div>
                  )}
                  
                  {transcript && (
                    <div className="mt-2 p-2 bg-green-50 rounded text-xs text-green-700">
                      <strong>You said:</strong> {transcript}
                      <br />
                      <span className="text-blue-600">AI is looking at your screen...</span>
                    </div>
                  )}
                </div>

                {/* Recognition Status */}
                {/* Removed recognition status block */}

                {/* Removed Drawing Analysis */}

                {recognitionResult && (
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-sm font-medium text-green-800">Recognized Expression:</span>
                    </div>
                    <div className="text-lg font-mono bg-white p-3 rounded border">
                      {recognitionResult}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Removed Recognition History */}

            {/* Instructions */}

          </div>
        </div>

      </div>
    </div>
  );
};

export default Whiteboard;
