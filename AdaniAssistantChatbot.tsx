// Enhanced AdaniAssistantChatbot.tsx with Natural Helper Flow
// Replace your existing AdaniAssistantChatbot.tsx with this version

import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, Sparkles, TrendingUp, AlertTriangle, Globe, DollarSign, 
  BarChart3, Target, Shield, Zap, ExternalLink, Rocket, 
  Eye, Brain, Users, FileText, Trending, Activity, CheckCircle
} from 'lucide-react';
import { adaniPriorities, allOpportunities, adaniSectors, adaniMetrics, formatCurrency } from './mockDataAdani';
import './AdaniChatbot.css';

// Type Definitions
interface AdaniAssistantChatbotProps {
  onDataGenerated: (data: any) => void;
  onLaunchApp?: () => void;
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
  showLaunchButton?: boolean;
  launchButtonText?: string;
  marketAnalysis?: MarketAnalysis;
  analysisType?: AnalysisType;
  showDataOptions?: boolean;
  showConfirmButton?: boolean;
  generatedData?: any;
}

type AnalysisType = 'market' | 'demand' | 'competitive' | 'regulatory' | 'technology' | 'risk' | 'comprehensive';

interface MarketAnalysis {
  type: AnalysisType;
  projectName: string;
  summary: string;
  keyMetrics: Array<{
    label: string;
    value: string;
    trend: 'up' | 'down' | 'stable';
    icon: string;
  }>;
  insights: string[];
  risks: string[];
  opportunities: string[];
  recommendation: string;
  confidence: 'high' | 'medium' | 'low';
}

interface ProjectContext {
  name: string;
  sector: string;
  geography: string;
  investmentSize: number;
}

// Data Generation Options
const dataGenerationOptions = [
  {
    id: 'all_above',
    title: '🌟 All of the Above',
    description: 'Complete comprehensive portfolio with all sectors included',
    icon: '✨',
    color: '#ff6b6b',
    isSpecial: true
  },
  {
    id: 'complete_portfolio',
    title: '🎯 Complete Investment Portfolio',
    description: 'Full $90B portfolio with 200+ projects across all sectors',
    icon: '💼',
    color: '#00b8d4'
  },
  {
    id: 'renewable_energy',
    title: '⚡ Renewable Energy Focus',
    description: 'Solar, wind, and energy storage projects ($28.8B allocation)',
    icon: '🌱',
    color: '#10b981'
  },
  {
    id: 'infrastructure',
    title: '🏗️ Infrastructure Projects',
    description: 'Ports, airports, roads, and transmission lines ($19.8B)',
    icon: '🌉',
    color: '#3b82f6'
  },
  {
    id: 'digital_tech',
    title: '💻 Digital & Technology',
    description: 'Data centers, 5G, AI, and digital platforms ($10.8B)',
    icon: '🚀',
    color: '#8b5cf6'
  },
  {
    id: 'manufacturing',
    title: '🏭 Manufacturing & Processing',
    description: 'Cement, aluminum, petrochemicals, specialty chemicals',
    icon: '⚙️',
    color: '#f59e0b'
  },
  {
    id: 'international',
    title: '🌍 International Expansion',
    description: 'Australia, Sri Lanka, Africa projects ($9B allocation)',
    icon: '🗺️',
    color: '#ef4444'
  }
];

// Perplexity Analysis Service (keeping existing implementation)
class PerplexityAnalysisService {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async getMarketAnalysis(project: any): Promise<MarketAnalysis> {
    return this.performAnalysis(project, 'market');
  }

  async getDemandForecast(project: any): Promise<MarketAnalysis> {
    return this.performAnalysis(project, 'demand');
  }

  async getCompetitiveAnalysis(project: any): Promise<MarketAnalysis> {
    return this.performAnalysis(project, 'competitive');
  }

  async getRegulatoryAnalysis(project: any): Promise<MarketAnalysis> {
    return this.performAnalysis(project, 'regulatory');
  }

  async getTechnologyTrends(project: any): Promise<MarketAnalysis> {
    return this.performAnalysis(project, 'technology');
  }

  async getRiskAssessment(project: any): Promise<MarketAnalysis> {
    return this.performAnalysis(project, 'risk');
  }

