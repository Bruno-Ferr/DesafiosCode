# Instruções de uso

Para clonar o repositório utilize o comando de git clone. Cada desafio está concluído em sua respectiva pasta.

### Desafio 1

Foi criada uma API em NestJS com Swagger
A API possui apenas uma rota /orders, responsável por definir a forma de empacotar produtos.

Além disso, também foram criados alguns testes automatizados para o controller. 

##### Execução docker desafio 1

Após clonar o repositório navegue para a pasta do desafio-1: `cd desafio-1`.
Dentro da pasta, pode executar os comandos:

`docker build -t packing-api .`

Após concluir a etapa de build da imagem, podemos executá-la com:
`docker run -p 3000:3000 packing-api`

O serviço então estará pronto na porta escolhida em `http://localhost:3000/order` e o swagger estará rodando em `http://localhost:3000/api`

Obs: A opção "-p 3000" indica a porta de execução do container, e pode ser alterada como no exemplo abaixo.
Ex: `docker run -p 3333:3000 packing-api`

### Desafio 2

Foram utilizados python e sqlite para esse desafio.

##### Execução scripts desafio 2

Para executar os scripts, é necessário possuir o python instalado.
Após clonar o repositório navegue para a pasta do desafio-2: `cd desafio-2`.

E então, para criar e popular o banco com dados mockados:
`python3 create_db.py`

Lista de salas com horários livres e ocupados:
`python3 schedule.py`

Mostra a quantidade de horas que cada professor tem comprometido em aulas:
`python3 teacher.py`