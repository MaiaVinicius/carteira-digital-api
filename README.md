# Carteira Digital API


### Como funciona
Utiliza a tecnologia [Puppeteer.js](https://github.com/puppeteer/puppeteer) para extrair seus dados bancários / investimentos.

### Instalação
- `git clone`
- `yarn`
- `nodemon server.js` 

### Como utilizar
Documentação dos métodos:

https://documenter.getpostman.com/view/1148545/Szmh4HWm

_Atenção: Sim, para utilizar os métodos é necessário informar dados sensíveis como `senha readonly`. Sinta-se à vontade para explorar o código e constatar que estes dados não são armazenados em qualquer banco de dados._

### Plataformas integradas


| Plataforma | Tesouro Direto      | Fundos inv.    | Renda Fixa     | Renda variável | Extrato | Ordens | Contas correntes |
| -----------|:-------------------:| --------------:| --------------:| --------------:| -------:| ------:|-----------------:|
| Clear      |⏰                   |➖               |➖              |✅              |⏰       |⏰       |✅                |
| Rico       |✅                   |⏰               |✅              |⏰              |⏰       |⏰       |✅                |
| Easynvest  |✅                   |✅               |✅              |⏰              |✅       |⏰       |✅                |
| GuiaBolso  |➖                   |➖               |➖              |➖              |✅       |➖       |✅                |
| XP         |                     |                |                |                |        |         |                  |
| Genial     |                     |                |                |                |        |         |                  |


### Como contribuir
Estamos em busca de apoiadores. Para contribuir, confira os [issues](https://github.com/MaiaVinicius/carteira-digital-api/issues) em aberto.
