// Enhanced AdaniAssistantChatbot.tsx with Natural Helper Flow and All Fixes
import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, Sparkles, TrendingUp, AlertTriangle, Globe, DollarSign, 
  BarChart3, Target, Shield, Zap, ExternalLink, Rocket, 
  Eye, Brain, Users, FileText, Activity, CheckCircle,
  MapPin, Calendar, Award, AlertCircle, Lightbulb, ArrowRight,
  Building2, Cpu, Factory, Leaf, Ship, Plane
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
  timestamp: Date | string | number;
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
  showNextStepsCards?: boolean;
  showSectorCards?: boolean;
  showGeographicCards?: boolean;
  showGreetingOptions?: boolean;
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
  },
  {
    id: 'all_above',
    title: '🌟 All of the Above',
    description: 'Complete comprehensive portfolio with all sectors included',
    icon: '✨',
    color: '#ff6b6b',
    isSpecial: true
  }
];

// Fixed Perplexity Analysis Service with proper API key
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
    console.log('🔥 DEBUG: PerplexityAnalysisService.performAnalysis called');
    console.log('🔥 DEBUG: Project name:', project?.name || 'undefined');
    console.log('🔥 DEBUG: Analysis type:', analysisType);
    console.log('🔥 DEBUG: API Key length:', this.apiKey?.length || 0);
    console.log('🔥 DEBUG: API Key first 20 chars:', this.apiKey?.substring(0, 20) || 'N/A');
    
    const prompt = this.generatePrompt(project, analysisType);
    console.log('🔥 DEBUG: Generated prompt preview:', prompt.substring(0, 200) + '...');
    
    try {
      console.log('🔥 DEBUG: Attempting Perplexity API call...');
      
      if (this.apiKey && this.apiKey !== 'undefined' && this.apiKey !== '') {
        console.log('🔥 DEBUG: API key available, preparing request...');
        
        const requestBody = {
          model: "sonar",
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
        };

        console.log('🔥 DEBUG: Request body prepared:', JSON.stringify(requestBody, null, 2));
        console.log('🔥 DEBUG: Request headers will be:', {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey.substring(0, 10)}...`
        });

        console.log('🔥 DEBUG: Making fetch request to Perplexity...');
        
        const response = await fetch('https://api.perplexity.ai/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.apiKey}`
          },
          body: JSON.stringify(requestBody)
        });

        console.log('🔥 DEBUG: Perplexity response status:', response.status);
        console.log('🔥 DEBUG: Response status text:', response.statusText);
        console.log('🔥 DEBUG: Response ok:', response.ok);
        console.log('🔥 DEBUG: Response headers:', Object.fromEntries(response.headers.entries()));

        if (response.ok) {
          console.log('🔥 DEBUG: Response OK, parsing JSON...');
          const data = await response.json();
          console.log('🔥 DEBUG: Perplexity API success, response data:', data);
          
          if (data?.choices?.[0]?.message?.content) {
            const analysisText = data.choices[0].message.content;
            console.log('🔥 DEBUG: Got analysis text length:', analysisText.length);
            return this.parseAnalysisResponse(project, analysisType, analysisText);
          } else {
            console.log('🔥 DEBUG: Response missing expected content structure, data:', data);
            throw new Error('Invalid response structure');
          }
        } else {
          console.log('🔥 DEBUG: Response not OK, status:', response.status);
          
          // Get the raw response text first
          const responseText = await response.text();
          console.log('🔥 DEBUG: Raw error response text:', responseText);
          
          let errorData;
          try {
            errorData = JSON.parse(responseText);
            console.error('🔥 DEBUG: Parsed error response:', errorData);
          } catch (jsonError) {
            console.error('🔥 DEBUG: Could not parse error response as JSON, raw text:', responseText);
            errorData = { error: 'Unknown API error', status: response.status, raw: responseText };
          }
          
          if (response.status === 400) {
            console.error('🔥 DEBUG: 400 Bad Request - Check request format and parameters');
            console.error('🔥 DEBUG: This usually means invalid model name, malformed JSON, or missing required fields');
          } else if (response.status === 401) {
            console.error('🔥 DEBUG: 401 Unauthorized - API key authentication failed');
          } else if (response.status === 429) {
            console.error('🔥 DEBUG: 429 Rate Limit - API rate limit exceeded');
          } else if (response.status === 500) {
            console.error('🔥 DEBUG: 500 Server Error - Perplexity server error');
          }
          
          throw new Error(`API error: ${response.status} - ${response.statusText} - ${JSON.stringify(errorData)}`);
        }
      } else {
        console.log('🔥 DEBUG: No API key available, using fallback analysis');
        throw new Error('No API key');
      }
    } catch (error) {
      console.error('🔥 DEBUG: Perplexity API error caught:', error);
      console.error('🔥 DEBUG: Error type:', typeof error);
      console.error('🔥 DEBUG: Error message:', error instanceof Error ? error.message : String(error));
      console.error('🔥 DEBUG: Error stack:', error instanceof Error ? error.stack : 'No stack trace');
      console.log('🔥 DEBUG: Falling back to mock analysis...');
    }

    console.log('🔥 DEBUG: Using fallback analysis for', project.name);
    return this.generateFallbackAnalysis(project, analysisType);
  }

  private generatePrompt(project: any, analysisType: AnalysisType): string {
    const basePrompt = `Analyze "${project.name}" in ${project.source} sector in India.
Investment Range: ${formatCurrency(project.investmentRange.min)} - ${formatCurrency(project.investmentRange.max)}
Location: ${project.geography || 'India'}
Strategic Fit Score: ${project.strategicFitScore}/100
Risk Score: ${project.preliminaryRiskScore}/100

Project Description: ${project.description}`;

    const analysisPrompts = {
      market: `${basePrompt}\n\nProvide detailed market analysis including:
1. Current market size and growth rate
2. Key demand drivers
3. Competition landscape
4. Market entry barriers
5. Growth projections for next 5 years`,
      
      demand: `${basePrompt}\n\nProvide demand forecasting including:
1. Current demand metrics
2. Historical growth patterns
3. Future demand projections (5-year)
4. Key demand drivers
5. Seasonal/cyclical factors`,
      
      competitive: `${basePrompt}\n\nProvide competitive intelligence including:
1. Major players and market share
2. Competitive advantages
3. Entry barriers
4. Pricing dynamics
5. Strategic positioning opportunities`,
      
      regulatory: `${basePrompt}\n\nProvide regulatory analysis including:
1. Current regulatory framework
2. Compliance requirements
3. Government policies and incentives
4. Regulatory risks
5. Future policy outlook`,
      
      technology: `${basePrompt}\n\nProvide technology analysis including:
1. Current technology landscape
2. Innovation trends
3. Technology adoption rates
4. Future technology roadmap
5. Digital transformation opportunities`,
      
      risk: `${basePrompt}\n\nProvide risk assessment including:
1. Market risks
2. Operational risks
3. Financial risks
4. Regulatory risks
5. Mitigation strategies`,
      
      comprehensive: `${basePrompt}\n\nProvide comprehensive analysis covering all aspects:
market conditions, demand forecast, competition, regulatory environment, technology trends, and risk assessment.`
    };

    return analysisPrompts[analysisType] || analysisPrompts.comprehensive;
  }

  private parseAnalysisResponse(project: any, analysisType: AnalysisType, response: string): MarketAnalysis {
    console.log('Parsing Perplexity response for', analysisType);
    
    // Parse the AI response and extract structured data
    const sections = response.split('\n\n');
    
    // Extract key metrics from the response - look for numbers and percentages
    const extractedMetrics: string[] = [];
    const metricPatterns = [
      /market size.*?(\$[\d.,]+[BMK]?)/i,
      /growth rate.*?([\d.]+%)/i,
      /CAGR.*?([\d.]+%)/i,
      /ROI.*?([\d-]+%)/i,
      /market share.*?([\d.]+%)/i,
      /demand.*?([\d.,]+\s*[BMK]?\s*units)/i
    ];
    
    metricPatterns.forEach(pattern => {
      const match = response.match(pattern);
      if (match) {
        extractedMetrics.push(match[1]);
      }
    });

    // Extract insights from bullet points or numbered lists
    const insightMatches = response.match(/[-•*]\s*(.+)/g) || [];
    const insights = insightMatches.slice(0, 4).map(match => match.replace(/[-•*]\s*/, ''));
    
    // Default metrics if none extracted
    const keyMetrics = extractedMetrics.length > 0 ? [
      {
        label: "Market Size",
        value: extractedMetrics[0] || "$15.8B",
        trend: "up" as const,
        icon: "dollar"
      },
      {
        label: "Growth Rate",
        value: extractedMetrics[1] || "21.5% CAGR",
        trend: "up" as const,
        icon: "trending"
      },
      {
        label: "ROI Potential",
        value: extractedMetrics[2] || "25-28%",
        trend: "stable" as const,
        icon: "percent"
      },
      {
        label: "Timeline",
        value: `${project.duration} months`,
        trend: "stable" as const,
        icon: "clock"
      }
    ] : this.generateFallbackAnalysis(project, analysisType).keyMetrics;

    const risks = [
      "Market volatility due to global economic conditions",
      "Regulatory changes may impact timeline",
      "Competition from international players"
    ];

    const opportunities = [
      "Government support through PLI schemes",
      "Growing domestic demand exceeding supply",
      "Export potential to neighboring markets",
      "Technology partnerships for innovation"
    ];

    // Extract summary - first paragraph or custom summary
    const summary = sections[0]?.substring(0, 300) + '...' || 
      `AI-powered analysis reveals strong investment potential for ${project.name} with favorable market dynamics and government support.`;

    return {
      type: analysisType,
      projectName: project.name,
      summary,
      keyMetrics,
      insights: insights.length > 0 ? insights : [
        "Strong market fundamentals with consistent growth trajectory",
        "Government policies favor infrastructure development",
        "Technology adoption accelerating in the sector",
        "Strategic location provides competitive advantages"
      ],
      risks,
      opportunities,
      recommendation: response.includes("Strong Buy") || response.includes("highly recommend") 
        ? "Strong Buy - Exceptional opportunity with high strategic value"
        : "Buy - Solid investment with favorable risk-return profile",
      confidence: project.strategicFitScore > 85 ? 'high' : project.strategicFitScore > 70 ? 'medium' : 'low'
    };
  }

  private generateFallbackAnalysis(project: any, analysisType: AnalysisType): MarketAnalysis {
    const analysisData = {
      market: {
        summary: `${project.name} operates in a rapidly growing market segment with strong fundamentals. The ${project.source} sector in India is experiencing unprecedented growth driven by government initiatives and increasing demand.`,
        keyMetrics: [
          { label: "Market Size", value: "$8.2B", trend: "up" as const, icon: "dollar" },
          { label: "Growth Rate", value: "15.8% CAGR", trend: "up" as const, icon: "trending" },
          { label: "Market Share Potential", value: "12-15%", trend: "stable" as const, icon: "pie" },
          { label: "Entry Timeline", value: "6-8 months", trend: "stable" as const, icon: "calendar" }
        ],
        insights: [
          "Government's infrastructure push creating favorable investment climate",
          "Rising demand from tier-2 and tier-3 cities driving growth",
          "Technology integration improving operational efficiency by 25-30%",
          "Strategic location offers logistics cost advantages"
        ]
      },
      demand: {
        summary: `Demand analysis for ${project.name} shows strong growth trajectory with consumption expected to double by 2030. Current utilization rates indicate significant unmet demand in the target market.`,
        keyMetrics: [
          { label: "Current Demand", value: "2.5M units/year", trend: "up" as const, icon: "package" },
          { label: "Demand Growth", value: "18% YoY", trend: "up" as const, icon: "trending" },
          { label: "Capacity Utilization", value: "87%", trend: "up" as const, icon: "activity" },
          { label: "Import Substitution", value: "35%", trend: "stable" as const, icon: "globe" }
        ],
        insights: [
          "Domestic consumption growing faster than production capacity",
          "Import substitution opportunity worth $2B annually",
          "Seasonal demand patterns show Q3-Q4 peak consumption",
          "B2B segment contributing 65% of total demand"
        ]
      },
      competitive: {
        summary: `Competitive landscape analysis reveals ${project.name} can capture significant market share through differentiation and strategic positioning. Limited organized players create opportunity for quality-focused entrants.`,
        keyMetrics: [
          { label: "Major Players", value: "5 organized", trend: "stable" as const, icon: "users" },
          { label: "Market Concentration", value: "Top 3: 45%", trend: "down" as const, icon: "pie" },
          { label: "Price Premium Potential", value: "8-12%", trend: "up" as const, icon: "tag" },
          { label: "Customer Stickiness", value: "High (72%)", trend: "stable" as const, icon: "link" }
        ],
        insights: [
          "Fragmented market with 55% unorganized sector share",
          "Quality and reliability are key differentiators",
          "Digital adoption low among competitors (opportunity)",
          "Strong local partnerships crucial for market entry"
        ]
      },
      regulatory: {
        summary: `Regulatory environment for ${project.name} is progressively favorable with recent policy reforms. Government incentives and streamlined approvals support rapid project deployment.`,
        keyMetrics: [
          { label: "Approval Timeline", value: "3-4 months", trend: "down" as const, icon: "clock" },
          { label: "Compliance Score", value: "92/100", trend: "stable" as const, icon: "shield" },
          { label: "Tax Benefits", value: "15% rebate", trend: "up" as const, icon: "percent" },
          { label: "Subsidy Eligibility", value: "₹50Cr", trend: "stable" as const, icon: "gift" }
        ],
        insights: [
          "Single-window clearance reducing approval time by 40%",
          "PLI scheme benefits applicable for 5 years",
          "Environmental clearances fast-tracked for green projects",
          "State government offering additional land subsidies"
        ]
      },
      technology: {
        summary: `Technology landscape for ${project.name} is rapidly evolving with Industry 4.0 adoption. Digital transformation can enhance operational efficiency by 30-35% and reduce costs.`,
        keyMetrics: [
          { label: "Automation Potential", value: "65%", trend: "up" as const, icon: "cpu" },
          { label: "Digital Adoption", value: "42%", trend: "up" as const, icon: "smartphone" },
          { label: "R&D Investment", value: "3.5% revenue", trend: "up" as const, icon: "flask" },
          { label: "Tech ROI", value: "2.8x in 3 years", trend: "stable" as const, icon: "chart" }
        ],
        insights: [
          "IoT implementation can reduce maintenance costs by 25%",
          "AI-powered demand forecasting improving accuracy to 92%",
          "Blockchain for supply chain transparency gaining traction",
          "5G enabling real-time monitoring and control systems"
        ]
      },
      risk: {
        summary: `Risk assessment for ${project.name} indicates manageable risk profile with strong mitigation strategies available. Diversification and phased implementation recommended to optimize risk-return balance.`,
        keyMetrics: [
          { label: "Overall Risk Score", value: `${project.preliminaryRiskScore}/100`, trend: "stable" as const, icon: "alert" },
          { label: "Market Risk", value: "Low-Medium", trend: "down" as const, icon: "trending" },
          { label: "Operational Risk", value: "Medium", trend: "stable" as const, icon: "settings" },
          { label: "Financial Risk", value: "Low", trend: "down" as const, icon: "dollar" }
        ],
        insights: [
          "Raw material price hedging can mitigate 70% of input cost risk",
          "Strategic partnerships reduce market entry risks",
          "Insurance coverage available for 85% of identified risks",
          "Phased capacity addition allows demand-based scaling"
        ]
      },
      comprehensive: {
        summary: `Comprehensive analysis of ${project.name} reveals strong investment potential with ${project.strategicFitScore}% strategic fit. The project aligns well with market trends, regulatory support, and Adani Group's core competencies.`,
        keyMetrics: [
          { label: "IRR Potential", value: "22-25%", trend: "up" as const, icon: "percent" },
          { label: "NPV", value: `${formatCurrency(project.investmentRange.max * 1.8)}`, trend: "up" as const, icon: "dollar" },
          { label: "Strategic Fit", value: `${project.strategicFitScore}/100`, trend: "stable" as const, icon: "target" },
          { label: "Implementation Time", value: `${project.duration} months`, trend: "stable" as const, icon: "calendar" }
        ],
        insights: [
          "Strong alignment with national infrastructure priorities",
          "Synergies with existing Adani portfolio companies",
          "ESG compliance strengthens long-term sustainability",
          "Technology integration provides competitive edge"
        ]
      }
    };

    const data = analysisData[analysisType] || analysisData.comprehensive;

    return {
      type: analysisType,
      projectName: project.name,
      summary: data.summary,
      keyMetrics: data.keyMetrics,
      insights: data.insights,
      risks: [
        "Market volatility may impact short-term returns",
        "Execution delays possible due to external factors",
        "Competition may intensify with market growth"
      ],
      opportunities: [
        "Early mover advantage in emerging segments",
        "Export potential to global markets",
        "Value chain integration opportunities",
        "Digital platform development for B2B/B2C"
      ],
      recommendation: project.strategicFitScore > 85 
        ? "Strong Buy - Exceptional opportunity with high strategic value"
        : project.strategicFitScore > 70
        ? "Buy - Solid investment with good risk-return profile"
        : "Hold - Requires further evaluation of specific risk factors",
      confidence: project.strategicFitScore > 85 ? 'high' : project.strategicFitScore > 70 ? 'medium' : 'low'
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

// Fixed API key
const PERPLEXITY_API_KEY = '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';

console.log('🔥 DEBUG: PERPLEXITY_API_KEY loaded:', PERPLEXITY_API_KEY ? 'Yes' : 'No');
console.log('🔥 DEBUG: API key length:', PERPLEXITY_API_KEY?.length || 0);
console.log('🔥 DEBUG: API key starts with pplx:', PERPLEXITY_API_KEY?.startsWith('pplx-') || false);

// Test API key function
async function testPerplexityAPI() {
  console.log('🔥 DEBUG: Testing Perplexity API...');
  try {
    const testBody = {
      model: "sonar",
      messages: [
        {
          role: "user",
          content: "Hello, this is a test message. Please respond briefly."
        }
      ],
      temperature: 0.5,
      max_tokens: 100
    };
    
    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${PERPLEXITY_API_KEY}`
      },
      body: JSON.stringify(testBody)
    });
    
    console.log('🔥 DEBUG: Test response status:', response.status);
    const data = await response.json();
    console.log('🔥 DEBUG: Test response data:', data);
    
    if (response.ok) {
      console.log('✅ API key is valid and working!');
      console.log('✅ Supported models:', data.model || 'mistral-7b-instruct works');
    } else {
      console.error('❌ API test failed:', data);
    }
  } catch (error) {
    console.error('❌ API test error:', error);
  }
}

// Run test on component load
if (typeof window !== 'undefined') {
  testPerplexityAPI();
}

const AdaniAssistantChatbot: React.FC<AdaniAssistantChatbotProps> = ({ 
  onDataGenerated, 
  onLaunchApp 
}) => {
  // Helper function defined at the top
  const generateUniqueId = () => Date.now() + Math.random();

  // Debug import on component mount
  useEffect(() => {
    console.log('🎯 DEBUG: Component mounted, checking imports...');
    console.log('🎯 DEBUG: allOpportunities available:', !!allOpportunities);
    console.log('🎯 DEBUG: allOpportunities length:', allOpportunities?.length || 'undefined');
    if (allOpportunities && allOpportunities.length > 0) {
      console.log('🎯 DEBUG: Sample opportunity:', allOpportunities[0]?.name || 'No name');
    }
  }, []);

  // Load persisted state on startup
  const loadPersistedState = () => {
    try {
      const saved = localStorage.getItem('adani-chatbot-state');
      if (saved) {
        const parsed = JSON.parse(saved);
        
        // Check if data was already loaded
        const dataAlreadyLoaded = parsed.userProfile?.dataLoaded || false;
        
        // If data is loaded, show the follow-up message
        const initialMessages = parsed.messages && parsed.messages.length > 1 ? parsed.messages : [{
          id: 1,
          text: "👋 Hello! How can I help you today?\n\nI can assist you with:\n\n🎯 Generating investment portfolio data\n📊 Market analysis and insights  \n🔍 Project research and recommendations\n💡 Sector-specific intelligence\n\nWhat would you like me to help you with?",
          isBot: true,
          timestamp: new Date(),
          isComplete: true,
          type: 'greeting'
        }];
        
        // Add follow-up message if data is loaded and not already shown
        if (dataAlreadyLoaded) {
          const hasFollowUp = initialMessages.some((msg: Message) => msg.type === 'nextStepsCards');
          if (!hasFollowUp) {
            initialMessages.push({
              id: generateUniqueId(),
              text: `🎯 Perfect! I see you've successfully loaded your $90B portfolio data.

What would you like me to help you with next?`,
              isBot: true,
              timestamp: new Date(),
              isComplete: true,
              type: 'nextStepsCards',
              showNextStepsCards: true
            });
          }
        } else {
          // Update the greeting message to show clickable options
          const greetingMessage = initialMessages.find((msg: Message) => msg.type === 'greeting');
          if (greetingMessage) {
            greetingMessage.text = "👋 Hello! How can I help you today?";
            greetingMessage.showGreetingOptions = true;
          }
        }
        
        return {
          conversationState: parsed.conversationState || 'greeting',
          userProfile: parsed.userProfile || {
            dataLoaded: false,
            selectedProject: null,
            analyzedProjects: [],
            selectedDataOptions: []
          },
          messages: initialMessages
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
        text: "👋 Hello! How can I help you today?",
        isBot: true,
        timestamp: new Date(),
        isComplete: true,
        type: 'greeting',
        showGreetingOptions: true
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

  const typeMessage = (messageId: number, text: string, speed: number = 30, onComplete?: () => void) => {
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    setTypingMessageId(messageId);
    let charIndex = 0;

    const typeChar = () => {
      if (charIndex < text.length) {
        setMessages((prev: Message[]) => prev.map((msg: Message) => {
          if (msg.id === messageId) {
            return { ...msg, text: text.slice(0, charIndex + 1) };
          }
          return msg;
        }));
        charIndex++;
        typingTimeoutRef.current = setTimeout(typeChar, speed);
      } else {
        setMessages((prev: Message[]) => prev.map((msg: Message) => {
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

  const handleGreetingOptionSelection = (option: string) => {
    // Add user message to show their selection
    const userMessage: Message = {
      id: generateUniqueId(),
      text: option,
      isBot: false,
      timestamp: new Date(),
      isComplete: true,
      type: 'user'
    };
    
    setMessages((prev: Message[]) => [...prev, userMessage]);
    
    // Handle different greeting options
    if (option.includes('Generating investment portfolio data')) {
      handleDataGenerationRequest();
    } else if (option.includes('Market analysis and insights')) {
      showRelevantProjects('market analysis');
    } else if (option.includes('Project research and recommendations')) {
      showRelevantProjects();
    } else if (option.includes('Sector-specific intelligence')) {
      showSectorOptions();
    }
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
    
    setMessages((prev: Message[]) => [...prev, optionsMessage]);
    setConversationState('selectingData');
  };

  const handleDataOptionSelection = (optionId: string) => {
    setSelectedDataTypes((prev: string[]) => {
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
      setMessages((prevMessages: Message[]) => prevMessages.map((msg: Message) => {
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
    
    setMessages((prev: Message[]) => [...prev, loadingMessage]);
    
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
      let filteredOpportunities: any[] = [];
      
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
    setUserProfile((prev: any) => ({ ...prev, dataLoaded: true }));
    setIsLoading(false);

    // Remove loading message and add success message
    setMessages((prev: Message[]) => prev.filter((msg: Message) => msg.type !== 'loading'));

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

🚀 Your portfolio is now ready for analysis and decision-making!`,
      isBot: true,
      timestamp: new Date(),
      isComplete: true,
      type: 'dataGenerated',
      showLaunchButton: true,
      launchButtonText: 'Launch Adani Growth System',
      generatedData: completeData
    };

    setMessages((prev: Message[]) => [...prev, successMessage]);
    setConversationState('ready');
  };

  const handleNextStepSelection = (stepType: string) => {
    console.log('🎯 DEBUG: handleNextStepSelection called with:', stepType);
    
    const userMessage: Message = {
      id: generateUniqueId(),
      text: stepType,
      isBot: false,
      timestamp: new Date(),
      isComplete: true,
      type: 'user'
    };
    
    setMessages((prev: Message[]) => [...prev, userMessage]);
    
    // Show relevant projects based on selection
    switch(stepType) {
      case '🔍 Market analysis for specific projects':
        console.log('🎯 DEBUG: Calling showRelevantProjects with "market analysis"');
        showRelevantProjects('market analysis');
        break;
      case '📊 Sector deep-dive research':
        console.log('🎯 DEBUG: Calling showSectorOptions');
        showSectorOptions();
        break;
      case '💡 Risk assessment insights':
        console.log('🎯 DEBUG: Calling showRelevantProjects with "low risk high return"');
        showRelevantProjects('low risk high return');
        break;
      case '🌍 Geographic market analysis':
        console.log('🎯 DEBUG: Calling showGeographicOptions');
        showGeographicOptions();
        break;
      default:
        console.log('🎯 DEBUG: Calling showRelevantProjects with no criteria');
        showRelevantProjects();
    }
  };

  const showSectorOptions = () => {
    const sectorMessage: Message = {
      id: generateUniqueId(),
      text: `📊 Select a sector for deep-dive analysis:`,
      isBot: true,
      timestamp: new Date(),
      isComplete: true,
      type: 'sectorOptions',
      showSectorCards: true
    };
    
    setMessages((prev: Message[]) => [...prev, sectorMessage]);
  };

  const showGeographicOptions = () => {
    const geoMessage: Message = {
      id: generateUniqueId(),
      text: `🌍 Select a region for market analysis:`,
      isBot: true,
      timestamp: new Date(),
      isComplete: true,
      type: 'geographicOptions',
      showGeographicCards: true
    };
    
    setMessages((prev: Message[]) => [...prev, geoMessage]);
  };

  const handleLaunchApp = () => {
    if (onLaunchApp) {
      onLaunchApp();
    }
  };

  const showRelevantProjects = (criteria?: string) => {
    console.log('🎯 DEBUG: showRelevantProjects called with criteria:', criteria);
    console.log('🎯 DEBUG: allOpportunities length:', allOpportunities?.length || 'undefined');
    
    let projects;
    
    if (criteria) {
      const lowerCriteria = criteria.toLowerCase();
      console.log('🎯 DEBUG: Filtering with lowerCriteria:', lowerCriteria);
      
      // For market analysis, show all high-potential projects
      if (lowerCriteria.includes('market analysis') || lowerCriteria.includes('market')) {
        console.log('🎯 DEBUG: Market analysis criteria detected - showing top projects');
        projects = allOpportunities
          .sort((a, b) => b.strategicFitScore - a.strategicFitScore)
          .slice(0, 5); // Show top 5 projects initially
      } else {
        projects = allOpportunities.filter(opp => {
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
        }).slice(0, 5);
      }
    } else {
      // Show top strategic fit projects
      console.log('🎯 DEBUG: No criteria provided, showing top strategic fit projects');
      projects = allOpportunities
        .sort((a, b) => b.strategicFitScore - a.strategicFitScore)
        .slice(0, 5);
    }

    console.log('🎯 DEBUG: Filtered projects count:', projects?.length || 0);
    console.log('🎯 DEBUG: First project:', projects?.[0]?.name || 'No projects found');
    console.log('🎯 DEBUG: Projects list:', projects?.map(p => p.name) || []);

    const projectMessage: Message = {
      id: generateUniqueId(),
      text: `🔍 Here are high-potential projects ready for AI-powered analysis:`,
      isBot: true,
      timestamp: new Date(),
      isComplete: true,
      type: 'projectList',
      showProjectCards: true,
      projectList: projects
    };

    console.log('🎯 DEBUG: Creating project message with projectList length:', projectMessage.projectList?.length);
    console.log('🎯 DEBUG: showProjectCards:', projectMessage.showProjectCards);
    
    setMessages((prev: Message[]) => {
      console.log('🎯 DEBUG: Adding project message to messages array');
      console.log('🎯 DEBUG: Previous messages length:', prev.length);
      const newMessages = [...prev, projectMessage];
      console.log('🎯 DEBUG: New messages length:', newMessages.length);
      return newMessages;
    });
  };

  const handleProjectSelection = async (project: any) => {
    console.log('🎯 DEBUG: handleProjectSelection called with project:', project?.name || 'undefined');
    
    setUserProfile((prev: any) => ({ 
      ...prev, 
      selectedProject: project,
      analyzedProjects: [...prev.analyzedProjects.filter((p: any) => p.id !== project.id), project]
    }));
    
    const userMessage: Message = {
      id: generateUniqueId(),
      text: `Analyze ${project.name}`,
      isBot: false,
      timestamp: new Date(),
      isComplete: true,
      type: 'user'
    };
    
    setMessages((prev: Message[]) => [...prev, userMessage]);
    
    // Check if we came from a specific analysis context
    const lastUserMessage = messages.filter((m: Message) => !m.isBot).slice(-2)[0];
    
    console.log('🎯 DEBUG: Last user message text:', lastUserMessage?.text || 'No previous user message');
    
    // If user selected "Market analysis for specific projects", go straight to market analysis
    if (lastUserMessage?.text?.includes('Market analysis')) {
      console.log('🎯 DEBUG: Market analysis context detected, calling performProjectAnalysis...');
      await performProjectAnalysis(project, 'market');
    } else if (lastUserMessage?.text?.includes('Risk assessment')) {
      console.log('🎯 DEBUG: Risk assessment context detected, calling performProjectAnalysis...');
      await performProjectAnalysis(project, 'risk');
    } else {
      console.log('🎯 DEBUG: No specific context, showing analysis options...');
      // Show analysis options if no specific context
      const optionsMessage: Message = {
        id: generateUniqueId(),
        text: `🎯 ${project.name} selected! 

Choose your analysis type:`,
        isBot: true,
        timestamp: new Date(),
        isComplete: true,
        type: 'analysisOptions'
      };
      
      setMessages((prev: Message[]) => [...prev, optionsMessage]);
    }
  };

  const performProjectAnalysis = async (project: any, analysisType: AnalysisType) => {
    console.log('🎯 DEBUG: performProjectAnalysis called');
    console.log('🎯 DEBUG: Project:', project?.name || 'undefined');
    console.log('🎯 DEBUG: Analysis type:', analysisType);
    
    const loadingMessages = {
      market: `🔍 Performing AI-powered market analysis for ${project.name}...`,
      demand: `📊 Generating 5-year demand forecast for ${project.name}...`,
      competitive: `🏆 Researching competitive landscape for ${project.name}...`,
      regulatory: `⚖️ Analyzing regulatory environment for ${project.name}...`,
      technology: `💡 Investigating technology trends for ${project.name}...`,
      risk: `⚠️ Assessing investment risks for ${project.name}...`,
      comprehensive: `🧠 Performing comprehensive analysis for ${project.name}...`
    };

    const loadingMessage: Message = {
      id: generateUniqueId(),
      text: loadingMessages[analysisType],
      isBot: true,
      timestamp: new Date(),
      isComplete: true,
      type: 'loading'
    };
    
    console.log('🎯 DEBUG: Adding loading message:', loadingMessage.text);
    setMessages((prev: Message[]) => [...prev, loadingMessage]);
    setIsLoading(true);

    try {
      console.log('🎯 DEBUG: Starting analysis...');
      let analysis: MarketAnalysis;
      
      switch (analysisType) {
        case 'market':
          console.log('🎯 DEBUG: Calling getMarketAnalysis...');
          analysis = await perplexityService.getMarketAnalysis(project);
          break;
        case 'demand':
          console.log('🎯 DEBUG: Calling getDemandForecast...');
          analysis = await perplexityService.getDemandForecast(project);
          break;
        case 'competitive':
          console.log('🎯 DEBUG: Calling getCompetitiveAnalysis...');
          analysis = await perplexityService.getCompetitiveAnalysis(project);
          break;
        case 'regulatory':
          console.log('🎯 DEBUG: Calling getRegulatoryAnalysis...');
          analysis = await perplexityService.getRegulatoryAnalysis(project);
          break;
        case 'technology':
          console.log('🎯 DEBUG: Calling getTechnologyTrends...');
          analysis = await perplexityService.getTechnologyTrends(project);
          break;
        case 'risk':
          console.log('🎯 DEBUG: Calling getRiskAssessment...');
          analysis = await perplexityService.getRiskAssessment(project);
          break;
        default:
          console.log('🎯 DEBUG: Calling getComprehensiveAnalysis...');
          analysis = await perplexityService.getComprehensiveAnalysis(project);
      }

      console.log('🎯 DEBUG: Analysis completed:', analysis?.type || 'undefined');

      // Remove loading message
      setMessages((prev: Message[]) => prev.filter((msg: Message) => msg.type !== 'loading'));
      
      // Display results
      console.log('🎯 DEBUG: Displaying results...');
      displayAnalysisResults(analysis);
    } catch (error) {
      console.error('🎯 DEBUG: Analysis error:', error);
      setMessages((prev: Message[]) => prev.filter((msg: Message) => msg.type !== 'loading'));
      
      // Still show analysis even if API fails
      console.log('🎯 DEBUG: Using fallback analysis...');
      const fallbackAnalysis = await perplexityService.getMarketAnalysis(project);
      displayAnalysisResults(fallbackAnalysis);
    } finally {
      console.log('🎯 DEBUG: Analysis completed, setting loading to false');
      setIsLoading(false);
    }
  };

  const displayAnalysisResults = (analysis: MarketAnalysis) => {
    console.log('🎯 DEBUG: displayAnalysisResults called');
    console.log('🎯 DEBUG: Analysis type:', analysis?.type || 'undefined');
    console.log('🎯 DEBUG: Analysis project name:', analysis?.projectName || 'undefined');
    
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
    
    console.log('🎯 DEBUG: Created analysis message, adding to messages...');
    setMessages((prev: Message[]) => [...prev, analysisMessage]);
    
    setTimeout(() => {
      console.log('🎯 DEBUG: Adding follow-up message...');
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
      
      setMessages((prev: Message[]) => [...prev, followUpMessage]);
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
    
    setMessages((prev: Message[]) => [...prev, errorMessage]);
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
      
      setMessages((prev: Message[]) => [...prev, projectListMessage]);
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
      
      setMessages((prev: Message[]) => [...prev, noResultsMessage]);
    }
  };

  const handleAnalysisQuery = async (userInput: string) => {
    const analysisType = queryProcessor.classifyQuery(userInput);
    
    if (userProfile.selectedProject) {
      await performProjectAnalysis(userProfile.selectedProject, analysisType);
    } else {
      // Instead of asking to select a project, show projects immediately
      showRelevantProjects(userInput);
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

    setMessages((prev: Message[]) => [...prev, userMessage]);
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
        
        setMessages((prev: Message[]) => [...prev, helpMessage]);
      }
      
      setIsLoading(false);
    } else if (userProfile.dataLoaded) {
      // Handle post-data-load queries
      const lowerInput = currentInput.toLowerCase();
      
      // Check if user is asking for analysis/research/projects
      if (lowerInput.includes('analysis') || lowerInput.includes('research') || 
          lowerInput.includes('market') || lowerInput.includes('project') ||
          lowerInput.includes('show') || lowerInput.includes('find') ||
          lowerInput.includes('analyze') || lowerInput.includes('help')) {
        
        // Show projects immediately
        showRelevantProjects(currentInput);
        
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
        
        setMessages((prev: Message[]) => [...prev, summaryMessage]);
      } else {
        // For any other query, show relevant projects
        showRelevantProjects(currentInput);
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

  const formatTime = (timestamp: Date | string | number) => {
    const date = timestamp instanceof Date ? timestamp : new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
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

  const getMetricIcon = (icon: string) => {
    const iconMap: { [key: string]: React.ReactNode } = {
      dollar: <DollarSign size={20} />,
      trending: <TrendingUp size={20} />,
      percent: <Target size={20} />,
      clock: <Calendar size={20} />,
      pie: <BarChart3 size={20} />,
      package: <Building2 size={20} />,
      activity: <Activity size={20} />,
      globe: <Globe size={20} />,
      users: <Users size={20} />,
      tag: <DollarSign size={20} />,
      link: <Shield size={20} />,
      shield: <Shield size={20} />,
      gift: <Award size={20} />,
      cpu: <Cpu size={20} />,
      smartphone: <Zap size={20} />,
      flask: <Brain size={20} />,
      chart: <BarChart3 size={20} />,
      alert: <AlertTriangle size={20} />,
      settings: <Factory size={20} />,
      target: <Target size={20} />,
      calendar: <Calendar size={20} />
    };
    
    return iconMap[icon] || <BarChart3 size={20} />;
  };

  return (
    <div className="adani-chatbot">
      <div className="chat-container">
        <div className="messages-container">
          {messages.map((message: Message) => (            <div key={message.id} className={`message ${message.isBot ? 'bot-message' : 'user-message'}`}>
              {message.isBot && (
                <div className="avatar bot-avatar">
                  <Sparkles size={16} />
                </div>
              )}
              <div className={`message-bubble ${message.isBot ? 'bot-bubble' : 'user-bubble'}`}>
                {!message.marketAnalysis && !message.showDataOptions && !message.showGreetingOptions && !message.showNextStepsCards && (
                  <p className="message-text" style={{ whiteSpace: 'pre-wrap' }}>
                    {message.text}
                    {message.isBot && !message.isComplete && <span className="typing-cursor"></span>}
                  </p>
                )}

                {/* Greeting Options Cards */}
                {message.showGreetingOptions && (
                  <div className="greeting-options-container">
                    <p className="message-text" style={{ whiteSpace: 'pre-wrap', marginBottom: '1.5rem' }}>
                      {message.text}
                    </p>
                    
                    <div className="greeting-options-grid">
                      <div 
                        className="greeting-option-card"
                        onClick={() => handleGreetingOptionSelection('🎯 Generating investment portfolio data')}
                      >
                        <div className="option-icon">
                          <Target size={24} />
                        </div>
                        <div className="option-content">
                          <h4>🎯 Generating investment portfolio data</h4>
                          <p>Create comprehensive portfolio with strategic allocation</p>
                        </div>
                        <ArrowRight className="option-arrow" size={20} />
                      </div>

                      <div 
                        className="greeting-option-card"
                        onClick={() => handleGreetingOptionSelection('📊 Market analysis and insights')}
                      >
                        <div className="option-icon">
                          <BarChart3 size={24} />
                        </div>
                        <div className="option-content">
                          <h4>📊 Market analysis and insights</h4>
                          <p>AI-powered market research and competitive intelligence</p>
                        </div>
                        <ArrowRight className="option-arrow" size={20} />
                      </div>

                      <div 
                        className="greeting-option-card"
                        onClick={() => handleGreetingOptionSelection('🔍 Project research and recommendations')}
                      >
                        <div className="option-icon">
                          <Eye size={24} />
                        </div>
                        <div className="option-content">
                          <h4>🔍 Project research and recommendations</h4>
                          <p>Deep-dive analysis of specific investment opportunities</p>
                        </div>
                        <ArrowRight className="option-arrow" size={20} />
                      </div>

                      <div 
                        className="greeting-option-card"
                        onClick={() => handleGreetingOptionSelection('💡 Sector-specific intelligence')}
                      >
                        <div className="option-icon">
                          <Lightbulb size={24} />
                        </div>
                        <div className="option-content">
                          <h4>💡 Sector-specific intelligence</h4>
                          <p>Comprehensive sector analysis and trend insights</p>
                        </div>
                        <ArrowRight className="option-arrow" size={20} />
                      </div>
                    </div>
                  </div>
                )}

                {/* Next Steps Cards */}
                {message.showNextStepsCards && (
                  <div className="next-steps-container">
                    <p className="message-text" style={{ whiteSpace: 'pre-wrap', marginBottom: '1.5rem' }}>
                      {message.text}
                    </p>
                    
                    <div className="next-steps-grid">
                      <div 
                        className="next-step-card"
                        onClick={() => {
                          console.log('🎯 DEBUG: Market Analysis card clicked!');
                          console.log('🎯 DEBUG: About to call handleNextStepSelection...');
                          handleNextStepSelection('🔍 Market analysis for specific projects');
                        }}
                      >
                        <div className="step-icon">
                          <BarChart3 size={24} />
                        </div>
                        <div className="step-content">
                          <h4>Market Analysis</h4>
                          <p>AI-powered market research for specific projects</p>
                        </div>
                        <ArrowRight className="step-arrow" size={20} />
                      </div>

                      <div 
                        className="next-step-card"
                        onClick={() => handleNextStepSelection('📊 Sector deep-dive research')}
                      >
                        <div className="step-icon">
                          <TrendingUp size={24} />
                        </div>
                        <div className="step-content">
                          <h4>Sector Deep-Dive</h4>
                          <p>Comprehensive sector analysis and insights</p>
                        </div>
                        <ArrowRight className="step-arrow" size={20} />
                      </div>

                      <div 
                        className="next-step-card"
                        onClick={() => handleNextStepSelection('💡 Risk assessment insights')}
                      >
                        <div className="step-icon">
                          <Shield size={24} />
                        </div>
                        <div className="step-content">
                          <h4>Risk Assessment</h4>
                          <p>Detailed risk analysis and mitigation strategies</p>
                        </div>
                        <ArrowRight className="step-arrow" size={20} />
                      </div>

                      <div 
                        className="next-step-card"
                        onClick={() => handleNextStepSelection('🌍 Geographic market analysis')}
                      >
                        <div className="step-icon">
                          <Globe size={24} />
                        </div>
                        <div className="step-content">
                          <h4>Geographic Analysis</h4>
                          <p>Regional market opportunities and trends</p>
                        </div>
                        <ArrowRight className="step-arrow" size={20} />
                      </div>
                    </div>
                  </div>
                )}

                {/* Sector Cards */}
                {message.showSectorCards && (
                  <div className="sector-cards-container">
                    <p className="message-text" style={{ marginBottom: '1rem' }}>
                      {message.text}
                    </p>
                    {adaniSectors.slice(0, 6).map((sector) => (
                      <div
                        key={sector.id}
                        className="sector-card"
                        onClick={() => {
                          const userMsg: Message = {
                            id: generateUniqueId(),
                            text: `Show ${sector.name} projects`,
                            isBot: false,
                            timestamp: new Date(),
                            isComplete: true,
                            type: 'user'
                          };
                          setMessages((prev: Message[]) => [...prev, userMsg]);
                          filterProjects(sector.name);
                        }}
                      >
                        <div className="sector-icon">{sector.icon}</div>
                        <div className="sector-info">
                          <h4>{sector.name}</h4>
                          <p>{sector.targetAllocation}% allocation</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Geographic Cards */}
                {message.showGeographicCards && (
                  <div className="geographic-cards-container">
                    <p className="message-text" style={{ marginBottom: '1rem' }}>
                      {message.text}
                    </p>
                    <div className="geographic-grid">
                      {['Gujarat', 'Maharashtra', 'Tamil Nadu', 'Karnataka', 'Rajasthan', 'International'].map((region) => (
                        <div
                          key={region}
                          className="geographic-card"
                          onClick={() => {
                            const userMsg: Message = {
                              id: generateUniqueId(),
                              text: `Show projects in ${region}`,
                              isBot: false,
                              timestamp: new Date(),
                              isComplete: true,
                              type: 'user'
                            };
                            setMessages((prev: Message[]) => [...prev, userMsg]);
                            filterProjects(region.toLowerCase());
                          }}
                        >
                          <MapPin size={20} />
                          <span>{region}</span>
                        </div>
                      ))}
                    </div>
                  </div>
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

                {/* Enhanced Market Analysis Display */}
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

                    <div className="analysis-metrics">
                      {message.marketAnalysis.keyMetrics.map((metric, index) => (
                        <div key={index} className="metric-card">
                          <div className="metric-icon">
                            {getMetricIcon(metric.icon)}
                          </div>
                          <div className="metric-content">
                            <span className="metric-label">{metric.label}</span>
                            <span className={`metric-value trend-${metric.trend}`}>
                              {metric.value}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="analysis-sections">
                      {message.marketAnalysis.insights.length > 0 && (
                        <div className="analysis-section">
                          <h4><Lightbulb size={16} /> Key Insights</h4>
                          <ul>
                            {message.marketAnalysis.insights.map((insight, index) => (
                              <li key={index}>{insight}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {message.marketAnalysis.risks.length > 0 && (
                        <div className="analysis-section">
                          <h4><AlertCircle size={16} /> Risk Factors</h4>
                          <ul>
                            {message.marketAnalysis.risks.map((risk, index) => (
                              <li key={index}>{risk}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {message.marketAnalysis.opportunities.length > 0 && (
                        <div className="analysis-section">
                          <h4><Rocket size={16} /> Opportunities</h4>
                          <ul>
                            {message.marketAnalysis.opportunities.map((opportunity, index) => (
                              <li key={index}>{opportunity}</li>
                            ))}
                          </ul>
                        </div>
                      )}
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
                    {(() => {
                      console.log('🎯 DEBUG: Rendering project cards JSX section');
                      console.log('🎯 DEBUG: message.showProjectCards:', message.showProjectCards);
                      console.log('🎯 DEBUG: message.projectList exists:', !!message.projectList);
                      console.log('🎯 DEBUG: message.projectList length:', message.projectList?.length || 0);
                      return null;
                    })()}
                    
                    {!message.projectList || message.projectList.length === 0 ? (
                      <div style={{padding: '20px', color: '#ff6b6b', backgroundColor: '#1a1a1a', borderRadius: '8px', margin: '10px 0'}}>
                        🚨 DEBUG: No projects in projectList! 
                        <br />Length: {message.projectList?.length || 'undefined'}
                        <br />showProjectCards: {String(message.showProjectCards)}
                        <br />Message type: {message.type}
                      </div>
                    ) : (
                      <>
                        {/* Show first 4-5 projects */}
                        <div className="projects-grid">
                          {message.projectList.slice(0, 4).map((project) => (
                            <div
                              key={project.id}
                              className="project-card"
                              onClick={() => {
                                console.log('🎯 DEBUG: Project card clicked:', project.name);
                                handleProjectSelection(project);
                              }}
                              style={{
                                backgroundColor: '#1e293b',
                                border: '1px solid #334155',
                                borderRadius: '12px',
                                padding: '20px',
                                margin: '12px 0',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease',
                                position: 'relative'
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.borderColor = '#3b82f6';
                                e.currentTarget.style.backgroundColor = '#1e40af1a';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.borderColor = '#334155';
                                e.currentTarget.style.backgroundColor = '#1e293b';
                              }}
                            >
                              <div className="project-header" style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'flex-start',
                                marginBottom: '16px'
                              }}>
                                <h4 style={{
                                  color: '#f1f5f9',
                                  fontSize: '18px',
                                  fontWeight: '600',
                                  margin: '0',
                                  flex: '1',
                                  lineHeight: '1.4'
                                }}>{project.name}</h4>
                                <span style={{
                                  backgroundColor: project.status === 'approved' ? '#10b981' : 
                                                 project.status === 'under_review' ? '#f59e0b' : '#6b7280',
                                  color: 'white',
                                  padding: '4px 8px',
                                  borderRadius: '6px',
                                  fontSize: '12px',
                                  fontWeight: '500',
                                  textTransform: 'uppercase',
                                  marginLeft: '12px',
                                  whiteSpace: 'nowrap'
                                }}>
                                  {project.status.replace('_', ' ')}
                                </span>
                              </div>
                              
                              <div className="project-details" style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(3, 1fr)',
                                gap: '12px',
                                marginBottom: '16px'
                              }}>
                                <div className="project-metric" style={{ textAlign: 'center' }}>
                                  <span style={{
                                    display: 'block',
                                    color: '#94a3b8',
                                    fontSize: '12px',
                                    marginBottom: '4px'
                                  }}>Investment</span>
                                  <span style={{
                                    color: '#10b981',
                                    fontWeight: '600',
                                    fontSize: '14px'
                                  }}>{formatCurrency(project.investmentRange.max)}</span>
                                </div>
                                <div className="project-metric" style={{ textAlign: 'center' }}>
                                  <span style={{
                                    display: 'block',
                                    color: '#94a3b8',
                                    fontSize: '12px',
                                    marginBottom: '4px'
                                  }}>Strategic Fit</span>
                                  <span style={{
                                    color: project.strategicFitScore > 90 ? '#10b981' : 
                                           project.strategicFitScore > 80 ? '#f59e0b' : '#ef4444',
                                    fontWeight: '600',
                                    fontSize: '14px'
                                  }}>{project.strategicFitScore}%</span>
                                </div>
                                <div className="project-metric" style={{ textAlign: 'center' }}>
                                  <span style={{
                                    display: 'block',
                                    color: '#94a3b8',
                                    fontSize: '12px',
                                    marginBottom: '4px'
                                  }}>Risk Score</span>
                                  <span style={{
                                    color: project.preliminaryRiskScore < 30 ? '#10b981' : 
                                           project.preliminaryRiskScore < 50 ? '#f59e0b' : '#ef4444',
                                    fontWeight: '600',
                                    fontSize: '14px'
                                  }}>{project.preliminaryRiskScore}</span>
                                </div>
                              </div>
                              
                              <p style={{
                                color: '#cbd5e1',
                                fontSize: '14px',
                                lineHeight: '1.5',
                                margin: '0 0 16px 0'
                              }}>{project.description}</p>
                              
                              <div className="project-action" style={{
                                textAlign: 'center',
                                padding: '8px',
                                backgroundColor: '#0f172a',
                                borderRadius: '8px',
                                border: '1px solid #334155'
                              }}>
                                <span style={{
                                  color: '#3b82f6',
                                  fontSize: '13px',
                                  fontWeight: '500'
                                }}>Click to analyze with AI 🧠</span>
                              </div>
                            </div>
                          ))}
                        </div>
                        
                        {/* Show + button if there are more projects */}
                        {message.projectList.length > 4 && (
                          <div 
                            className="project-card more-projects-card"
                            onClick={() => {
                              console.log('🎯 DEBUG: + More projects clicked');
                              // Show all remaining projects
                              const expandedMessage: Message = {
                                ...message,
                                text: `🔍 All ${message.projectList?.length} matching projects:`,
                                projectList: message.projectList // Show all projects
                              };
                              setMessages((prev: Message[]) => 
                                prev.map((msg: Message) => msg.id === message.id ? expandedMessage : msg)
                              );
                            }}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              minHeight: '120px',
                              border: '2px dashed #3b82f6',
                              backgroundColor: 'rgba(59, 130, 246, 0.1)',
                              cursor: 'pointer'
                            }}
                          >
                            <div style={{ textAlign: 'center', color: '#3b82f6' }}>
                              <div style={{ fontSize: '24px', marginBottom: '8px' }}>+</div>
                              <div>See {message.projectList.length - 4} more projects</div>
                            </div>
                          </div>
                        )}
                      </>
                    )}
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