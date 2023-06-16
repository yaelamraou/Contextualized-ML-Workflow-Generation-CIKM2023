import nbformat as nbf


class Workflow:

    def __init__(self, name: str):
        self.name = name
        self.workflow = dict()

    def get_keys(self):
        return self.workflow.keys()

    def get_values(self):
        return self.workflow.values()

    def get_items(self):
        return self.workflow.items()

    def add_item(self, key: str, value: list):
        self.workflow[key] = value

    def multiple_add(self, key_list: list, value_list: str):
        for (i, j) in zip(key_list, value_list):
            self.add_item(i, j)

    # virer la boucle ici aussi
    def del_item(self, key_to_del: str):
        for key in list(self.workflow.keys()):
            if key == key_to_del:
                del self.workflow[key]

    # virer la boucle, pas nécessaire !
    def update_item(self, key: str, new_value: list):
        for k, v in self.workflow.items():
            if k == key:
                self.workflow[k] = new_value

# mettre dans un fichier à part


class Cell:

    def __init__(self):
        self.content = ''''''

    def get_content(self):
        return self.content

    def delete_content(self):
        self.content = ''''''


class CodeCell(Cell):

    def __init__(self):
        super().__init__()
        self.type = "code"

    def add_content(self, new_content: str):
        self.content = self.content + ''.join(new_content)

    def convert(self):
        return nbf.v4.new_code_cell(self.content)

    def get_type(self):
        return self.type


class MarkCell(Cell):

    def __init__(self):
        super().__init__()
        self.type = "markdown"

    def get_type(self):
        return self.type

    def add_title_content(self, new_content: str):
        self.content = self.content + '# ' + ''.join(new_content) + '\n'

    def add_content(self, new_content: str):
        self.content = self.content + ''.join(new_content) + '\n'

    def convert(self):
        return nbf.v4.new_markdown_cell(self.content)
