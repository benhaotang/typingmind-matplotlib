function render_matplotlib_plot(params) {
    const { title, matplotlib_code, packages } = params;
  
    // Ensure packages is an array even if empty or undefined
    const pkgs = Array.isArray(packages) && packages.length > 0 ? packages : [];
  
    // A helper function to remove common leading whitespace
    function dedent(str) {
      const lines = str.split('\n');
      // Find the minimum indentation of all non-empty lines
      let minIndent = Infinity;
      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed) {
          const match = line.match(/^(\s+)/);
          if (match) {
            minIndent = Math.min(minIndent, match[1].length);
          } else {
            minIndent = 0;
          }
        }
      }
      if (minIndent === Infinity) minIndent = 0;
      // Remove that amount of whitespace from the beginning of each line
      return lines.map(line => line.startsWith(' '.repeat(minIndent)) ? line.slice(minIndent) : line).join('\n');
    }
  
    // Construct the Python code by concatenating the static header with the matplotlib_code
    const rawPythonCode = `
      import matplotlib
      matplotlib.use('module://matplotlib_pyodide.html5_canvas_backend')
      ${matplotlib_code}
    `;
    const pythonCode = dedent(rawPythonCode);
  
    // Start constructing the HTML string
    let htmlString = `
  <script src="https://cdn.jsdelivr.net/pyodide/v0.26.4/full/pyodide.js"></script>
  <script>
  async function main() {
    let pyodide = await loadPyodide();
  
    // Print Python version for debugging
    console.log(
      pyodide.runPython(\`
        import sys
        sys.version
      \`)
    );
  
    // Load matplotlib package
    await pyodide.loadPackage("matplotlib");
  
    // Set packages variable (an empty array if none provided)
    const packages = ${JSON.stringify(pkgs)};
  
    // Load additional packages if provided
    if (packages.length > 0) {
      for (const packageName of packages) {
        await pyodide.loadPackage(packageName);
      }
    }
  
    // Run dedented Python code
    pyodide.runPython(\`${pythonCode}\`);
  }
  main();
  </script>
  `;
  
    return htmlString;
  }
  