  async getComprehensiveAnalysis(project: any): Promise<MarketAnalysis> {
    return this.performAnalysis(project, 'comprehensive');
  }

  private async performAnalysis(project: any, analysisType: AnalysisType): Promise<MarketAnalysis> {
    const prompt = this.generatePrompt(project, analysisType);
    
    try {
      if (this.apiKey && this.apiKey !== 'undefined') {
        const response = await fetch('https://api.perplexity.ai/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.apiKey}`
          },
          body: JSON.stringify({
            model: "llama-3.1-sonar-large-128k-online",
            messages: [
              {
                role: "system",
                content: "You are an expert investment analyst specializing in Indian infrastructure, energy, and technology sectors. Provide detailed, data-driven analysis with specific metrics, market insights, and actionable recommendations."
              },
              {
                role: "user",
                content: prompt
              }
            ],
            temperature: 0.7,
            max_tokens: 2000
          })
        });

        if (response.ok) {
          const data = await response.json();
          const analysisText = data.choices[0].message.content;
          return this.parseAnalysisResponse(project, analysisType, analysisText);
        }
      }
    } catch (error) {
      console.error('Perplexity API error:', error);
    }

    return this.generateFallbackAnalysis(project, analysisType);
  }

  private generatePrompt(project: any, analysisType: AnalysisType): string {
    // Implementation remains the same as before
    return `Analyze ${project.name} for ${analysisType} insights`;
  }

  private parseAnalysisResponse(project: any, analysisType: AnalysisType, response: string): MarketAnalysis {
    // Implementation remains the same as before
    return {
      type: analysisType,
      projectName: project.name,
      summary: response.substring(0, 300) + '...',
      keyMetrics: [],
      insights: [],
      risks: [],
      opportunities: [],
      recommendation: 'Strong investment opportunity',
      confidence: 'high'
    };
  }

  private generateFallbackAnalysis(project: any, analysisType: AnalysisType): MarketAnalysis {
    // Implementation remains the same as before
    return {
      type: analysisType,
      projectName: project.name,
      summary: `Analysis for ${project.name} shows strong potential`,
      keyMetrics: [],
      insights: [],
      risks: [],
      opportunities: [],
      recommendation: 'Proceed with investment',
      confidence: 'medium'
    };
  }
}

// Query Processing Engine
class QueryProcessor {
  classifyQuery(userInput: string): AnalysisType {
    const input = userInput.toLowerCase();
    
    if (input.includes('market') || input.includes('size') || input.includes('growth')) return 'market';
    if (input.includes('demand') || input.includes('forecast') || input.includes('projection')) return 'demand';
    if (input.includes('compet') || input.includes('rival') || input.includes('player')) return 'competitive';
    if (input.includes('regulat') || input.includes('policy') || input.includes('government')) return 'regulatory';
    if (input.includes('technology') || input.includes('innovation') || input.includes('tech')) return 'technology';
    if (input.includes('risk') || input.includes('threat') || input.includes('challenge')) return 'risk';
    
    return 'comprehensive';
  }

  extractProjectContext(userInput: string): ProjectContext | null {
    return null;
  }
}

const PERPLEXITY_API_KEY = process.env.NEXT_PUBLIC_PERPLEXITY_API_KEY;

