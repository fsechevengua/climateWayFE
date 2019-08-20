// Setar true para ligar o tour
var _tourOn = false;

$(document).ready(function () {
    $(document).ajaxStop(function () {
        if(_tourOn)
        {
          _intro = false;
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

          var intro = introJs();

          intro.setOptions({
              steps: [
                { 
                  intro: step1_texto
                },
                { 
                  element: '.step2',
                  intro: step2_texto
                },
                { 
                  element: '.step3',
                  intro: step3_texto
                },
                { 
                  element: '.step4',
                  intro: step4_texto
                },
                { 
                  element: '.step5',
                  intro: step5_texto
                },
                { 
                  element: '#heat-map-months svg',
                  intro: step6_texto
                },
                { 
                  intro: step7_texto
                },
                { 
                  element: '.step8',
                  intro: step8_texto,
                },
              ]
          });

          intro.onbeforechange(function(targetElement) {
              if($(targetElement).hasClass('step5')){
                  $('.openbtn').click();
              }
          });

          intro.start();
      }
    });
});