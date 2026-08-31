
Validação do Arquivo completo: o DOM renderizado apresenta uma arte representativa por família/série, reduzindo 108 desenhos para 20 entradas visuais. O card Anões abre o lightbox contextual com a imagem Rosto em carvão e contador 1 / 4, confirmando que as outras artes da série permanecem acessíveis dentro do lightbox. A Ficha também exibe seis miniaturas clicáveis e os controles Série anterior/Próxima série.

Validação funcional do lightbox: a seta Próximo avançou o contador de 1 / 4 para 2 / 4 mantendo a série Rosto em carvão; o gesto simulado de deslizar para a esquerda avançou de 2 / 4 para 3 / 4. Isso confirma a navegação contextual entre as quatro artes da série.

Captura mobile full-page após o agrupamento: o Arquivo completo mostra uma única arte por família/série, com a grade mais curta e compacta; a seção segue acessível depois do filtro e os cards permanecem clicáveis para abrir o lightbox. A captura confirma a redução de volume visual de 108 artes para 20 entradas representativas no arquivo principal.

Validação final do lightbox contextual: a primeira prancha representativa abriu o diálogo com a série ANÕES e contador 1 / 4. No container interno do lightbox, um TouchEvent com início em x=320 e fim em x=80, separado por 80 ms, avançou o contador para 2 / 4, confirmando o gesto horizontal entre artes da mesma série. O modal também exibe WhatsApp, Copiar Link, dimensão e navegação anterior/próxima.

Validação da nova busca: no preview, “Rosto em carvão” retornou 004 entradas no catálogo e uma série representativa ANÕES com 4 artes; “Os que escapam” não retornou catálogo principal, mas exibiu os Flashs correspondentes na seção Flashs. A combinação “Rosto em carvão” + família Anões + disponibilidade Disponível manteve o card correto e o filtro Anões ativo.

Validação do skeleton: o DOM renderizado expôs image-skeleton em cada LoadingImage e data-loading-state=loaded após o carregamento; o helper unitário cobre deterministically os estados image-loading-shell e image-loading-shell is-loaded. A regra de movimento reduzido desativa o shimmer.

Validação da melhoria de miniaturas: a Ficha iniciou em Rosto em carvão, série 01 / 108; ao clicar na miniatura “Entre marés”, mudou para Entre marés e série 05 / 108, com estado ativo sincronizado. As miniaturas agora são controles explícitos, acessíveis por aria-label e aria-current.

Validação de espaçamento: gaps reduzidos na faixa de destaque, Flashs, Arquivo de Flashs, Ficha e grade masonry, com ajustes equivalentes para mobile. A captura mobile confirmou a composição mais compacta sem perda de legibilidade.

Validação responsiva final: no fluxo de preview com viewport mobile solicitado, a miniatura de Entre marés foi acionada e a Ficha atualizou a imagem principal, o título para Entre marés e o índice da série para 05 / 108. Os controles da Ficha permaneceram legíveis; a captura mobile full-page confirmou os gaps reduzidos nas grades de destaque, Flashs, Arquivo e catálogo.

Validação móvel adicional: com viewport solicitado de 390 × 844, a Ficha foi reestabelecida em Rosto em carvão e, no toque/clique seguinte da miniatura Entre marés, atualizou a imagem principal e o título para Entre marés. A captura resultante mostrou a trilha de miniaturas e os controles de navegação legíveis após a compactação.

Validação da Seleção do Arquivo: o preview exibiu 10 / 20 imagens candidatas (seis a mais que a faixa anterior de quatro) e o aviso “10 imagens selecionadas · próxima troca em 2d 23h ...”, com data exata da próxima troca. A seção Flashs permaneceu com seus próprios 8 destaques e contador independente.

Validação da Seleção do Arquivo: o preview mostrou Figura umbral e Voo de bruxas consecutivos nas posições 09 e 10. O botão de favorito da Figura umbral mudou para “Remover A figura umbral dos favoritos”, confirmando persistência e ação independente da abertura. O filtro local por Família Umbra reduziu a seleção a 1 imagem e exibiu o botão Limpar; os filtros Família e Estilo ficaram disponíveis no bloco da seleção.

Validação da correção de sobreposição: no preview, os quatro primeiros cards do Arquivo apresentaram `frameBottom` igual a `captionTop` (gap 0px), indicando que a legenda começa exatamente após o frame da imagem, sem invasão vertical. A imagem, o status e os controles permanecem dentro do card, com os espaçamentos mobile corrigidos.

