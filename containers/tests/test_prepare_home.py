"""Check the home archive contract used by AMPS 9.9.1 and retry behaviour."""
import os
from pathlib import Path
from shutil import copytree, move
import subprocess
import sys
from tempfile import TemporaryDirectory
import unittest
from xml.etree.ElementTree import parse
from zipfile import ZipFile


SCRIPT = Path(__file__).resolve().parents[1] / "prepare-home.py"


class PrepareHomeTest(unittest.TestCase):
    def setUp(self):
        self.temp = TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.project = Path(self.temp.name)
        self.base = self.project / "target/jira"
        self.staging = self.base / "tmp-resources"
        self.home = self.base / "home"
        self.environment = dict(os.environ, PGHOST="postgres", PGPORT="5432",
                                PGDATABASE="jira", PGUSER="jira",
                                PGPASSWORD="local<&password")

    def prepare(self):
        subprocess.run([sys.executable, str(SCRIPT)], cwd=self.project,
                       env=self.environment, check=True, capture_output=True)

    def extract_like_amps(self):
        # AbstractProductHandler.extractProductHomeData unzips, copies the single
        # root's CONTENTS to the instance directory, then moves jira-home to home.
        with ZipFile(self.project / "target/container-postgres-home.zip") as archive:
            archive.extractall(self.staging)
        roots = list(self.staging.iterdir())
        self.assertEqual(len(roots), 1, "AMPS requires exactly one wrapper folder")
        copytree(roots[0], self.base, dirs_exist_ok=True)
        self.assertTrue((self.base / "jira-home").is_dir(),
                        "AMPS must find jira-home after removing the wrapper")
        move(self.base / "jira-home", self.home)
        return parse(self.home / "dbconfig.xml").getroot()

    def test_fresh_home_has_postgres_configuration_after_amps_extraction(self):
        self.prepare()
        config = self.extract_like_amps()
        self.assertEqual(config.findtext("database-type"), "postgres72")
        self.assertEqual(config.findtext("schema-name"), "jiradb")
        self.assertEqual(config.findtext("jdbc-datasource/url"),
                         "jdbc:postgresql://postgres:5432/jira")
        self.assertEqual(config.findtext("jdbc-datasource/password"),
                         self.environment["PGPASSWORD"])

    def test_retry_clears_staging_from_the_old_archive_layout(self):
        old_home = self.staging / "jira-home"
        old_home.mkdir(parents=True)
        (old_home / "dbconfig.xml").write_text("failed extraction")
        self.prepare()
        self.assertFalse(self.staging.exists())
        self.extract_like_amps()

    def test_existing_jira_home_and_other_build_files_are_preserved(self):
        self.home.mkdir(parents=True)
        config = self.home / "dbconfig.xml"
        config.write_text("existing database configuration")
        artifact = self.base / "cached-distribution.zip"
        artifact.write_bytes(b"cached Jira distribution")
        self.staging.mkdir()
        (self.staging / "incomplete").write_text("temporary extraction")
        self.prepare()
        self.prepare()
        self.assertEqual(config.read_text(), "existing database configuration")
        self.assertEqual(artifact.read_bytes(), b"cached Jira distribution")
        self.assertFalse(self.staging.exists())


if __name__ == "__main__":
    unittest.main()
