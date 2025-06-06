from fastapi import FastAPI, Request, Response
from fastapi.routing import APIRoute

def ensure_unique_route_names(app: FastAPI) -> None:
    temp_routes = set()
    for route in app.routes:
        if isinstance(route, APIRoute):
            if route.name in temp_routes:
                raise ValueError(f'Non-unique route name: {route.name}')
            temp_routes.add(route.name)

def simplify_operation_ids(app: FastAPI) -> None:
    for route in app.routes:
        if isinstance(route, APIRoute):
            route.operation_id = route.name