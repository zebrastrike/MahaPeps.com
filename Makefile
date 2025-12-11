COMPOSE_FILE=infra/docker/docker-compose.yml
COMPOSE=docker compose -f $(COMPOSE_FILE)

.PHONY: help dev up down logs restart api-shell web-shell build clean

help:
	@echo "Available targets:"
	@echo "  dev       - Start all services with rebuild"
	@echo "  up        - Start services"
	@echo "  down      - Stop and remove services"
	@echo "  logs      - Tail logs for core services"
	@echo "  restart   - Restart api and web containers"
	@echo "  api-shell - Open a shell inside the api container"
	@echo "  web-shell - Open a shell inside the web container"
	@echo "  build     - Build images without starting containers"
	@echo "  clean     - Remove volumes for a fresh start"

dev:
	$(COMPOSE) up --build

up:
	$(COMPOSE) up

down:
	$(COMPOSE) down

logs:
	$(COMPOSE) logs -f api web nginx

restart:
	$(COMPOSE) restart api web

api-shell:
	$(COMPOSE) exec api sh

web-shell:
	$(COMPOSE) exec web sh

build:
	$(COMPOSE) build

clean:
	$(COMPOSE) down -v
