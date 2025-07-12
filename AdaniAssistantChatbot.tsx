// components/adani-assistant/AdaniAssistantChatbot.tsx
import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, TrendingUp, AlertTriangle, Globe, DollarSign, BarChart3, Target, Shield, Zap } from 'lucide-react';
import { adaniPriorities, allOpportunities, adaniSectors, adaniMetrics, formatCurrency } from './mockDataAdani';import './AdaniChatbot.css';

interface AdaniAssistantChatbotProps {
  onDataGenerated: (data: any) => void;
}

interface Message {
  id: number;
  text: string;
  isBot: boolean;
  timestamp: Date;
  isComplete: boolean;
  type: string;
  showProjectCards?: boolean;
  projectList?: any[];
}

const PERPLEXITY_API_KEY = process.env.NEXT_PUBLIC_PERPLEXITY_API_KEY;

const AdaniAssistantChatbot: React.FC<AdaniAssistantChatbotProps> = ({ onDataGenerated }) => {
  const [conversationState, setConversationState] = useState('greeting');
  const [userProfile, setUserProfile] = useState({
    userName: '',
    division: '',
    role: '',
    dataLoaded: false,
    selectedProject: null as any
  });
  
  const [messages, setMessages] = useState<Message[]>([{
    id: 1,
    text: "🚀 Welcome to Adani Growth System AI Assistant! I'll help you initialize and explore your $90B investment portfolio. First, what's your name?",
    isBot: true,
    timestamp: new Date(),
    isComplete: true,
    type: 'greeting'
  }]);
  
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [typingMessageId, setTypingMessageId] = useState<number | null>(null);
  const [filteredProjects, setFilteredProjects] = useState<any[]>([]);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const conversationFlow = {
    greeting: {
      nextState: 'division',
      processAnswer: (answer: string) => {
        setUserProfile(prev => ({ ...prev, userName: answer }));
        return `Nice to meet you, ${answer}! Which Adani division or company are you with?`;
      }
    },
    division: {
      nextState: 'role',
      processAnswer: (answer: string) => {
        setUserProfile(prev => ({ ...prev, division: answer }));
        return `Great! ${answer} is at the forefront of our growth initiatives. What's your role?`;
      }
    },
    role: {
      nextState: 'dataGeneration',
      processAnswer: (answer: string) => {
        setUserProfile(prev => ({ ...prev, role: answer }));
        return `Perfect! As ${answer}, you'll have full access to our investment portfolio. Let me initialize the Adani Growth System with our complete portfolio data...`;
      }
    },
    dataGeneration: {
      nextState: 'ready',
      processAnswer: () => {
        // Generate data after a brief delay
        setTimeout(() => generateAdaniData(), 1500);
        return '';
      }
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const generateUniqueId = () => Date.now() + Math.random();

  const typeMessage = (messageId: number, text: string, speed: number = 30, onComplete?: () => void) => {
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    setTypingMessageId(messageId);
    let charIndex = 0;

    const typeChar = () => {
      if (charIndex < text.length) {
        setMessages(prev => prev.map(msg => {
          if (msg.id === messageId) {
            return { ...msg, text: text.slice(0, charIndex + 1) };
          }
          return msg;
        }));
        charIndex++;
        typingTimeoutRef.current = setTimeout(typeChar, speed);
      } else {
        setMessages(prev => prev.map(msg => {
          if (msg.id === messageId) {
            return { ...msg, isComplete: true };
          }
          return msg;
        }));
        setTypingMessageId(null);
        if (onComplete) onComplete();
      }
    };

    typeChar();
  };

  const generateAdaniData = () => {
    // Package the complete mock data
    const completeData = {
      investmentPriorities: adaniPriorities,
      opportunities: allOpportunities,
      adaniSectors: adaniSectors,
      adaniMetrics: adaniMetrics,
      settings: {
        discountRate: 12,
        currency: 'USD',
        fiscalYearStart: 4,
        totalBudget: 90000000000
      }
    };

    // Load data into the main app
    onDataGenerated(completeData);
    setUserProfile(prev => ({ ...prev, dataLoaded: true }));

    const summaryMessage: Message = {
      id: generateUniqueId(),
      text: `✅ Adani Growth System successfully initialized!

📊 **Portfolio Summary:**
- **Total Capital**: $90B across 10 strategic priorities
- **Investment Opportunities**: ${allOpportunities.length} projects
- **Sectors**: ${adaniSectors.length} business verticals
- **Green Energy**: $28.8B (largest allocation)
- **Infrastructure**: $19.8B
- **Digital & Technology**: $10.8B

🎯 Your portfolio is now ready for analysis. What would you like to explore?

You can:
- Filter projects by sector or region
- Deep dive into specific opportunities
- Get market intelligence on any project
- Analyze risks and future trends`,
      isBot: true,
      timestamp: new Date(),
      isComplete: true,
      type: 'dataLoaded'
    };

    setMessages(prev => [...prev, summaryMessage]);
    setConversationState('ready');
  };

  const handleProjectSelection = async (project: any) => {
    setUserProfile(prev => ({ ...prev, selectedProject: project }));
    
    const userMessage: Message = {
      id: generateUniqueId(),
      text: `Tell me about ${project.name}`,
      isBot: false,
      timestamp: new Date(),
      isComplete: true,
      type: 'user'
    };
    
    setMessages(prev => [...prev, userMessage]);
    
    const loadingMessage: Message = {
      id: generateUniqueId(),
      text: `🔍 Analyzing ${project.name} - Getting latest market intelligence...`,
      isBot: true,
      timestamp: new Date(),
      isComplete: true,
      type: 'loading'
    };
    
    setMessages(prev => [...prev, loadingMessage]);
    
    // Call Perplexity API for real-time analysis
    await getProjectAnalysis(project);
  };

  const getProjectAnalysis = async (project: any) => {
    const industry = project.source.includes('Green') ? 'renewable energy' : 
                    project.source.includes('Ports') ? 'port infrastructure' :
                    project.source.includes('Airport') ? 'aviation' : 'infrastructure';
    
    const prompt = `Provide a comprehensive investment analysis for ${project.name} in ${industry} sector in India:
    1. Current market conditions and growth drivers
    2. Competitive landscape and Adani's position
    3. Regulatory environment and government support
    4. Technology trends affecting this sector
    5. Key risks and mitigation strategies
    6. 5-year growth outlook and opportunities
    Focus on specific, actionable insights for investment decisions.`;

    try {
      if (PERPLEXITY_API_KEY) {
        const response = await fetch('https://api.perplexity.ai/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${PERPLEXITY_API_KEY}`
          },
          body: JSON.stringify({
            model: "llama-3.1-sonar-large-128k-online",
            messages: [
              {
                role: "system",
                content: "You are an investment analyst specializing in Indian infrastructure and energy sectors. Provide detailed, data-driven analysis."
              },
              {
                role: "user",
                content: prompt
              }
            ],
            temperature: 0.7,
            max_tokens: 1500
          })
        });

        const data = await response.json();
        const analysis = data.choices[0].message.content;
        
        displayProjectAnalysis(project, analysis);
      } else {
        // Fallback analysis
        displayProjectAnalysis(project, generateFallbackAnalysis(project));
      }
    } catch (error) {
      console.error('Perplexity API error:', error);
      displayProjectAnalysis(project, generateFallbackAnalysis(project));
    }
  };

  const generateFallbackAnalysis = (project: any) => {
    return `📊 **${project.name} - Investment Analysis**

💰 **Investment Details:**
- Investment Range: ${formatCurrency(project.investmentRange.min)} - ${formatCurrency(project.investmentRange.max)}
- Timeline: ${project.estimatedStart} (${project.duration} months)
- Strategic Fit Score: ${project.strategicFitScore}/100
- Risk Score: ${project.preliminaryRiskScore}/100

🌟 **Market Opportunity:**
The ${project.source} sector in India is experiencing rapid growth driven by government initiatives and increasing demand. This project aligns perfectly with India's infrastructure development goals.

📈 **Growth Drivers:**
- Government's infrastructure push with dedicated funding
- Rising demand in the region
- Technology advancement enabling better efficiency
- Strategic location advantages

⚠️ **Key Risks:**
- Regulatory approvals and timeline delays
- Market competition from other players
- Capital intensity and funding requirements
- Execution challenges in scaling

🎯 **Strategic Recommendations:**
${project.recommendations}

🔮 **5-Year Outlook:**
Strong growth potential with expected IRR of 18-25% based on sector trends and Adani's execution capabilities. The project positions Adani as a leader in this segment.`;
  };

  const displayProjectAnalysis = (project: any, analysis: string) => {
    setMessages(prev => prev.filter(msg => msg.type !== 'loading'));
    
    const analysisMessage: Message = {
      id: generateUniqueId(),
      text: analysis,
      isBot: true,
      timestamp: new Date(),
      isComplete: true,
      type: 'analysis'
    };
    
    setMessages(prev => [...prev, analysisMessage]);
    
    // Add follow-up options
    setTimeout(() => {
      const followUpMessage: Message = {
        id: generateUniqueId(),
        text: `Would you like to:
- 🔍 Explore more projects in ${project.source}
- 📊 Compare with similar opportunities
- 💡 Get specific insights (market size, competition, regulations)
- 🚀 View another sector

Just type what you'd like to know more about!`,
        isBot: true,
        timestamp: new Date(),
        isComplete: true,
        type: 'followUp'
      };
      
      setMessages(prev => [...prev, followUpMessage]);
    }, 500);
  };

  const filterProjects = (criteria: string) => {
    const lowerCriteria = criteria.toLowerCase();
    
    let filtered = allOpportunities.filter(opp => {
      // Sector filtering
      if (lowerCriteria.includes('solar') || lowerCriteria.includes('renewable')) {
        return opp.source.includes('Green') || opp.name.toLowerCase().includes('solar');
      }
      if (lowerCriteria.includes('port')) {
        return opp.source.includes('Ports');
      }
      if (lowerCriteria.includes('airport')) {
        return opp.source.includes('Airport');
      }
      if (lowerCriteria.includes('data center')) {
        return opp.source.includes('Connex');
      }
      
      // Region filtering
      if (lowerCriteria.includes('gujarat')) {
        return opp.name.toLowerCase().includes('gujarat');
      }
      if (lowerCriteria.includes('maharashtra') || lowerCriteria.includes('mumbai')) {
        return opp.name.toLowerCase().includes('maharashtra') || opp.name.toLowerCase().includes('mumbai');
      }
      
      // Risk filtering
      if (lowerCriteria.includes('low risk')) {
        return opp.preliminaryRiskScore < 40;
      }
      if (lowerCriteria.includes('high return') || lowerCriteria.includes('high potential')) {
        return opp.strategicFitScore > 85;
      }
      
      // General search
      return opp.name.toLowerCase().includes(lowerCriteria) || 
             opp.description.toLowerCase().includes(lowerCriteria);
    });
    
    // Limit to top 10 for display
    filtered = filtered.slice(0, 10);
    setFilteredProjects(filtered);
    
    if (filtered.length > 0) {
      const projectListMessage: Message = {
        id: generateUniqueId(),
        text: `Found ${filtered.length} matching opportunities:`,
        isBot: true,
        timestamp: new Date(),
        isComplete: true,
        type: 'projectList',
        showProjectCards: true,
        projectList: filtered
      };
      
      setMessages(prev => [...prev, projectListMessage]);
    } else {
      const noResultsMessage: Message = {
        id: generateUniqueId(),
        text: `No projects found matching "${criteria}". Try searching for:
- Sectors: Solar, Wind, Ports, Airports, Data Centers
- Regions: Gujarat, Maharashtra, Tamil Nadu, Karnataka
- Criteria: "low risk", "high return", "large investment"`,
        isBot: true,
        timestamp: new Date(),
        isComplete: true,
        type: 'noResults'
      };
      
      setMessages(prev => [...prev, noResultsMessage]);
    }
  };

  const sendMessage = async () => {
    if (!inputText.trim() || isLoading || typingMessageId) return;

    const userMessage: Message = {
      id: generateUniqueId(),
      text: inputText,
      isBot: false,
      timestamp: new Date(),
      isComplete: true,
      type: 'user'
    };

    setMessages(prev => [...prev, userMessage]);
    const currentInput = inputText;
    setInputText('');
    setIsLoading(true);

    // Handle conversation flow
    if (!userProfile.dataLoaded) {
      const currentFlow = conversationFlow[conversationState as keyof typeof conversationFlow];
      if (currentFlow) {
        const nextMessage = currentFlow.processAnswer(currentInput);
        
        if (nextMessage) {
          const botMessage: Message = {
            id: generateUniqueId(),
            text: '',
            isBot: true,
            timestamp: new Date(),
            isComplete: false,
            type: 'text'
          };

          setMessages(prev => [...prev, botMessage]);

          setTimeout(() => {
            typeMessage(botMessage.id, nextMessage, 20, () => {
              setConversationState(currentFlow.nextState);
              setIsLoading(false);
              
              // Trigger data generation if we've reached that state
              if (currentFlow.nextState === 'dataGeneration') {
                conversationFlow.dataGeneration.processAnswer();
              }
            });
          }, 500);
        } else {
          setIsLoading(false);
        }
      }
    } else {
      // Handle post-data-load queries
      const lowerInput = currentInput.toLowerCase();
      
      if (lowerInput.includes('show') || lowerInput.includes('filter') || lowerInput.includes('find')) {
        filterProjects(currentInput);
      } else if (lowerInput.includes('sector') || lowerInput.includes('summary')) {
        // Show sector summary
        const sectorSummary = adaniSectors.map(sector => 
          `• ${sector.icon} ${sector.name}: ${sector.targetAllocation}% allocation`
        ).join('\n');
        
        const summaryMessage: Message = {
          id: generateUniqueId(),
          text: `📊 **Sector Allocation Overview:**\n\n${sectorSummary}\n\nWhich sector would you like to explore in detail?`,
          isBot: true,
          timestamp: new Date(),
          isComplete: true,
          type: 'sectorSummary'
        };
        
        setMessages(prev => [...prev, summaryMessage]);
      } else {
        // General query - provide guidance
        const helpMessage: Message = {
          id: generateUniqueId(),
          text: `I can help you explore the portfolio. Try:
- "Show me solar projects in Gujarat"
- "Find high-potential renewable energy projects"
- "Show low-risk infrastructure opportunities"
- "What are the port expansion projects?"
- "Show me projects starting in Q1 2025"`,
          isBot: true,
          timestamp: new Date(),
          isComplete: true,
          type: 'help'
        };
        
        setMessages(prev => [...prev, helpMessage]);
      }
      
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTime = (timestamp: Date) => {
    return timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="adani-chatbot">
      <div className="chat-container">
        <div className="messages-container">
          {messages.map((message) => (
            <div key={message.id} className={`message ${message.isBot ? 'bot-message' : 'user-message'}`}>
              {message.isBot && (
                <div className="avatar bot-avatar">
                  <Sparkles size={16} />
                </div>
              )}
              <div className={`message-bubble ${message.isBot ? 'bot-bubble' : 'user-bubble'}`}>
                <p className="message-text" style={{ whiteSpace: 'pre-wrap' }}>
                  {message.text}
                  {message.isBot && !message.isComplete && <span className="typing-cursor"></span>}
                </p>
                
                {/* Project Cards */}
                {message.showProjectCards && message.projectList && (
                  <div className="project-cards-container">
                    {message.projectList.map((project) => (
                      <div
                        key={project.id}
                        className="project-card"
                        onClick={() => handleProjectSelection(project)}
                      >
                        <div className="project-header">
                          <h4>{project.name}</h4>
                          <span className={`project-status ${project.status}`}>
                            {project.status.replace('_', ' ').toUpperCase()}
                          </span>
                        </div>
                        <div className="project-details">
                          <div className="project-metric">
                            <span className="metric-label">Investment:</span>
                            <span className="metric-value">{formatCurrency(project.investmentRange.max)}</span>
                          </div>
                          <div className="project-metric">
                            <span className="metric-label">Strategic Fit:</span>
                            <span className="metric-value">{project.strategicFitScore}%</span>
                          </div>
                          <div className="project-metric">
                            <span className="metric-label">Risk Score:</span>
                            <span className="metric-value risk">{project.preliminaryRiskScore}</span>
                          </div>
                        </div>
                        <p className="project-description">{project.description}</p>
                      </div>
                    ))}
                  </div>
                )}
                
                <p className="message-time">{formatTime(message.timestamp)}</p>
              </div>
              {!message.isBot && (
                <div className="avatar user-avatar">You</div>
              )}
            </div>
          ))}
          
          {isLoading && !typingMessageId && (
            <div className="message bot-message loading-message">
              <div className="avatar bot-avatar">
                <Sparkles size={16} />
              </div>
              <div className="message-bubble bot-bubble">
                <div className="typing-indicator">
                  <div className="dot"></div>
                  <div className="dot"></div>
                  <div className="dot"></div>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="input-area">
        <div className="input-container">
          <div className="input-wrapper">
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={
                conversationState === 'greeting' ? 'Enter your name...' : 
                conversationState === 'division' ? 'Enter your division (e.g., Adani Green Energy)...' :
                conversationState === 'role' ? 'Enter your role...' :
                userProfile.dataLoaded ? 'Ask about projects, sectors, or opportunities...' :
                'Type your message...'
              }
              className="message-input"
              rows={1}
              disabled={isLoading}
            />
          </div>
          <button
            onClick={sendMessage}
            disabled={!inputText.trim() || isLoading}
            className="send-button"
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdaniAssistantChatbot;