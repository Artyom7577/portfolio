// All portfolio text lives here. Edit this file to make the site yours.

export const profile = {
  firstName: 'ARTYOM',
  lastName: 'HAYRAPETYAN',
  short: 'A.HAYRAPETYAN',
  club: 'HAYRAPETYAN FC',
  role: 'BACKEND SOFTWARE ENGINEER',
  headline: 'Backend engineer building distributed systems and high-volume data platforms with Java.',
  summary:
    "I take services from an empty repository to production: architecture, code, tests against real infrastructure, load testing and Kubernetes deployment. My focus is where systems meet — keeping data consistent across systems that can't share a transaction, processing millions of records fast, and keeping data in sync across environments. Software Engineer at Polixis; previously Practice Lead at Picsart Academy and Java Lecturer at the European University of Armenia.",
  tags: ['JAVA', 'QUARKUS', 'SPRING BOOT', 'DISTRIBUTED SYSTEMS', 'KAFKA', 'KUBERNETES', 'LLMs / RAG'],
  email: 'artyom.hayrapetyan0001@gmail.com',
  github: 'https://github.com/Artyom7577',
  linkedin: 'https://www.linkedin.com/in/artyom-hayrapetyan/',
  gitlab: 'https://gitlab.com/artyom.hayrapetyan',
  leetcode: 'https://leetcode.com/u/artyomhayrapetyan1/',
  // Put your CV in public/ (e.g. public/resume.pdf) and set this to '/resume.pdf'.
  // While it's empty the download button is hidden.
  resumePdf: '/resume.pdf',
}

// "Career Mode" — work experience, newest first.
export const career = [
  {
    club: 'POLIXIS',
    dates: '2024 – PRESENT',
    role: 'Software Engineer',
    location: 'Yerevan, Armenia',
    points: [
      'Designed and built a multi-tenant identity & access management platform (Keycloak + PostgreSQL) from scratch: organizations, groups, roles, 2FA and product subscriptions with seats.',
      'Designed a crash-safe saga engine that keeps Keycloak and PostgreSQL consistent across multi-step operations, with automatic undo of completed steps and recovery after a crash.',
      'Built a data versioning & matching engine that merges new dataset releases into a master dataset of millions of records, using a custom in-memory index.',
      'Built a real-time sync service streaming data over gRPC into MongoDB and Elasticsearch, with parallel batching and resume after failure, deployed to multiple on-premise customer environments.',
      'Added reliable Kafka event publishing (transactional outbox), load-tested with k6, profiled with JFR, and deployed every service to Kubernetes with Helm.',
    ],
  },
  {
    club: 'PICSART ACADEMY',
    dates: '2023 – 2024',
    role: 'Software Engineer / Practice Lead',
    location: 'Yerevan, Armenia',
    points: [
      'Developed and maintained software applications using Java and Node.js.',
      'Led small student teams through real-world projects, from design and code review to delivery.',
      'Mentored developers on algorithms, data structures, problem solving and clean code.',
    ],
  },
  {
    club: 'EUROPEAN UNIVERSITY OF ARMENIA',
    dates: '2022 – 2023',
    role: 'Java Lecturer',
    location: 'Yerevan, Armenia',
    points: [
      'Delivered lectures on Java and C++ to undergraduate students, covering core concepts.',
      'Designed and ran practical lab sessions for hands-on Java development.',
    ],
  },
  {
    club: 'UPWORK',
    dates: '2018 – 2019',
    role: 'Software Engineer (Freelance)',
    location: 'Remote',
    points: [
      'Bug fixing and optimization for backend systems.',
      'Mini projects involving search, Kafka and Docker, delivered to client requirements.',
    ],
  },
]

import { PALETTE as C } from '../game/pixels'

// "Squad Select" — skills laid out as a 4-3-3 team.
// kit / kit2 / shorts are shirt colors; skin and hair tint the sprite.
const attack = { kit: C.red, kit2: C.white }
const mid = { kit: C.gold, kit2: C.navy, shorts: C.navy }
const def = { kit: C.sky, kit2: C.white }
const keeper = { kit: C.navy, kit2: C.gold, shorts: C.navy }

export const squad = [
  {
    line: 'ATTACK',
    players: [
      { name: 'QUARKUS', position: 'Winger', note: 'Blocking and reactive services, native builds, Dev Services testing.', ...attack, skin: '#E0AC69' },
      { name: 'JAVA', position: 'Striker', note: 'Java 25: records, sealed types, pattern matching, virtual threads. My main language.', ...attack, skin: '#C68642' },
      { name: 'SPRING BOOT', position: 'Winger', note: 'REST APIs, WebFlux reactive services and Spring AI.', ...attack, skin: '#F1C27D' },
    ],
  },
  {
    line: 'MIDFIELD',
    players: [
      { name: 'SAGAS', position: 'Playmaker', note: 'Distributed consistency: a crash-safe saga engine with compensation and recovery.', ...mid, skin: '#C68642' },
      { name: 'KAFKA', position: 'Box-to-box', note: 'Event streaming with the transactional outbox pattern.', ...mid, skin: '#E0AC69' },
      { name: 'gRPC', position: 'Anchor', note: 'Compressed, authenticated streaming between services.', ...mid, skin: '#8D5524' },
    ],
  },
  {
    line: 'DEFENSE',
    players: [
      { name: 'POSTGRESQL', position: 'Full-back', note: 'Schema design, Flyway migrations, type-safe SQL with jOOQ.', ...def, skin: '#F1C27D' },
      { name: 'MONGODB', position: 'Centre-back', note: 'Bulk upserts and indexing over millions of documents.', ...def, skin: '#C68642' },
      { name: 'ELASTIC', position: 'Centre-back', note: 'Search indexes, mappings and bulk sync with Elasticsearch.', ...def, skin: '#E0AC69' },
      { name: 'REDIS', position: 'Full-back', note: 'Caching layers for high-throughput services.', ...def, skin: '#8D5524' },
    ],
  },
  {
    line: 'GOALKEEPER',
    players: [{ name: 'KUBERNETES', position: 'Last line', note: 'Docker images, Helm charts and Kubernetes deployments for every service.', ...keeper, skin: '#E0AC69' }],
  },
]

export const bench = ['AWS (Developer Associate in progress)', 'Keycloak / OIDC', 'Docker', 'Helm', 'Prometheus', 'k6', 'Python', 'LLMs / RAG', 'Node.js', 'Git']

// "Highlights" — featured projects.
export const highlights = [
  {
    name: 'IDENTITY & ACCESS PLATFORM',
    tagline: 'KEYCLOAK + POSTGRESQL, KEPT CONSISTENT',
    stats: [
      { value: 'CRASH-SAFE', label: 'Saga engine with automatic compensation' },
      { value: 'MULTI-TENANT', label: 'Organizations, groups, roles, 2FA' },
      { value: 'REUSED', label: 'Shared identity library used by other services' },
    ],
    points: [
      'Backend for users, organizations, groups, roles and product subscriptions with seats — built from an empty repository.',
      'Keycloak cannot join a database transaction, so I built a saga engine that persists every step and undoes completed ones when a later step fails.',
      'Kafka events via the transactional outbox; load-tested with k6 and profiled with JFR.',
    ],
    stack: ['Java 25', 'Quarkus', 'PostgreSQL', 'jOOQ', 'Keycloak', 'Kafka', 'Kubernetes'],
  },
  {
    name: 'DATA VERSIONING ENGINE',
    tagline: 'MATCHING AT MILLION-RECORD SCALE',
    stats: [
      { value: 'MILLIONS', label: 'Records in the master dataset' },
      { value: 'CUSTOM INDEX', label: 'In-memory B+ tree I designed' },
      { value: '14', label: 'Field-merge strategies' },
    ],
    points: [
      'Merges each new release of a large dataset into a master dataset, matching records and keeping full version history.',
      'A custom in-memory index narrows millions of candidates to a small set before the database is queried.',
      'Fully non-blocking pipeline with pluggable conflict-resolution rules.',
    ],
    stack: ['Java 25', 'Quarkus', 'Mutiny', 'MongoDB', 'Prometheus'],
  },
  {
    name: 'REAL-TIME DATA SYNC',
    tagline: 'gRPC → MONGODB & ELASTICSEARCH',
    stats: [
      { value: 'RESUMABLE', label: 'Continues where a failed run stopped' },
      { value: 'PARALLEL', label: 'Batched, concurrent processing' },
      { value: 'ON-PREM', label: 'Multiple customer environments' },
    ],
    points: [
      'Streams changed records over compressed gRPC on a schedule and applies them to MongoDB and Elasticsearch.',
      'Checkpoints each time window so no data is lost or processed twice; one bad batch never stops the whole sync.',
      'GraalVM native builds, deployed with Helm.',
    ],
    stack: ['Java', 'Quarkus', 'gRPC', 'MongoDB', 'Elasticsearch', 'Helm'],
  },
  {
    name: 'ARMENIAN VOICE AI',
    tagline: 'REAL-TIME VOICE ASSISTANT PROTOTYPE',
    stats: [
      { value: 'ARMENIAN', label: 'Speech in and out' },
      { value: 'RAG', label: 'Answers grounded in bank documents' },
      { value: 'REAL-TIME', label: 'Interruptible voice over LiveKit' },
    ],
    points: [
      'Voice assistant for banking questions (loans, deposits, branches) in a language most voice AI does not support.',
      'Speech-to-text → Claude → text-to-speech pipeline, with a pgvector knowledge base built from scraped pages.',
      'Guardrail prompts keep answers on topic and stop the model from guessing.',
    ],
    stack: ['Python', 'LiveKit', 'Claude', 'ElevenLabs', 'LlamaIndex', 'pgvector', 'React'],
  },
  {
    name: 'SPRING AI + RAG',
    tagline: 'LLM FEATURES IN JAVA BACKENDS',
    stats: [
      { value: 'RAG', label: 'Milvus vector search, top-15 chunks' },
      { value: 'TYPED', label: 'LLM output mapped to Java records' },
      { value: 'DOCKER', label: 'Self-hosted Milvus stack' },
    ],
    points: [
      'Loads documents from files and web pages, splits and embeds them, and stores them in Milvus.',
      'Prompt templates make the model answer only from retrieved documents.',
    ],
    stack: ['Java 21', 'Spring Boot', 'Spring AI', 'OpenAI', 'Milvus'],
    repo: 'https://github.com/Artyom7577/spring-ai',
  },
  {
    name: 'SUPERMARKET VORONOI MAP',
    tagline: "BACHELOR'S THESIS",
    stats: [
      { value: 'VORONOI', label: 'Service area of every store' },
      { value: 'REACTIVE', label: 'Spring WebFlux end to end' },
      { value: 'LIVE MAP', label: 'Regions drawn on Google Maps' },
    ],
    points: [
      'Collects supermarket locations across Yerevan from the Google Places API.',
      "Computes a Voronoi diagram to show each store's natural catchment area and underserved districts.",
    ],
    stack: ['Java 21', 'Spring WebFlux', 'MongoDB', 'Google Maps API'],
    repo: 'https://github.com/Artyom7577/undergraduate-project',
  },
  {
    name: 'MINITYPE',
    tagline: 'A SMALL LANGUAGE + TYPE CHECKER',
    stats: [
      { value: 'ANTLR4', label: 'Generated parser' },
      { value: 'SDD', label: 'Syntax-directed type checking' },
      { value: 'C-LIKE', label: 'Tiny language design' },
    ],
    points: ['A tiny C-like language with a type checker built as a syntax-directed definition over an ANTLR4 parser.'],
    stack: ['Java', 'ANTLR4', 'Compilers'],
    repo: 'https://github.com/Artyom7577/mini-type-checker',
  },
]

