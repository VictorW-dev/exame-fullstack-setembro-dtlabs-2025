.PHONY: up down logs migrate seed test


up:
	docker compose up -d --build
	docker compose logs -f backend


down:
	docker compose down -v


migrate:
	docker compose exec backend alembic upgrade head


seed:
	docker compose exec backend python -m app.db.init_db


logs:
	docker compose logs -f


test:
	docker compose exec backend pytest -q