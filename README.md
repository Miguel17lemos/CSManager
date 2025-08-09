<img src="https://imgur.com/10kuTxK">

# 🚀 Aumenta a tua produtividade e trabalha com a PHC CS Framework de forma simples e eficiente!

<img src="https://imgur.com/UDmWDJK"><br>
### 📥 Recebe os teus scripts do PHC CS Web diretamente no VS Code!
Transforma o teu fluxo de trabalho no PHC CS Web com o **PHC Cs Code**. Importa facilmente os scripts criados para a tua pasta de trabalho e utiliza o poder do **Visual Studio Code** junto com as tuas extensões favoritas para uma experiência de programação eficiente e personalizada.

🚀 **Escreve**, **edita**, e **melhora o teu código** com toda a flexibilidade do VS Code. E, quando o teu código estiver pronto, basta **submetê-lo** de volta ao **PHC CS Web** de forma rápida e simples.

📂 **Scripts organizados na tua pasta de trabalho**, permitindo-te navegar facilmente entre todos os tipos de scripts criados na **PHC CS Framework Web**. Com o **PHC Cs Code**, tens tudo à mão para editar, gerir e submeter os teus scripts de forma eficiente e integrada no Visual Studio Code.

### 👨‍💻 Work in Progress...
- Permitir o envio e recepção de todos os tipos de expressões existentes no PHC CS Web Framework. Esta atualização vai expandir as capacidades da extensão, oferecendo uma integração completa e flexível com todas as expressões do framework.
- Interface gráfica completa que incluirá todas as funcionalidades dos comandos do VSCode. Esta melhoria permitirá uma interação mais intuitiva e eficiente, facilitando a gestão das suas tarefas e comandos diretamente através da extensão.
- Criação de scripts diretamente no PHC Cs Code. Em breve, será possível realizar todas as suas tarefas e operações diretamente na extensão, tornando o seu fluxo de trabalho ainda mais eficiente e integrado.

### 🤝 Contribui para o Desenvolvimento
Estamos sempre à procura de contribuições para melhorar o PHC Cs Code! Se desejas ajudar a desenvolver a extensão, podes fazê-lo aqui mesmo no repositório. As tuas sugestões, correções e melhorias são muito bem-vindas e são essenciais para tornar a extensão ainda melhor. Lembra-te: uma comunidade forte é construída com as contribuições de todos. Junta-te a nós e faz a diferença!

## 📦 Instalação
Para instalar o **PHC Cs Code**, siga estes passos:

1. **Descarregue o ficheiro** `PHCCsCode(...).vsix` da última versão disponível na [secção de Releases do Repositório.](https://github.com/Miguel17lemos/CSManager/releases)
2. Abra o **Visual Studio Code**.
3. Vá até a aba de extensões (ou pressione `Ctrl+Shift+X`)
4. Clique nos três pontos no canto superior direito da aba de extensões e selecione **Instalar a partir do VSIX**.
5. Selecione o ficheiro `PHCCsCode(...).vsix` e clique em **Instalar**.
6. Após a instalação, reinicie o Visual Studio Code para completar o processo.

## 📚 Como Usar
Após instalar o **PHC Cs Code**, podes começar a usá-lo seguindo estes passos:
1. Abre a **Linha de Comandos do Visual Studio Code** através da barra de pesquisa na parte superior do ecrã do VSCode e escolhe a opção `Mostrar e Executar Comandos >`, ou simplesmente digita um `>`. Em alternativa, existe o atalho `Ctrl+Shift+P`.
2. Pesquisa por **PHCCsCode** e serão apresentados todos os comandos da extensão. <br><img src="https://imgur.com/UDmWDJK">
<br>

## 🚨 **Avisos Importantes:
1. O ficheiro data.js contem todos o dados do registo, caso seja feita qualquer alteração nele será refletida na base de dados.
2. Em caso de push o registo não existir na base de dados este é criado, isto facilita numa implementação em que um push de todos o ficheiros todos serão criados e atualizados.


## 🧰 Configurações Iniciais da Extensão
Para garantir que a extensão possa comunicar eficazmente com o servidor de base de dados, é essencial configurar as informações de acesso ao Microsoft SQL Server nas configurações globais da extensão. Preencha estes detalhes para uma integração perfeita e um fluxo de trabalho sem interrupções.

Pode fazê-lo através do comando `PHCCsCode: Configuration`.<br>
Ou, em alternativa, uma forma mais prática para alguns, editar diretamente nas `Definições` do Visual Studio Code.
1. No menu superior, clique em `Ficheiro` e depois em `Preferências`.
2. No submenu que aparece, selecione "Configurações" (ou utilize o atalho de teclado `Ctrl+,`).
3. Na barra de pesquisas, procure por `PHCCsCode` e preencha todos os campos de configuração da extensão, os cookies de seesão do PHC deve ser copiados após o login na aplicação (ASP.NET_SessionId=Este cookie só muda quando é realizado um login | PHC_Intranet202404=Muda de x em x tempo, mediante o parametro authentication do ficheiro web.config do IIS que por defeito está 60 minutos, sempre que os coockies expirarem a extensão informará) <br> <img src="https://imgur.com/a/EK2LUY1">

## 🛠️ Problemas Conhecidos e Soluções

N/A

Se tiveres problemas que não consegues resolver, não hesites em abrir uma [issue](https://github.com/Miguel17lemos/CSManager/issues) no repositório do GitHub.