## RUNDEX


**O universo dos games na palma da sua mão.**


## TECH'S


| Frontend | Next.js 16.4.2, React 19.3, TypeScript e CSS |

| Estilização complementar | Tailwind CSS 4 |

| Backend | Python, FastAPI, Uvicorn e Pydantic |

| Banco de dados | PostgreSQL e Psycopg |

| Configuração | python-dotenv |

| Fonte externa de dados | RAWG API, utilizada pelo script de geração do catálogo |


## ESTRUTURA


RUNDEX/
├── BACK/
│   ├── app/
│   │   ├── config.py          # Configurações e caminhos
│   │   ├── main.py            # Aplicação FastAPI e CORS
│   │   └── schemas.py
│   ├── database/
│   │   ├── JSON/
│   │   │   └── pokemon.json   # Catálogo de reserva
│   │   ├── SQL/
│   │   │   └── pokemon.sql
│   │   └── pokemon.py         # Geração de dados a partir da RAWG
│   ├── routes/
│   │   └── home.py            # Listagem, busca, destaques e imagens
│   └── services/
│       ├── connect.py         # Conexão e inicialização do PostgreSQL
│       └── rawg.py            # Cliente da RAWG API
├── FRONT/
│   └── RUNDEX/
│       ├── app/
│       │   ├── components/   # Cabeçalho e rodapé
│       │   └── home/         # Página inicial e estilos
│       ├── public/           # Imagens e arquivos estáticos
│       └── package.json
└── README.md


### COMO COLOCAR O BACK P RODAR


- cd BACK

python -m uvicorn app.main:app --reload --port 5500


### COMO COLOCAR O FRONT P RODAR


- cd FRONT
- cd RUNDEX

npm.cmd run dev

### ENDEREÇO DA API

O front chama o FastAPI por `/api`, incluindo as capas servidas pelo back-end. O Next encaminha essas chamadas para o endereço definido em `API_URL`.

O arquivo `BACK/repository/api.py` reúne as rotas de Home, Jogos e Catálogo. Com os dois servidores ligados, use `http://localhost:3000/api/health` para conferir o encaminhamento.

- **Local:** o endereço padrão é `http://localhost:5500`. Para usar outro, defina `API_URL` em `FRONT/RUNDEX/.env.local` e reinicie o Next.
- **Vercel:** defina `API_URL` em **Settings → Environment Variables** com a URL HTTPS do FastAPI publicado, por exemplo `https://api.seudominio.com`. Faça um novo deploy do front para aplicar o valor.
- **Outro host com Next.js:** defina `API_URL` no ambiente do front antes de rodar `npm run build`. O host precisa servir a aplicação Next para encaminhar `/api`.
