import nbformat as nbf

from app.generator.extractor import Extractor
from app.generator.mapper import Mapper
from app.generator.workflow import CodeCell, MarkCell, Workflow


class NbGenerator:
    """
    This class is an object that generates notebooks

    Attributes
    ----------
    mapper : Mapper
        An instance of the class Mapper that loads artifacts from our artifacts library
    config : dict
        The configuration that contains all artefacts asked to generate
    notebook : NotebookNode
        the notebook object instanciated from nbformat library
    workflow_list : list
        A list of each workflow that compose the configuration (Train, Valid, Test), each workflow is an instance of custom class Workflow

    Methods
    -------
    generate_nb(file_path)
        The methods that create the file in fs corresponding to the notebook object

    initiate_workflows()
        This method is the one that goes through the configuration and fills the workflow list

    create_cells()
        This method instanciates all three cells generators and append all cells to the notebook
    """

    def __init__(self, config: dict):
        """
        Attributes
        ----------
        mapper : Mapper
            An instance of the class Mapper that loads artifacts from our artifacts library
        config : dict
            The configuration that contains all artefacts asked to generate
        notebook : NotebookNode
            the notebook object instanciated from nbformat library
        workflow_list : list
            A list of each workflow that compose the configuration (Train, Valid, Test), each workflow is an instance of custom class Workflow
        """

        self.mapper = Mapper()
        self.config = config
        self.notebook = nbf.v4.new_notebook()
        self.workflow_list = []

    def generate_nb(self, file_path: str):
        """
        The methods that create the file in fs corresponding to the notebook object

        Parameters
        ----------
        file_path : str
            path where to write the notebook in fs
        """

        nbf.write(self.notebook, file_path)

    # make private and call in generate_nb
    def initiate_workflows(self):
        """
        This method is the one that goes through the configuration and fills the workflow list
        """
        for activity, treatment_list in self.config.items():
            tmp_workflow = Workflow(activity)
            for treatment, artifacts_list in treatment_list.items():
                tmp_workflow.add_item(treatment, artifacts_list)
            self.workflow_list.append(tmp_workflow)

    # make private and call in generate_nb
    def create_cells(self):
        """
        This method instanciates all three cells generators and append all cells to the notebook
        """
        importGen = ImportCellGenerator(self.workflow_list)
        datasGen = DataCellsGenerator()
        cellsGen = WorkflowCellsGenerator(self.workflow_list)

        importGen.generate()
        datasGen.generate()
        cellsGen.generate()

        self.notebook['cells'] = importGen.get_all(
        ) + datasGen.get_all() + cellsGen.get_all()

    def generate(self, filepath: str):
        self.initiate_workflows()
        self.create_cells()
        self.generate_nb(filepath)


class CellGenerator:
    """
    This is an abstract class for cells generators

    Attributes
    ----------
    mapper : Mapper
        An instance of the Mapper class that loads artifacts
    cells : list
        a list of notebook cells

    """

    def __init__(self):
        self.mapper = Mapper()
        self.cells = []

    def get_cell(self, index: int):
        return self.cells[index]

    def get_all(self):
        return self.cells

    def delete_cell(self, index):
        self.cells.remove(index)

    def delete_all(self):
        self.cells = []

    def replace(self, index, value):
        self.cells[index] = value

    def insert(self, index, value):
        self.cells.insert(index, value)


class ImportCellGenerator(CellGenerator):
    """
    This class implement the cell generator class and is specialized in generating import cells

    Attributes
    ----------
    Same as the mother class
    wf_list : list
        the list of all worfkflows composing the configuration

    Methods
    -------
    generate()
        This method goes through the list of workflow and for each treatment of each workflow,
        extract for the artifacts the necessary imports and adds it into a cell.
    """

    def __init__(self, wf_list):
        super().__init__()
        self.wf_list = wf_list

    def generate(self):
        """
        This method goes through the list of workflow and for each treatment of each workflow,
        extract for the artifacts the necessary imports and adds it into a cell.
        """

        cell = CodeCell()
        for wf in self.wf_list:
            for treatment, artifacts in wf.get_items():
                for art in artifacts:
                    self.mapper.load_artifact(art)
                    extractor = Extractor(self.mapper.artifact)
                    for imports in extractor.extract_imports():
                        if imports in cell.get_content():
                            continue
                        else:
                            cell.add_content(imports)
        self.cells.append(cell.convert())


class DataCellsGenerator(CellGenerator):
    """
    This class implement the cell generator class and is specialized in generating data import cells

    Attributes
    ----------
    Same as the mother class

    Methods
    -------
    generate()
        Data import is very personnel thing to do and cannot be generalized. This cell contains one way to split the data and just an indicator on where to import the data

    """

    def __init__(self):
        super().__init__()

    def generate(self):
        data_import = MarkCell()
        data_import.add_title_content("Data import cell")
        content = "To import your data, add a code cell to import it as you want\n"
        data_import.add_content(content)
        self.cells.append(data_import.convert())
        data_split = CodeCell()
        imports = 'from sklearn.model_selection import train_test_split\n\n'
        first_split = 'x_train, x_test, y_train, y_test = train_test_split(x, y, test_size=0.2, random_state=1)\n'
        second_split = 'x_train, x_val, y_train, y_val = train_test_split(x_train, y_train, test_size=0.25, random_state=1)\n'
        data_split.add_content(imports)
        data_split.add_content(first_split)
        data_split.add_content(second_split)
        self.cells.append(data_split.convert())


class WorkflowCellsGenerator(CellGenerator):
    """
    This class implement the cell generator class and is specialized in generating cells that contain the code 
    of the different artifacts

    Attributes
    ----------
    Same as the mother class
    wf_list : list
        the list of all worfkflows composing the configuration

    Methods
    -------
    generate()
        This method goes through each workflows and for each one add a cell with the code of each artifact that needs to perform actions in the current workflow. 
    """

    def __init__(self, wf_list):
        super().__init__()
        self.workflow_list = wf_list

    def generate(self):
        for wf in self.workflow_list:
            wf_cell = MarkCell()
            wf_cell.add_title_content(wf.name)
            self.cells.append(wf_cell.convert())
            for treatment, artifacts in wf.get_items():
                for art in artifacts:
                    self.mapper.load_artifact(art)
                    extractor = Extractor(self.mapper.artifact)
                    content = extractor.extract_code(wf.name)
                    tmp_cell = CodeCell()
                    tmp_cell.add_content(content)
                    self.cells.append(tmp_cell.convert())
