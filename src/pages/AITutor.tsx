import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { 
  Upload, 
  MessageCircle, 
  Mic, 
  MicOff, 
  BookOpen, 
  Eye, 
  EyeOff,
  Bot,
  User,
  Volume2,
  VolumeX,
  Send,
  FileText,
  AlertCircle,
  CheckCircle,
  Lightbulb
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Document {
  id: string;
  filename: string;
  analysis: string;
}

interface ChatMessage {
  user: string;
  ai: string;
  timestamp: string;
}

interface WorkAnalysis {
  correct: string;
  errors: string[];
  suggestions: string[];
  concepts: string[];
}

const AITutor: React.FC = () => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [currentWork, setCurrentWork] = useState<string>('');
  const [workAnalysis, setWorkAnalysis] = useState<WorkAnalysis | null>(null);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isChatting, setIsChatting] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { toast } = useToast();

  // Load documents on component mount
  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/health');
      const data = await response.json();
      // In a real app, you'd have an endpoint to get documents
      console.log('AI Tutor status:', data);
    } catch (error) {
      console.error('Error loading documents:', error);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('http://localhost:5000/api/upload-document', {
        method: 'POST',
        body: formData
      });

      const result = await response.json();
      
      if (result.success) {
        setDocuments(prev => [...prev, {
          id: result.document_id,
          filename: result.filename,
          analysis: result.analysis
        }]);
        
        toast({
          title: "Document uploaded successfully!",
          description: `AI tutor now knows about ${result.filename}`,
        });
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Upload failed",
        description: "Could not upload document. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };

  const sendMessage = async (message: string, includeVoice: boolean = false) => {
    if (!message.trim()) return;

    setIsChatting(true);
    
    try {
      const response = await fetch('http://localhost:5000/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: message,
          user_id: 'default',
          include_voice: includeVoice
        })
      });

      if (response.ok) {
        if (includeVoice) {
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
          
          audio.onerror = () => {
            setIsSpeaking(false);
            toast({
              title: "Audio error",
              description: "Failed to play AI response.",
              variant: "destructive"
            });
          };
          
          setIsSpeaking(true);
          await audio.play();
        } else {
          // Handle text response
          const result = await response.json();
          
          setChatMessages(prev => [...prev, {
            user: message,
            ai: result.response,
            timestamp: new Date().toISOString()
          }]);
        }
      } else {
        throw new Error('Chat failed');
      }
    } catch (error) {
      console.error('Chat error:', error);
      toast({
        title: "Chat failed",
        description: "Could not get AI response. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsChatting(false);
    }
  };

  const handleChatSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentMessage.trim()) {
      sendMessage(currentMessage);
      setCurrentMessage('');
    }
  };

  const handleVoiceChat = () => {
    if (currentMessage.trim()) {
      sendMessage(currentMessage, true);
      setCurrentMessage('');
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

  const monitorWork = async () => {
    if (!currentWork) {
      toast({
        title: "No work to monitor",
        description: "Please draw something first.",
        variant: "destructive"
      });
      return;
    }

    setIsMonitoring(true);
    
    try {
      const response = await fetch('http://localhost:5000/api/monitor-work', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          work_image: currentWork,
          user_id: 'default'
        })
      });

      const result = await response.json();
      
      if (result.success) {
        setWorkAnalysis(result.analysis);
        
        toast({
          title: "Work analyzed!",
          description: `Found ${result.errors_detected.length} errors and ${result.suggestions.length} suggestions.`,
        });
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Monitoring error:', error);
      toast({
        title: "Monitoring failed",
        description: "Could not analyze your work. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsMonitoring(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            🤖 AI Math Tutor
          </h1>
          <p className="text-gray-600">
            Upload documents, chat with AI, and get real-time guidance on your math work.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Document Upload & Knowledge Base */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Knowledge Base
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.docx,.txt"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="w-full"
                >
                  {isUploading ? (
                    <>
                      <Upload className="h-4 w-4 mr-2 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Document
                    </>
                  )}
                </Button>
              </div>

              <Separator />

              <div>
                <h3 className="font-semibold mb-2">Loaded Documents:</h3>
                {documents.length === 0 ? (
                  <p className="text-sm text-gray-500">No documents uploaded yet.</p>
                ) : (
                  <div className="space-y-2">
                    {documents.map((doc) => (
                      <div key={doc.id} className="p-2 bg-gray-50 rounded">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4" />
                          <span className="text-sm font-medium">{doc.filename}</span>
                        </div>
                        <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                          {doc.analysis.substring(0, 100)}...
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Chat Interface */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5" />
                Chat with AI Tutor
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="h-64 overflow-y-auto border rounded p-3 bg-gray-50">
                {chatMessages.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center">
                    Start a conversation with your AI tutor!
                  </p>
                ) : (
                  <div className="space-y-3">
                    {chatMessages.map((msg, index) => (
                      <div key={index} className="space-y-2">
                        <div className="flex items-start gap-2">
                          <User className="h-4 w-4 mt-1 text-blue-600" />
                          <div className="bg-blue-100 p-2 rounded text-sm">
                            {msg.user}
                          </div>
                        </div>
                        <div className="flex items-start gap-2">
                          <Bot className="h-4 w-4 mt-1 text-green-600" />
                          <div className="bg-green-100 p-2 rounded text-sm">
                            {msg.ai}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <form onSubmit={handleChatSubmit} className="space-y-2">
                <Textarea
                  value={currentMessage}
                  onChange={(e) => setCurrentMessage(e.target.value)}
                  placeholder="Ask your AI tutor anything..."
                  className="min-h-[60px]"
                />
                <div className="flex gap-2">
                  <Button
                    type="submit"
                    disabled={isChatting || !currentMessage.trim()}
                    className="flex-1"
                  >
                    {isChatting ? (
                      <>
                        <Bot className="h-4 w-4 mr-2 animate-spin" />
                        Thinking...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        Send
                      </>
                    )}
                  </Button>
                  <Button
                    type="button"
                    onClick={handleVoiceChat}
                    disabled={isChatting || isSpeaking || !currentMessage.trim()}
                    variant="outline"
                  >
                    {isSpeaking ? (
                      <VolumeX className="h-4 w-4" />
                    ) : (
                      <Volume2 className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </form>

              {isSpeaking && (
                <div className="flex items-center gap-2 text-sm text-blue-600">
                  <Volume2 className="h-4 w-4 animate-pulse" />
                  <span>AI is speaking...</span>
                  <Button
                    onClick={stopSpeaking}
                    variant="destructive"
                    size="sm"
                  >
                    Stop
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Work Monitoring */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Work Monitor
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <canvas
                  ref={canvasRef}
                  width={300}
                  height={200}
                  className="border rounded bg-white cursor-crosshair"
                  style={{ touchAction: 'none' }}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Draw your math work here for AI analysis
                </p>
              </div>

              <Button
                onClick={monitorWork}
                disabled={isMonitoring || !currentWork}
                className="w-full"
              >
                {isMonitoring ? (
                  <>
                    <Eye className="h-4 w-4 mr-2 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Eye className="h-4 w-4 mr-2" />
                    Analyze Work
                  </>
                )}
              </Button>

              {workAnalysis && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    {workAnalysis.correct === 'true' ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-red-600" />
                    )}
                    <span className="text-sm font-medium">
                      {workAnalysis.correct === 'true' ? 'Work is correct!' : 'Issues detected'}
                    </span>
                  </div>

                  {workAnalysis.errors.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-red-600 mb-1">Errors:</h4>
                      <ul className="text-xs space-y-1">
                        {workAnalysis.errors.map((error, index) => (
                          <li key={index} className="flex items-start gap-1">
                            <AlertCircle className="h-3 w-3 mt-0.5 text-red-500" />
                            {error}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {workAnalysis.suggestions.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-blue-600 mb-1">Suggestions:</h4>
                      <ul className="text-xs space-y-1">
                        {workAnalysis.suggestions.map((suggestion, index) => (
                          <li key={index} className="flex items-start gap-1">
                            <Lightbulb className="h-3 w-3 mt-0.5 text-blue-500" />
                            {suggestion}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AITutor;
