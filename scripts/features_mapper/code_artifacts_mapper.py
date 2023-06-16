import json
import os
from datetime import date
from pathlib import Path
import logging

from dotenv import load_dotenv

logging.basicConfig(level=logging.INFO)


# dotenv_path = Path('./.env')
# load_dotenv(dotenv_path=dotenv_path)

# ARTIFACTS_PATH = os.getenv('ARTIFACTS_PATH')
ARTIFACTS_PATH = './static/illustration_test_cases/assets/code_artifacts'
# ARTIFACT_MAP_PATH = os.getenv('ARTIFACT_MAP_PATH')
ARTIFACT_MAP_PATH = './static/maps/code_artifacts_map.json'

features = dict()
map = dict()
metadata = dict()
metadata['last_generation'] = str(date.today())


for dir in os.listdir(ARTIFACTS_PATH):
    logging.info(f'mapping file tree, current dir: {dir}\n')
    if dir == 'map.json':
        continue
    for file in os.listdir(f'{os.path.join(ARTIFACTS_PATH, dir)}'):
        file_name = file.split('.')[0]
        file_path = os.path.join(ARTIFACTS_PATH, dir, file)
        logging.info(f'mapping file: {file_name} to path: {file_path}\n')
        data = dict()
        data['known'] = True
        data['dir'] = dir
        data['path'] = file_path
        features[file_name] = data

logging.info('=================================')
metadata['features_count'] = len(features.keys())
logging.info(f"mapped {metadata['features_count']} into file")
map['metadata'] = metadata
map['features'] = features


with open(ARTIFACT_MAP_PATH, "w") as output:
    json.dump(map, output, indent=2)
