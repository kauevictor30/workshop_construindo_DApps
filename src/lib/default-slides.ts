export interface SlideContent {
  badge?: string;
  category?: string;
  subtitle?: string;
  highlights?: string[];
  points?: string[];
  cards?: { title: string; desc: string; icon?: string; badge?: string }[];
  timeline?: { year?: string; title: string; desc: string; highlight?: string }[];
  comparison?: {
    leftTitle: string;
    leftBadge?: string;
    leftItems: string[];
    rightTitle: string;
    rightBadge?: string;
    rightItems: string[];
  };
  tipBox?: { title: string; desc: string; type?: 'tip' | 'warning' | 'info' };
  code?: { language: string; snippet: string; explanation?: string };
}

export interface DefaultSlideItem {
  id?: string;
  orderIndex: number;
  title: string;
  notes?: string;
  content: SlideContent;
}

export const DEFAULT_RAW_SLIDES: { title: string; notes?: string; content: SlideContent }[] = [
  {
    title: 'Boas-Vindas ao Stellar Ambassador Workshop',
    notes: 'Dar boas-vindas ao público. Explicar a dinâmica e incentivar o escaneamento do QR Code com o celular para acompanhar em tempo real.',
    content: {
      category: 'Stellar Ambassador 2026',
      badge: 'Web3 & AI Workshop',
      subtitle: 'Construindo a Nova Era de Aplicações Descentralizadas com Soroban & Inteligência Artificial',
      highlights: [
        '🌐 Infraestrutura Global: Como a Rede Stellar conecta o sistema financeiro mundial.',
        '🦀 Smart Contracts Soroban: Programabilidade segura em Rust compilado para WebAssembly (WASM).',
        '🤖 Agentes de IA Autônomos: Integração de LLMs com micropagamentos e execução on-chain.',
        '📱 Sincronização em Tempo Real: Acompanhe cada slide no seu smartphone escaneando o QR Code.',
      ],
      tipBox: {
        title: '💡 Dica Didática de Acompanhamento',
        desc: 'Escaneie o QR Code na tela principal para entrar na sala. Você acompanhará as transições de slides e o ponteiro laser em tempo real!',
        type: 'info',
      },
    },
  },
  {
    title: 'Evolução Histórica da Web: Web1 → Web2 → Web3',
    notes: 'Passar por cada fase com clareza. Destacar que a Web3 adiciona a camada de PROPRIEDADE (Ownership) de forma nativa.',
    content: {
      category: 'Fundamentos da Web3',
      subtitle: 'Como saímos das páginas estáticas de 1990 para o valor descentralizado autônomo',
      timeline: [
        {
          year: '1990 — 2004',
          title: 'Web1: Leitura (Read-Only)',
          desc: 'Páginas estáticas em HTML. O usuário consome informação passivamente sem interação.',
          highlight: 'Servidores Estáticos & Portais',
        },
        {
          year: '2004 — 2020',
          title: 'Web2: Leitura + Escrita (Read-Write)',
          desc: 'Redes sociais e Big Techs. Interatividade total, mas os dados e identidades pertencem a corporações.',
          highlight: 'Bancos Centralizados & Monetização de Dados',
        },
        {
          year: '2020 +',
          title: 'Web3: Leitura + Escrita + Propriedade (Read-Write-Own)',
          desc: 'Blockchain e Smart Contracts. O usuário possui seus dados, moedas e ativos digitais sem intermediários.',
          highlight: 'Descentralização, Soroban & Agentes Autônomos',
        },
      ],
    },
  },
  {
    title: 'Desmistificando Mitos: Transparência & Forense On-Chain',
    notes: 'Abordar o mito do anonimato do Bitcoin/cripto. Explicar que a blockchain é um livro público imutável.',
    content: {
      category: 'Segurança & Verdades',
      subtitle: 'Por que a Blockchain é a tecnologia mais auditável e transparente já inventada',
      comparison: {
        leftTitle: '❌ Mitos Populares Falsos',
        leftBadge: 'Mito de Censo Comum',
        leftItems: [
          'Criptomoedas são completamente anônimas e indetectáveis.',
          'A Blockchain é usada primariamente para atividades ilícitas.',
          'Qualquer pessoa pode apagar ou alterar uma transação passada.',
        ],
        rightTitle: '✅ Realidade Técnica',
        rightBadge: 'Funcionamento Real',
        rightItems: [
          'Publicidade Total: Todas as transações são públicas e rastreáveis on-chain.',
          'Análise Forense: Ferramentas como Chainalysis monitoram fluxos globais em tempo real.',
          'Imutabilidade Criptográfica: Bloco confirmado jamais pode ser modificado.',
        ],
      },
      tipBox: {
        title: '🔍 Curiosidade Forense',
        desc: 'Estudos de órgãos reguladores comprovam que mais de 99% das atividades ilícitas no mundo utilizam papel moeda fiat tradicional, não criptoativos públicos!',
        type: 'tip',
      },
    },
  },
  {
    title: 'O que é uma DApp? (Decentralized Application)',
    notes: 'Explicar os componentes centrais de uma DApp comparada a um site Web2 tradicional.',
    content: {
      category: 'Arquitetura de Sistemas',
      subtitle: 'Entendendo a diferença estrutural entre Web2 e Web3',
      cards: [
        {
          title: 'Frontend Reativo',
          desc: 'Interface moderna (Next.js/React) conectada à carteira do usuário (ex: Freighter) para assinar transações.',
          icon: 'layout',
          badge: 'Interface do Usuário',
        },
        {
          title: 'Smart Contracts (Soroban)',
          desc: 'A lógica de negócios não fica em um servidor privado, mas em código compilado WASM rodando na rede Stellar.',
          icon: 'cpu',
          badge: 'Backend Descentralizado',
        },
        {
          title: 'Identidade Sovereign',
          desc: 'Sem formulários de cadastro ou senhas vulneráveis. O acesso é feito via Chave Pública Criptográfica.',
          icon: 'key',
          badge: 'Autenticação Criptográfica',
        },
      ],
    },
  },
  {
    title: 'DAOs: Organizações Autônomas Descentralizadas',
    notes: 'Explicar como comunidades globais gerenciam milhões de dólares sem diretoria centralizada.',
    content: {
      category: 'Governança & Sociedade',
      subtitle: 'Modelos de gestão democráticos executados por código imutável',
      points: [
        '1. Votação Transparente On-Chain: Membros da comunidade votam em propostas utilizando seus tokens de governança.',
        '2. Tesouraria Pública Multisig: Fundos do projeto permanecem guardados no contrato e só são liberados após aprovação por consenso.',
        '3. Execução Autônoma de Decisões: Quando uma proposta atinge o número de votos necessário, o contrato executa a transferência automaticamente.',
      ],
      tipBox: {
        title: '🏛️ Exemplo de DAO na Prática',
        desc: 'O Stellar Community Fund (SCF) distribui prêmios e fundos de desenvolvimento para projetos Web3 através de votos registrados pela comunidade!',
        type: 'info',
      },
    },
  },
  {
    title: 'A Rede Stellar & O Consenso SCP',
    notes: 'Apresentar os pilares da Stellar: velocidade (3-5s), taxas insignificantes e o protocolo SCP.',
    content: {
      category: 'Infraestrutura Stellar',
      subtitle: 'Rede global otimizada para pagamentos e inclusão financeira',
      cards: [
        {
          title: 'Velocidade Extrema (3-5s)',
          desc: 'Confirmações de blocos quase instantâneas, tornando transações comerciais viáveis no dia a dia.',
          badge: 'Alta Performance',
        },
        {
          title: 'Taxa Quase Nula ($0.00001)',
          desc: 'Taxa fixa por transação extremamente baixa, protegendo a rede contra spam sem onerar o usuário.',
          badge: 'Custo Acessível',
        },
        {
          title: 'Consenso SCP (FBA)',
          desc: 'O Stellar Consensus Protocol não usa mineração Proof-of-Work. Baixo consumo de energia e segurança garantida.',
          badge: 'Sustentável',
        },
      ],
    },
  },
  {
    title: 'Soroban: Smart Contracts Modernos em Rust',
    notes: 'Explicar a arquitetura da máquina virtual Soroban e os benefícios de usar Rust.',
    content: {
      category: 'Soroban & WASM',
      subtitle: 'A plataforma de contratos inteligentes de última geração da Stellar',
      highlights: [
        '🦀 Segurança do Rust: Garantia de gerenciamento de memória sem riscos de estouro de pilha (buffer overflow).',
        '⚡ WebAssembly (WASM): Execução de alta velocidade com binários compactos e previsibilidade de recursos.',
        '📦 State Archiving (Arquivamento de Estado): Previne o inchaço da blockchain mantendo o custo de armazenamento justo.',
        '🔑 Abstração de Conta Nativa: Suporte a Passkeys (WebAuthn), Biometria e assinaturas customizadas.',
      ],
    },
  },
  {
    title: 'Código Hands-On: Smart Contract Soroban em Rust',
    notes: 'Analisar o código do contrato Rust linha por linha com os participantes.',
    content: {
      category: 'Desenvolvimento Prático',
      subtitle: 'Estrutura básica de um contrato contador em Soroban Rust',
      code: {
        language: 'rust',
        snippet: `#![no_std]
use soroban_sdk::{contract, contractimpl, symbol_short, Env, Symbol};

const COUNTER: Symbol = symbol_short!("COUNTER");

#[contract]
pub struct CounterContract;

#[contractimpl]
impl CounterContract {
    /// Incrementa o contador armazenado e retorna o valor atualizado
    pub fn increment(env: Env) -> u32 {
        let mut count: u32 = env.storage().instance().get(&COUNTER).unwrap_or(0);
        count += 1;
        env.storage().instance().set(&COUNTER, &count);
        count
    }
}`,
        explanation: 'Destaques do Código: #![no_std] remove dependências pesadas; #[contractimpl] expõe os métodos para a ABI WASM; env.storage() gerencia o estado da conta.',
      },
    },
  },
  {
    title: 'Agentes de IA na Rede Stellar',
    notes: 'Conectar os conceitos: Como modelos de IA (LLMs) interagem diretamente com a rede Stellar e contratos Soroban.',
    content: {
      category: 'IA + Web3',
      subtitle: 'A sinergia entre Inteligência Autônoma e Finanças Descentralizadas',
      points: [
        '1. Micropagamentos Autônomos entre Agentes: Agentes de IA podem pagar requisições de API por frações de centavo usando XLM ou stablecoins.',
        '2. Formulação de Intenções (Intents): A IA recebe um comando em linguagem natural do usuário e constrói a transação Soroban correspondente.',
        '3. Validação e Simulação Previa: O agente simula a execução on-chain antes de assinar, evitando desperdício de fundos ou erros de contrato.',
      ],
      tipBox: {
        title: '🤖 O Futuro da Automação Financeira',
        desc: 'Agentes de IA não possuem contas bancárias tradicionais, mas podem possuir chaves públicas Stellar para transacionar valor autonomamente!',
        type: 'tip',
      },
    },
  },
  {
    title: 'Código Hands-On: Ferramenta de Agente IA (TypeScript)',
    notes: 'Mostrar como uma LLM invoca uma função de envio ou contrato Soroban usando Tool Calling com schema Zod.',
    content: {
      category: 'Integração de Agentes',
      subtitle: 'Definindo uma ferramenta de micropagamento para Agentes de IA com LangChain',
      code: {
        language: 'typescript',
        snippet: `import { DynamicTool } from "@langchain/core/tools";
import { Keypair, TransactionBuilder, Networks, Operation } from "@stellar/stellar-sdk";

export const sendPaymentTool = new DynamicTool({
  name: "stellar_send_payment",
  description: "Envia um micropagamento via Rede Stellar para um destinatário especifico",
  func: async (input: { destination: string; amount: string }) => {
    // 1. Carrega as chaves criptografadas do Agente
    const sourceKeys = Keypair.fromSecret(process.env.AGENT_SECRET_KEY!);
    
    // 2. Constrói a transação on-chain
    console.log(\`[AI Agent] Enviando \${input.amount} XLM para \${input.destination}\`);
    return \`Transação enviada com sucesso para \${input.destination}\`;
  },
});`,
        explanation: 'Explicação: A LLM valida os parâmetros destination e amount antes de chamar o SDK oficial da Stellar para preparar a transação.',
      },
    },
  },
  {
    title: 'Roadmap Hands-On do Desenvolvedor Web3',
    notes: 'Mostrar o passo a passo prático para qualquer desenvolvedor começar a construir na Stellar hoje.',
    content: {
      category: 'Guia Prático',
      subtitle: '3 Passos Simples para Compilar, Fazer Deploy e Testar seu primeiro Smart Contract',
      timeline: [
        {
          year: 'Passo 1',
          title: 'Instalar Rust & Stellar CLI',
          desc: 'Instale o compilador Rust, adicione o target WASM e instale a CLI oficial da Stellar via Cargo.',
          highlight: 'stellar-cli + cargo',
        },
        {
          year: 'Passo 2',
          title: 'Criar Carteira & Obter Fundos Testnet',
          desc: 'Instale a extensão Freighter Wallet e use o Faucet do Stellar Laboratory para receber XLM de testes.',
          highlight: 'Freighter Wallet + Faucet',
        },
        {
          year: 'Passo 3',
          title: 'Deploy e Invocação On-Chain',
          desc: 'Execute "stellar contract deploy" para subir o arquivo .wasm para a Testnet e invoque os métodos remotamente.',
          highlight: 'Deploy na Testnet Soroban',
        },
      ],
    },
  },
  {
    title: 'Conclusão & Próximos Passos',
    notes: 'Agradecer a participação de todos, abrir para perguntas e respostas (Q&A) e disponibilizar os slides em PDF.',
    content: {
      category: 'Encerramento',
      badge: 'Obrigado pela Participação!',
      subtitle: 'Você está pronto para construir a próxima geração de DApps e Agentes de IA na Stellar',
      highlights: [
        '✅ Conhecimento Adquirido: Compreensão de Blockchain, DApps, DAOs, SCP e Soroban.',
        '🚀 Mão na Massa: Exemplos práticos em Rust e TypeScript prontos para expansão.',
        '📄 Material de Apoio: Faça o download dos slides em PDF diretamente pela página inicial!',
      ],
      tipBox: {
        title: '🎉 Envio Automático dos Slides por E-mail',
        desc: 'Ao encerrar a sessão pelo Painel do Apresentador, todos os alunos cadastrados receberão a apresentação oficial diretamente na caixa de entrada!',
        type: 'tip',
      },
    },
  },
];

export const DEFAULT_SLIDE_ITEMS: DefaultSlideItem[] = DEFAULT_RAW_SLIDES.map((item, index) => ({
  id: `default_slide_${index + 1}`,
  orderIndex: index,
  title: item.title,
  notes: item.notes,
  content: item.content,
}));
