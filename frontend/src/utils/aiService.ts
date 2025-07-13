
// AI Service Integration Utility
// This can be configured to work with OpenAI, Anthropic, or other AI services

interface AIServiceConfig {
  apiKey?: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
}

interface AIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

class AIService {
  private config: AIServiceConfig;
  private apiEndpoint: string;

  constructor(config: AIServiceConfig = {}) {
    this.config = {
      model: 'gpt-3.5-turbo',
      temperature: 0.7,
      maxTokens: 500,
      ...config
    };
    
    // Default to OpenAI API endpoint
    this.apiEndpoint = 'https://api.openai.com/v1/chat/completions';
  }

  async sendMessage(
    messages: AIMessage[], 
    userRole: 'student' | 'mentor' | 'admin'
  ): Promise<string> {
    // If no API key is provided, fall back to mock responses
    if (!this.config.apiKey) {
      return this.getMockResponse(messages[messages.length - 1].content, userRole);
    }

    try {
      const systemPrompt = this.getSystemPrompt(userRole);
      const fullMessages = [
        { role: 'system' as const, content: systemPrompt },
        ...messages
      ];

      const response = await fetch(this.apiEndpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: this.config.model,
          messages: fullMessages,
          temperature: this.config.temperature,
          max_tokens: this.config.maxTokens,
        }),
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.statusText}`);
      }

      const data = await response.json();
      return data.choices[0]?.message?.content || 'Sorry, I encountered an error. Please try again.';
    } catch (error) {
      console.error('AI Service Error:', error);
      return this.getMockResponse(messages[messages.length - 1].content, userRole);
    }
  }

  private getSystemPrompt(userRole: 'student' | 'mentor' | 'admin'): string {
    const prompts = {
      student: `You are an AI learning assistant for students. You should:
        - Provide clear, educational explanations
        - Break down complex concepts into simple steps
        - Encourage learning and curiosity
        - Offer study tips and learning strategies
        - Be supportive and motivational`,
      
      mentor: `You are an AI assistant for teachers and mentors. You should:
        - Provide insights on teaching strategies
        - Offer advice on student engagement
        - Share data-driven recommendations
        - Help with curriculum planning
        - Support mentor development`,
      
      admin: `You are an AI assistant for educational administrators. You should:
        - Provide platform analytics and insights
        - Offer administrative recommendations
        - Help with system management
        - Share best practices for educational technology
        - Support decision-making with data`
    };

    return prompts[userRole];
  }

  private getMockResponse(userMessage: string, userRole: 'student' | 'mentor' | 'admin'): string {
    const responses = {
      student: [
        "That's a great question! Let me help you understand this concept better.",
        "I can see you're working on this topic. Here's a helpful explanation...",
        "Let's break this down step by step to make it easier to understand.",
        "Great job asking for help! Learning is all about curiosity.",
        "I'm here to support your learning journey. Let's explore this together!"
      ],
      mentor: [
        "Here's some insight that might help with your mentoring approach...",
        "Based on student engagement patterns, I'd suggest...",
        "This is a common challenge in mentoring. Here's what works well...",
        "Your students would benefit from this teaching strategy...",
        "Let me provide some data-driven recommendations for your students."
      ],
      admin: [
        "Here's the administrative data you requested...",
        "Based on platform analytics, I recommend...",
        "The system metrics show the following trends...",
        "For optimal platform management, consider...",
        "Here's a comprehensive overview of the current status..."
      ]
    };

    const roleResponses = responses[userRole];
    return roleResponses[Math.floor(Math.random() * roleResponses.length)];
  }

  updateConfig(newConfig: Partial<AIServiceConfig>) {
    this.config = { ...this.config, ...newConfig };
  }
}

export const aiService = new AIService();
export type { AIMessage, AIServiceConfig };
