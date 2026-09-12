# US Climate & Energy Policy Agent

A modern, AI-powered chat interface for analyzing and querying US climate and energy policy positions, statements, and international commitments.

## Overview

This application provides a comprehensive platform for policy researchers, diplomats, and the general public to explore US climate and energy policy from June 2025 - June 2026, including:

- **Policy Analysis**: 8 major policy areas with detailed position statements
- **Statement Tracking**: Key quotes and utterances from US foreign policy officials
- **Consistency Analysis**: Where policies have been consistent, shifted, or remained non-committal
- **Interactive Chat**: Real-time querying and analysis of policy positions
- **ChatGPT Integration**: Custom ChatGPT Action for accessing policy data

## Features

✨ **Modern UI/UX**
- Clean, professional interface designed for policy professionals
- Responsive design works on desktop, tablet, and mobile
- Real-time chat with streaming responses
- Suggested queries for new users

📊 **Comprehensive Policy Database**
- 8 major policy themes
- 17+ key policy statements with dates and sources
- Analysis of policy shifts, consistency, and ambiguity
- Contextual information for each statement

🔗 **Multiple Access Points**
- Web chat interface
- REST API endpoint
- ChatGPT Action integration
- OpenAPI specification for integrations

## Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Node.js
- **State Management**: Zustand
- **Deployment**: Vercel
- **API**: REST, OpenAPI 3.0

## Local Development

### Prerequisites

- Node.js 18+ and npm

### Setup

1. Clone the repository:
```bash
cd "c:\Users\Administrator\Desktop\US UN History"
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking

## Deployment

### Deploy to Vercel

1. **Push to GitHub** (Recommended)
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin <your-repo-url>
git push -u origin main
```

2. **Connect to Vercel**
- Go to [vercel.com](https://vercel.com)
- Click "New Project"
- Import your Git repository
- Vercel will automatically detect Next.js and configure build settings
- Click "Deploy"

3. **Alternative: Direct Vercel CLI**
```bash
npm i -g vercel
vercel
```

### Environment Variables

No environment variables required for basic functionality. Optional:

```
NEXT_PUBLIC_API_URL=https://your-domain.vercel.app
```

## API Documentation

### Chat Endpoint

**POST** `/api/chat`

Request:
```json
{
  "message": "What is the US position on renewable energy?",
  "conversationHistory": []
}
```

Response:
```json
{
  "id": "msg-1234567890",
  "role": "assistant",
  "content": "Policy analysis response...",
  "timestamp": "2026-06-12T10:30:00Z",
  "metadata": {
    "source": "State Department",
    "theme": "renewable-energy-leadership",
    "citations": ["June 2025", "May 2026"]
  }
}
```

### ChatGPT Action Endpoint

**GET** `/api/chat-gpt-action` - Returns OpenAPI specification

**POST** `/api/chat-gpt-action`

Request:
```json
{
  "query": "international climate commitments",
  "context": "policy briefing"
}
```

Response includes relevant policy statements, themes, and analysis.

## ChatGPT Integration

See [CHATGPT_ACTION_SETUP.md](./CHATGPT_ACTION_SETUP.md) for detailed instructions on setting up ChatGPT Action integration.

## Policy Data Structure

### 8 Policy Themes

1. **International Climate Commitments** - Paris Agreement, multilateral initiatives
2. **Domestic Energy Transition** - Renewable energy, infrastructure, targets
3. **Renewable Energy & Green Technology** - Solar, wind, EV, innovation leadership
4. **Climate Finance & Development** - Support for developing nations
5. **Methane Reduction & Other GHGs** - Emissions targets and monitoring
6. **Clean Tech Competition & China** - Strategic technology competition
7. **Just Transition & Social Equity** - Community investment, worker protection
8. **Climate Adaptation & Resilience** - Infrastructure, disaster preparedness

Each theme includes:
- Overall position statement
- 2-3 key statements with dates and speakers
- Policy shifts over 13 months
- Areas of consistency
- Areas of ambiguity

## Analysis Capabilities

The agent provides analysis on:

- **Policy Positions**: Current US stance on specific issues
- **Consistency Analysis**: Where policies have remained constant
- **Policy Shifts**: How positions have evolved or changed
- **Ambiguities**: Areas where policy remains unclear or flexible
- **Key Statements**: Direct quotes from US officials
- **Contextual Information**: Background on policy decisions

## Use Cases

### For Policy Researchers
- Track consistency of US climate commitments
- Identify policy shifts and evolution
- Access key statements and official quotes
- Analyze domestic vs. international positions

### For Diplomats
- Quick reference for US policy positions
- Understanding of US negotiating positions
- Identification of flexibility areas
- Context for bilateral discussions

### For General Public
- Understand US climate policy
- Access to official statements
- Analysis of policy implications
- Tracking of government commitments

## Limitations

- Data covers June 2025 - June 2026 period
- Based on publicly available statements
- Statements are representative, not exhaustive
- Real-time policy updates require manual input
- Analysis reflects official statements, not implementation effectiveness

## Future Enhancements

- Real-time policy data integration
- Multi-language support
- PDF export of analyses
- Advanced search and filtering
- Policy comparison tools
- Historical tracking dashboard
- Social media statement integration

## Support & Documentation

- **Issues**: Report bugs via GitHub Issues
- **Documentation**: See `/docs` folder
- **API Docs**: Available at `/api/chat-gpt-action` (GET)

## License

MIT License - See LICENSE file for details

## Contributing

Contributions welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Submit a pull request with description

## Contact

For questions or partnership inquiries, contact the policy analysis team.

---

**Last Updated**: June 2026  
**Version**: 1.0.0
