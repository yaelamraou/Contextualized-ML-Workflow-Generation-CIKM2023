class Extractor:
    """
    A class that extract content from artifact files that are json files

    Attributes
    ----------

    artifact : json

    Methods
    -------

    extract_all_code()
        return code for the three section of an artefact

    extract_code(section:str)
        return code of the artefact for the specified section

    extract_imports()
        return import of the artifact
    """

    def __init__(self, artifact):
        """
        Parameters
        ----------

        artifact : json object
            json file of an artefact
        """
        self.artifact = artifact

    def extract_all_code(self):
        """
        return code for the three section of an artefact

        """

        return self.artifact["Train"], self.artifact["Valid"], self.artifact["Test"]

    def extract_code(self, section: str):
        """
        return code of the artefact for the specified section

        Parameters
        ----------

        section : str
            section that need to be extracted
        """

        return self.artifact[section]

    def extract_imports(self):
        """
        return import of the artifact
        """
        return self.artifact['Imports']

    def extract_parameters(self):
        return self.artifact['parameters']
