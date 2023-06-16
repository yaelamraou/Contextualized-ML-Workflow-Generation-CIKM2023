import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.api.router import configurator_router

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=['*'],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(configurator_router)

app.mount("/", StaticFiles(directory="./static/configurator",
          html=True), name="configurator")

# if __name__ == "__main__":
#     config = uvicorn.Config("app:app", port=5000,
#                             log_level="info", reload=True)
#     server = uvicorn.Server(config)
#     server.run()
