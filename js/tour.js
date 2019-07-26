$(document).ready(function () {
    function waitForElement(elementPath, callBack) {
        window.setTimeout(function () {
            if ($(elementPath).length) {
                callBack(elementPath, $(elementPath));
            } else {
                waitForElement(elementPath, callBack);
            }
        }, 500)
    }
    
    waitForElement("#heat-map-months svg", function () {
        // do other stuff load is completed

        var step1_texto = "Bem vindo a aplicação de monitoramento e análise metereológica. Nós próximos passos apresentaremos as funcionalidades.";
        var step2_texto = "Estas são as células de monitoramento. Elas mostram um resumo dos dados coletados pelos sensores. Cada célula representa um sensor.";
        var step3_texto = "Dentro de cada célula existe um gráfico do tipo gauge indicando o máximo, mínimo e o valor que o sensor capturou naquele momento.";
        var step4_texto = "Ao Clicar em uma ou mais células, os gráficos da aplicação são atualizados, utilizando as células clicadas com parâmetros.";
        var step5_texto = "Este gráfico de linha apresenta os dados de um ou mais sensores. Os dados podem ser filtrados utilizando o heatmap encontrado no topo da aplicação. Inicialmente o gráfico apresenta os dados mais recentemente capturados pelos sensores.";
        var step6_texto = "O heatmap é utilizado tanto como visualização, quanto para filtragem de dados.";
        var step7_texto = "As células representam os dias do ano. Cada célula também representa um valor de um sensor selecionado.";
        var step8_texto = "O sensor utilizado no heatmap é selecionado neste seletor.";
        var step9_texto = "Aqui encontra-se uma representação em barras de todo o ano. Este gráfico utiliza os dados mostrados no heatmap.";
        var step10_texto = "Para filtragem dos dias, utilizamos as células do heatmap.";
        var step11_texto = "Podemos, também, selecionar um período, apertando ctrl e clicando na célula inicial, e novamente apertando ctrl e apertando na célula final.";
        var step12_texto = "Ao filtrar, toda aplicação será atualizada utilizando os dados do período selecionado.";
        var step13_texto = "Ao clicar duas vezes no gráfico de linha, ele gerará um gráfico do tipo box-plot com os carregados no gráfico de linha.";
        var step14_texto = "Caso mais de uma célula dos sensores seja selecionada, novas abas aparecerão gerando box-plots de cada sensor.";
        var step15_texto = "Ao clicar neste botão os filtros aparecerão.";
        var step16_texto = "Estes filtros controlam o que toda a aplicação exibe.";
        var step17_texto = "Este seletor seleciona um conjunto de sensores, atualizando os dados de toda aplicação para esse novo conjunto de sensores.";
        var step18_texto = "Este seletor troca o tipo de representação utilizada no gráfico de linha.";
        var step19_texto = "Este seletor troca o tipo de representação utilizada no gráfico de linha.";
        var step20_texto = "Este botão acessa a planta baixa do local onde os grupos de sensores estão localizados.";

        /*$('.step-1').attr('data-intro', step1_texto);
        $('.step-2').attr('data-intro', step2_texto);
        $('.step-3').attr('data-intro', step3_texto);
        $('.step-4').attr('data-intro', step4_texto);
        $('.step-5').attr('data-intro', step5_texto);
        $('.step-6').attr('data-intro', step6_texto);
        $('.step-7').attr('data-intro', step7_texto);
        $('.step-8').attr('data-intro', step8_texto);
        $('.step-9').attr('data-intro', step9_texto);
        $('.step-10').attr('data-intro', step10_texto);
        $('.step-11').attr('data-intro', step11_texto);
        $('.step-12').attr('data-intro', step12_texto);
        $('.step-13').attr('data-intro', step13_texto);
        $('.step-14').attr('data-intro', step14_texto);
        $('.step-15').attr('data-intro', step15_texto);
        $('.step-16').attr('data-intro', step16_texto);
        $('.step-17').attr('data-intro', step17_texto);
        $('.step-18').attr('data-intro', step18_texto);
        $('.step-19').attr('data-intro', step19_texto);
        $('.step-20').attr('data-intro', step20_texto);*/

        introJs().addStep({
            element: document.querySelectorAll('.step-1')[0],
            intro: "Ok, wasn't that fun?",
            position: 'right'
        });

        var intro = introJs();

        intro.setOptions({
            steps: [
              { 
                intro: "Hello world!"
              },
              { 
                intro: "You <b>don't need</b> to define element to focus, this is a floating tooltip."
              },
              {
                element: '.step-1',
                intro: "This is a tooltip."
              },
              {
                element: '.step-2',
                intro: "Ok, wasn't that fun?",
                position: 'right'
              },
              {
                element: '.step-3',
                intro: 'More features, more fun.',
                position: 'left'
              },
              {
                element: '.step-4',
                intro: "Another step.",
                position: 'bottom'
              },
              {
                element: '.step-5',
                intro: 'Get it, use it.'
              }
            ]
          });
        introJs().start();
    });
});