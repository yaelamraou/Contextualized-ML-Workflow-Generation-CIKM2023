import json


class Mapper:
    """
    A class used to map a required artifacts with the artifact library to load artifact content for extraction

    Attributes
    ----------

    dir : str
        name of the directory containing artifacts
    file_extension : str
        extension of artifacts file
    artifact : json object
        the content of the file


    Methods
    -------

    complete_path(pseudo_path)
        method that transform pseudo_path into absolute one. pseudo path is composed of treatment type and name. Example Normalization/StandardScaler.
        The completion adds location of the library and file extension.

    find_artifact(pseudo_path)
        calls complete_path in order to have the absolute_path to locate the file and load it
    """

    def __init__(self):
        """
        Attributes
        ----------
        dir : str
            name of the directory containing artifacts
        file_extension : str
            extension of artifacts file
        artifact : json object
            the content of the file
        """

        # self.dir = 'artifacts-library'
        # self.file_extension = '.json'
        self.features_map_path = './static/maps/ml_components_map.json'
        self.artifact = None

    # def complete_path(self, pseudo_path: str):
    #     """
    #     Method that transform pseudo_path into absolute one. pseudo path is composed of treatment type and name. Example Normalization/StandardScaler.
    #     The completion adds location of the library and file extension

    #     Parameters
    #     ----------
    #     pseudo_path : str
    #         String composed of two elements, the type of treatment, and the name with a / between them
    #         [examples: "Normalization/StandardScaler", "Augmentation/Smote", "Algo/SVM" ...]

    #     Return
    #     ------
    #     complete_path : str
    #         the absolute path of the artifact file if found in our artifact library, else none
    #     """

    #     return (Path(__file__).parents[1] / self.dir / pseudo_path).with_suffix(self.file_extension)

    def load_artifact(self, pseudo_path: str):
        """
        calls complete_path in order to have the absolute_path to locate the file and load it

        Parameters
        ----------

        pseudo_path : str
            String composed of two elements, the type of treatment, and the name with a / between them
            [examples: "Normalization/StandardScaler", "Augmentation/Smote", "Algo/SVM" ...]

        """

        features_map = None
        with open(self.features_map_path, 'r') as file:
            features_map = json.load(file)

        path = features_map['features'][pseudo_path]['path']
        with open(path, 'r') as file_content:
            self.artifact = json.load(file_content)

        # try:
        #     path = self.complete_path(pseudo_path)
        #     with path.open() as artifact_file:
        #         self.artifact = json.load(artifact_file)
        # except FileNotFoundError:
        #     print(
        #         f"file {pseudo_path} not found, this artifacts is not available in the library")
        #     type = pseudo_path.split("/")[0]
        #     if type != 'Algo' and type != 'Metrics':
        #         path = self.complete_path("Templating/MissingDataArtifacts")
        #     else:
        #         path = self.complete_path(f"Templating/Missing{type}Artifacts")
        #     with path.open() as missing_artifact:
        #         self.artifact = json.load(missing_artifact)