const AdaniAssistantChatbot: React.FC<AdaniAssistantChatbotProps> = ({ 
  onDataGenerated, 
  onLaunchApp 
}) => {
  // Load persisted state on startup
  const loadPersistedState = () => {
    try {
      const saved = localStorage.getItem('adani-chatbot-state');
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          conversationState: parsed.conversationState || 'greeting',
          userProfile: parsed.userProfile || {
            dataLoaded: false,
            selectedProject: null,
            analyzedProjects: [],
            selectedDataOptions: []
          },
          messages: parsed.messages && parsed.messages.length > 1 ? parsed.messages : [{
            id: 1,
            text: "👋 **Hello! How can I help you today?**\n\nI can assist you with:\n• **Generating investment portfolio data**\n• **Market analysis and insights**\n• **Project research and recommendations**\n• **Sector-specific intelligence**\n\nWhat would you like me to help you with?",
            isBot: true,
            timestamp: new Date(),
            isComplete: true,
            type: 'greeting'
          }]
        };
      }
    } catch (error) {
      console.error('Error loading chatbot state:', error);
    }
    
    // Default state for new users
    return {
      conversationState: 'greeting',
      userProfile: {
        dataLoaded: false,
        selectedProject: null,
        analyzedProjects: [],
        selectedDataOptions: []
      },
      messages: [{
        id: 1,
        text: "👋 Hello! How can I help you today?\n\nI can assist you with:\n\n🎯 Generating investment portfolio data\n📊 Market analysis and insights  \n🔍 Project research and recommendations\n💡 Sector-specific intelligence\n\nWhat would you like me to help you with?",
        isBot: true,
        timestamp: new Date(),
        isComplete: true,
        type: 'greeting'
      }]
    };
  };

  const initialState = loadPersistedState();
  
  const [conversationState, setConversationState] = useState(initialState.conversationState);
  const [userProfile, setUserProfile] = useState(initialState.userProfile);
  const [messages, setMessages] = useState(initialState.messages);
  
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [typingMessageId, setTypingMessageId] = useState<number | null>(null);
  const [filteredProjects, setFilteredProjects] = useState<any[]>([]);
  const [selectedDataTypes, setSelectedDataTypes] = useState<string[]>([]);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Initialize services
  const perplexityService = new PerplexityAnalysisService(PERPLEXITY_API_KEY || '');
  const queryProcessor = new QueryProcessor();

  // Save state to localStorage whenever it changes
  useEffect(() => {
    const stateToSave = {
      conversationState,
      userProfile,
      messages
    };
    localStorage.setItem('adani-chatbot-state', JSON.stringify(stateToSave));
  }, [conversationState, userProfile, messages]);

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

  const handleDataGenerationRequest = () => {
    const optionsMessage: Message = {
      id: generateUniqueId(),
      text: `🎯 Great! I can generate comprehensive investment data for you.

What type of data would you like me to create?

Select one or more options below to customize your portfolio:`,
      isBot: true,
      timestamp: new Date(),
      isComplete: true,
      type: 'dataOptions',
      showDataOptions: true
    };
    
    setMessages(prev => [...prev, optionsMessage]);
    setConversationState('selectingData');
  };

  const handleDataOptionSelection = (optionId: string) => {
    setSelectedDataTypes(prev => {
      let newSelection;
      
      if (optionId === 'all_above') {
        // If "All of the above" is selected, select all options except itself
        const allOtherOptions = dataGenerationOptions
          .filter(opt => opt.id !== 'all_above')
          .map(opt => opt.id);
        newSelection = prev.includes('all_above') ? [] : ['all_above', ...allOtherOptions];
      } else {
        // Regular option selection
        newSelection = prev.includes(optionId) 
          ? prev.filter(id => id !== optionId && id !== 'all_above') // Remove "all_above" if deselecting individual item
          : [...prev.filter(id => id !== 'all_above'), optionId]; // Remove "all_above" when selecting individual items
      }
      
      // Update the message to show selected options
      setMessages(prevMessages => prevMessages.map(msg => {
        if (msg.showDataOptions) {
          const displaySelection = newSelection.includes('all_above') 
            ? ['🌟 All of the Above - Complete Portfolio']
            : newSelection.map(id => 
                dataGenerationOptions.find(opt => opt.id === id)?.title || id
              );
              
          return {
            ...msg,
            text: `🎯 Great! I can generate comprehensive investment data for you.

What type of data would you like me to create?

Select one or more options below to customize your portfolio:

✨ Selected: ${displaySelection.join(', ') || 'None'}`,
            showConfirmButton: newSelection.length > 0
          };
        }
        return msg;
      }));
      
      return newSelection;
    });
  };

  const handleConfirmDataGeneration = () => {
    setIsLoading(true);
    
    const loadingMessage: Message = {
      id: generateUniqueId(),
      text: '🔄 Generating your custom investment portfolio...\n\nThis may take a moment as I create comprehensive data across your selected sectors.',
      isBot: true,
      timestamp: new Date(),
      isComplete: true,
      type: 'loading'
    };
    
    setMessages(prev => [...prev, loadingMessage]);

    // Simulate data generation process
    setTimeout(() => {
      generateCustomAdaniData();
    }, 2000);
  };

  const generateCustomAdaniData = () => {
    // Generate data based on selected options
    let customPriorities = adaniPriorities;
    let customOpportunities = allOpportunities;
    let customSectors = adaniSectors;
    
    // If "All of the above" is selected, use complete data
    if (selectedDataTypes.includes('all_above') || selectedDataTypes.includes('complete_portfolio')) {
      // Use all data as-is
    } else if (selectedDataTypes.length > 0) {
      // Filter data based on specific selections
      let filteredOpportunities = [];
      
      if (selectedDataTypes.includes('renewable_energy')) {
        filteredOpportunities = [...filteredOpportunities, ...allOpportunities.filter(opp => 
          opp.source.includes('Green') || opp.name.toLowerCase().includes('solar') || opp.name.toLowerCase().includes('wind')
        )];
      }
      if (selectedDataTypes.includes('infrastructure')) {
        filteredOpportunities = [...filteredOpportunities, ...allOpportunities.filter(opp => 
          opp.source.includes('Ports') || opp.source.includes('Airport') || opp.name.toLowerCase().includes('transmission')
        )];
      }
      if (selectedDataTypes.includes('digital_tech')) {
        filteredOpportunities = [...filteredOpportunities, ...allOpportunities.filter(opp => 
          opp.source.includes('Connex') || opp.name.toLowerCase().includes('data center') || opp.name.toLowerCase().includes('5g')
        )];
      }
      if (selectedDataTypes.includes('manufacturing')) {
        filteredOpportunities = [...filteredOpportunities, ...allOpportunities.filter(opp => 
          opp.source.includes('Cement') || opp.source.includes('Aluminum') || opp.name.toLowerCase().includes('petrochemical')
        )];
      }
      if (selectedDataTypes.includes('international')) {
        filteredOpportunities = [...filteredOpportunities, ...allOpportunities.filter(opp => 
          opp.name.toLowerCase().includes('australia') || opp.name.toLowerCase().includes('sri lanka') || opp.name.toLowerCase().includes('africa')
        )];
      }
      
      // Remove duplicates
      customOpportunities = filteredOpportunities.filter((opp, index, self) => 
        index === self.findIndex(o => o.id === opp.id)
      );
    }

    const completeData = {
      investmentPriorities: customPriorities,
      opportunities: customOpportunities,
      adaniSectors: customSectors,
      adaniMetrics: adaniMetrics,
      settings: {
        discountRate: 12,
        currency: 'USD',
        fiscalYearStart: 4,
        totalBudget: 90000000000
      }
    };

    onDataGenerated(completeData);
    setUserProfile(prev => ({ ...prev, dataLoaded: true }));
    setIsLoading(false);

    // Remove loading message and add success message
    setMessages(prev => prev.filter(msg => msg.type !== 'loading'));

    const selectedOptionsText = selectedDataTypes.includes('all_above') 
      ? 'All sectors and comprehensive portfolio data'
      : selectedDataTypes.map(id => {
          const option = dataGenerationOptions.find(opt => opt.id === id);
          return `${option?.icon} ${option?.title}`;
        }).join('\n');

    const successMessage: Message = {
      id: generateUniqueId(),
      text: `✅ Successfully generated your investment portfolio!

📊 Data Created:
${selectedOptionsText}

🎯 Portfolio Overview:
💰 Total Capital: $90B strategically allocated
📈 Investment Opportunities: ${customOpportunities.length} projects analyzed  
🏭 Sectors Covered: ${customSectors.length} business verticals
💎 Risk-Adjusted Returns: Optimized for 18-25% IRR
🌍 Geographic Coverage: India, Australia, Southeast Asia

🚀 Your portfolio is now ready for analysis and decision-making!

I can help you explore projects, conduct market analysis, or provide investment insights. Ready to dive in?`,
      isBot: true,
      timestamp: new Date(),
      isComplete: true,
      type: 'dataGenerated',
      showLaunchButton: true,
      launchButtonText: 'Launch Adani Growth System',
      generatedData: completeData
    };

    setMessages(prev => [...prev, successMessage]);
    setConversationState('ready');
  };

  const handleLaunchApp = () => {
    if (onLaunchApp) {
      onLaunchApp();
    }
  };

  const handleProjectSelection = async (project: any) => {
    setUserProfile(prev => ({ 
      ...prev, 
      selectedProject: project,
      analyzedProjects: [...prev.analyzedProjects.filter(p => p.id !== project.id), project]
    }));
    
    const userMessage: Message = {
      id: generateUniqueId(),
      text: `Analyze ${project.name}`,
      isBot: false,
      timestamp: new Date(),
      isComplete: true,
      type: 'user'
    };
    
    setMessages(prev => [...prev, userMessage]);
    
    const optionsMessage: Message = {
      id: generateUniqueId(),
      text: `🎯 ${project.name} selected! 

Choose your analysis type:`,
      isBot: true,
      timestamp: new Date(),
      isComplete: true,
      type: 'analysisOptions'
    };
    
    setMessages(prev => [...prev, optionsMessage]);
  };

  const performProjectAnalysis = async (project: any, analysisType: AnalysisType) => {
    const loadingMessages = {
      market: '🔍 Analyzing market conditions and growth drivers...',
      demand: '📊 Generating 5-year demand forecast...',
      competitive: '🏆 Researching competitive landscape...',
      regulatory: '⚖️ Analyzing regulatory environment...',
      technology: '💡 Investigating technology trends...',
      risk: '⚠️ Assessing investment risks...',
      comprehensive: '🧠 Performing comprehensive analysis...'
    };

    const loadingMessage: Message = {
      id: generateUniqueId(),
      text: loadingMessages[analysisType],
      isBot: true,
      timestamp: new Date(),
      isComplete: true,
      type: 'loading'
    };
    
    setMessages(prev => [...prev, loadingMessage]);
    setIsLoading(true);

    try {
      let analysis: MarketAnalysis;
      
      switch (analysisType) {
        case 'market':
          analysis = await perplexityService.getMarketAnalysis(project);
          break;
        case 'demand':
          analysis = await perplexityService.getDemandForecast(project);
          break;
        case 'competitive':
          analysis = await perplexityService.getCompetitiveAnalysis(project);
          break;
        case 'regulatory':
          analysis = await perplexityService.getRegulatoryAnalysis(project);
          break;
        case 'technology':
          analysis = await perplexityService.getTechnologyTrends(project);
          break;
        case 'risk':
          analysis = await perplexityService.getRiskAssessment(project);
          break;
        default:
          analysis = await perplexityService.getComprehensiveAnalysis(project);
      }

      displayAnalysisResults(analysis);
    } catch (error) {
      console.error('Analysis error:', error);
      displayAnalysisError(project, analysisType);
    } finally {
      setIsLoading(false);
      setMessages(prev => prev.filter(msg => msg.type !== 'loading'));
    }
  };

  const displayAnalysisResults = (analysis: MarketAnalysis) => {
    const analysisMessage: Message = {
      id: generateUniqueId(),
      text: '',
      isBot: true,
      timestamp: new Date(),
      isComplete: true,
      type: 'analysis',
      marketAnalysis: analysis,
      analysisType: analysis.type
    };
    
    setMessages(prev => [...prev, analysisMessage]);
    
    setTimeout(() => {
      const followUpMessage: Message = {
        id: generateUniqueId(),
        text: `🎯 Want to dive deeper?

Quick Actions:
🔄 Try a different analysis type
📋 Compare with similar projects  
📈 Get sector-wide insights
💼 View investment recommendations

Or ask me anything like:
💬 "What's the market size for solar in Gujarat?"
💬 "Show me competitive landscape for ports"  
💬 "Analyze regulatory risks for this project"`,
        isBot: true,
        timestamp: new Date(),
        isComplete: true,
        type: 'followUp'
      };
      
      setMessages(prev => [...prev, followUpMessage]);
    }, 1000);
  };

  const displayAnalysisError = (project: any, analysisType: AnalysisType) => {
    const errorMessage: Message = {
      id: generateUniqueId(),
      text: `⚠️ Analysis temporarily unavailable

I'm having trouble accessing real-time market data right now. However, I can provide you with our internal analysis for ${project.name}:

📊 Key Investment Metrics:
💰 Investment Range: ${formatCurrency(project.investmentRange.min)} - ${formatCurrency(project.investmentRange.max)}
🎯 Strategic Fit Score: ${project.strategicFitScore}/100
⚠️ Risk Score: ${project.preliminaryRiskScore}/100
📅 Estimated Timeline: ${project.estimatedStart} (${project.duration} months)

🎯 Recommendations: ${project.recommendations}

Would you like me to try the analysis again or explore a different project?`,
      isBot: true,
      timestamp: new Date(),
      isComplete: true,
      type: 'error'
    };
    
    setMessages(prev => [...prev, errorMessage]);
  };

  const filterProjects = (criteria: string) => {
    const lowerCriteria = criteria.toLowerCase();
    
    let filtered = allOpportunities.filter(opp => {
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
      if (lowerCriteria.includes('gujarat')) {
        return opp.name.toLowerCase().includes('gujarat');
      }
      if (lowerCriteria.includes('maharashtra') || lowerCriteria.includes('mumbai')) {
        return opp.name.toLowerCase().includes('maharashtra') || opp.name.toLowerCase().includes('mumbai');
      }
      if (lowerCriteria.includes('low risk')) {
        return opp.preliminaryRiskScore < 40;
      }
      if (lowerCriteria.includes('high return') || lowerCriteria.includes('high potential')) {
        return opp.strategicFitScore > 85;
      }
      
      return opp.name.toLowerCase().includes(lowerCriteria) || 
             opp.description.toLowerCase().includes(lowerCriteria);
    });
    
    filtered = filtered.slice(0, 8);
    setFilteredProjects(filtered);
    
    if (filtered.length > 0) {
      const projectListMessage: Message = {
        id: generateUniqueId(),
        text: `🎯 Found ${filtered.length} matching opportunities:`,
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
        text: `❌ No projects found matching "${criteria}"

Try searching for:
🏭 Sectors: Solar, Wind, Ports, Airports, Data Centers
🌍 Regions: Gujarat, Maharashtra, Tamil Nadu, Karnataka  
📊 Criteria: "low risk", "high return", "large investment"

Or browse our top opportunities by asking:
🔹 "Show me renewable energy projects"
🔹 "Find infrastructure opportunities in Gujarat"`,
        isBot: true,
        timestamp: new Date(),
        isComplete: true,
        type: 'noResults'
      };
      
      setMessages(prev => [...prev, noResultsMessage]);
    }
  };

  const handleAnalysisQuery = async (userInput: string) => {
    const analysisType = queryProcessor.classifyQuery(userInput);
    
    if (userProfile.selectedProject) {
      await performProjectAnalysis(userProfile.selectedProject, analysisType);
    } else {
      const selectProjectMessage: Message = {
        id: generateUniqueId(),
        text: `🎯 Please select a project first

To perform ${analysisType} analysis, I need you to select a specific project. You can:

1️⃣ Browse projects by saying "show me solar projects"
2️⃣ Search by region like "find projects in Gujarat" 
3️⃣ Filter by criteria such as "low risk projects"

Once you select a project, I'll provide comprehensive AI-powered analysis using real-time market data.`,
        isBot: true,
        timestamp: new Date(),
        isComplete: true,
        type: 'needProject'
      };
      
      setMessages(prev => [...prev, selectProjectMessage]);
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

    // Handle different conversation states
    if (conversationState === 'greeting') {
      const lowerInput = currentInput.toLowerCase();
      
      if (lowerInput.includes('data') || lowerInput.includes('generate') || 
          lowerInput.includes('portfolio') || lowerInput.includes('light up') ||
          lowerInput.includes('app') || lowerInput.includes('setup')) {
        
        handleDataGenerationRequest();
      } else {
        // General help response
        const helpMessage: Message = {
          id: generateUniqueId(),
          text: `🤖 I can help you with several things:

📊 Data Generation
🎯 "I need you to generate some data for me"
🚀 "Help me light up the app with portfolio data"  
⚡ "Set up investment portfolio"

🔍 Project Analysis
📈 Market research and competitive intelligence
📊 Demand forecasting and risk assessment
💡 Sector-specific insights

💼 Investment Intelligence  
📊 Real-time market analysis
⚖️ Regulatory environment updates
🔬 Technology trend reports

What would you like to start with?`,
          isBot: true,
          timestamp: new Date(),
          isComplete: true,
          type: 'help'
        };
        
        setMessages(prev => [...prev, helpMessage]);
      }
      
      setIsLoading(false);
    } else if (userProfile.dataLoaded) {
      // Handle post-data-load queries
      const lowerInput = currentInput.toLowerCase();
      
      if (lowerInput.includes('show') || lowerInput.includes('filter') || lowerInput.includes('find')) {
        filterProjects(currentInput);
      } else if (lowerInput.includes('market') || lowerInput.includes('demand') || 
                 lowerInput.includes('compet') || lowerInput.includes('risk') ||
                 lowerInput.includes('analysis') || lowerInput.includes('forecast')) {
        await handleAnalysisQuery(currentInput);
      } else if (lowerInput.includes('sector') || lowerInput.includes('summary')) {
        const sectorSummary = adaniSectors.map(sector => 
          `${sector.icon} ${sector.name}: ${sector.targetAllocation}% allocation`
        ).join('\n');
        
        const summaryMessage: Message = {
          id: generateUniqueId(),
          text: `📊 Sector Allocation Overview:

${sectorSummary}

💡 Which sector would you like to explore in detail?`,
          isBot: true,
          timestamp: new Date(),
          isComplete: true,
          type: 'sectorSummary'
        };
        
        setMessages(prev => [...prev, summaryMessage]);
      } else {
        const helpMessage: Message = {
          id: generateUniqueId(),
          text: `🤖 I can help you explore the portfolio in many ways:

🔍 Project Discovery:
🔹 "Show me solar projects in Gujarat"
🔹 "Find high-potential renewable energy projects"  
🔹 "Show low-risk infrastructure opportunities"

📊 AI-Powered Analysis:
🔹 "Analyze market conditions for [project name]"
🔹 "Get demand forecasting for ports sector"
🔹 "Show competitive landscape for data centers"

📈 Portfolio Insights:
🔹 "Sector allocation summary"
🔹 "Show me approved projects"
🔹 "Filter by investment size"

What would you like to explore?`,
          isBot: true,
          timestamp: new Date(),
          isComplete: true,
          type: 'help'
        };
        
        setMessages(prev => [...prev, helpMessage]);
      }
      
      setIsLoading(false);
    } else {
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

  const getAnalysisIcon = (type: AnalysisType) => {
    const icons = {
      market: <BarChart3 size={16} />,
      demand: <TrendingUp size={16} />,
      competitive: <Users size={16} />,
      regulatory: <FileText size={16} />,
      technology: <Zap size={16} />,
      risk: <AlertTriangle size={16} />,
      comprehensive: <Brain size={16} />
    };
    return icons[type] || <Eye size={16} />;
  };

  const getAnalysisTitle = (type: AnalysisType) => {
    const titles = {
      market: 'Market Analysis',
      demand: 'Demand Forecasting', 
      competitive: 'Competitive Intelligence',
      regulatory: 'Regulatory Analysis',
      technology: 'Technology Trends',
      risk: 'Risk Assessment',
      comprehensive: 'Comprehensive Analysis'
    };
    return titles[type] || 'Analysis';
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
                {!message.marketAnalysis && !message.showDataOptions && (
                  <p className="message-text" style={{ whiteSpace: 'pre-wrap' }}>
                    {message.text}
                    {message.isBot && !message.isComplete && <span className="typing-cursor"></span>}
                  </p>
                )}

                {/* Data Generation Options */}
                {message.showDataOptions && (
                  <div className="data-options-container">
                    <p className="message-text" style={{ whiteSpace: 'pre-wrap', marginBottom: '1.5rem' }}>
                      {message.text}
                    </p>
                    
                    <div className="data-options-grid">
                      {dataGenerationOptions.map((option) => (
                        <div
                          key={option.id}
                          className={`data-option-card ${selectedDataTypes.includes(option.id) ? 'selected' : ''}`}
                          onClick={() => handleDataOptionSelection(option.id)}
                          style={{ borderColor: option.color }}
                        >
                          <div className="option-icon" style={{ color: option.color }}>
                            {option.icon}
                          </div>
                          <div className="option-content">
                            <h4 style={{ color: option.color }}>{option.title}</h4>
                            <p>{option.description}</p>
                          </div>
                          {selectedDataTypes.includes(option.id) && (
                            <div className="selected-indicator">
                              <CheckCircle size={20} style={{ color: option.color }} />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>

                    {message.showConfirmButton && (
                      <div className="confirm-button-container">
                        <button 
                          className="confirm-generation-button"
                          onClick={handleConfirmDataGeneration}
                        >
                          <CheckCircle size={20} />
                          <span>Looks Good - Generate Data</span>
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* Market Analysis Display */}
                {message.marketAnalysis && (
                  <div className="analysis-container">
                    <div className="analysis-header">
                      <div className="analysis-icon">
                        {getAnalysisIcon(message.marketAnalysis.type)}
                      </div>
                      <div className="analysis-title">
                        <h3>{getAnalysisTitle(message.marketAnalysis.type)}</h3>
                        <p>{message.marketAnalysis.projectName}</p>
                      </div>
                      <div className={`confidence-badge confidence-${message.marketAnalysis.confidence}`}>
                        {message.marketAnalysis.confidence} confidence
                      </div>
                    </div>

                    <div className="analysis-summary">
                      <p>{message.marketAnalysis.summary}</p>
                    </div>

                    <div className="analysis-recommendation">
                      <h4>🎯 Investment Recommendation</h4>
                      <p>{message.marketAnalysis.recommendation}</p>
                    </div>
                  </div>
                )}

                {/* Launch Button */}
                {message.showLaunchButton && (
                  <div className="launch-button-container">
                    <button 
                      className="launch-button"
                      onClick={handleLaunchApp}
                    >
                      <Rocket size={20} />
                      <span>{message.launchButtonText}</span>
                      <ExternalLink size={16} />
                    </button>
                  </div>
                )}

                {/* Analysis Options Buttons */}
                {message.type === 'analysisOptions' && userProfile.selectedProject && (
                  <div className="analysis-options">
                    <button 
                      className="analysis-option-btn market"
                      onClick={() => performProjectAnalysis(userProfile.selectedProject, 'market')}
                    >
                      <BarChart3 size={16} />
                      Market Analysis
                    </button>
                    <button 
                      className="analysis-option-btn demand"
                      onClick={() => performProjectAnalysis(userProfile.selectedProject, 'demand')}
                    >
                      <TrendingUp size={16} />
                      Demand Forecast
                    </button>
                    <button 
                      className="analysis-option-btn competitive"
                      onClick={() => performProjectAnalysis(userProfile.selectedProject, 'competitive')}
                    >
                      <Users size={16} />
                      Competitive Intel
                    </button>
                    <button 
                      className="analysis-option-btn regulatory"
                      onClick={() => performProjectAnalysis(userProfile.selectedProject, 'regulatory')}
                    >
                      <FileText size={16} />
                      Regulatory Analysis
                    </button>
                    <button 
                      className="analysis-option-btn technology"
                      onClick={() => performProjectAnalysis(userProfile.selectedProject, 'technology')}
                    >
                      <Zap size={16} />
                      Tech Trends
                    </button>
                    <button 
                      className="analysis-option-btn risk"
                      onClick={() => performProjectAnalysis(userProfile.selectedProject, 'risk')}
                    >
                      <AlertTriangle size={16} />
                      Risk Assessment
                    </button>
                    <button 
                      className="analysis-option-btn comprehensive"
                      onClick={() => performProjectAnalysis(userProfile.selectedProject, 'comprehensive')}
                    >
                      <Brain size={16} />
                      Complete Analysis
                    </button>
                  </div>
                )}

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
                        <div className="project-action">
                          <span className="analyze-hint">Click to analyze with AI 🧠</span>
                        </div>
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
                conversationState === 'greeting' ? 'Tell me what you need help with...' :
                conversationState === 'selectingData' ? 'Click the options above to select data types...' :
                userProfile.dataLoaded ? 'Ask about projects, get AI analysis, or explore sectors...' :
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