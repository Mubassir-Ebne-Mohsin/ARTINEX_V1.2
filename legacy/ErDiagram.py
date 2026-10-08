from graphviz import Digraph

# Create a new directed graph
er_diagram = Digraph('ER_Diagram', filename='er_diagram_flower_shop', format='png')

# Set graph attributes
er_diagram.attr(rankdir='LR', size='8,5')

# Add entities
entities = {
    "Owner": ["OwnerID (PK)", "Name", "PhoneNumber"],
    "Manager": ["ManagerID (PK)", "Name", "Address", "PhoneNumber", "Age", "Email"],
    "Employee": ["EmployeeID (PK)", "Name", "Address", "PhoneNumber", "Age", "ManagedBy (FK)"],
    "Vendor": ["VendorID (PK)", "Name", "Address", "PhoneNumber"],
    "PurchaseOrder": ["PurchaseOrderID (PK)", "DateIssued", "MadeBy (FK)"],
    "PurchaseInventory": ["PurchaseInventoryID (PK)", "Quantity", "Color", "RetailValue", "LinkedTo (FK)"],
    "Customer": ["CustomerID (PK)", "Name", "PhoneNumber", "Email", "Age", "Address", "AssistedBy (FK)"],
    "Payment": ["PaymentID (PK)", "PaymentType", "Date", "Time", "MadeBy (FK)"]
}

# Add attributes to entities
for entity, attributes in entities.items():
    er_diagram.node(entity, label=f'<<TABLE BORDER="0" CELLBORDER="1" CELLSPACING="0">'
                                  f'<TR><TD COLSPAN="1"><B>{entity}</B></TD></TR>' +
                                  ''.join([f'<TR><TD>{attr}</TD></TR>' for attr in attributes]) +
                                  '</TABLE>>', shape='plaintext')

# Add relationships
relationships = [
    ("Owner", "Manager", "Hires"),
    ("Manager", "Employee", "Supervises"),
    ("Vendor", "PurchaseOrder", "LinkedTo"),
    ("PurchaseOrder", "PurchaseInventory", "Contains"),
    ("Shop", "Vendor", "DealsWith"),
    ("Employee", "Customer", "Assists"),
    ("Customer", "Payment", "Makes")
]

# Add edges with relationship labels
for source, target, label in relationships:
    er_diagram.edge(source, target, label=label)

# Render the diagram
er_diagram.render('/mnt/data/er_diagram_flower_shop', format='png', cleanup=True)
'/mnt/data/er_diagram_flower_shop.png'
