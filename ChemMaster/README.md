# 🧪 ChemMaster - MVP

> **Domine a química de forma interativa, intuitiva e divertida!**

![ChemMaster](https://img.shields.io/badge/Status-MVP-green)
![License](https://img.shields.io/badge/License-MIT-blue)

## 📋 Sobre o Projeto

**ChemMaster** é uma aplicação educacional web interativa focada no ensino de química geral. Desenvolvida com HTML, CSS e JavaScript puro, oferece uma experiência gamificada de aprendizado com tabela periódica 3D, quiz inteligente e sistema de conquistas.

## ✨ Features Implementadas (MVP)

### ⚛️ Tabela Periódica Interativa
- 36 elementos químicos com informações detalhadas
- Grid responsivo seguindo o layout padrão da tabela
- Cores por categoria (metais, não-metais, gases nobres, etc.)
- Modal com detalhes ao clicar:
  - Número atômico e massa
  - Pontos de fusão/ebulição
  - Configuração eletrônica
  - Usos e curiosidades
  - História da descoberta

### 🎯 Sistema de Quiz Gamificado
- Banco de 10 questões de química
- Interface limpa e intuitiva
- Sistema de pontuação com bônus de velocidade
- Feedback visual (respostas certas/erradas)
- Tela de resultados com XP ganho

### 🏆 Gamificação Completa
- **Sistema de XP**: Ganhe pontos por:
  - Visualizar elementos (+5 XP)
  - Responder questões corretamente (+10 XP)
  - Respostas rápidas (<5s) (+15 XP com bônus)
  
- **Níveis**: 10 níveis progressivos
  - Nível 1: Aprendiz (0 XP)
  - Nível 5: Especialista (1000 XP)
  - Nível 10: Mestre Químico (12.000 XP)

- **Conquistas**: 7 badges desbloqueáveis
  - 🎓 Primeiro Quiz
  - 💯 Perfeição (10/10 acertos)
  - ⚡ Velocista (resposta <5s)
  - 🧪 Químico (50 questões corretas)
  - 🏆 Mestre (nível 10)
  - 🔍 Explorador (20 elementos visualizados)
  - 🔥 Sequência (5 acertos seguidos)

- **Widget de Perfil**: Flutuante com:
  - Avatar com nível
  - Barra de progresso de XP
  - Dados salvos em LocalStorage

### 🎨 Design Premium
- Paleta de cores baseada em elementos químicos
- Fundo animado com moléculas flutuantes
- Glassmorphism e efeitos de brilho
- Fonte display "Orbitron" para títulos
- Animações suaves e micro-interações

## 🚀 Como Usar

### Instalação

1. Navegue até a pasta do projeto:
```bash
cd ChemMaster
```

2. Abra o arquivo `index.html` em seu navegador

### Ou use um servidor local:

```bash
# Python 3
python -m http.server 8000

# Node.js (http-server)
npx http-server
```

Acesse: `http://localhost:8000`

## 📁 Estrutura de Arquivos

```
ChemMaster/
├── index.html              # Estrutura HTML principal
├── chemmaster-styles.css   # Estilos completos da aplicação
├── chemmaster-data.js      # Dados dos elementos e questões
├── chemmaster-app.js       # Lógica da aplicação
└── README.md               # Este arquivo
```

## 💻 Tecnologias Utilizadas

- **HTML5**: Estrutura semântica
- **CSS3**: Grid, Flexbox, Animações, CSS Variables
- **JavaScript (ES6+)**: Vanilla JS puro, LocalStorage API
- **Google Fonts**: Inter e Orbitron

## 🎮 Como Jogar

1. **Explore a Tabela Periódica**
   - Clique em qualquer elemento para ver detalhes
   - Ganhe +5 XP por elemento visualizado

2. **Faça o Quiz**
   - Clique em "Começar Agora" ou "Fazer Quiz"
   - Responda 10 questões sobre química
   - Ganhe XP e conquistas

3. **Suba de Nível**
   - Acumule XP para subir de nível
   - Desbloqueie conquistas especiais
   - Acompanhe seu progresso no widget flutuante

## 📊 Dados do MVP

| Recurso | Quantidade |
|---------|------------|
| Elementos | 36 (de 118) |
| Questões | 10 |
| Níveis | 10 |
| Conquistas | 7 |
| Categorias de Elementos | 8 |

## 🔮 Próximos Passos (Roadmap)

### Fase 2 (Features Planejadas)
- [ ] Completar todos os 118 elementos
- [ ] Adicionar 500+ questões
- [ ] Implementar simulador de molé culas 3D
- [ ] Calculadora estequiométrica
- [ ] Laboratório virtual de gases
- [ ] Sistema de autenticação
- [ ] Modo multiplayer/desafios

### Fase 3 (Futuro)
- [ ] Backend com Node.js
- [ ] Banco de dados (MongoDB)
- [ ] API REST
- [ ] Versão mobile (React Native)
- [ ] Realidade Aumentada (AR)
- [ ] Integração com plataformas educacionais

Sistema de grupos de estudo
- [ ] Painel para professores

## 🎨 Capturas de Tela

_Screenshots serão adicionadas após testes visuais_

## 🤝 Contribuindo

Contribuições são bem-vindas! Para contribuir:

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/NovaFeature`)
3. Commit suas mudanças (`git commit -m 'Adiciona nova feature'`)
4. Push para a branch (`git push origin feature/NovaFeature`)
5. Abra um Pull Request

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 👤 Autor

Desenvolvido com 💜 por [Seu Nome]

## 🙏 Agradecimentos

- Dados dos elementos baseados em fontes públicas
- Inspiração: Khan Academy, Periodic Videos, PubChem
- Design inspirado em modern chemistry education apps

---

**ChemMaster - Transformando o ensino de química através da tecnologia!** 🧪🚀

*Versão MVP 1.0 - Janeiro 2026*
