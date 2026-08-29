import { db, SessionRecord, SlideRecord, ParticipantRecord } from '../db';
import crypto from 'crypto';

export interface SlideContent {
  badge?: string;
  category?: string;
  subtitle?: string;
  highlights?: string[];
  points?: string[];
  cards?: { title: string; desc: string }[];
  code?: { language: string; snippet: string };
}

export function getOrCreateDefaultSession(): { session: SessionRecord; slides: SlideRecord[] } {
  const existingSession = db.prepare('SELECT * FROM sessions ORDER BY createdAt ASC LIMIT 1').get() as SessionRecord | undefined;

  if (existingSession) {
    const slides = db.prepare('SELECT * FROM slides WHERE sessionId = ? ORDER BY orderIndex ASC').all(existingSession.id) as SlideRecord[];
    return { session: existingSession, slides };
  }

  // Create new Session
  const sessionId = 'web3-ai-workshop-2026';
  const presenterToken = 'pres_secret_' + crypto.randomBytes(8).toString('hex');
  const now = new Date().toISOString();

  const session: SessionRecord = {
    id: sessionId,
    title: 'Introdução a Blockchain: Construindo DApps na Web3 com Agentes de IA na Prática',
    presenterToken,
    status: 'live',
    currentSlide: 0,
    createdAt: now,
    updatedAt: now,
  };

  db.prepare(`
    INSERT INTO sessions (id, title, presenterToken, status, currentSlide, createdAt, updatedAt)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(session.id, session.title, session.presenterToken, session.status, session.currentSlide, session.createdAt, session.updatedAt);

  // Default Slide Deck Content
  const rawSlides: { title: string; notes?: string; content: SlideContent }[] = [
    {
      title: 'Introdução a Blockchain & Web3',
      notes: 'Dar boas-vindas a todos. Solicitar que escanem o QR Code no celular para acompanhar a apresentação em tempo real.',
      content: {
        category: 'Live Workshop 2026',
        badge: 'Web3 + AI Architecture',
        subtitle: 'Construindo DApps na Web3 com Agentes de IA na Prática',
        highlights: [
          'Decentralized Infrastructure & Smart Contracts',
          'Autonomous Agentic Reasoning with LLMs',
          'Account Abstraction (ERC-4337) & Keyless UX',
          'Real-time On-Chain Data Integration',
        ],
      },
    },
    {
      title: 'O Problema Atual das DApps',
      notes: 'Explicar a dor real dos usuários Web2 tentando usar dApps atuais. A fricção de UX mata a conversão.',
      content: {
        category: 'Contexto & Dores',
        subtitle: 'UX Complexa e Alta Barreira de Entrada na Web3',
        points: [
          'Gestão de Wallets & Private Keys assusta e afasta usuários tradicionais.',
          'Assinatura de Transações com calldata hexadecimal ininteligível.',
          'Taxas de Gas flutuantes e falhas de execução sem mensagens amigáveis.',
          'Falta de assistência proativa durante a jornada de onboarding.',
        ],
      },
    },
    {
      title: 'A Nova Era: Agentes de IA na Web3',
      notes: 'Mostrar como a transição de interfaces rígidas para Agentes Autônomos simplifica tudo.',
      content: {
        category: 'Arquitetura de Solução',
        subtitle: 'De interfaces passivas para assistentes de decisão autônomos',
        cards: [
          {
            title: 'Agentic Reasoning',
            desc: 'Agentes analisam o estado da blockchain, calculam riscos e formulam intenções de execução (Intents).',
          },
          {
            title: 'Account Abstraction (ERC-4337)',
            desc: 'Agentes utilizam Paymasters para patrocinar gas e Bundlers para submeter transações sem fricção.',
          },
          {
            title: 'Self-Correction & Audit',
            desc: 'Agentes simulam chamadas on-chain via eth_call antes da execução real para evitar perda de fundos.',
          },
        ],
      },
    },
    {
      title: 'Anatomia de um Smart Contract Moderno',
      notes: 'Revisar brevemente o contrato Solidity base para registro de Agentes.',
      content: {
        category: 'Smart Contracts',
        subtitle: 'Solidity 0.8.24 + Padrões de Segurança',
        code: {
          language: 'solidity',
          snippet: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract AgentRegistry {
    struct Agent {
        address owner;
        string ipfsMetadata;
        bool isActive;
    }

    mapping(bytes32 => Agent) public agents;
    event AgentRegistered(bytes32 indexed agentId, address indexed owner);

    function registerAgent(bytes32 agentId, string calldata metadata) external {
        require(!agents[agentId].isActive, "Agent already exists");
        agents[agentId] = Agent(msg.sender, metadata, true);
        emit AgentRegistered(agentId, msg.sender);
    }
}`,
        },
      },
    },
    {
      title: 'Como Agentes Interagem com a EVM',
      notes: 'Explicar o ciclo de vida do Tool Calling conectando a LLM aos contratos.',
      content: {
        category: 'Integração Web3',
        subtitle: 'Tool Calling, Viem e JSON-RPC Protocols',
        points: [
          '1. Tool Definition: O LLM recebe a assinatura estruturada das funções do Smart Contract.',
          '2. Intent Generation: A IA decide executar uma leitura (eth_call) ou transação (eth_sendTransaction).',
          '3. Simulation & Validation: Validação de saldo, limites de gas e simulação de alteração de estado.',
          '4. Execution & Receipt: Submissão para o nó RPC e monitoramento dos logs do evento.',
        ],
      },
    },
    {
      title: 'Agentes IA com LangChain & Viem (Hands-On)',
      notes: 'Destacar o código TypeScript real. Focar no schema Zod das ferramentas do Agente.',
      content: {
        category: 'Hands-On Code',
        subtitle: 'Definindo ferramentas Web3 para o Agente em TypeScript',
        code: {
          language: 'typescript',
          snippet: `import { DynamicStructuredTool } from "@langchain/core/tools";
import { parseEther } from "viem";
import { z } from "zod";

export const transferTokensTool = new DynamicStructuredTool({
  name: "transfer_tokens",
  description: "Transfere tokens ERC-20 ou ETH nativo para um endereço destinatário",
  schema: z.object({
    recipient: z.string().describe("Endereço Ethereum no formato 0x..."),
    amount: z.string().describe("Quantidade em ETH/tokens (ex: '0.05')"),
  }),
  func: async ({ recipient, amount }) => {
    const txHash = await walletClient.sendTransaction({
      to: recipient as \`0x\${string}\`,
      value: parseEther(amount)
    });
    return \`Transação enviada! Hash: \${txHash}\`;
  }
});`,
        },
      },
    },
    {
      title: 'Oráculos & Dados Off-Chain em Tempo Real',
      notes: 'Mostrar a importância de Chainlink e The Graph para evitar alucinações de LLM em dados de mercado.',
      content: {
        category: 'Infraestrutura de Dados',
        subtitle: 'Conectando LLMs a Chainlink Feeds e Subgraphs',
        cards: [
          {
            title: 'Chainlink Price Feeds',
            desc: 'Garante precificação descentralizada e confiável sem manipulação de oráculos centralizados.',
          },
          {
            title: 'Subgraphs (The Graph)',
            desc: 'Consultas em tempo de execução via GraphQL para resgatar histórico de transações do usuário.',
          },
          {
            title: 'RAG On-Chain',
            desc: 'Vetorização e indexação de especificações de contratos e mempool para contexto preciso.',
          },
        ],
      },
    },
    {
      title: 'Casos de Uso Reais na Prática',
      notes: 'Apresentar exemplos práticos que já estão operando no mercado.',
      content: {
        category: 'Casos Práticos',
        subtitle: 'Aplicações reais de Agentes de IA na Web3',
        cards: [
          {
            title: 'DeFi Liquidity Rebalancing',
            desc: 'Agentes que gerenciam posições em Uniswap v3 e Aave ajustando a liquidez automaticamente.',
          },
          {
            title: 'Automated Governance (DAOs)',
            desc: 'Agentes que analisam propostas de governança complexas e executam votos alinhados à estratégia.',
          },
          {
            title: 'Autonomous Game NPCs',
            desc: 'Personagens em jogos Web3 que possuem carteiras próprias e negociam itens com jogadores.',
          },
        ],
      },
    },
    {
      title: 'Segurança & Vetores de Ataque',
      notes: 'Alertar sobre os riscos e as boas práticas de segurança ao conectar IAs a carteiras ativas.',
      content: {
        category: 'Segurança & Compliance',
        subtitle: 'Mitigando riscos ao dar autonomia financeira a IAs',
        points: [
          'Prompt Injection: Proteger as ferramentas contra injeção de texto em mensagens de transação.',
          'Spending Limits: Aplicar regras rígidas de teto diário de valor em nível de Smart Contract.',
          'Multi-Signature Approvals: Transações acima do limite exigem aprovação humana explícita.',
          'Key Isolation: Manter as private keys dos agentes em hardware enclave (KMS / TEE).',
        ],
      },
    },
    {
      title: 'Passo a Passo: Construindo seu DApp com IA',
      notes: 'Passar o roteiro sintético para quem quer implementar o projeto após a aula.',
      content: {
        category: 'Roadmap de Implementação',
        subtitle: 'Da concepção ao deploy em rede de teste (Sepolia / Base)',
        points: [
          '1. Escrever e compilar os Smart Contracts em Solidity (Foundry / Hardhat).',
          '2. Configurar o nó RPC da rede de teste no Alchemy ou Infura.',
          '3. Criar os Prompts e Tools de IA usando TypeScript / LangChain.',
          '4. Desenvolver a UI responsiva em Next.js + Tailwind + Socket.IO para sincronização.',
        ],
      },
    },
    {
      title: 'Resumo & Principais Insights',
      notes: 'Recapitulando os 3 pontos mais importantes do workshop.',
      content: {
        category: 'Conclusão & Takeaways',
        subtitle: 'O futuro da Web3 é impulsionado por autonomia inteligente',
        highlights: [
          'A Inteligência Artificial é a nova camada de abstração de UI da Web3.',
          'Account Abstraction remove a dor de cabeca das Private Keys para a audiência.',
          'Agentes de IA seguros exigem limites claros no contrato inteligente.',
          'O ecossistema está pronto para produção: Next.js + Viem + Socket.IO.',
        ],
      },
    },
    {
      title: 'Encerramento & Material do Workshop',
      notes: 'Clicar em "Encerrar Sessão" no painel do instrutor para disparar os e-mails aos participantes.',
      content: {
        category: 'Follow-up Automático',
        subtitle: 'Obrigado por participar! O material foi enviado por e-mail.',
        points: [
          'Todos os participantes cadastrados receberão o slide e o repositório por e-mail.',
          'Verifique sua caixa de entrada e pasta de spam.',
          'Contato & Dúvidas: kauemotavitor30@gmail.com',
          'Desenvolvido com LiveDeck — Plataforma Sincronizada para Workshops.',
        ],
      },
    },
  ];

  const insertSlideStmt = db.prepare(`
    INSERT INTO slides (id, sessionId, orderIndex, title, content, notes)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  const createdSlides: SlideRecord[] = [];

  rawSlides.forEach((slideItem, index) => {
    const slideId = `slide_${index}_${crypto.randomBytes(4).toString('hex')}`;
    const contentStr = JSON.stringify(slideItem.content);
    insertSlideStmt.run(slideId, session.id, index, slideItem.title, contentStr, slideItem.notes || null);
    createdSlides.push({
      id: slideId,
      sessionId: session.id,
      orderIndex: index,
      title: slideItem.title,
      content: contentStr,
      notes: slideItem.notes,
    });
  });

  return { session, slides: createdSlides };
}

export function getSession(sessionId: string): { session: SessionRecord | null; slides: SlideRecord[] } {
  const session = db.prepare('SELECT * FROM sessions WHERE id = ?').get(sessionId) as SessionRecord | undefined;
  if (!session) return { session: null, slides: [] };
  const slides = db.prepare('SELECT * FROM slides WHERE sessionId = ? ORDER BY orderIndex ASC').all(sessionId) as SlideRecord[];
  return { session, slides };
}

export function addParticipant(sessionId: string, name: string, email: string, consentLgpd: boolean): ParticipantRecord {
  const existing = db.prepare('SELECT * FROM participants WHERE sessionId = ? AND email = ?').get(sessionId, email) as ParticipantRecord | undefined;
  if (existing) {
    db.prepare('UPDATE participants SET name = ?, consentLgpd = ? WHERE id = ?').run(name, consentLgpd ? 1 : 0, existing.id);
    return { ...existing, name, consentLgpd: consentLgpd ? 1 : 0 };
  }

  const id = 'part_' + crypto.randomBytes(8).toString('hex');
  const now = new Date().toISOString();
  db.prepare(`
    INSERT INTO participants (id, sessionId, name, email, consentLgpd, joinedAt)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(id, sessionId, name, email, consentLgpd ? 1 : 0, now);

  return { id, sessionId, name, email, consentLgpd: consentLgpd ? 1 : 0, joinedAt: now };
}

export function updateSessionSlide(sessionId: string, slideIndex: number): boolean {
  const result = db.prepare('UPDATE sessions SET currentSlide = ?, updatedAt = ? WHERE id = ?').run(slideIndex, new Date().toISOString(), sessionId);
  return result.changes > 0;
}

export function updateSessionStatus(sessionId: string, status: 'live' | 'ended'): boolean {
  const result = db.prepare('UPDATE sessions SET status = ?, updatedAt = ? WHERE id = ?').run(status, new Date().toISOString(), sessionId);
  return result.changes > 0;
}

export function getParticipants(sessionId: string): ParticipantRecord[] {
  return db.prepare('SELECT * FROM participants WHERE sessionId = ? ORDER BY joinedAt DESC').all(sessionId) as ParticipantRecord[];
}