// "Academy" — education, newest first.
export const education = [
  {
    school: 'Yerevan State University',
    degree: "Master's degree, Mathematical and Software Development of Computing Machines, Complexes, Systems and Networks",
    dates: 'Aug 2025 – May 2027',
  },
  {
    school: 'Yerevan State University',
    degree: "Bachelor's degree, Informatics and Applied Mathematics",
    dates: 'Sep 2021 – May 2025',
    extras: 'Specialization: Information Security • GPA 16.7 / 20',
  },
  {
    school: 'Picsart Academy',
    degree: 'Computer Architecture • Object-Oriented Analysis & Design • SQL / NoSQL Databases',
    dates: '2022 – 2023',
  },
]

// "Trophy Cabinet" — certificates, newest first.
export const certificates = [
  {
    name: 'AWS Certified Developer – Associate',
    issuer: 'Amazon Web Services',
    date: 'Exam scheduled Nov 2026',
    skills: 'Lambda • DynamoDB • API Gateway • SQS/SNS • IAM • CI/CD',
    status: 'IN TRAINING',
  },
  {
    name: 'Introduction to Claude Cowork',
    issuer: 'Anthropic',
    date: 'May 2026',
    url: 'https://verify.skilljar.com/c/9qcyqnd6mm3m',
  },
  {
    name: 'Claude Code in Action',
    issuer: 'Anthropic',
    date: 'May 2026',
    url: 'https://verify.skilljar.com/c/2u3m7p5q4w7m',
  },
  {
    name: 'Claude Code 101',
    issuer: 'Anthropic',
    date: 'May 2026',
    url: 'https://verify.skilljar.com/c/rrk9x2eo2it3',
  },
  {
    name: 'Building with the Claude API',
    issuer: 'Anthropic',
    date: 'Apr 2026',
    skills: 'Prompt Engineering • Model Context Protocol (MCP)',
    url: 'https://verify.skilljar.com/c/w7urtoxy9koh',
  },
]

// Exhibition match text.
export const match = {
  home: 'HAYRAPETYAN FC',
  away: 'BUG CITY',
  results: {
    win: 'HAYRAPETYAN FC TAKE THE WIN. WORTH A CONTRACT?',
    draw: 'ALL LEVEL. LET THE RESUME DECIDE IT.',
    loss: 'BUG CITY NICK IT. THE RESUME STILL WINS.',
  },
}
