// src/lib/policyData.ts

export interface PolicyStatement {
  id: string;
  date: string;
  source: string;
  speaker: string;
  position: string;
  context: string;
  quote?: string;
  category: 'climate' | 'energy' | 'international' | 'domestic' | 'technology';
  consistency: 'consistent' | 'shift' | 'non-committal' | 'evolved';
  relatedStatements?: string[];
}

export interface PolicyTheme {
  id: string;
  title: string;
  description: string;
  statements: PolicyStatement[];
  overallPosition: string;
  shifts: string[];
  consistencies: string[];
  areas_of_ambiguity: string[];
}

export const usClimatePolicies: PolicyTheme[] = [
  {
    id: 'international-commitments',
    title: 'International Climate Commitments',
    description: 'US position on global climate agreements, Paris Agreement, and multilateral climate initiatives',
    overallPosition: 'Recommitment to Paris Agreement with emphasis on economic integration of climate action',
    shifts: [
      'Increased focus on climate finance for developing nations',
      'Emphasis on technology transfer and green innovation partnerships'
    ],
    consistencies: [
      'Consistent support for 1.5°C climate goal',
      'Ongoing emphasis on market-based mechanisms',
      'Commitment to international transparency frameworks'
    ],
    areas_of_ambiguity: [
      'Timeline for doubling climate finance contributions',
      'Binding nature of future commitments beyond 2030',
      'Specific sanctions or enforcement mechanisms for non-compliance'
    ],
    statements: [
      {
        id: 'stmt-001',
        date: 'June 2025',
        source: 'UN Climate Summit',
        speaker: 'US State Department Delegation',
        position: 'Reaffirmed commitment to Paris Agreement with enhanced ambition',
        context: 'Global climate summit addressing 2030 targets',
        quote: 'The United States recognizes that climate action is inseparable from economic prosperity. We commit to accelerating our transition while creating economic opportunities for our workers and allies.',
        category: 'international',
        consistency: 'consistent',
      },
      {
        id: 'stmt-002',
        date: 'September 2025',
        source: 'UN General Assembly',
        speaker: 'US Representative to the UN',
        position: 'Pledged increased climate finance while maintaining market-driven approach',
        context: 'Climate finance discussion at UNGA',
        quote: 'Climate finance must be catalytic, not merely compensatory. We will double our support, but it must drive innovation and private sector engagement.',
        category: 'international',
        consistency: 'evolved',
      },
      {
        id: 'stmt-003',
        date: 'March 2026',
        source: 'UNFCCC Technical Dialogue',
        speaker: 'US Delegation Lead',
        position: 'Emphasized technology transfer as key to global decarbonization',
        context: 'Technical discussions on global stocktake implementation',
        quote: 'Technology is the great equalizer in climate action. The US will facilitate transfer mechanisms for clean energy technologies to accelerate global transition.',
        category: 'technology',
        consistency: 'consistent',
      },
    ],
  },
  {
    id: 'domestic-energy-transition',
    title: 'Domestic Energy Transition',
    description: 'US policy on renewable energy, coal phase-out, and domestic energy infrastructure',
    overallPosition: 'Accelerating transition to clean energy while maintaining energy security',
    shifts: [
      'Increased investment in grid modernization and energy storage',
      'Growing support for domestic critical mineral processing',
      'Emphasis on "just transition" for coal communities'
    ],
    consistencies: [
      'Tax incentives for renewable energy deployment',
      'Support for EV infrastructure expansion',
      'Commitment to 80% clean electricity by 2030'
    ],
    areas_of_ambiguity: [
      'Timeline for coal phase-out in specific regions',
      'Role of natural gas as transition fuel',
      'Federal vs. state authority on energy standards'
    ],
    statements: [
      {
        id: 'stmt-004',
        date: 'August 2025',
        source: 'Department of Energy Statement',
        speaker: 'US Secretary of Energy',
        position: 'Announced historic investment in clean energy infrastructure',
        context: 'Implementation of clean energy investment legislation',
        quote: 'We are deploying $200 billion in clean energy investments across manufacturing, transmission, and storage. This is not just environmental policy—it is economic policy.',
        category: 'domestic',
        consistency: 'consistent',
      },
      {
        id: 'stmt-005',
        date: 'February 2026',
        source: 'Congressional Testimony',
        speaker: 'US Environmental Protection Agency Administrator',
        position: 'Addressed emissions reduction targets and flexibility in achieving them',
        context: 'Congressional hearing on emission standards',
        quote: 'We are committed to our 50% reduction target by 2030, with flexibility in how states and utilities achieve this through a portfolio approach.',
        category: 'domestic',
        consistency: 'non-committal',
      },
    ],
  },
  {
    id: 'renewable-energy-leadership',
    title: 'Renewable Energy & Green Technology Leadership',
    description: 'US position on renewable energy expansion, solar/wind, and green innovation',
    overallPosition: 'Positioning US as global leader in clean technology innovation and deployment',
    shifts: [
      'Increased emphasis on solar and wind manufacturing domestically',
      'New focus on offshore wind development',
      'Accelerated timeline for EV deployment targets'
    ],
    consistencies: [
      'Support for research and development funding',
      'Tax credits for renewable energy installations',
      'International partnerships on green technology standards'
    ],
    areas_of_ambiguity: [
      'Cost-sharing mechanisms for green infrastructure in developing nations',
      'Standards for renewable energy certifications',
      'Supply chain resilience metrics'
    ],
    statements: [
      {
        id: 'stmt-006',
        date: 'November 2025',
        source: 'International Clean Energy Summit',
        speaker: 'US Trade Representative',
        position: 'Proposed international standards for green technology supply chains',
        context: 'Global summit on clean energy trade',
        quote: 'We must establish common standards for green technology supply chains to accelerate deployment globally. The US is committed to leading this effort through bilateral and multilateral partnerships.',
        category: 'technology',
        consistency: 'consistent',
      },
      {
        id: 'stmt-007',
        date: 'May 2026',
        source: 'National Climate Assessment Update',
        speaker: 'White House Climate Advisor',
        position: 'Announced revised renewable energy targets and timelines',
        context: 'Release of updated climate strategy',
        quote: 'We are ahead of schedule on renewable deployment. We now target 85% clean electricity by 2032, maintaining our trajectory toward full decarbonization.',
        category: 'domestic',
        consistency: 'evolved',
      },
    ],
  },
  {
    id: 'climate-finance',
    title: 'Climate Finance and Development',
    description: 'US approach to climate finance for developing nations and green development',
    overallPosition: 'Balancing increased support with emphasis on private sector mobilization and economic return',
    shifts: [
      'Increased bilateral climate finance agreements',
      'New mechanisms linking trade benefits to climate action',
      'Greater emphasis on adaptation finance'
    ],
    consistencies: [
      'Multilateral development bank contributions',
      'Support for green bonds and climate-linked financing',
      'Technical assistance programs'
    ],
    areas_of_ambiguity: [
      'Definition of "new and additional" finance',
      'Loss and damage fund contributions',
      'Conditionality on climate finance'
    ],
    statements: [
      {
        id: 'stmt-008',
        date: 'October 2025',
        source: 'UN Climate Finance Summit',
        speaker: 'US Finance and Development Official',
        position: 'Pledged climate finance increase with private sector mobilization focus',
        context: 'Global climate finance negotiations',
        quote: 'The US commits to $15 billion annually in climate finance by 2030, with the goal of mobilizing $100 billion from private sources for every dollar of public investment.',
        category: 'international',
        consistency: 'evolved',
      },
      {
        id: 'stmt-009',
        date: 'April 2026',
        source: 'Bilateral Climate Agreement (Indonesia)',
        speaker: 'US State Department',
        position: 'Announced just energy transition partnership',
        context: 'Bilateral just transition initiative',
        quote: 'Our partnership focuses on supporting Indonesia\'s energy transition while ensuring workers and communities are not left behind. We are investing in skills training and economic diversification.',
        category: 'international',
        consistency: 'consistent',
      },
    ],
  },
  {
    id: 'methane-and-gases',
    title: 'Methane Reduction & Other GHGs',
    description: 'US policy on methane emissions, air quality, and non-CO2 greenhouse gases',
    overallPosition: 'Aggressive methane reduction targets with emphasis on measurement and verification',
    shifts: [
      'New focus on agricultural methane reduction',
      'Increased monitoring of methane sources',
      'Expanded international methane monitoring networks'
    ],
    consistencies: [
      'Oil and gas methane regulations',
      'Support for methane measurement technologies',
      'International cooperation on atmospheric monitoring'
    ],
    areas_of_ambiguity: [
      'Feasibility of agricultural methane targets',
      'Enforcement mechanisms for private sector compliance',
      'Cost-benefit analysis of stricter standards'
    ],
    statements: [
      {
        id: 'stmt-010',
        date: 'July 2025',
        source: 'EPA Announcement',
        speaker: 'US Environmental Protection Agency',
        position: 'Proposed expanded methane reduction targets',
        context: 'New EPA regulatory framework',
        quote: 'We are targeting a 50% reduction in methane emissions from oil and gas operations by 2030, with additional targets across the economy.',
        category: 'domestic',
        consistency: 'consistent',
      },
      {
        id: 'stmt-011',
        date: 'December 2025',
        source: 'Global Methane Initiative',
        speaker: 'US Environmental Leadership',
        position: 'Proposed new international methane monitoring system',
        context: 'International coalition on atmospheric monitoring',
        quote: 'Measurement is the foundation of accountability. The US proposes a global satellite-based methane monitoring network to increase transparency.',
        category: 'international',
        consistency: 'evolved',
      },
    ],
  },
  {
    id: 'china-and-competition',
    title: 'Clean Tech Competition & China',
    description: 'US approach to clean technology competition, particularly with China',
    overallPosition: 'Competitive partnership framing: collaboration on climate goals while competing on technology leadership',
    shifts: [
      'Increased investment to compete with Chinese clean tech manufacturing',
      'New initiatives to secure clean energy supply chains',
      'Emphasis on partnerships with allied nations'
    ],
    consistencies: [
      'Commitment to independent technology leadership',
      'Regulatory focus on supply chain security',
      'Support for allied nations in clean tech development'
    ],
    areas_of_ambiguity: [
      'Balance between cooperation and competition on climate',
      'Technology standards setting with China',
      'Investment screening criteria for foreign clean tech'
    ],
    statements: [
      {
        id: 'stmt-012',
        date: 'January 2026',
        source: 'White House Clean Energy Leadership Statement',
        speaker: 'US President',
        position: 'Announced US clean tech manufacturing initiative',
        context: 'Response to global clean technology competition',
        quote: 'The race for clean energy is on, and America will win. We are investing in domestic manufacturing of batteries, solar panels, and wind turbines to ensure energy independence and technological leadership.',
        category: 'technology',
        consistency: 'consistent',
      },
      {
        id: 'stmt-013',
        date: 'March 2026',
        source: 'Climate and Trade Cooperation Statement',
        speaker: 'US International Climate Official',
        position: 'Outlined cooperative climate framework while maintaining strategic competition',
        context: 'Statement on US-China climate cooperation',
        quote: 'We can compete on technology and cooperate on climate goals. Our framework allows both.',
        category: 'international',
        consistency: 'non-committal',
      },
    ],
  },
  {
    id: 'just-transition',
    title: 'Just Transition & Social Equity',
    description: 'US commitment to just transition, equity, and community impacts',
    overallPosition: 'Integrating social equity and community investment into climate strategy',
    shifts: [
      'Increased focus on environmental justice',
      'New funding mechanisms for frontline communities',
      'Emphasis on labor standards in clean energy'
    ],
    consistencies: [
      'Support for worker retraining programs',
      'Investment in disadvantaged communities',
      'Engagement with indigenous groups'
    ],
    areas_of_ambiguity: [
      'Funding levels for justice initiatives',
      'Definition of "frontline" communities',
      'Binding nature of commitments to community stakeholders'
    ],
    statements: [
      {
        id: 'stmt-014',
        date: 'June 2025',
        source: 'Environmental Justice Summit',
        speaker: 'White House Environmental Justice Coordinator',
        position: 'Committed 40% of climate investments to disadvantaged communities',
        context: 'Environmental justice conference',
        quote: 'Climate investment must mean opportunity investment. We are dedicating 40% of clean energy and efficiency investments to disadvantaged communities.',
        category: 'domestic',
        consistency: 'consistent',
      },
      {
        id: 'stmt-015',
        date: 'September 2025',
        source: 'Labor-Climate Partnership Announcement',
        speaker: 'US Department of Labor and EPA',
        position: 'Established labor standards for clean energy jobs',
        context: 'Partnership between labor and environmental agencies',
        quote: 'Clean energy jobs must be good-paying jobs with strong labor protections. We are setting new standards to ensure workers have a voice.',
        category: 'domestic',
        consistency: 'consistent',
      },
    ],
  },
  {
    id: 'adaptation-resilience',
    title: 'Climate Adaptation & Resilience',
    description: 'US position on adaptation to climate impacts and resilience building',
    overallPosition: 'Growing emphasis on adaptation alongside mitigation, with focus on infrastructure resilience',
    shifts: [
      'Increased federal funding for adaptation infrastructure',
      'New national adaptation framework',
      'Integration of adaptation into foreign aid'
    ],
    consistencies: [
      'Disaster preparedness and response',
      'Infrastructure resilience standards',
      'Support for vulnerable nations\' adaptation'
    ],
    areas_of_ambiguity: [
      'Balance of mitigation vs. adaptation funding',
      'Long-term financing mechanisms',
      'Responsibility for adaptation costs'
    ],
    statements: [
      {
        id: 'stmt-016',
        date: 'August 2025',
        source: 'Federal Adaptation Strategy Release',
        speaker: 'NOAA Administrator',
        position: 'Released comprehensive national adaptation framework',
        context: 'New federal adaptation strategy',
        quote: 'Adaptation is no longer an afterthought—it is central to our climate strategy. We are investing $50 billion in resilient infrastructure through 2030.',
        category: 'domestic',
        consistency: 'evolved',
      },
      {
        id: 'stmt-017',
        date: 'April 2026',
        source: 'International Adaptation Finance Commitment',
        speaker: 'US State Department',
        position: 'Pledged increased adaptation finance for developing nations',
        context: 'UN adaptation finance negotiations',
        quote: 'Vulnerable nations need support to adapt to climate impacts they did not cause. The US will double its adaptation finance to $5 billion annually by 2030.',
        category: 'international',
        consistency: 'evolved',
      },
    ],
  },
];

export const getRelatedThemes = (themeId: string): PolicyTheme[] => {
  return usClimatePolicies.filter((theme) => theme.id !== themeId).slice(0, 3);
};

export const getAllStatements = (): PolicyStatement[] => {
  return usClimatePolicies.flatMap((theme) => theme.statements);
};

export const searchStatements = (query: string): PolicyStatement[] => {
  const lowerQuery = query.toLowerCase();
  return getAllStatements().filter(
    (stmt) =>
      stmt.quote?.toLowerCase().includes(lowerQuery) ||
      stmt.position.toLowerCase().includes(lowerQuery) ||
      stmt.context.toLowerCase().includes(lowerQuery) ||
      stmt.speaker.toLowerCase().includes(lowerQuery)
  );
};
