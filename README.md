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
