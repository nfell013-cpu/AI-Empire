// Shared tools data used across components
export type ToolInfo = {
  name: string;
  slug: string;
  description: string;
  category: string;
  active: boolean;
};

export const ALL_TOOLS: ToolInfo[] = [
  // New tools
  { name: 'CodeAudit', slug: 'codeaudit', description: 'Code Review & Security Scanner', category: 'Developer Tools', active: true },
  { name: 'PixelCraft', slug: 'pixelcraft', description: 'AI Image Generation Studio', category: 'Creative', active: true },
  { name: 'DocuWise', slug: 'docuwise', description: 'Document Summarizer', category: 'Productivity', active: true },
  { name: 'ChatGenius', slug: 'chatgenius', description: 'Custom Chatbot Builder', category: 'Business', active: true },
  { name: 'VoiceBox', slug: 'voicebox', description: 'Text-to-Speech Engine', category: 'Creative', active: true },
  { name: 'BrandSpark', slug: 'brandspark', description: 'Brand Name Generator', category: 'Marketing', active: true },
  { name: 'DataWeave', slug: 'dataweave', description: 'CSV & Data Analyst', category: 'Data & Analytics', active: true },
  { name: 'MailPilot', slug: 'mailpilot', description: 'AI Email Composer', category: 'Productivity', active: true },
  { name: 'FitForge', slug: 'fitforge', description: 'AI Fitness Planner', category: 'Health', active: true },
  { name: 'LexiLearn', slug: 'lexilearn', description: 'Language Learning AI', category: 'Education', active: true },
  { name: 'AdCopy', slug: 'adcopy', description: 'Ad Copywriter AI', category: 'Marketing', active: true },
  { name: 'BugBuster', slug: 'bugbuster', description: 'AI Debugging Assistant', category: 'Developer Tools', active: true },
  { name: 'PitchDeck', slug: 'pitchdeck', description: 'Investor Pitch Generator', category: 'Business', active: true },
  { name: 'RecipeRx', slug: 'reciperx', description: 'AI Recipe Generator', category: 'Lifestyle', active: true },
  { name: 'StockSense', slug: 'stocksense', description: 'Market Analysis AI', category: 'Finance', active: true },
  { name: 'SketchAI', slug: 'sketchai', description: 'UI/UX Design Assistant', category: 'Creative', active: true },
  { name: 'ContractIQ', slug: 'contractiq', description: 'Contract Generator', category: 'Legal', active: true },
  { name: 'StudyBlitz', slug: 'studyblitz', description: 'Study Guide Creator', category: 'Education', active: true },
  { name: 'Socialize', slug: 'socialize', description: 'Social Media Strategist', category: 'Marketing', active: true },
  { name: 'SEOMaster', slug: 'seomaster', description: 'SEO Optimization Tool', category: 'Marketing', active: true },
  { name: 'WriteFlow', slug: 'writeflow', description: 'AI Content Writer', category: 'Creative', active: true },
  { name: 'VideoSync', slug: 'videosync', description: 'Video Production AI', category: 'Creative', active: true },
  { name: 'TaskFlow', slug: 'taskflow', description: 'Project Management AI', category: 'Productivity', active: true },
  { name: 'SecureNet', slug: 'securenet', description: 'Cybersecurity Assessment', category: 'Security', active: true },
  { name: 'APIGen', slug: 'apigen', description: 'API Generator', category: 'Developer Tools', active: true },
  { name: 'TravelMate', slug: 'travelmate', description: 'Travel Planner AI', category: 'Lifestyle', active: true },
  { name: 'InvoicePro', slug: 'invoicepro', description: 'Invoice Generator', category: 'Business', active: true },
  { name: 'MindMap', slug: 'mindmap', description: 'Mind Mapping Tool', category: 'Productivity', active: true },
  { name: 'RealtorIQ', slug: 'realtoriq', description: 'Real Estate Analyzer', category: 'Finance', active: true },
  { name: 'HealthPulse', slug: 'healthpulse', description: 'Health & Wellness AI', category: 'Health', active: true },
  // Legacy tools
  { name: 'Legalese', slug: 'legalese', description: 'PDF Contract Scanner', category: 'Legal', active: true },
  { name: 'FlipScore', slug: 'flipscore', description: 'Thrift Item Scanner', category: 'Finance', active: true },
  { name: 'TradeAce', slug: 'tradeace', description: 'Vocational Exam Prep', category: 'Education', active: true },
  { name: 'DealDone', slug: 'dealdone', description: 'Brand Negotiation AI', category: 'Business', active: true },
  { name: 'LeafCheck', slug: 'leafcheck', description: 'Plant Species ID', category: 'Lifestyle', active: true },
  { name: 'PawPair', slug: 'pawpair', description: 'Pet Compatibility Quiz', category: 'Lifestyle', active: true },
  { name: 'VisionLens', slug: 'visionlens', description: 'Object ID & Valuation', category: 'Lifestyle', active: true },
  { name: 'CoachLogic', slug: 'coachlogic', description: 'Health', category: 'Health', active: true },
  { name: 'GlobeGuide', slug: 'globeguide', description: 'AI Travel Itinerary', category: 'Lifestyle', active: true },
  { name: 'SkillScope', slug: 'skillscope', description: 'Resume Analyzer', category: 'Productivity', active: true },
  { name: 'DataVault', slug: 'datavault', description: 'Finance Analyzer', category: 'Finance', active: true },
  { name: 'GuardianAI', slug: 'guardianai', description: 'Reputation Monitor', category: 'Security', active: true },
  { name: 'TrendPulse', slug: 'trendpulse', description: 'Market Predictor', category: 'Finance', active: true },
  { name: 'SoundForge', slug: 'soundforge', description: 'AI Music Generator', category: 'Creative', active: true },
  { name: 'MemeMint', slug: 'mememint', description: 'AI Meme Generator', category: 'Creative', active: true },
];

export const TOOL_CATEGORIES = [...new Set(ALL_TOOLS.map(t => t.category))].sort();
