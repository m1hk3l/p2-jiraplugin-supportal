"""Generate a fresh PostgreSQL home archive; preserve existing running Jira data."""
import os
from pathlib import Path
from xml.etree.ElementTree import Element, SubElement, tostring
from zipfile import ZipFile, ZIP_DEFLATED

root = Element("jira-database-config")
for name, value in [("name", "defaultDS"), ("delegator-name", "default"),
                    ("database-type", "postgres72"), ("schema-name", "jiradb")]:
    SubElement(root, name).text = value
jdbc = SubElement(root, "jdbc-datasource")
for name, value in [
    ("url", f"jdbc:postgresql://{os.environ['PGHOST']}:{os.environ['PGPORT']}/{os.environ['PGDATABASE']}"),
    ("driver-class", "org.postgresql.Driver"),
    ("username", os.environ["PGUSER"]), ("password", os.environ["PGPASSWORD"]),
    ("pool-min-size", "5"), ("pool-max-size", "20"),
    ("validation-query", "select 1"), ("pool-test-while-idle", "true")]:
    SubElement(jdbc, name).text = value
output = Path("target/container-postgres-home.zip")
output.parent.mkdir(parents=True, exist_ok=True)
with ZipFile(output, "w", ZIP_DEFLATED) as archive:
    archive.writestr("jira-home/dbconfig.xml", tostring(root, encoding="utf-8", xml_declaration=True))
print(f"Prepared {output}")