Validação da correção de sobreposição: no desktop, o primeiro card do Arquivo apresentou frameBottom 4437 e ações abaixo, entre 4445–4472, com 25px de distância vertical mínima; os controles mantiveram os rótulos “Remover Rosto em carvão dos favoritos” e “Compartilhar Rosto em carvão”. O clique no favorito atualizou o localStorage, o compartilhamento foi acionado e o foco retornou ao botão com tag BUTTON. A captura mobile full-page confirmou o layout após o ajuste de altura intrínseca dos frames.

Validação final da sobreposição: a medição desktop confirmou que os controles de favorito e compartilhar ficaram abaixo do frame e não invadiram a imagem; os dois botões foram encontrados com labels acessíveis, o favorito atualizou o localStorage e o compartilhamento foi acionado. A sequência de foco foi preparada no favorito e avançou por Tab para o controle seguinte. A captura em viewport mobile confirmou a separação visual do card e o espaçamento vertical entre imagem, legenda e ações após o ajuste de altura intrínseca.

Validação da nova interação: o clique na imagem do primeiro card abriu o lightbox com título, dimensões e ações de WhatsApp/Copiar link. O filtro Somente favoritos foi testado em estado vazio (0 cards) e no fluxo completo: após favoritar Rosto em carvão, o filtro exibiu exatamente 1 entrada e o botão permaneceu com o rótulo “Remover Rosto em carvão dos favoritos”.

Validação desta entrega: o Arquivo completo abriu o lightbox pelo botão de imagem e exibiu título, dimensões, navegação, WhatsApp e Copiar link. O filtro Somente favoritos foi confirmado no DOM com checkbox focável e, após favoritar Rosto em carvão, reduziu o Arquivo para 1 entrada. A captura desktop mostrou os cards com gaps ampliados e sem sobreposição; a captura mobile revisou a mesma composição em duas colunas. O pulso foi limitado a 420ms e desligado em prefers-reduced-motion.

Validação adicional: o checkbox “Somente favoritos” recebeu foco real com tabIndex 0 e label associada; após Shift+Tab, o foco retornou ao select “Ordenar”, confirmando a ordem de navegação. O gap computado da grade desktop foi 14px vertical / 12px horizontal; a captura mobile revisou a grade em duas colunas com espaçamento ampliado. A regra CSS de `prefers-reduced-motion` para `.drawing-actions button.is-pulsing svg` foi detectada e desativa a animação, enquanto o pulso normal permanece limitado a 420ms.

Inspeção visual final das capturas: a captura desktop mostrou a grade do Arquivo com colunas separadas, áreas de imagem independentes e legendas/ações iniciando abaixo de cada frame. A captura mobile mostrou a mesma composição em duas colunas, com espaçamento vertical visível entre cards, sem imagens invadindo legendas ou controles. A leitura visual confirma a correção solicitada de sobreposição.

Validação de teclado concluída: o foco foi colocado no select Ordenar, Tab real moveu o foco para o input checkbox Somente favoritos, identificado com `type=checkbox`, `tabIndex=0` e label “Somente favoritos”. A checagem anterior confirmou Space alternando o filtro e Shift+Tab retornando ao select anterior.

Revisão visual do Arquivo completo: na captura mobile, a seção mantém duas colunas, títulos e metadados legíveis, ações agrupadas abaixo da imagem e respiro consistente entre cards, sem colisões. Na captura desktop, o spread da ficha e a grade apresentam hierarquia mais clara, escala equilibrada e maior separação entre grupos de cards; o título agora aparece na legenda, seguido de família/índice, descritor e ações.

Validação interativa da revisão: após navegar até o Arquivo, a barra `.filter-shell` manteve `position: sticky` e z-index 5 durante a rolagem. No ponto medido, o filtro terminou em 1217px e o primeiro card começou em 1298px, deixando separação de 81px; portanto, o filtro não cobriu o conteúdo nem a legenda dos cards.

Validação de interação concluída: com o cursor no centro do primeiro card do Arquivo, o hover revelou “Rosto em carvão” e a família “Anões” na camada sobre a imagem; os botões de ação permaneceram em área própria abaixo, sem colisão. A nova legenda também manteve título, índice/família e descritor separados.

Validação interativa final: após mover o cursor para o primeiro card, `.drawing-hover-info` ficou com opacidade 1, exibindo “Rosto em carvão / Anões”, enquanto as ações permaneceram visíveis em retângulo próprio. Com foco no botão de imagem, Tab levou ao botão de favorito do mesmo card; o elemento ativo foi um `BUTTON` dentro de `.drawing-tile`, com label “Remover Rosto em carvão dos favoritos” e `aria-pressed=true`.

Captura mobile final da revisão: o Arquivo completo mantém duas colunas com ritmo vertical consistente; a nova linha de título, família/índice, descritor e ações continua legível, e as imagens permanecem isoladas sem sobreposição entre cards.
