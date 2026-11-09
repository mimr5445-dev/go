#!/usr/bin/env python3
"""Dependency-free checks for the operational memory, NOT product behavior tests."""
from pathlib import Path
import re
import unittest

ROOT = Path(__file__).resolve().parents[1]
REQUIRED = ['AGENTS.md', 'PROJECT_CONTEXT.md', 'README.md',
    *['project-memory/' + n + '.md' for n in
      ['CURRENT_STATE', 'INCIDENTS', 'LESSONS', 'DECISIONS', 'ROADMAP', 'ARCHITECTURE']],
    'project-memory/archive/README.md', 'tasks/BACKLOG.md', 'tasks/ACTIVE.md',
    'tasks/completed/README.md', 'tasks/templates/TASK_TEMPLATE.md',
    'docs/INITIAL_AUDIT.md', 'docs/VALIDATION.md', 'docs/CONTINUITY_CHECK.md']

class MemoryChecks(unittest.TestCase):
    def test_required_files_have_content(self):
        for name in REQUIRED:
            with self.subTest(path=name):
                self.assertTrue((ROOT / name).is_file())
                self.assertGreater(len((ROOT / name).read_text().strip()), 100)

    def test_relative_markdown_links_resolve(self):
        for name in REQUIRED:
            path = ROOT / name
            for link in re.findall(r'\]\(([^)]+)\)', path.read_text()):
                if '://' in link or link.startswith('#'):
                    continue
                with self.subTest(path=name, link=link):
                    self.assertTrue((path.parent / link.split('#')[0]).exists())

    def test_states_and_template(self):
        text = (ROOT / 'tasks/BACKLOG.md').read_text()
        for state in ['NEW', 'CLAIMED', 'IN_PROGRESS', 'BLOCKED', 'REVIEW', 'COMPLETED']:
            self.assertIn(state, text)
        template = (ROOT / 'tasks/templates/TASK_TEMPLATE.md').read_text()
        for heading in ['الهدف', 'السياق', 'نطاق العمل', 'الملفات المتوقع تأثرها',
                        'القيود', 'معايير القبول', 'الاختبارات المطلوبة', 'الأدلة المطلوبة للتسليم']:
            self.assertIn('## ' + heading, template)

    def test_task_ids_unique_and_not_active_and_completed(self):
        active = (ROOT / 'tasks/ACTIVE.md').read_text()
        backlog = (ROOT / 'tasks/BACKLOG.md').read_text()
        ids = re.findall(r'^## (GO-[A-Z]+-\d+)', active + '\n' + backlog, re.M)
        self.assertEqual(len(ids), len(set(ids)))
        for path in (ROOT / 'tasks/completed').glob('GO-*.md'):
            self.assertNotIn(path.stem, ids, 'Keep only a link, not an active task heading')

    def test_incident_fields_and_sources(self):
        text = (ROOT / 'project-memory/INCIDENTS.md').read_text()
        incidents = re.split(r'^## INC-\d+', text, flags=re.M)[1:]
        self.assertGreaterEqual(len(incidents), 3)
        for incident in incidents:
            for field in ['الاكتشاف', 'المشكلة', 'الأعراض', 'السبب الجذري',
                          'المساهمات', 'الملفات', 'الحل المنفذ', 'دليل النجاح', 'منع التكرار', 'الحالة']:
                self.assertIn(field, incident)
        audit = (ROOT / 'docs/INITIAL_AUDIT.md').read_text()
        for sha in ['22fd1f23f3099be758fb3544a81464ae405267d7',
                    'f7cbae6e8cb864bff154c90fbe74275047d009da']:
            self.assertIn(sha, audit)

    def test_continuity_has_nine_sourced_answers(self):
        text = (ROOT / 'docs/CONTINUITY_CHECK.md').read_text()
        answers = re.findall(r'^## ([1-9])\.', text, re.M)
        self.assertEqual(answers, list('123456789'))
        self.assertGreaterEqual(text.count('المصدر:'), 9)

if __name__ == '__main__':
    unittest.main(verbosity=2)
