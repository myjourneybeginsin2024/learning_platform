
import os
import sys

startpath = r'c:\TRISNA\learning-platform'
ignored = {'node_modules', '.git', 'venv', '.venv', '__pycache__', '.next', '.idea', '.vscode', '.mypy_cache', 'dist', 'build', 'data', 'pg_data', '.pytest_cache'}
output_file = 'full_tree.txt'

def list_files(startpath):
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write(f".\n+--- {os.path.basename(startpath)}/\n")
        for root, dirs, files in os.walk(startpath):
            # Modify dirs in-place to skip ignored directories
            dirs[:] = [d for d in dirs if d not in ignored]
            # Sort for deterministic output
            dirs.sort()
            files.sort()
            
            level = root.replace(startpath, '').count(os.sep)
            indent = '|   ' * (level)
            f.write('|   {}+--- {}/\n'.format(indent, os.path.basename(root)))
            subindent = '|   ' * (level + 1)
            for file in files:
                f.write('{}    {}\n'.format(subindent, file))
    print(f"Tree written to {output_file}")

if __name__ == "__main__":
    try:
        list_files(startpath)
    except Exception as e:
        print(f"Error: {e}")
