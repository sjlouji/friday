.PHONY: lint format type-check test

lint:
	ruff check app/
	flake8 app/
	pylint app/ --disable=all --enable=E,F

format:
	black app/
	isort app/
	ruff check --fix app/

type-check:
	mypy app/ --ignore-missing-imports

test:
	pytest

