# 🚀 LiveDeck — Stellar Ambassador Workshop 2026

> **Plataforma de Apresentação Interativa & Sincronizada em Tempo Real**  
> *Introdução a Blockchain, Web3, Smart Contracts Soroban e Agentes de IA na Rede Stellar.*

---

## 📋 Índice

- [1. Sobre o Workshop](#1-sobre-o-workshop)
- [2. Arquitetura da Plataforma LiveDeck](#2-arquitetura-da-plataforma-livedeck)
- [3. Conteúdo Programático Encorpado](#3-conteúdo-programático-encorpado)
  - [3.1. Introdução à Blockchain, Web3 & DApps](#31-introdução-à-blockchain-web3--dapps)
  - [3.2. Evolução Histórica: Web1 → Web2 → Web3](#32-evolução-histórica-web1--web2--web3)
  - [3.3. Desmistificando Mitos: Transparência & Rastreabilidade Forense](#33-desmistificando-mitos-transparência--rastreabilidade-forense)
  - [3.4. DApps (Decentralized Applications) vs Web2](#34-dapps-decentralized-applications-vs-web2)
  - [3.5. DAOs (Organizações Autônomas Descentralizadas)](#35-daos-organizações-autônomas-descentralizadas)
  - [3.6. A Rede Stellar & Inclusão Financeira (SCP)](#36-a-rede-stellar--inclusão-financeira-scp)
  - [3.7. Soroban: Contratos Inteligentes de Alta Performance em Rust](#37-soroban-contratos-inteligentes-de-alta-performance-em-rust)
  - [3.8. Fronteira Tecnológica: Agentes de IA + Rede Stellar](#38-fronteira-tecnológica-agentes-de-ia--rede-stellar)
  - [3.9. Hands-on Roadmap: Da Teoria ao Código](#39-hands-on-roadmap-da-teoria-ao-código)
- [4. Guia de Instalação & Ferramentas Stellar](#4-guia-de-instalação--ferramentas-stellar)
  - [4.1. Instalação do Rust & Target WASM](#41-instalação-do-rust--target-wasm)
  - [4.2. Instalação do Stellar CLI (Soroban CLI)](#42-instalação-do-stellar-cli-soroban-cli)
  - [4.3. Configuração de Carteira (Freighter Wallet) & Testnet Faucet](#43-configuração-de-carteira-freighter-wallet--testnet-faucet)
  - [4.4. Links & Documentações Oficiais da Stellar](#44-links--documentações-oficiais-da-stellar)
- [5. Executando o Projeto LiveDeck Localmente](#5-executando-o-projeto-livedeck-localmente)
  - [5.1. Pré-requisitos](#51-pré-requisitos)
  - [5.2. Instalação e Execução](#52-instalação-e-execução)
  - [5.3. Estrutura de Rotas e Papéis](#53-estrutura-de-rotas-e-papéis)
- [6. Licença & Créditos](#6-licença--créditos)

---

## 1. Sobre o Workshop

O **Stellar Ambassador Workshop 2026** foi desenhado para apresentar os fundamentos da tecnologia blockchain, desmistificar conceitos equivocados sobre Web3 e demonstrar a integração de **Agentes de Inteligência Artificial** com Smart Contracts na rede **Stellar (Soroban)**.

A plataforma **LiveDeck** fornece uma experiência interativa sincronizada via WebSockets, onde o apresentador possui controle total da navegação e do ponteiro laser, enquanto os espectadores acompanham a transmissão ao vivo em seus dispositivos móveis apenas escaneando um QR Code.

---

## 2. Arquitetura da Plataforma LiveDeck

A aplicação foi construída com tecnologias modernas de alto desempenho:

- **Frontend & App Framework:** Next.js (App Router), Tailwind CSS v4, Framer Motion, Lucide Icons.
- **Backend & Real-Time Sync:** Node.js, Express, Socket.IO.
- **Banco de Dados:** SQLite (Prisma ORM) com fallback em memória para sessões e participantes.
- **PDF Generation Engine:** `modern-screenshot` + `jsPDF` (renderização limpa sem botões de UI).
- **Email Service:** Nodemailer para envio automático dos slides ao encerrar a sessão.

---

## 3. Conteúdo Programático Encorpado

### 3.1. Introdução à Blockchain, Web3 & DApps
A Blockchain é um livro de razão distribuído (*distributed ledger*), imutável e descentralizado. Diferente dos bancos de dados tradicionais controlados por uma única entidade:
- **Imutabilidade:** Dados gravados em blocos encadeados por hashes criptográficos não podem ser alterados retroativamente.
- **Consenso Descentralizado:** Validadores globais garantem a integridade das transações sem a necessidade de intermediários confiáveis.

---

### 3.2. Evolução Histórica: Web1 → Web2 → Web3

```
  +-------------------------------------------------------------------+
  | Web1 (1990-2004)  │ Static / Read-Only (HTML, Páginas Estáticas)  |
  +-------------------+-----------------------------------------------+
  | Web2 (2004-2020)  │ Interactive / Read-Write (Big Techs, Redes)   |
  +-------------------+-----------------------------------------------+
  | Web3 (2020+)      │ Decoupled / Read-Write-Own (Blockchain, Smart)|
  +-------------------------------------------------------------------+
```

- **Bitcoin (2009):** Trouxe a escassez digital e o conceito de moeda peer-to-peer descentralizada, resolvendo o problema do gasto duplo (*double-spending*).
- **Ethereum (2015):** Introduziu os *Smart Contracts* e a EVM (*Ethereum Virtual Machine*), permitindo a execução de programas autônomos.
- **Rede Stellar & Soroban (Atualidade):** Evolução focada em pagamentos internacionais de altíssima velocidade (3-5s), taxas irrisórias e contratos inteligentes eficientes compilados em WebAssembly (WASM).

---

### 3.3. Desmistificando Mitos: Transparência & Rastreabilidade Forense

> 💡 **Mito Comum:** *"Blockchain é anônima e usada primariamente para ilícitos."*

**Realidade:**
1. **Publicidade Nativa:** Todo bloco e transação são públicos por padrão e auditáveis por qualquer pessoa através de exploradores de blocos (ex: [StellarExpert](https://stellar.expert/)).
2. **Análise Forense On-Chain:** Empresas de inteligência como Chainalysis, Elliptic e TRM Labs monitoram em tempo real o fluxo de fundos on-chain.
3. **KYC/AML nas Anchors:** As pontes de entrada e saída (*On/Off Ramps*) exigem compliance rigoroso alinhado às regulamentações globais.

---

### 3.4. DApps (Decentralized Applications) vs Web2

| Característica | Aplicação Web2 Tradicional | DApp Web3 (Stellar / Soroban) |
| :--- | :--- | :--- |
| **Backend** | Servidores Centralizados (AWS, GCP) | Smart Contracts em Rede Descentralizada |
| **Banco de Dados** | PostgreSQL / MySQL Centralizado | Estado Imutável Gravado On-Chain |
| **Autenticação** | Login/Senha ou OAuth2 Social | Chave Pública / Carteira Cripto / Passkeys |
| **Disponibilidade** | Sujeito a Downtime Central | 100% de Uptime Nativo da Blockchain |

---

### 3.5. DAOs (Organizações Autônomas Descentralizadas)

Organizações governadas por código transparente e votos registrados em blockchain:
- **Governança por Tokens:** Poder de voto proporcional ou quadrático com base nos tokens retidos pelos membros.
- **Votação On-Chain:** Propostas de melhoria (SIPs) aprovadas executam automaticamente transferências de tesouraria via contratos.
- **Tesouraria Transparente:** O caixa da DAO é visível publicamente em tempo real.

---

### 3.6. A Rede Stellar & Inclusão Financeira (SCP)

A **Stellar Network** é uma infraestrutura global projetada para conectar instituições financeiras e mover dinheiro de forma rápida e acessível.

- **Stellar Consensus Protocol (SCP):** Diferente do Proof-of-Work (mineração de alto consumo), o SCP utiliza o *Federated Byzantine Agreement* (FBA), permitindo confirmações em 3 a 5 segundos com consumo energético mínimo.
- **Anchors (Pontes Fiat-Cripto):** Entidades reguladas que emitem tokens lastreados em moedas fiduciárias locais (BRL, USD, EUR), permitindo remessas transfronteiriças instantâneas.

---

### 3.7. Soroban: Contratos Inteligentes de Alta Performance em Rust

O **Soroban** é a plataforma de smart contracts de última geração da Stellar, projetada com foco em segurança, previsibilidade de custos e excelente experiência para desenvolvedores.

#### Exemplo de Smart Contract Soroban em Rust:

```rust
#![no_std]
use soroban_sdk::{contract, contractimpl, symbol_short, Env, Symbol};

const COUNTER: Symbol = symbol_short!("COUNTER");

#[contract]
pub struct CounterContract;

#[contractimpl]
impl CounterContract {
    /// Incrementa o contador armazenado no estado da instância e retorna o valor atualizado.
    pub fn increment(env: Env) -> u32 {
        let mut count: u32 = env.storage().instance().get(&COUNTER).unwrap_or(0);
        count += 1;
        env.storage().instance().set(&COUNTER, &count);
        count
    }
}
```

---

### 3.8. Fronteira Tecnológica: Agentes de IA + Rede Stellar

A combinação de **Inteligência Artificial** com a **Rede Stellar** permite a criação de ecossistemas financeiros autônomos:

1. **Micropagamentos Autônomos entre IAs:** Agentes de IA consomem APIs e pagam frações de centavos via XLM ou stablecoins de forma autônoma.
2. **Invocação de Contratos Soroban via Tool Calling:** Modelos de Linguagem (LLMs) interpretam comandos do usuário e disparam chamadas em smart contracts.
3. **Abstração de Conta & Passkeys:** Autenticação moderna sem a necessidade de o usuário final gerenciar chaves privadas hexadecimais complexas.

---

### 3.9. Hands-on Roadmap: Da Teoria ao Código

1. **Setup de Ambiente:** Instalação do Rust, Soroban CLI e Carteira Freighter.
2. **Obtenção de XLM de Teste:** Utilização do Faucet da Testnet da Stellar.
3. **Compilação e Deploy:** Compilar contratos Rust para WASM e realizar deploy na Testnet.
4. **Conexão com Agentes:** Integrar SDKs TypeScript para permitir que agentes de IA interajam com o contrato.

---

## 4. Guia de Instalação & Ferramentas Stellar

Para acompanhar o desenvolvimento prático do workshop, siga as instruções de instalação das ferramentas oficiais:

### 4.1. Instalação do Rust & Target WASM

O Soroban utiliza o compilador Rust para gerar binários `wasm32-unknown-unknown`.

```bash
# 1. Instalar o Rust via rustup (Linux / macOS)
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# 2. Carregar variáveis de ambiente no shell atual
source "$HOME/.cargo/env"

# 3. Adicionar o target WebAssembly (WASM)
rustup target add wasm32-unknown-unknown
```

---

### 4.2. Instalação do Stellar CLI (Soroban CLI)

O **Stellar CLI** é a ferramenta oficial de linha de comando para compilar, testar, implantar e interagir com contratos Soroban.

#### Instalação via Cargo:
```bash
cargo install --locked stellar-cli --features opt
```

#### Verificação da Instalação:
```bash
stellar --version
```

---

### 4.3. Configuração de Carteira (Freighter Wallet) & Testnet Faucet

1. **Instalar a Extensão Freighter Wallet:**
   - [Baixar Freighter Wallet (Chrome / Firefox)](https://www.freighter.app/)
2. **Alternar para a Rede Testnet:**
   - Abra a extensão Freighter → Configurações → Alterar Rede → **Testnet**.
3. **Obter Fundos de Teste (Faucet):**
   - Acesse o [Stellar Laboratory Faucet](https://laboratory.stellar.org/#account-creator) ou use a linha de comando:
   ```bash
   stellar keys generate alice --global
   stellar keys fund alice --network testnet
   ```

---

### 4.4. Links & Documentações Oficiais da Stellar

- 📘 **Documentação Oficial da Stellar:** [https://developers.stellar.org](https://developers.stellar.org)
- ⚙️ **Documentação do Soroban:** [https://soroban.stellar.org](https://soroban.stellar.org)
- 🧪 **Stellar Laboratory (Testnet Tools):** [https://laboratory.stellar.org](https://laboratory.stellar.org)
- 🔍 **Explorador de Blocos StellarExpert:** [https://stellar.expert](https://stellar.expert)
- 🌐 **Stellar Community Fund (SCF):** [https://communityfund.stellar.org](https://communityfund.stellar.org)

---

## 5. Executando o Projeto LiveDeck Localmente

### 5.1. Pré-requisitos

- **Node.js:** Versão 18.x ou superior.
- **npm** ou **yarn / pnpm / bun**.

---

### 5.2. Instalação e Execução

```bash
# 1. Clonar o repositório ou navegar até a pasta
cd /home/kauevictor30/projetos/slides_workshop_phppi

# 2. Instalar as dependências do projeto
npm install

# 3. Iniciar o servidor com suporte a WebSockets (Express + Socket.IO + Next.js)
npm run dev
```

O servidor estará rodando em: `http://localhost:3000`

---

### 5.3. Estrutura de Rotas e Papéis

- **`http://localhost:3000/`**  
  **Tela de Início / Hub da Apresentação:** Exibe o **QR Code do Espectador**, atalhos para o apresentador e estatísticas da sala ao vivo.

- **`http://localhost:3000/join/web3-ai-workshop-2026`**  
  **Visão do Espectador (Somente Leitura):** O espectador escaneia o QR Code, insere nome/e-mail e assiste aos slides sincronizados no 1º slide. Não possui controles de navegação.

- **`http://localhost:3000/presenter/web3-ai-workshop-2026`**  
  **Painel do Apresentador (Controle Total):** Controle de slides (setas/espaço), canvas do ponteiro laser, notas do orador, modal de alunos e encerramento de sessão com envio de e-mails.

- **`http://localhost:3000/projector/web3-ai-workshop-2026`**  
  **Visão do Projetor (HDMI Limpa):** Exibição em tela cheia sem botões de interface para data show ou TV externa.

---

## 6. Licença & Créditos

Desenvolvido por **Kauê Victor** — *Stellar Ambassador*.  
Distribuído sob a licença **MIT**. Sinta-se à vontade para utilizar, modificar e contribuir com o ecossistema Web3!
