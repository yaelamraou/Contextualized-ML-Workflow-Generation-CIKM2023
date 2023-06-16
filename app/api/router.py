import json
import logging
import os
import shutil

import xmltodict
from fastapi import APIRouter
from fastapi.responses import FileResponse

from app.generator.generator import NbGenerator

from .models import Configuration
from .models import CloneDTO

FEATURES_MAP_PATH = './static/maps/ml_components_map.json'
EXP_DIR_PATH = "./static/illustration_test_cases/assets/experiments"
EXP_NB_DIR_PATH = "./static/illustration_test_cases/assets/experiment_notebooks"
EXP_MAP_PATH = "./static/maps/experiments_map.json"
NOTEBOOKS_DIR_PATH = './static/generated_notebooks'
CONFIG_TEMPLATE_PATH = './static/configuration_template.json'
CLONE_PROJECT_PATH = './static/illustration_test_cases/cloned_projects'

logging.basicConfig(level=logging.DEBUG)

features_map = None
with open(FEATURES_MAP_PATH, 'r') as file:
    features_map = json.load(file)


configurator_router = APIRouter()


@configurator_router.get("/app")
async def root():
    return {"message": "you are at root"}


def write_config(config: str) -> str:
    """
    Transform the received configuration which is an xml string into a stringify json object.

    Parameters
    ----------

    config : str
        the config attribute of the Configuration data model

    Returns
    -------

    config_json : str
        a stringify json object that contains the config content
    """

    obj = xmltodict.parse(config)
    config_json = json.dumps(obj)
    return config_json


def extract_solution_configuration(content: str) -> list:
    """
    Go through the whole configuration that is equivalent to the feature Model and operate in multiple phases.
    First go through the all thing to find the range of the solution part and then extract it into the Solution list.
    Then creates a dict that contains name of all known artifacts of our artifacts library.
    Then compare selected features with known artifacts and if known put it into the configuration dict.

    Parameters
    ----------

    content : str
        the stringify json object containing the whole configuration

    Returns
    -------

    configuration : dict
        a dict containing only selected solutions of the configuration
    """

    content = json.loads(content)
    feature_list = content["configuration"]["feature"]
    logging.debug(feature_list)

    sol_index = None
    src_index = None

    for index, feature in enumerate(feature_list):
        if feature["@name"] == "Solution":
            sol_index = index
            continue
        if feature["@name"] == "Sources":
            src_index = index
            break

    Solutions = feature_list[sol_index:src_index]
    logging.debug(Solutions)
    configuration = []
    for sol in Solutions:
        if sol["@automatic"] == "selected" or sol["@manual"] == "selected":
            configuration.append(sol['@name'])
    logging.debug(f'config: {configuration}')
    return configuration


def fit_for_generator(config: list) -> dict:
    """
    Templating step to create a suitable configuration for generation

    Parameters
    ----------

        config : dict
        dict that contains all known and selected features of the client configuration

    Return
    ------

        fit_config : dict
        the same content as config but templated according to generator's need.
    """

    generator_config = None
    with open(CONFIG_TEMPLATE_PATH, 'r') as file:
        generator_config = json.load(file)
    for name in config:
        logging.debug(f'name in config: {name}')
        if name in features_map['features'].keys():
            logging.debug(f'name: {name}')
            logging.debug(f"keys: {features_map['features'].keys()}")
            logging.info('name in features map keys')
            artifact = features_map['features'][name]
            logging.debug(f'artifact {artifact}')
            if artifact['dir'] == 'algorithms':
                logging.debug(f"artifact: {artifact} is algorithm")
                generator_config['Train']['modelTraining'].append(f"{name}")
                generator_config['Valid']['prediction'].append(f"{name}")
                generator_config['Test']['prediction'].append(f"{name}")
            elif artifact['dir'] == 'preprocessings':
                logging.debug(f"artifact: {artifact} is prepro")
                generator_config['Train']['dataTreatment'].append(f"{name}")
                if name != 'Smote':
                    generator_config['Valid']['dataTreatment'].append(
                        f"{name}")
                    generator_config['Test']['dataTreatment'].append(f"{name}")
            elif artifact['dir'] == 'postprocessings':
                generator_config['Valid']['evaluation'].append(f'{name}')
                generator_config['Test']['evaluation'].append(f'{name}')
    return generator_config


@ configurator_router.post("/generate")
async def generate(payload: Configuration):
    """
    Receive request body from user as custom data object Configuration
    First step extract it and transform xml into json
    Second step extract selected and known features that we can generate
    Third step, fit it according to generator's template
    Then create generator with this configuration and generate the notebook
    Finally launch notebook in jupyter and return.

    Parameters
    ----------

        payload: Configuration
        Request body containing the generated configuration as stringify xml

    Return
    ------

        api response
    """

    config_json = write_config(payload.config)
    config = extract_solution_configuration(config_json)
    to_generate = fit_for_generator(config)
    logging.debug(f'config to generate: {to_generate}')
    generator = NbGenerator(to_generate)
    if not os.path.exists(NOTEBOOKS_DIR_PATH):
        os.mkdir(NOTEBOOKS_DIR_PATH)
    generator.generate(f'{NOTEBOOKS_DIR_PATH}/experiment_notebook.ipynb')
    return {"message": "notebook experiment_notebook generated"}


@ configurator_router.get("/download")
async def download():
    return FileResponse(path=f'{NOTEBOOKS_DIR_PATH}/experiment_notebook.ipynb', media_type="application/octet-stream")


@ configurator_router.post("/clone")
async def clone(payload: CloneDTO):
    str_config = payload.config
    clone_name = payload.clone
    dir_path = f'{CLONE_PROJECT_PATH}/{clone_name}'

    # try:
    #     os.mkdir(dir_path)
    # except OSError as error:
    #     print(error)

    if not os.path.exists(CLONE_PROJECT_PATH):
        os.mkdir(CLONE_PROJECT_PATH)

    if os.path.exists(dir_path):
        shutil.rmtree(dir_path)
    os.mkdir(dir_path)
    

    with open(f'{dir_path}/current_config.xml', 'w') as f:
        f.write(str_config)

    with open(EXP_MAP_PATH, 'r') as file:
            exp_nb_map = json.load(file)

    if clone_name.startswith('NB'):
        logging.debug('clone is an NB')
        logging.debug(f'clone name: {clone_name}')
        if clone_name in exp_nb_map['notebooks'].keys():
            logging.debug(f"nb src path: {exp_nb_map['notebooks'][f'{clone_name}']['path']}")
            logging.debug(f"nb dst path: {dir_path}/{clone_name}.ipynb")
            shutil.copyfile(exp_nb_map['notebooks'][f'{clone_name}']['path'], f'{dir_path}/{clone_name}.ipynb')

    elif clone_name.startswith('XP'):
        if clone_name in exp_nb_map['experiments'].keys():
            shutil.copytree(exp_nb_map['experiments'][f'{clone_name}']['path'], f'{dir_path}/{clone_name}')
            shutil.copytree(exp_nb_map['experiments'][f'{clone_name}']['dataset'], f'{dir_path}/{clone_name}/dataset')
            shutil.copyfile(exp_nb_map['experiments'][f'{clone_name}']['notebook'], f'{dir_path}/{clone_name}/notebook.ipynb')

    zip_name = shutil.make_archive(dir_path, 'zip', CLONE_PROJECT_PATH, clone_name)
    return FileResponse(path=f'{zip_name}', media_type="application/octet-stream")

