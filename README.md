# Carteira Digital API


### Como funciona
Utiliza a tecnologia [Puppeteer.js](https://github.com/puppeteer/puppeteer) para extrair seus dados bancários / investimentos.

##### Quais informações consigo obter
- Seu saldo bancário em todas as suas contas bancárias
- O histórico de transações do cartão de crédito
- Todas as transações financeiras de suas contas
- Seus investimentos em corretoras
- A valorização de seus ativos, como ações, FIIs, e Tesouro Direto

### Instalação
- `git clone`
- `yarn`
- `nodemon server.js` 

### Como utilizar
[Clique aqui](https://documenter.getpostman.com/view/1148545/Szmh4HWm) para consultar a documentação dos métodos disponíveis.


> _Atenção: Para utilizar os métodos é necessário informar dados sensíveis como `senha readonly`. Sinta-se à vontade para explorar o código e constatar que estes dados não são armazenados em qualquer banco de dados._

### Plataformas integradas


| Plataforma | Tesouro Direto      | Fundos inv.    | Renda Fixa     | Renda variável | Extrato | Ordens | Contas correntes |
| -----------|:-------------------:| --------------:| --------------:| --------------:| -------:| ------:|-----------------:|
| Clear      |⏰                   |➖               |➖              |✅              |⏰       |⏰       |✅                |
| Rico       |✅                   |⏰               |✅              |⏰              |⏰       |⏰       |✅                |
| Easynvest  |✅                   |✅               |✅              |⏰              |✅       |⏰       |✅                |
| GuiaBolso  |➖                   |➖               |➖              |➖              |✅       |➖       |✅                |
| XP         |                     |                |                |                |        |         |                  |
| Genial     |                     |                |                |                |        |         |                  |

> A integração com o Guia Bolso contempla bancos como Nubank, Inter, Itaú, Bradesco, Banco do Brasil etc.

### Como contribuir
Estamos em busca de apoiadores. Para contribuir, confira os [issues](https://github.com/MaiaVinicius/carteira-digital-api/issues) em aberto.
