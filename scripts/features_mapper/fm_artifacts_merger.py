import json
import logging
import os
import xml.dom.minidom
import xml.etree.ElementTree as ET
from datetime import date
from pathlib import Path

from dotenv import load_dotenv

# dotenv_path = Path('./.env')
# load_dotenv(dotenv_path=dotenv_path)

# FEATURE_MODEL_PATH = os.getenv('FEATURE_MODEL_PATH')
# FEATURES_MAP_PATH = os.getenv('FEATURES_MAP_PATH')
# ARTIFACT_MAP_PATH = os.getenv('ARTIFACT_MAP_PATH')

logging.basicConfig(level=logging.INFO)


FEATURE_MODEL_PATH = './static/illustration_test_cases/illustrative_fm_scenario2.xml'
FEATURES_MAP_PATH = './static/maps/ml_components_map.json'
ARTIFACT_MAP_PATH = './static/maps/code_artifacts_map.json'

map = None
fm = None
fm_solution_dict = ()

with open(ARTIFACT_MAP_PATH, 'r') as map_file:
    map = json.load(map_file)

logging.debug('artifacts map loaded\n')

with open(FEATURE_MODEL_PATH, 'r') as fm_file:
    fm = xml.dom.minidom.parse(fm_file)

logging.debug('fm parsed \n')

features = fm.getElementsByTagName("feature")

for index, feature in enumerate(features):
    if feature.getAttribute('name') == "StandardScaler":
        start = index
        continue
    if feature.getAttribute('name') == "QuantizeNN":
        finish = index
        break

solutions = features[start:finish+1]

logging.debug('solutions feature extracted \n')

known_features = map['features'].keys()
known_count = 0
unknown_count = 0

for feature in solutions:
    if feature.getAttribute('name') not in known_features:
        logging.info(
            f"new unknown feature detected, {feature.getAttribute('name')} mapped as unknown feature\n")
        unknown_count += 1
        logging.info(f"new unknown feature count: {unknown_count}\n")
        data = dict()
        data['known'] = False
        data['dir'] = 'Unknown'
        data['path'] = map['features']['MissingDataArtifacts']['path']
        map['features'][feature.getAttribute('name')] = data
    else:
        known_count += 1

map['metadata']['last_generation'] = str(date.today())
map['metadata']['features_count'] = len(map['features'].keys())


# for feat in map['features'].keys():
#     if map['features'][feat]['known'] == True:
#         known_count += 1
#     else:
#         unknown_count += 1

map['metadata']['know_count'] = known_count
map['metadata']['unkonwn_count'] = unknown_count
logging.info(
    f"Mapping finished \n, total count: {map['metadata']['features_count']},\n known features count: {known_count},\n unknown features count: {unknown_count}\n")

with open(FEATURES_MAP_PATH, 'w') as output:
    json.dump(map, output, indent=2)
