# Validação da Ficha de arquivo

A Ficha exibe a série atual e os dados sincronizados: título, família, formato e disponibilidade. Os controles acessíveis **Série anterior** e **Próxima série** funcionam por clique e teclado; a navegação direta mudou de Série 01 para Série 02 e retornou à Série 01 com imagens diferentes. Com Gatos filtrado, a ficha permaneceu sincronizada em `SÉRIE 02 / 07`, coleção Gatos e título Gato amuleto.

A navegação por teclado usou Tab e Enter. A troca aplica `spotlight-series-enter` ao card e à ficha, respeitando `prefers-reduced-motion`. A captura mobile full-page foi fatiada para inspeção: as regiões do catálogo mostram as artes em coluna de duas grades, com a Ficha posicionada no fluxo vertical após o arquivo. A própria captura é uma renderização full-page estreita e não permite ler todos os rótulos em escala reduzida; os rótulos dos controles foram confirmados na inspeção renderizada desktop e os estilos mobile dedicados reduzem espaçamento e mantém os controles agrupados.

Tipagem, 12 testes e build de produção passaram.

A inspeção das fatias mobile finais confirmou que o catálogo segue em duas colunas estreitas e que o fluxo vertical continua ordenado até Processo, FAQ e Contato. A Ficha fica entre a seleção de Flashs e a grade principal no fluxo da página; a captura full-page reduzida não é adequada para ler seus rótulos, portanto os nomes exatos dos controles permanecem comprovados pela renderização DOM: Série anterior e Próxima série.
